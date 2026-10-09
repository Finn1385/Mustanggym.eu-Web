import { Mail, MapPin, Phone } from "lucide-react";
import type { Site } from "@/lib/content/settings";
import { telHref } from "@/lib/format";
import { FacebookIcon, InstagramIcon } from "./social-icons";

export function Contact({ site }: { site: Site }) {
  return (
    <section id="kontakt" aria-labelledby="kontakt-title" className="shell py-16 md:py-24">
      <h2 id="kontakt-title" className="font-display text-heading font-bold">
        Kontakt
      </h2>
      <div className="mt-10 grid gap-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <a href={telHref(site.phone)} className="group inline-block">
            <span className="flex items-center gap-2 text-ash">
              <Phone aria-hidden className="size-4" /> Zavolajte nám
            </span>
            <span className="mt-1 block font-display text-[clamp(2.5rem,1.5rem+4vw,4.75rem)] leading-none font-bold group-hover:text-chalk/80">
              {site.phone}
            </span>
          </a>
          <a href={`mailto:${site.email}`} className="link-underline mt-8 flex items-center gap-3 text-xl">
            <Mail aria-hidden className="size-5 text-ash" />
            {site.email}
          </a>
        </div>
        <address className="not-italic md:col-span-5">
          <p className="flex items-center gap-2 text-ash">
            <MapPin aria-hidden className="size-4" /> Adresa
          </p>
          <p className="mt-2 text-2xl leading-snug font-semibold">
            {site.street}
            <br />
            {site.zip} {site.city}
          </p>
          {site.mapsUrl && (
            <a href={site.mapsUrl} target="_blank" rel="noopener noreferrer" className="link-underline mt-3 inline-block">
              Otvoriť v mapách
            </a>
          )}
          <div className="mt-8 flex gap-3">
            {site.facebook && (
              <a
                href={site.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-12 items-center justify-center rounded-full border border-rule transition-colors hover:border-mustang hover:bg-mustang"
                aria-label="Mustang Gym na Facebooku"
              >
                <FacebookIcon className="size-5" />
              </a>
            )}
            {site.instagram && (
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex size-12 items-center justify-center rounded-full border border-rule transition-colors hover:border-mustang hover:bg-mustang"
                aria-label="Mustang Gym na Instagrame"
              >
                <InstagramIcon className="size-5" />
              </a>
            )}
          </div>
        </address>
      </div>
    </section>
  );
}
