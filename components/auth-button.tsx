import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";

export async function AuthButton() {
  const supabase = await createClient();

  // getUser() (not the faster getClaims()) because we need user_metadata
  // for the display name below, which isn't in the JWT claims.
  const { data, error } = await supabase.auth.getUser();
  const user = !error ? data.user : null;

  const fullName = (user?.user_metadata as { full_name?: string } | null)
    ?.full_name?.trim();
  const displayName = fullName || user?.email;

  return user ? (
    <div className="flex min-w-0 flex-wrap items-center gap-4 break-words">
      Hey, {displayName}!
      <LogoutButton />
    </div>
  ) : (
    <div className="flex gap-2">
      <Button asChild size="sm" variant={"outline"}>
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
