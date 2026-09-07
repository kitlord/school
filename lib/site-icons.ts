import {
  ClipboardList,
  GraduationCap,
  Monitor,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Resolves a `features.items[].icon` name from school.config.jsonc to the
 * actual Lucide icon component. Split out from lib/site-config.ts because
 * that module is server-only (it reads school.config.jsonc from disk) and
 * its result crosses into Client Components as a plain prop (see
 * site-provider.tsx) — a resolved icon is a React component, i.e. a
 * function, and functions can't be passed from a Server Component to a
 * Client Component as prop/context data. So siteConfig keeps `icon` as a
 * plain string, and Client Components that render an icon (currently just
 * features-section.tsx) resolve it via this client-safe module instead.
 *
 * Add to this map if a new school's config wants a different icon.
 */
const icons = {
  Users,
  ClipboardList,
  GraduationCap,
  Monitor,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

export function resolveIcon(name: string): LucideIcon {
  return icons[name as IconName] ?? Users;
}
