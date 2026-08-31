import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName, hasRole } from "@/lib/supabase/roles";

// Serverless function (Vercel): lets an authenticated Admin post a new
// event. The caller's role is looked up server-side via the service-role
// client, so a request can't self-elevate by just claiming to be an admin.
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Service role bypasses RLS to look up the caller's role and, once
  // authorized, to write the new event row.
  const admin = createAdminClient();
  const [{ data: role }, { Admin: ADMIN_ROLE_ID }] = await Promise.all([
    admin
      .from("user_roles")
      .select("role_id")
      .eq("user_id", user.sub)
      .maybeSingle(),
    getRoleIdsByName(admin, ["Admin"]),
  ]);

  if (!hasRole(role?.role_id, ADMIN_ROLE_ID)) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 });
  }

  const { title, description } = await request.json();

  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json(
      { error: "Event title is required" },
      { status: 400 },
    );
  }

  if (typeof description !== "string" || !description.trim()) {
    return NextResponse.json(
      { error: "Event description is required" },
      { status: 400 },
    );
  }

  const { data: event, error } = await admin
    .from("events")
    .insert({ title: title.trim(), description: description.trim() })
    .select("id, title, description, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, event });
}
