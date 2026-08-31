import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

// Serverless function (Vercel): lets an authorized Admin remove a student.
// Unlike adding a student (Teacher or Admin, see ../route.ts), removal is
// Admin-only. attendance's FK to students is ON DELETE CASCADE, so this
// also permanently deletes that student's attendance history — there's no
// way to remove a student without losing their past attendance marks.
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ roll: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { roll: rollParam } = await params;
  const roll = Number(rollParam);

  if (!Number.isInteger(roll)) {
    return NextResponse.json(
      { error: "A valid roll is required" },
      { status: 400 },
    );
  }

  const { error } = await admin.from("students").delete().eq("roll", roll);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
