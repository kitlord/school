import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName } from "@/lib/supabase/roles";

// Serverless function (Vercel): returns the current "headmaster" — defined
// as whichever Admin-role user's account was created first — for display
// on the home page's About section. Fully public, no sign-in required.
// There's no dedicated profile table for a display name: it's read from
// that user's auth `user_metadata.full_name`, set via PATCH
// /api/users/[userId] (see app/admin — any Admin can set any user's name).
export async function GET() {
  const admin = createAdminClient();

  const { Admin: ADMIN_ROLE_ID } = await getRoleIdsByName(admin, ["Admin"]);
  if (ADMIN_ROLE_ID === undefined) {
    return NextResponse.json({ headmaster: null });
  }

  const { data: adminRoles, error } = await admin
    .from("user_roles")
    .select("user_id")
    .eq("role_id", ADMIN_ROLE_ID);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const adminUserIds = new Set((adminRoles ?? []).map((r) => r.user_id));
  if (adminUserIds.size === 0) {
    return NextResponse.json({ headmaster: null });
  }

  // listUsers() paginates (default page size 50) — fine for a small
  // school's user base; revisit with pagination if that ever changes.
  const { data: usersData, error: usersError } =
    await admin.auth.admin.listUsers();
  if (usersError) {
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }

  const firstAdmin = usersData.users
    .filter((u) => adminUserIds.has(u.id))
    .sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )[0];

  if (!firstAdmin) {
    return NextResponse.json({ headmaster: null });
  }

  const fullName = (firstAdmin.user_metadata as { full_name?: string } | null)
    ?.full_name;

  return NextResponse.json({
    headmaster: {
      name: typeof fullName === "string" && fullName.trim() ? fullName.trim() : null,
      email: firstAdmin.email ?? null,
    },
  });
}
