import Link from "next/link";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { useSite } from "@/components/site-provider";

export function SiteFooter() {
  const site = useSite();
  const year = new Date().getFullYear();

  return (
    <footer id="contact" className="w-full border-t border-border bg-muted">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-5 py-16 sm:grid-cols-2 lg:grid-cols-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">
              {site.initials}
            </span>
            <span className="font-display text-lg text-heading">
              {site.name}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">{site.footer.blurb}</p>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-heading">
            Quick Links
          </h3>
          <nav className="flex flex-col gap-2">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {item.label}
              </a>
            ))}
            <Link
              href="/auth/login"
              className="text-sm text-muted-foreground hover:text-primary"
            >
              Sign in
            </Link>
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-heading">
            Teachers
          </h3>
          <nav className="flex flex-col gap-2">
            {site.teachers.items.map((teacher) => (
              <a
                key={teacher.name}
                href="#teachers"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                {teacher.name}
              </a>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-heading">
            {site.contact.heading}
          </h3>
          <div className="flex flex-col gap-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{site.contact.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-primary" />
              <span className="flex flex-col">
                <a href={`tel:${site.contact.phone}`} className="hover:text-primary">
                  {site.contact.phone}
                </a>
                <a
                  href={`tel:${site.contact.phoneAlt}`}
                  className="hover:text-primary"
                >
                  {site.contact.phoneAlt}
                </a>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="size-4 shrink-0 text-primary" />
              <a
                href={`https://wa.me/91${site.contact.whatsapp}`}
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                WhatsApp
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="size-4 shrink-0 text-primary" />
              <a
                href={`mailto:${site.contact.email}`}
                className="hover:text-primary"
              >
                {site.contact.email}
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-primary" />
              <span>{site.contact.hours}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto w-full max-w-6xl px-5 py-6 text-center text-xs text-muted-foreground">
          © {year} {site.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
