import Link from "next/link";
import { PageTitle } from "@/components/admin/ui";
import { BANNER_DEFAULT_TITLE } from "@/lib/banner/timetable-banner";
import { getGallery, getHero, getTimetable } from "@/lib/content/queries";
import { formatDate } from "@/lib/format";
import { BannerGenerator } from "./banner-generator";

export const metadata = { title: "Facebook banner" };

export default function BannerPage() {
  const photos = [...getGallery("treningy"), ...getGallery("fitness")].map((p) => ({
    id: p.id,
    label: `${p.gallery === "treningy" ? "Tréningy" : "Fitness"}: ${p.alt}`,
  }));
  const hero = getHero("treningy");

  return (
    <>
      <PageTitle
        title="Facebook banner"
        description="Titulná fotka pre Facebook vygenerovaná z aktuálneho rozvrhu (1640 × 720 px). Po zmene rozvrhu stačí stiahnuť nový banner."
      />
      {getTimetable().length === 0 ? (
        <p>
          Rozvrh je prázdny. <Link href="/admin/rozvrh" className="link-underline">Pridajte tréningy do rozvrhu</Link>.
        </p>
      ) : (
        <BannerGenerator
          photos={photos}
          defaultTitle={BANNER_DEFAULT_TITLE}
          defaultNote={`Platné od ${formatDate(new Date())}`}
          defaultBg={hero ? String(hero.id) : "none"}
        />
      )}
    </>
  );
}
