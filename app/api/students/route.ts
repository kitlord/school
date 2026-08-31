import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName, hasRole } from "@/lib/supabase/roles";

// Serverless function (Vercel): lets an authenticated, authorized teacher
// (or admin) add a new student. The caller's role is looked up server-side
// via the service-role client, so a request can't self-elevate by just
// claiming to be a teacher.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Service role bypasses RLS to look up the caller's role and, once
  // authorized, to write the new student row.
  const admin = createAdminClient();
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
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { name, classId } = await request.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json(
      { error: "Student name is required" },
      { status: 400 },
    );
  }

  if (typeof classId !== "number" || !Number.isInteger(classId)) {
    return NextResponse.json(
      { error: "A valid classId is required" },
      { status: 400 },
    );
  }

  const { data: student, error } = await admin
    .from("students")
    .insert({ name: name.trim(), class: classId })
    .select("roll, name, class")
    .single();

  if (error) {
    const isInvalidClass = error.code === "23503"; // FK violation on class
    return NextResponse.json(
      { error: isInvalidClass ? "Class not found" : error.message },
      { status: isInvalidClass ? 400 : 500 },
    );
  }

  return NextResponse.json({ success: true, student });
}
