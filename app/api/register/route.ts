import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getRoleIdsByName } from "@/lib/supabase/roles";

// Serverless function (Vercel): handles sign-up via default Supabase auth,
// then assigns the new user the Viewer role.
export async function POST(request: Request) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email and password are required" },
      { status: 400 },
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${new URL(request.url).origin}/dashboard`,
    },
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Sign up failed" },
      { status: 400 },
    );
  }

  // Service role bypasses RLS since a brand-new user has no privileges yet.
  const admin = createAdminClient();
  const { Viewer: VIEWER_ROLE_ID } = await getRoleIdsByName(admin, ["Viewer"]);
  const { error: roleError } = await admin
    .from("user_roles")
    .insert({ user_id: data.user.id, role_id: VIEWER_ROLE_ID });

  if (roleError) {
    return NextResponse.json({ error: roleError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
