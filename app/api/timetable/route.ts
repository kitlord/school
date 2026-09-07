import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;

type EntryInput = {
  dayOfWeek: number;
  periodNumber: number;
  startTime?: string | null;
  endTime?: string | null;
  subjectId?: number | null;
  title?: string | null;
  teacherName?: string | null;
};

function validateEntry(entry: unknown, index: number): string | null {
  const e = entry as Partial<EntryInput> | null;
  const at = `Period ${index + 1}`;

  if (!e || typeof e !== "object") return `${at}: invalid entry`;

  if (
    typeof e.dayOfWeek !== "number" ||
    !Number.isInteger(e.dayOfWeek) ||
    e.dayOfWeek < 1 ||
    e.dayOfWeek > 6
  ) {
    return `${at}: dayOfWeek must be 1 (Monday) through 6 (Saturday)`;
  }
  if (
    typeof e.periodNumber !== "number" ||
    !Number.isInteger(e.periodNumber) ||
    e.periodNumber < 1
  ) {
    return `${at}: periodNumber must be a positive integer`;
  }
  if (
    e.startTime != null &&
    (typeof e.startTime !== "string" || !TIME_RE.test(e.startTime))
  ) {
    return `${at}: startTime must be HH:MM`;
  }
  if (
    e.endTime != null &&
    (typeof e.endTime !== "string" || !TIME_RE.test(e.endTime))
  ) {
    return `${at}: endTime must be HH:MM`;
  }
  if (
    e.subjectId != null &&
    (typeof e.subjectId !== "number" || !Number.isInteger(e.subjectId))
  ) {
    return `${at}: subjectId must be a valid id`;
  }
  if (e.title != null && typeof e.title !== "string") {
    return `${at}: title must be text`;
  }
  if (!e.subjectId && !e.title?.trim()) {
    return `${at}: needs a subject or a title (e.g. "Lunch break")`;
  }
  if (e.teacherName != null && typeof e.teacherName !== "string") {
    return `${at}: teacherName must be text`;
  }

  return null;
}

// Serverless function (Vercel): returns the published timetable for one
// class (or one section of it, for classes with multiple sections) — fully
// public, no sign-in required, since the timetable is meant to be visible
// to parents and students alike.
export async function GET(request: Request) {
  const admin = createAdminClient();

  const { searchParams } = new URL(request.url);
  const classIdParam = searchParams.get("classId");
  const classId = classIdParam !== null ? Number(classIdParam) : NaN;
  const sectionIdParam = searchParams.get("sectionId");
  const sectionId = sectionIdParam !== null ? Number(sectionIdParam) : null;

  if (!Number.isInteger(classId)) {
    return NextResponse.json(
      { error: "A valid classId is required" },
      { status: 400 },
    );
  }
  if (sectionId !== null && !Number.isInteger(sectionId)) {
    return NextResponse.json(
      { error: "sectionId must be a valid id" },
      { status: 400 },
    );
  }

  let query = admin
    .from("timetable_entries")
    .select(
      "id, day_of_week, period_number, start_time, end_time, subject_id, title, teacher_name, subject:subjects(name)",
    )
    .eq("class_id", classId)
    .order("day_of_week")
    .order("period_number");
  query = sectionId !== null
    ? query.eq("section_id", sectionId)
    : query.is("section_id", null);

  const { data: entries, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ entries });
}

// Serverless function (Vercel): lets an Admin issue (replace) the whole
// timetable for a class/section in one request — the same "submit the full
// set at once" shape as marking attendance (see ../attendance/route.ts).
// Unlike attendance's upsert, this fully replaces what's stored for that
// class/section: the old rows are deleted first, so removing a period from
// the submitted list actually removes it rather than leaving it stale.
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { classId, sectionId, entries } = await request.json();

  if (typeof classId !== "number" || !Number.isInteger(classId)) {
    return NextResponse.json(
      { error: "A valid classId is required" },
      { status: 400 },
    );
  }
  if (
    sectionId !== undefined &&
    sectionId !== null &&
    (typeof sectionId !== "number" || !Number.isInteger(sectionId))
  ) {
    return NextResponse.json(
      { error: "sectionId must be a valid id" },
      { status: 400 },
    );
  }
  if (!Array.isArray(entries)) {
    return NextResponse.json(
      { error: "entries must be an array (it may be empty)" },
      { status: 400 },
    );
  }

  // Same rule as adding a student: once a class has any sections, a
  // section must be picked — classes with none (e.g. LKG/UKG) are
  // unaffected.
  const { data: sections, error: sectionsError } = await admin
    .from("sections")
    .select("id")
    .eq("class_id", classId);

  if (sectionsError) {
    return NextResponse.json({ error: sectionsError.message }, { status: 500 });
  }

  if (sections.length > 0 && (sectionId === undefined || sectionId === null)) {
    return NextResponse.json(
      { error: "A section is required for this class" },
      { status: 400 },
    );
  }
  if (
    sectionId !== undefined &&
    sectionId !== null &&
    !sections.some((s) => s.id === sectionId)
  ) {
    return NextResponse.json(
      { error: "Section not found in that class" },
      { status: 400 },
    );
  }

  for (let i = 0; i < entries.length; i++) {
    const message = validateEntry(entries[i], i);
    if (message) {
      return NextResponse.json({ error: message }, { status: 400 });
    }
  }

  const seen = new Set<string>();
  for (const e of entries as EntryInput[]) {
    const key = `${e.dayOfWeek}-${e.periodNumber}`;
    if (seen.has(key)) {
      return NextResponse.json(
        { error: `Duplicate period ${e.periodNumber} on the same day` },
        { status: 400 },
      );
    }
    seen.add(key);
  }

  let deleteQuery = admin
    .from("timetable_entries")
    .delete()
    .eq("class_id", classId);
  deleteQuery = sectionId
    ? deleteQuery.eq("section_id", sectionId)
    : deleteQuery.is("section_id", null);

  const { error: deleteError } = await deleteQuery;
  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  if (entries.length === 0) {
    return NextResponse.json({ success: true, entries: [] });
  }

  const rows = (entries as EntryInput[]).map((e) => ({
    class_id: classId,
    section_id: sectionId ?? null,
    day_of_week: e.dayOfWeek,
    period_number: e.periodNumber,
    start_time: e.startTime ?? null,
    end_time: e.endTime ?? null,
    subject_id: e.subjectId ?? null,
    title: e.title?.trim() || null,
    teacher_name: e.teacherName?.trim() || null,
  }));

  const { data: inserted, error: insertError } = await admin
    .from("timetable_entries")
    .insert(rows)
    .select(
      "id, day_of_week, period_number, start_time, end_time, subject_id, title, teacher_name, subject:subjects(name)",
    );

  if (insertError) {
    const isInvalidSubject = insertError.code === "23503"; // FK violation
    return NextResponse.json(
      {
        error: isInvalidSubject
          ? "Subject not found"
          : insertError.message,
      },
      { status: isInvalidSubject ? 400 : 500 },
    );
  }

  return NextResponse.json({ success: true, entries: inserted });
}
