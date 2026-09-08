import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName, hasRole } from "@/lib/supabase/roles";

// Serverless function (Vercel): tells the nav (see SiteHeader,
// use-current-user.ts) whether the caller is signed in and holds the
// Teacher or Admin role, so it knows whether to show a "Dashboard" link.
// Not a general profile endpoint — /dashboard itself is open to any
// signed-in user (including Viewer), this just controls the nav shortcut.
export async function GET() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return NextResponse.json({ signedIn: false, canAccessDashboard: false });
  }

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

  return NextResponse.json({
    signedIn: true,
    canAccessDashboard: hasRole(role?.role_id, TEACHER_ROLE_ID, ADMIN_ROLE_ID),
  });
}
