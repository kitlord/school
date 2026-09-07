import { Suspense } from "react";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { DeployButton } from "@/components/deploy-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { hasEnvVars } from "@/lib/utils";
import { siteConfig } from "@/lib/site-config";
import { AttendanceList } from "@/components/attendance-list";

// Public: anyone can view attendance, signed in or not — this page lives
// outside app/dashboard/ and, unlike the teacher-only attendance marking
// page (app/attendance/mark), doesn't redirect signed-out visitors away
// (same pattern as app/events/page.tsx and app/timetable/page.tsx).
async function AttendanceListGate() {
  // RLS on classes has no policies, so reads go through the service-role
  // client too (same pattern as the other public pages).
  const admin = createAdminClient();
  const [{ data: classes }, { data: sections }] = await Promise.all([
    admin.from("classes").select("id, name").order("name"),
    admin.from("sections").select("id, name, class_id").order("name"),
  ]);

  return <AttendanceList classes={classes ?? []} sections={sections ?? []} />;
}

export default function AttendanceListPage() {
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
          <h1 className="font-bold text-2xl">Attendance</h1>
          <Suspense
            fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
          >
            <AttendanceListGate />
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
