import { createAdminClient } from "./admin";

type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Looks up role ids by name from the `roles` table instead of hardcoding
 * them (e.g. `1` for Admin), so authorization checks stay correct even if
 * roles are reseeded or reordered.
 */
export async function getRoleIdsByName(admin: AdminClient, names: string[]) {
  const { data, error } = await admin
    .from("roles")
    .select("id, name")
    .in("name", names);

  if (error) throw error;

  return Object.fromEntries(
    (data ?? []).map((role) => [role.name, role.id]),
  ) as Record<string, number>;
}
