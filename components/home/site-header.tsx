"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Menu } from "lucide-react";
import { useSite } from "@/components/site-provider";
import { useCurrentUser } from "@/components/home/use-current-user";

// Explicit "use client" (unlike most of components/home/*) because this
// is now imported directly by Server Component pages outside the home
// page (app/events, app/timetable, app/attendance, app/admin, ...), not
// just via home-page.tsx's own "use client" boundary — a plain import
// from a Server Component needs the file itself to declare the boundary,
// since useSite() (via useContext) doesn't work otherwise.
export function SiteHeader({ authSlot }: { authSlot: React.ReactNode }) {
  const site = useSite();
  // "Dashboard" is added to the nav for Teacher/Admin only (see
  // GET /api/me) — /dashboard itself is open to any signed-in user, this
  // is just a shortcut for the roles that get the most use out of it.
  const { canAccessDashboard } = useCurrentUser();
  const navItems = canAccessDashboard
    ? [...site.nav, { label: "Dashboard", href: "/dashboard" }]
    : site.nav;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt={site.name}
            width={32}
            height={32}
            className="size-8 object-contain"
          />
          <span className="font-display text-lg text-heading">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {authSlot}
          <ThemeSwitcher />
        </div>

        {/* Mobile menu — CSS-only disclosure, no client JS needed. */}
        <details className="relative md:hidden [&_summary::-webkit-details-marker]:hidden">
          <summary className="flex cursor-pointer list-none items-center justify-center rounded-md p-2 hover:bg-accent">
            <Menu className="size-5" />
            <span className="sr-only">Open menu</span>
          </summary>
          <div className="absolute right-0 top-full mt-2 flex w-72 max-w-[calc(100vw-2.5rem)] flex-col gap-1 rounded-md border border-border bg-popover p-3 shadow-md">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-sm px-2 py-1.5 text-sm font-medium text-popover-foreground hover:bg-accent hover:text-accent-foreground"
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 flex min-w-0 flex-wrap items-center gap-3 break-words border-t border-border pt-3">
              {authSlot}
              <ThemeSwitcher />
            </div>
          </div>
        </details>
      </div>
    </header>
  );
}
