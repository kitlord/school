"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName, hasRole } from "@/lib/supabase/roles";

async function requireAdmin() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;
  if (!user) throw new Error("Not authenticated");

  const admin = createAdminClient();
  const [{ data: role }, { Admin: ADMIN_ROLE_ID }] = await Promise.all([
    admin
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.sub)
      .maybeSingle(),
    getRoleIdsByName(admin, ["Admin"]),
  ]);

  if (!hasRole(role?.role_id, ADMIN_ROLE_ID)) throw new Error("Not authorized");

  return { admin, user };
}

export async function updateUserRole(formData: FormData) {
  const { admin } = await requireAdmin();

  const userId = formData.get("userId") as string;
  const roleId = Number(formData.get("roleId"));

  await admin.from("user_roles").upsert({ user_id: userId, role_id: roleId });

  revalidatePath("/admin");
}

// Removing a "teacher" (or any other user) means deleting their account
// outright — there's no separate teachers table, a teacher is just a user
// with the Teacher role. This cascades to their role assignment, subjects
// taught, etc. (all FKs to auth.users here are ON DELETE CASCADE) and is
// irreversible: they'd need to sign up again from scratch.
export async function deleteUser(userId: string) {
  const { admin, user } = await requireAdmin();

  if (userId === user.sub) {
    throw new Error("You can't remove your own account");
  }

  const { error } = await admin.auth.admin.deleteUser(userId);
  if (error) throw error;

  revalidatePath("/admin");
}
