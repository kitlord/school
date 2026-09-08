import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasRole } from "@/lib/supabase/roles";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import { SiteHeader } from "@/components/home/site-header";
import { DeleteUserButton } from "@/components/delete-user-button";
import { EditUserNameField } from "@/components/edit-user-name-field";
import { ContactInfoForm } from "@/components/contact-info-form";
import { StaffManager } from "@/components/staff-manager";
import { updateUserRole, deleteUser } from "./actions";

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

  if (!hasRole(myRole?.role_id, adminRoleId)) redirect("/dashboard");

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
          <th className="p-2">Name</th>
          <th className="p-2">Role</th>
          <th className="p-2" />
          <th className="p-2" />
        </tr>
      </thead>
      <tbody>
        {usersData.users.map((u) => (
          <tr key={u.id} className="border-b">
            <td className="p-2">{u.email}</td>
            <td className="p-2">
              <EditUserNameField
                userId={u.id}
                initialName={
                  (u.user_metadata as { full_name?: string } | null)
                    ?.full_name ?? ""
                }
              />
            </td>
            <td className="p-2">
              <form
                action={updateUserRole}
                className="flex gap-2 items-center"
              >
                <input type="hidden" name="userId" value={u.id} />
                <select
                  name="roleId"
                  defaultValue={roleByUserId.get(u.id) ?? viewerRoleId}
                  className="border rounded px-2 py-1 bg-background text-foreground"
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
            <td className="p-2 text-right">
              <DeleteUserButton
                userId={u.id}
                email={u.email ?? "this user"}
                action={deleteUser}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// This page lives outside app/dashboard/, so it isn't wrapped by the
// dashboard layout — it carries its own nav/footer (same pattern as
// app/students/page.tsx and app/attendance/page.tsx).
export default function AdminPanel() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <SiteHeader
          authSlot={
            !hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )
          }
        />
        <div className="flex-1 flex flex-col gap-12 max-w-5xl w-full p-5">
          <div className="flex flex-col gap-8">
            <h1 className="font-bold text-2xl">User Roles</h1>
            {/* The home page's "Headmaster: ..." line (see
                components/home/about-section.tsx, GET /api/headmaster) is
                whichever Admin here joined first — set a Name below to
                have it show up there instead of that person's email. */}
            <Suspense
              fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
            >
              <UserRolesTable />
            </Suspense>
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-2xl">Staff</h2>
            <p className="text-sm text-muted-foreground">
              Shown on the home page&apos;s &quot;Meet Our Teachers&quot;
              section. This is separate from the Teacher/Admin role above —
              granting someone a role doesn&apos;t list them here, and
              listing someone here doesn&apos;t give them a role.
            </p>
            <StaffManager />
          </div>

          <div className="flex flex-col gap-4">
            <h2 className="font-bold text-2xl">Contact Info</h2>
            <p className="text-sm text-muted-foreground">
              Shown in the site footer. Leave a field blank to hide it there.
            </p>
            <ContactInfoForm />
          </div>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16">
          <p>
            Powered by{" "}
            <a
              href="https://supabase.com/?utm_source=create-next-app&utm_medium=template&utm_term=nextjs"
              target="_blank"
              className="font-bold hover:underline"
              rel="noreferrer"
            >
              Supabase
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
