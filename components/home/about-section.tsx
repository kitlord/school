import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PlaceholderImage } from "@/components/placeholder-image";
import { useSite } from "@/components/site-provider";

export function AboutSection() {
  const { about } = useSite();

  return (
    <section id="about" className="w-full">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-5 py-16 text-center md:py-24">
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4">
          {Array.from({ length: about.imageCount }).map((_, i) => (
            <PlaceholderImage
              key={i}
              label={`Photo ${i + 1}`}
              className="aspect-square w-full rounded-md"
            />
          ))}
        </div>

        <div className="flex max-w-2xl flex-col items-center gap-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            {about.eyebrow}
          </span>
          <h2 className="text-3xl">{about.heading}</h2>
          <div className="h-1 w-16 bg-primary" />
          <p className="text-muted-foreground">{about.body}</p>
          <Button asChild className="mt-2">
            <Link href={about.cta.href}>{about.cta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
