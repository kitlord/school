"use client";

import { createContext, useContext } from "react";
import type { SiteConfig } from "@/lib/site-config";

const SiteContext = createContext<SiteConfig | null>(null);

/**
 * Makes the school's details (lib/site-config.ts) available to any Client
 * Component via useSite(), without threading props through every layer.
 * Mounted once in app/layout.tsx — a Server Component, which reads
 * lib/site-config.ts and passes the result down as `site` — so it's
 * available everywhere.
 *
 * This only imports SiteConfig's *type*, not lib/site-config.ts itself:
 * that module reads school.config.jsonc from disk via `fs`, which isn't
 * available in the browser, so it must never end up in the client bundle.
 * A type-only import is erased at compile time, so it doesn't pull the
 * module in.
 *
 * Server Components can't use context — they should import `siteConfig`
 * directly from "@/lib/site-config" instead, which is the same data.
 */
export function SiteProvider({
  children,
  site,
}: {
  children: React.ReactNode;
  site: SiteConfig;
}) {
  return <SiteContext.Provider value={site}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const site = useContext(SiteContext);
  if (!site) {
    throw new Error("useSite() must be used within <SiteProvider>");
  }
  return site;
}
