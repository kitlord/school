import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName, hasRole } from "@/lib/supabase/roles";
import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { MarkAttendanceForm } from "@/components/mark-attendance-form";

// This page lives outside app/dashboard/, so it isn't wrapped by the
// dashboard layout — it carries its own nav/footer (same pattern as
// app/attendance/page.tsx). Unlike that page (open to any signed-in user),
// this one is gated to the Teacher/Admin role since it writes attendance.
async function MarkAttendanceGate() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) redirect("/auth/login");

  // RLS on user_roles/classes has no policies, so reads go through the
  // service-role client too (same pattern as app/admin/page.tsx).
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

  if (!hasRole(role?.role_id, TEACHER_ROLE_ID, ADMIN_ROLE_ID)) {
    redirect("/dashboard");
  }

  const [{ data: classes }, { data: sections }] = await Promise.all([
    admin.from("classes").select("id, name").order("name"),
    admin.from("sections").select("id, name, class_id").order("name"),
  ]);

  return (
    <MarkAttendanceForm classes={classes ?? []} sections={sections ?? []} />
  );
}

export default function MarkAttendancePage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        <nav className="w-full flex justify-center border-b border-b-foreground/10 h-16">
          <div className="w-full max-w-5xl flex justify-between items-center p-3 px-5 text-sm">
            <div className="flex gap-5 items-center font-semibold">
              <Link href={"/"}>{siteConfig.name}</Link>
              <div className="flex items-center gap-2">
                <DeployButton />
              </div>
            </div>
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </nav>
        <div className="flex-1 flex flex-col gap-8 max-w-sm w-full p-5">
          <h1 className="font-bold text-2xl">Mark Attendance</h1>
          <Suspense
            fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
          >
            <MarkAttendanceGate />
          </Suspense>
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
          <ThemeSwitcher />
        </footer>
      </div>
    </main>
  );
}
