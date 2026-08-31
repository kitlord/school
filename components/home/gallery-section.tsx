import Image from "next/image";
import { useSite } from "@/components/site-provider";

export function GallerySection() {
  const { gallery } = useSite();

  return (
    <section id="gallery" className="w-full bg-muted">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-5 py-16 text-center md:py-24">
        <div className="flex max-w-2xl flex-col items-center gap-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            {gallery.eyebrow}
          </span>
          <h2 className="text-3xl">{gallery.heading}</h2>
          <div className="h-1 w-16 bg-primary" />
          <p className="text-muted-foreground">{gallery.body}</p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.images.map((image) => (
            <div
              key={image.src}
              className="relative aspect-[4/3] w-full overflow-hidden rounded-md"
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-cover"
                sizes="(min-width: 640px) 33vw, 50vw"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
