import { useSite } from "@/components/site-provider";

export function TeachersSection() {
  const { teachers } = useSite();

  return (
    <section id="teachers" className="w-full">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-10 px-5 py-16 text-center md:py-24">
        <div className="flex max-w-2xl flex-col items-center gap-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-primary">
            {teachers.eyebrow}
          </span>
          <h2 className="text-3xl">{teachers.heading}</h2>
          <div className="h-1 w-16 bg-primary" />
          <p className="text-muted-foreground">{teachers.body}</p>
        </div>

        <div className="grid w-full grid-cols-1 gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-2 lg:grid-cols-3">
          {teachers.items.map((teacher) => (
            <div
              key={teacher.name}
              className="flex flex-col items-start gap-6 bg-secondary p-8 text-left text-secondary-foreground"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                {teacher.designation}
              </span>
              <h3 className="font-display text-2xl text-secondary-foreground">
                {teacher.name}
              </h3>
              <span className="text-sm text-secondary-foreground/70">
                {teacher.role}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
