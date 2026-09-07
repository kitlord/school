import Image from "next/image";
import { useSite } from "@/components/site-provider";
import { useStaff } from "@/components/home/use-staff";

export function TeachersSection() {
  const { teachers } = useSite();
  const { staff, isLoading } = useStaff();

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

        <div className="relative aspect-[3/2] w-full max-w-2xl overflow-hidden rounded-lg">
          <Image
            src={teachers.groupPhoto.src}
            alt={teachers.groupPhoto.alt}
            fill
            className="object-cover object-top"
            sizes="(min-width: 768px) 42rem, 100vw"
          />
        </div>

        {!isLoading && staff.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            We&apos;re getting our staff details ready — check back soon!
          </p>
        ) : (
          <div className="grid w-full grid-cols-1 gap-px overflow-hidden rounded-lg bg-border sm:grid-cols-2 lg:grid-cols-3">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex flex-col items-start gap-6 bg-secondary p-8 text-left text-secondary-foreground"
              >
                {member.designation && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary">
                    {member.designation}
                  </span>
                )}
                <h3 className="font-display text-2xl text-secondary-foreground">
                  {member.name}
                </h3>
                {member.role && (
                  <span className="text-sm text-secondary-foreground/70">
                    {member.role}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
