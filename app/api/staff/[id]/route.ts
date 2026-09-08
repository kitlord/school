import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/supabase/require-admin";

// Serverless function (Vercel): lets an Admin edit one staff member's
// details — see the Staff section on /admin. Every field is optional;
// only the ones present in the body get updated.
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "A valid id is required" }, { status: 400 });
  }

  const { name, designation, role, displayOrder } = await request.json();
  const updates: Record<string, unknown> = {};

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "name must be non-empty text" },
        { status: 400 },
      );
    }
    updates.name = name.trim();
  }
  if (designation !== undefined) {
    if (typeof designation !== "string" || !designation.trim()) {
      return NextResponse.json(
        { error: "designation must be non-empty text" },
        { status: 400 },
      );
    }
    updates.designation = designation.trim();
  }
  if (role !== undefined) {
    if (role !== null && typeof role !== "string") {
      return NextResponse.json({ error: "role must be text" }, { status: 400 });
    }
    updates.role = typeof role === "string" ? role.trim() || null : null;
  }
  if (displayOrder !== undefined) {
    if (typeof displayOrder !== "number" || !Number.isInteger(displayOrder)) {
      return NextResponse.json(
        { error: "displayOrder must be a valid integer" },
        { status: 400 },
      );
    }
    updates.display_order = displayOrder;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const { data, error } = await admin
    .from("staff")
    .update(updates)
    .eq("id", id)
    .select("id, name, designation, role, display_order")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, staff: data });
}

// Serverless function (Vercel): lets an Admin remove a staff member from
// the public directory. This never touches user_roles/auth.users — a
// staff row and a login account are unrelated (see route.ts).
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "A valid id is required" }, { status: 400 });
  }

  const { error } = await admin.from("staff").delete().eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
