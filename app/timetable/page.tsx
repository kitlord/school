import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName, hasRole } from "@/lib/supabase/roles";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import { SiteHeader } from "@/components/home/site-header";
import { TimetableView } from "@/components/timetable-view";
import { TimetableEditor } from "@/components/timetable-editor";

// Public: anyone can view the timetable, signed in or not — this page lives
// outside app/dashboard/ and, like Events (see app/events/page.tsx), doesn't
// redirect signed-out visitors away.
async function PublicTimetable() {
  // RLS on classes/sections has no policies, so reads go through the
  // service-role client too (same pattern as the other pages) — classes and
  // sections are public, only issuing a timetable is gated.
  const admin = createAdminClient();
  const [{ data: classes }, { data: sections }] = await Promise.all([
    admin.from("classes").select("id, name").order("name"),
    admin.from("sections").select("id, name, class_id").order("name"),
  ]);

  return <TimetableView classes={classes ?? []} sections={sections ?? []} />;
}

// Admin-only: signed-out visitors and non-admins get nothing here, not a
// redirect — the public timetable above stays visible either way (same
// pattern as app/events/page.tsx's AdminPostEvent).
async function AdminIssueTimetable() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) return null;

  const admin = createAdminClient();
  const [{ data: role }, { Admin: ADMIN_ROLE_ID }] = await Promise.all([
    admin
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.sub)
      .maybeSingle(),
    getRoleIdsByName(admin, ["Admin"]),
  ]);

  if (!hasRole(role?.role_id, ADMIN_ROLE_ID)) return null;

  const [{ data: classes }, { data: sections }, { data: subjects }] =
    await Promise.all([
      admin.from("classes").select("id, name").order("name"),
      admin.from("sections").select("id, name, class_id").order("name"),
      admin.from("subjects").select("id, name").order("name"),
    ]);

  return (
    <TimetableEditor
      classes={classes ?? []}
      sections={sections ?? []}
      subjects={subjects ?? []}
    />
  );
}

export default function TimetablePage() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-20 items-center">
        {/* print:hidden throughout: clicking "Download PDF" on the
            timetable below just calls window.print(), so anything that
            isn't the timetable itself (nav, admin editor, footer) is
            hidden for that print — see TimetableView. */}
        <div className="w-full print:hidden">
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
        </div>
        <div className="flex-1 flex flex-col gap-8 max-w-4xl w-full p-5">
          <h1 className="font-bold text-2xl print:hidden">Timetable</h1>
          <div className="print:hidden">
            <Suspense
              fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
            >
              <AdminIssueTimetable />
            </Suspense>
          </div>
          <Suspense
            fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
          >
            <PublicTimetable />
          </Suspense>
        </div>

        <footer className="w-full flex items-center justify-center border-t mx-auto text-center text-xs gap-8 py-16 print:hidden">
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
