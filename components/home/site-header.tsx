import Link from "next/link";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Menu } from "lucide-react";
import { useSite } from "@/components/site-provider";

export function SiteHeader({ authSlot }: { authSlot: React.ReactNode }) {
  const site = useSite();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-backdrop-blur:bg-background/80">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="#home" className="flex items-center gap-2 shrink-0">
          <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
            {site.initials}
          </span>
          <span className="font-display text-lg text-heading">
            {site.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {site.nav.map((item) => (
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
            {site.nav.map((item) => (
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
