import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

// Serverless function (Vercel): lets an Admin set any user's display name
// (stored in that user's auth `user_metadata.full_name`) — there's no
// separate profile table for it. Currently only used to name whoever shows
// up as "headmaster" (see /api/headmaster, the first-joined Admin), but
// works for any user.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { userId } = await params;
  const { fullName } = await request.json();

  if (typeof fullName !== "string") {
    return NextResponse.json({ error: "fullName is required" }, { status: 400 });
  }

  // Fetch first and merge rather than overwrite: updateUserById replaces
  // user_metadata wholesale, and other fields may be stored there already
  // (or in future).
  const { data: existing, error: getError } =
    await admin.auth.admin.getUserById(userId);
  if (getError || !existing.user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { data, error } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: {
      ...existing.user.user_metadata,
      full_name: fullName.trim() || null,
    },
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    fullName: (data.user.user_metadata as { full_name?: string } | null)
      ?.full_name ?? null,
  });
}
