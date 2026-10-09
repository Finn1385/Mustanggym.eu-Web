import type { Metadata } from "next";
import { Gallery } from "@/components/site/gallery";
import { JsonLd } from "@/components/site/json-ld";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { Timetable } from "@/components/site/timetable";
import { UpdatedStamp } from "@/components/site/updated-stamp";
import { galleryPhotos } from "@/lib/content/gallery";
import { getHero, getSectionUpdates, getSetting, getTimetable } from "@/lib/content/queries";
import { localNow } from "@/lib/hours";
import { resolveNow } from "@/lib/now";
import { breadcrumbJsonLd } from "@/lib/seo/jsonld";

export const metadata: Metadata = {
  title: "Skupinové tréningy – rozvrh hodín",
  description:
    "Rozvrh skupinových tréningov v Mustang Gym Snina: kruhový tréning, Strong Body, Body Forming a ďalšie hodiny pod vedením certifikovaného trénera.",
  alternates: { canonical: "/treningy" },
};

export default async function TreningyPage({ searchParams }: PageProps<"/treningy">) {
  const { now } = resolveNow((await searchParams).now);
  const today = localNow(now).day;
  const page = getSetting("treningy");
  const updates = getSectionUpdates();
  const photos = galleryPhotos("treningy");

  return (
    <>
      <JsonLd data={breadcrumbJsonLd([{ name: "Skupinové tréningy", path: "/treningy" }])} />
      <PageHero title="Skupinové tréningy" intro={page.intro} image={getHero("treningy")} />

      <section aria-labelledby="rozvrh-title" className="shell py-16 md:py-24">
        <SectionHeading id="rozvrh-title" aside={<UpdatedStamp date={updates.timetable} className="text-ash" />}>
          Rozvrh
        </SectionHeading>
        <Timetable slots={getTimetable()} today={today} />
      </section>

      {photos.length > 0 && (
        <section aria-labelledby="galeria-title" className="shell pb-16 md:pb-24">
          <SectionHeading id="galeria-title">Galéria</SectionHeading>
          <Gallery photos={photos} label="Fotky zo sály na skupinové tréningy" />
        </section>
      )}
    </>
  );
}
