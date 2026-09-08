import { Suspense } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import { SiteHeader } from "@/components/home/site-header";
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
        </footer>
      </div>
    </main>
  );
}
