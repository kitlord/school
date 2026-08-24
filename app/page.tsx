import { Suspense } from "react";
import { AuthButton } from "@/components/auth-button";
import { EnvVarWarning } from "@/components/env-var-warning";
import { hasEnvVars } from "@/lib/utils";
import { HomePage } from "@/components/home/home-page";

export default function Home() {
  return (
    <HomePage
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
  );
}
