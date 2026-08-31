import { Suspense } from "react";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ClipboardCheck,
  ClipboardList,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hasRole } from "@/lib/supabase/roles";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type QuickLink = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

// Landing page after sign-in. It's role-aware: everyone gets a link to view
// attendance, Teacher/Admin also get Students and Mark attendance, and Admin
// alone gets User roles. This is the only place in the app that links out to
// those pages, so a signed-in user can actually discover them.
async function DashboardContent() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) redirect("/auth/login");

  // RLS on user_roles/roles has no policies, so reads go through the
  // service-role client too (same pattern as the other gated pages).
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
  const teacherRoleId = roles?.find((r) => r.name === "Teacher")?.id;
  const roleName =
    roles?.find((r) => r.id === myRole?.role_id)?.name ?? "No role assigned";

  const isAdmin = hasRole(myRole?.role_id, adminRoleId);
  const isTeacherOrAdmin = hasRole(myRole?.role_id, teacherRoleId, adminRoleId);

  // Roster-wide counts are only fetched for Teacher/Admin — same roles that
  // can already see this data via the Students and Mark attendance pages.
  let studentCount: number | null = null;
  let classCount: number | null = null;
  if (isTeacherOrAdmin) {
    const [{ count: students }, { count: classes }] = await Promise.all([
      admin.from("students").select("*", { count: "exact", head: true }),
      admin.from("classes").select("*", { count: "exact", head: true }),
    ]);
    studentCount = students ?? 0;
    classCount = classes ?? 0;
  }

  const links: QuickLink[] = [
    {
      href: "/attendance",
      title: "Attendance",
      description: "Look up a class's attendance for any date.",
      icon: ClipboardList,
    },
    ...(isTeacherOrAdmin
      ? [
          {
            href: "/attendance/mark",
            title: "Mark attendance",
            description: "Take roll call for a class.",
            icon: ClipboardCheck,
          },
          {
            href: "/students",
            title: "Students",
            description: "Enrol a new student in a class.",
            icon: Users,
          },
        ]
      : []),
    ...(isAdmin
      ? [
          {
            href: "/admin",
            title: "User roles",
            description: "Manage every user's role.",
            icon: ShieldCheck,
          },
        ]
      : []),
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-bold text-2xl">Welcome back</h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Badge variant="secondary">{roleName}</Badge>
      </div>

      {isTeacherOrAdmin && (
        <div className="grid grid-cols-2 gap-4 sm:max-w-xs">
          <Card>
            <CardHeader className="gap-1 p-4">
              <CardDescription>Students</CardDescription>
              <CardTitle className="text-3xl">{studentCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="gap-1 p-4">
              <CardDescription>Classes</CardDescription>
              <CardTitle className="text-3xl">{classCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            <Card className="h-full transition-colors hover:bg-accent">
              <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
                <link.icon className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">{link.title}</CardTitle>
                  <CardDescription>{link.description}</CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
    >
      <DashboardContent />
    </Suspense>
  );
}
