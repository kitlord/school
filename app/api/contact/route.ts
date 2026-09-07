import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/supabase/require-admin";

// contact_info has one row (id 1) per the table's singleton contract — see
// its migration.
const ROW_ID = 1;

type ContactRow = {
  address: string | null;
  phone: string | null;
  phone_alt: string | null;
  whatsapp: string | null;
  whatsapp_country_code: string | null;
  email: string | null;
  hours: string | null;
};

function toContact(row: ContactRow) {
  return {
    address: row.address,
    phone: row.phone,
    phoneAlt: row.phone_alt,
    whatsapp: row.whatsapp,
    whatsappCountryCode: row.whatsapp_country_code,
    email: row.email,
    hours: row.hours,
  };
}

// Serverless function (Vercel): returns the school's public contact
// details shown in the site footer — fully public, no sign-in required.
export async function GET() {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("contact_info")
    .select("address, phone, phone_alt, whatsapp, whatsapp_country_code, email, hours")
    .eq("id", ROW_ID)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ contact: toContact(data) });
}

// Serverless function (Vercel): lets an Admin update the school's contact
// details in one request — every field is optional/nullable, so clearing
// one (e.g. no alternate phone) is just omitting or nulling it.
export async function PUT(request: Request) {
  const auth = await requireAdmin();
  if (auth.error) return auth.error;
  const { admin } = auth;

  const body = await request.json();
  const { address, phone, phoneAlt, whatsapp, whatsappCountryCode, email, hours } =
    body;

  const fields = { address, phone, phoneAlt, whatsapp, whatsappCountryCode, email, hours };
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined && value !== null && typeof value !== "string") {
      return NextResponse.json({ error: `${key} must be text` }, { status: 400 });
    }
  }

  const { data, error } = await admin
    .from("contact_info")
    .update({
      address: address ?? null,
      phone: phone ?? null,
      phone_alt: phoneAlt ?? null,
      whatsapp: whatsapp ?? null,
      whatsapp_country_code: whatsappCountryCode ?? null,
      email: email ?? null,
      hours: hours ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", ROW_ID)
    .select("address, phone, phone_alt, whatsapp, whatsapp_country_code, email, hours")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, contact: toContact(data) });
}
