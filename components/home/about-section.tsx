import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useSite } from "@/components/site-provider";

type Headmaster = { name: string | null; email: string | null };

export function AboutSection() {
  const { about } = useSite();
  const [headmaster, setHeadmaster] = useState<Headmaster | null>(null);

  // The headmaster isn't configured content — it's derived from whichever
  // Admin-role account was created first (see GET /api/headmaster). A
  // display name comes from that user's auth metadata, settable by any
  // Admin from /admin; falls back to their email if none is set.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const response = await fetch("/api/headmaster");
        const result = await response.json();
        if (!cancelled && response.ok) {
          setHeadmaster(result.headmaster as Headmaster | null);
        }
      } catch {
        // Leave headmaster unset — the rest of the section renders either way.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section id="about" className="w-full">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-5 py-16 text-center md:py-24">
        {about.images?.length > 0 && (
          <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
            {about.images.map((image) => (
              <div
                key={image.src}
                className="relative aspect-[3/2] w-full overflow-hidden rounded-md"
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  className="object-cover object-top"
                  sizes="(min-width: 640px) 33vw, 50vw"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex max-w-2xl flex-col items-center gap-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            {about.eyebrow}
          </span>
          <h2 className="text-3xl">{about.heading}</h2>
          <div className="h-1 w-16 bg-primary" />
          <p className="text-muted-foreground">{about.body}</p>
          {headmaster && (headmaster.name || headmaster.email) && (
            <p className="text-sm text-muted-foreground">
              Led by Headmaster {headmaster.name ?? headmaster.email}
            </p>
          )}
          <Button asChild className="mt-2">
            <Link href={about.cta.href}>{about.cta.label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
