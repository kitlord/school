import { useSite } from "@/components/site-provider";

export function FeaturesSection() {
  const { features } = useSite();

  return (
    <section className="w-full bg-muted">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-16 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] md:py-24">
        <div className="flex flex-col items-start gap-4">
          <h2 className="text-3xl">Why Choose Us</h2>
          <div className="h-1 w-16 bg-primary" />
          <p className="text-muted-foreground">
            A school run the way parents wish every school were run: small
            classes, real oversight, and nothing left to guesswork.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          {features.map((feature) => (
            <div key={feature.title} className="flex flex-col items-start gap-3">
              <feature.icon className="size-8 text-primary" strokeWidth={1.5} />
              <h3 className="text-lg">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
