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

/**
 * True if `roleId` matches one of `requiredIds`. Use this instead of a bare
 * `roleId !== requiredId` check: if a required role's id wasn't found (e.g.
 * `getRoleIdsByName` didn't find a "Teacher" row because it was renamed or
 * never seeded), the id comes back `undefined` — a bare `!==` comparison
 * against a caller with no role assigned (also `undefined`) would then read
 * as a match and authorize them. This treats an undefined required id as
 * "no match" so authorization fails closed instead.
 */
export function hasRole(
  roleId: number | null | undefined,
  ...requiredIds: (number | undefined)[]
) {
  return requiredIds.some((id) => id !== undefined && roleId === id);
}
