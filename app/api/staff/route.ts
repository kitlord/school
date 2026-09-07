import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

// Serverless function (Vercel): returns the public staff directory shown
// on the home page's "Meet Our Teachers" section — fully public, no
// sign-in required, same as the events and timetable endpoints. There's no
// write endpoint yet: like classes/subjects, staff rows are managed
// directly in the database for now (see the `staff` table's comment).
export async function GET() {
  const admin = createAdminClient();

  const { data: staff, error } = await admin
    .from("staff")
    .select("id, name, designation, role")
    .order("display_order")
    .order("name");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ staff });
}
