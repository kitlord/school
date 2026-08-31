import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName, hasRole } from "@/lib/supabase/roles";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Shared by GET and POST below: confirms the caller is signed in, returning
// the service-role client to use for the rest of the request. Returns an
// `error` response instead if the caller isn't authenticated. Reading
// attendance only requires being signed in (any role); marking it requires
// Teacher/Admin, checked separately by authorizeTeacherOrAdmin below.
async function authorizeUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return {
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  // Service role bypasses RLS to read/write attendance rows.
  return { admin: createAdminClient(), user };
}

// Builds on authorizeUser: also confirms the caller holds the Teacher or
// Admin role, for endpoints that write attendance data.
async function authorizeTeacherOrAdmin() {
  const auth = await authorizeUser();
  if (auth.error) return { error: auth.error };
  const { admin, user } = auth;

  // Service role bypasses RLS to look up the caller's role.
  const [{ data: role }, { Teacher: TEACHER_ROLE_ID, Admin: ADMIN_ROLE_ID }] =
    await Promise.all([
      admin
        .from("user_roles")
        .select("role_id")
        .eq("user_id", user.sub)
        .maybeSingle(),
      getRoleIdsByName(admin, ["Teacher", "Admin"]),
    ]);

  if (!hasRole(role?.role_id, TEACHER_ROLE_ID, ADMIN_ROLE_ID)) {
    return {
      error: NextResponse.json({ error: "Not authorized" }, { status: 403 }),
    };
  }

  return { admin };
}

// Serverless function (Vercel): lets any signed-in user fetch a class's
// attendance roster for a date — every student in the class, with their
// present/absent mark for that date, or null if not yet marked.
export async function GET(request: Request) {
  const auth = await authorizeUser();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { searchParams } = new URL(request.url);
  const classIdParam = searchParams.get("classId");
  const classId = classIdParam !== null ? Number(classIdParam) : NaN;
  const date = searchParams.get("date") ?? new Date().toISOString().slice(0, 10);

  if (!Number.isInteger(classId)) {
    return NextResponse.json(
      { error: "A valid classId is required" },
      { status: 400 },
    );
  }
  if (!DATE_RE.test(date)) {
    return NextResponse.json(
      { error: "date must be YYYY-MM-DD" },
      { status: 400 },
    );
  }

  const [
    { data: students, error: studentsError },
    { data: marks, error: marksError },
  ] = await Promise.all([
    admin.from("students").select("roll, name").eq("class", classId).order("roll"),
    admin.from("attendance").select("roll, present").eq("class", classId).eq("date", date),
  ]);

  if (studentsError || marksError) {
    return NextResponse.json(
      { error: (studentsError ?? marksError)?.message },
      { status: 500 },
    );
  }

  const presentByRoll = new Map(marks?.map((m) => [m.roll, m.present]));
  const roster = (students ?? []).map((s) => ({
    roll: s.roll,
    name: s.name,
    present: presentByRoll.has(s.roll) ? (presentByRoll.get(s.roll) ?? null) : null,
  }));

  return NextResponse.json({ students: roster });
}

// Serverless function (Vercel): lets an authorized teacher (or admin) mark a
// whole class's attendance for a date in one request — one checkbox's worth
// of state per student, submitted together. attendance's primary key is
// (roll, class), so marking again just overwrites that student's row —
// there's one current mark per student, not a running history per date.
export async function POST(request: Request) {
  const auth = await authorizeTeacherOrAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { classId, date, marks } = await request.json();

  if (typeof classId !== "number" || !Number.isInteger(classId)) {
    return NextResponse.json(
      { error: "A valid classId is required" },
      { status: 400 },
    );
  }
  if (date !== undefined && (typeof date !== "string" || !DATE_RE.test(date))) {
    return NextResponse.json(
      { error: "date must be YYYY-MM-DD" },
      { status: 400 },
    );
  }
  if (!Array.isArray(marks) || marks.length === 0) {
    return NextResponse.json(
      { error: "marks must be a non-empty array" },
      { status: 400 },
    );
  }
  for (const mark of marks) {
    if (typeof mark?.roll !== "number" || !Number.isInteger(mark.roll)) {
      return NextResponse.json(
        { error: "Each mark needs a valid roll" },
        { status: 400 },
      );
    }
    if (typeof mark.present !== "boolean") {
      return NextResponse.json(
        { error: "Each mark's present must be true or false" },
        { status: 400 },
      );
    }
  }

  // Resolve the date server-side so both the insert and update paths of the
  // upsert agree on it (a DB default only applies on insert).
  const attendanceDate = date ?? new Date().toISOString().slice(0, 10);

  const rows = marks.map((m: { roll: number; present: boolean }) => ({
    roll: m.roll,
    class: classId,
    present: m.present,
    date: attendanceDate,
  }));

  const { data: attendance, error } = await admin
    .from("attendance")
    .upsert(rows, { onConflict: "roll,class" })
    .select("roll, class, date, present");

  if (error) {
    const isInvalidStudent = error.code === "23503"; // FK violation
    return NextResponse.json(
      {
        error: isInvalidStudent
          ? "Student not found in that class"
          : error.message,
      },
      { status: isInvalidStudent ? 400 : 500 },
    );
  }

  return NextResponse.json({ success: true, attendance });
}
