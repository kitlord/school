import { PlaceholderImage } from "@/components/placeholder-image";
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
          {Array.from({ length: gallery.imageCount }).map((_, i) => (
            <PlaceholderImage
              key={i}
              label={`Photo ${i + 1}`}
              className="aspect-[4/3] w-full rounded-md"
            />
          ))}
        </div>
      </div>
    </section>
  );
}
