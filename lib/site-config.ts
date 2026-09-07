import fs from "node:fs";
import path from "node:path";
import { parse as parseJsonc } from "jsonc-parser";

/**
 * Single source of truth for every piece of school-specific text used
 * across the site — nav labels, hero copy, contact info, teacher list.
 * All of it lives in school.config.jsonc at the repo root: to point this
 * site at a different school, edit that file (and swap the images it
 * references under public/, plus app/icon.jpeg, app/opengraph-image.png
 * and app/twitter-image.png, which Next.js picks up by filename and so
 * can't be driven from JSON) — no code changes needed.
 *
 * This module reads and adapts that file for use in code: it's JSONC
 * (JSON with `//` comments) rather than plain JSON, so it's read from disk
 * and parsed here instead of via a static `import ... from "*.json"` —
 * Node/TypeScript's built-in JSON module support doesn't allow comments.
 * That also means this file must stay server-only: `fs` isn't available in
 * the browser. Client Components get this data via useSite() instead (see
 * site-provider.tsx), which takes it as a prop from a Server Component
 * rather than importing this module directly, so none of this ends up in
 * the client bundle.
 *
 * Note `features.items[].icon` is kept here as a plain string, not
 * resolved to a component: siteConfig crosses into Client Components as a
 * plain prop (see site-provider.tsx), and a resolved icon would be a
 * function — which can't cross that boundary. See lib/site-icons.ts for
 * where it's resolved instead.
 *
 * Reading from disk also means TypeScript can no longer infer this file's
 * shape the way it could from a plain JSON import, so RawSiteConfig below
 * spells that shape out by hand — keep it in sync with
 * school.config.jsonc.
 *
 * Read this directly in Server Components (`import { siteConfig } from
 * "@/lib/site-config"`), or via `useSite()` (see site-provider.tsx) in
 * Client Components.
 */

type LabeledLink = { label: string; href: string };
type Image = { src: string; alt: string };

type RawSiteConfig = {
  name: string;
  shortName: string;
  initials: string;
  description: string;
  nav: LabeledLink[];
  hero: {
    eyebrow: string;
    headline: string;
    body: string;
    primaryCta: LabeledLink;
    secondaryCta: LabeledLink;
    image: Image;
  };
  features: {
    heading: string;
    body: string;
    // `icon` is a name from the map in lib/site-icons.ts, e.g. "Users".
    items: { icon: string; title: string; body: string }[];
  };
  about: {
    eyebrow: string;
    heading: string;
    body: string;
    cta: LabeledLink;
    images: Image[];
  };
  gallery: {
    eyebrow: string;
    heading: string;
    body: string;
    images: Image[];
  };
  teachers: {
    eyebrow: string;
    heading: string;
    body: string;
    groupPhoto: Image;
  };
  cta: {
    eyebrow: string;
    heading: string;
    body: string;
    action: LabeledLink;
  };
  contact: {
    heading: string;
  };
  footer: { blurb: string };
};

const configPath = path.join(process.cwd(), "school.config.jsonc");

export const siteConfig = parseJsonc(
  fs.readFileSync(configPath, "utf8"),
) as RawSiteConfig;

export type SiteConfig = typeof siteConfig;
