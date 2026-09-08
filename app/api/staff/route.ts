import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// Serverless function (Vercel): returns the public staff directory shown
// on the home page's "Meet Our Teachers" section — fully public, no
// sign-in required, same as the events and timetable endpoints.
export async function GET() {
  const admin = createAdminClient();

  const { data: staff, error } = await admin
    .from("staff")
    .select("id, name, designation, role, display_order")
    .order("display_order")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ staff });
}

// Serverless function (Vercel): lets an Admin add someone to the public
// staff directory — see the Staff section on /admin. This is distinct
// from granting the Teacher/Admin role (see app/admin/actions.ts): a role
// controls what a signed-in account can do, this just controls who shows
// up on the home page. Neither implies the other.
export async function POST(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { name, designation, role, displayOrder } = await request.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }
  if (typeof designation !== "string" || !designation.trim()) {
    return NextResponse.json(
      { error: "Designation is required" },
      { status: 400 },
    );
  }
  if (role !== undefined && role !== null && typeof role !== "string") {
    return NextResponse.json({ error: "role must be text" }, { status: 400 });
  }
  if (
    displayOrder !== undefined &&
    (typeof displayOrder !== "number" || !Number.isInteger(displayOrder))
  ) {
    return NextResponse.json(
      { error: "displayOrder must be a valid integer" },
      { status: 400 },
    );
  }

  const { data, error } = await admin
    .from("staff")
    .insert({
      name: name.trim(),
      designation: designation.trim(),
      role: typeof role === "string" ? role.trim() || null : null,
      display_order: displayOrder ?? 0,
    })
    .select("id, name, designation, role, display_order")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, staff: data });
}
