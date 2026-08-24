import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSite } from "@/components/site-provider";

export function CtaSection() {
  const { cta } = useSite();

  return (
    <section className="w-full bg-secondary">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-4 px-5 py-16 text-center text-secondary-foreground md:py-24">
        <span className="text-sm font-semibold uppercase tracking-wide text-primary">
          {cta.eyebrow}
        </span>
        <h2 className="font-display text-3xl text-secondary-foreground md:text-4xl">
          {cta.heading}
        </h2>
        <p className="max-w-md text-secondary-foreground/70">{cta.body}</p>
        <Button asChild size="lg" className="mt-2">
          <Link href={cta.action.href}>{cta.action.label}</Link>
        </Button>
      </div>
    </section>
  );
}
