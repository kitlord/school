import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName } from "@/lib/supabase/roles";
import { MarkAttendanceForm } from "@/components/mark-attendance-form";

async function AttendanceGate() {
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

  if (role?.role_id !== TEACHER_ROLE_ID && role?.role_id !== ADMIN_ROLE_ID) {
    redirect("/protected");
  }

  const { data: classes } = await admin
    .from("classes")
    .select("id, name")
    .order("name");

  return <MarkAttendanceForm classes={classes ?? []} />;
}

export default function AttendancePage() {
  return (
    <div className="flex-1 w-full flex flex-col gap-8 max-w-sm">
      <h1 className="font-bold text-2xl">Attendance</h1>
      <Suspense
        fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
      >
        <AttendanceGate />
      </Suspense>
    </div>
  );
}
