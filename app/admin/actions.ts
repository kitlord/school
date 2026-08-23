"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName } from "@/lib/supabase/roles";

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

  if (role?.role_id !== ADMIN_ROLE_ID) throw new Error("Not authorized");

  return admin;
}

export async function updateUserRole(formData: FormData) {
  const admin = await requireAdmin();

  const userId = formData.get("userId") as string;
  const roleId = Number(formData.get("roleId"));

  await admin.from("user_roles").upsert({ user_id: userId, role_id: roleId });

  revalidatePath("/admin");
}
