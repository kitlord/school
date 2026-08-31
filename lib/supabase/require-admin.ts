import { NextResponse } from "next/server";
import { createClient } from "./server";
import { createAdminClient } from "./admin";
import { getRoleIdsByName, hasRole } from "./roles";

// Shared by API routes that are Admin-only (posting/removing events,
// removing a student, ...): confirms the caller is signed in and holds the
// Admin role, returning the service-role client to use for the rest of the
// request. The caller's role is looked up server-side, so a request can't
// self-elevate by just claiming to be an admin.
export async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return {
      error: NextResponse.json({ error: "Not authenticated" }, { status: 401 }),
    };
  }

  const admin = createAdminClient();
  const [{ data: role }, { Admin: ADMIN_ROLE_ID }] = await Promise.all([
    admin
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.sub)
      .maybeSingle(),
    getRoleIdsByName(admin, ["Admin"]),
  ]);

  if (!hasRole(role?.role_id, ADMIN_ROLE_ID)) {
    return {
      error: NextResponse.json({ error: "Not authorized" }, { status: 403 }),
    };
  }

  return { admin, user };
}
