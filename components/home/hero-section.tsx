import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/placeholder-image";
import { useSite } from "@/components/site-provider";

export function HeroSection() {
  const { hero } = useSite();

  return (
    <section id="home" className="w-full">
      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
        <div className="flex flex-col items-start gap-5">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            {hero.eyebrow}
          </span>
          <h1 className="text-4xl leading-tight md:text-5xl">
            {hero.headline}
          </h1>
          <div className="h-1 w-16 bg-primary" />
          <p className="max-w-md text-base text-muted-foreground">
            {hero.body}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <Button asChild size="lg">
              <Link href={hero.primaryCta.href}>{hero.primaryCta.label}</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={hero.secondaryCta.href}>
                {hero.secondaryCta.label}
              </Link>
            </Button>
          </div>
        </div>

        <PlaceholderImage
          label="Campus photo"
          className="aspect-[4/3] w-full rounded-lg"
        />
      </div>
    </section>
  );
}
