import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateUserRole } from "./actions";

async function UserRolesTable() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) redirect("/auth/login");

  const admin = createAdminClient();

  const [{ data: myRole }, { data: roles }] = await Promise.all([
    admin
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.sub)
      .maybeSingle(),
    admin.from("roles").select("id, name").order("id"),
  ]);

  const adminRoleId = roles?.find((r) => r.name === "Admin")?.id;
  const viewerRoleId = roles?.find((r) => r.name === "Viewer")?.id;

  if (myRole?.role_id !== adminRoleId) redirect("/protected");

  const [{ data: usersData }, { data: userRoles }] = await Promise.all([
    admin.auth.admin.listUsers(),
    admin.from("user_roles").select("user_id, role_id"),
  ]);

  const roleByUserId = new Map(userRoles?.map((r) => [r.user_id, r.role_id]));

  return (
    <table className="w-full text-sm border-collapse">
      <thead>
        <tr className="text-left border-b">
          <th className="p-2">Email</th>
          <th className="p-2">Role</th>
          <th className="p-2" />
        </tr>
      </thead>
      <tbody>
        {usersData.users.map((u) => (
          <tr key={u.id} className="border-b">
            <td className="p-2">{u.email}</td>
            <td className="p-2">
              <form
                action={updateUserRole}
                className="flex gap-2 items-center"
              >
                <input type="hidden" name="userId" value={u.id} />
                <select
                  name="roleId"
                  defaultValue={roleByUserId.get(u.id) ?? viewerRoleId}
                  className="border rounded px-2 py-1 bg-background"
                >
                  {roles?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
                <button type="submit" className="underline text-xs">
                  Save
                </button>
              </form>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function AdminPanel() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8">
      <h1 className="font-bold text-2xl">User Roles</h1>
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
      >
        <UserRolesTable />
      </Suspense>
    </div>
  );
}
