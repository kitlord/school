"use client";

import { createContext, useContext } from "react";
import { siteConfig, type SiteConfig } from "@/lib/site-config";

const SiteContext = createContext<SiteConfig>(siteConfig);

/**
 * Makes the school's details (lib/site-config.ts) available to any Client
 * Component via useSite(), without threading props through every layer.
 * Mounted once in app/layout.tsx, so it's available everywhere.
 *
 * Server Components can't use context — they should import `siteConfig`
 * directly from "@/lib/site-config" instead, which is the same data.
 */
export function SiteProvider({ children }: { children: React.ReactNode }) {
  return (
    <SiteContext.Provider value={siteConfig}>{children}</SiteContext.Provider>
  );
}

export function useSite() {
  return useContext(SiteContext);
}
