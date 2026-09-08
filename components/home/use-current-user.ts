"use client";

import { useEffect, useState } from "react";

/**
 * Fetches just enough about the signed-in visitor (see GET /api/me) to
 * decide whether the nav should show a "Dashboard" link — used by
 * SiteHeader. Defaults to false/false while loading or signed out, so the
 * link simply doesn't show rather than flashing in.
 */
export function useCurrentUser() {
  const [signedIn, setSignedIn] = useState(false);
  const [canAccessDashboard, setCanAccessDashboard] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/me");
        const result = await response.json();
        if (!cancelled && response.ok) {
          setSignedIn(Boolean(result.signedIn));
          setCanAccessDashboard(Boolean(result.canAccessDashboard));
        }
      } catch {
        // Leave both false — the nav just omits the Dashboard link.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { signedIn, canAccessDashboard };
}
