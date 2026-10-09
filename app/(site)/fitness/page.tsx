import type { Metadata } from "next";
import { Gallery } from "@/components/site/gallery";
import { HoursTable } from "@/components/site/hours";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { PricePanel } from "@/components/site/price-panel";
import { SectionHeading } from "@/components/site/section-heading";
import { UpdatedStamp } from "@/components/site/updated-stamp";
import { Icon } from "@/components/ui/icon";
import { galleryPhotos } from "@/lib/content/gallery";
import { getHero, getHours, getPrices, getSectionUpdates, getSetting } from "@/lib/content/queries";
import { localNow } from "@/lib/hours";
import { resolveNow } from "@/lib/now";
import { breadcrumbJsonLd, offerCatalogJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Fitness centrum – otváracie hodiny a cenník",
  description:
    "Fitness centrum Mustang Gym v Snine: 800 m², kardio zóna, činkáreň, miestnosť na drepy a funkčná zóna. Otváracie hodiny, cenník vstupov a permanentiek, fotogaléria.",
  alternates: { canonical: "/fitness" },
};

export default async function FitnessPage({ searchParams }: PageProps<"/fitness">) {
  const { now } = resolveNow((await searchParams).now);
  const today = localNow(now).day;
  const page = getSetting("fitness");
  const site = getSetting("site");
  const prices = getPrices();
  const updates = getSectionUpdates();
  const photos = galleryPhotos("fitness");

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Fitness centrum", path: "/fitness" }])} />
      <JsonLd data={offerCatalogJsonLd(prices)} />
      <PageHero title="Fitness centrum" intro={page.intro} image={getHero("fitness")} />

      {page.features.length > 0 && (
        <section aria-label="Čo u nás nájdete" className="shell py-16 md:py-24">
          <ul className="border-t border-rule">
            {page.features.map((f) => (
              <li key={f.title} className="grid gap-3 border-b border-rule py-8 md:grid-cols-12 md:gap-8 md:py-10">
                <Icon name={f.icon} className="size-9 text-chalk md:col-span-1" />
                <h2 className="font-display text-[2rem] leading-none font-bold md:col-span-5 md:text-[2.5rem]">
                  {f.title}
                </h2>
                <p className="max-w-prose text-lg text-chalk/80 md:col-span-6">{f.text}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="hodiny-title" className="shell grid gap-8 pb-16 md:grid-cols-12 md:pb-24">
        <div className="md:col-span-4">
          <h2 id="hodiny-title" className="font-display text-heading font-bold">
            Otváracie hodiny
          </h2>
          <UpdatedStamp date={updates.hours} className="mt-4 text-ash" />
        </div>
        <div className="md:col-span-8">
          <HoursTable hours={getHours()} today={today} />
        </div>
      </section>

      <PricePanel groups={prices} updatedAt={updates.prices} multisport={site.multisport} />

      {photos.length > 0 && (
        <section aria-labelledby="galeria-title" className="shell py-16 md:py-24">
          <SectionHeading id="galeria-title">Galéria</SectionHeading>
          <Gallery photos={photos} label="Fotky z fitness centra" />
        </section>
      )}
    </>
  );
}
