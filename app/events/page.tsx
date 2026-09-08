import { Suspense } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName, hasRole } from "@/lib/supabase/roles";
import { EnvVarWarning } from "@/components/env-var-warning";
import { AuthButton } from "@/components/auth-button";
import { hasEnvVars } from "@/lib/utils";
import { SiteHeader } from "@/components/home/site-header";
import { AddEventForm } from "@/components/add-event-form";

type Event = {
  id: number;
  title: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  created_at: string;
};

// Public: anyone can view events, signed in or not — this page lives
// outside app/dashboard/ and, unlike the Students/Attendance pages, doesn't
// redirect signed-out visitors away.
async function EventList() {
  // RLS on events has no policies, so reads go through the service-role
  // client too (same pattern as the other pages) — the events themselves
  // are public, only posting is gated.
  const admin = createAdminClient();
  const { data: events, error } = await admin
    .from("events")
    .select("id, title, description, image_url, video_url, created_at")
    .order("created_at", { ascending: false })
    .returns<Event[]>();

  if (error) {
    return <p className="text-sm text-red-500">{error.message}</p>;
  }

  if (!events || events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No events posted yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {events.map((event) => (
        <div key={event.id} className="rounded-md border p-4">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="font-semibold">{event.title}</h2>
            <time
              dateTime={event.created_at}
              className="shrink-0 text-xs text-muted-foreground"
            >
              {new Date(event.created_at).toLocaleDateString()}
            </time>
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
            {event.description}
          </p>
          {event.image_url && (
            <div className="relative mt-3 aspect-video w-full overflow-hidden rounded-md">
              <Image
                src={event.image_url}
                alt={event.title}
                fill
                className="object-cover"
                sizes="(min-width: 672px) 42rem, 100vw"
              />
            </div>
          )}
          {event.video_url && (
            <video
              src={event.video_url}
              controls
              className="mt-3 w-full rounded-md"
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Admin-only: signed-out visitors and non-admins get nothing here, not a
// redirect — the rest of the page (the event list above) stays visible.
async function AdminPostEvent() {
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

  return <AddEventForm className="max-w-sm" />;
}

export default function EventsPage() {
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
        <div className="flex-1 flex flex-col gap-8 max-w-2xl w-full p-5">
          <h1 className="font-bold text-2xl">Events</h1>
          <Suspense
            fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
          >
            <AdminPostEvent />
          </Suspense>
          <Suspense
            fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
          >
            <EventList />
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
