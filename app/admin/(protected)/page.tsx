import Link from "next/link";
import { Download } from "lucide-react";
import { PageTitle } from "@/components/admin/ui";
import { getGallery, getSectionUpdates, getTimetable, type Section } from "@/lib/content/queries";
import { formatDate } from "@/lib/format";

export const metadata = { title: "Prehľad" };

const SECTIONS: { section: Section; label: string; href: string; view: string }[] = [
  { section: "hours", label: "Otváracie hodiny", href: "/admin/hodiny", view: "/fitness" },
  { section: "timetable", label: "Rozvrh tréningov", href: "/admin/rozvrh", view: "/treningy" },
  { section: "prices", label: "Cenník", href: "/admin/cennik", view: "/fitness#cennik" },
  { section: "gallery", label: "Galérie", href: "/admin/galeria/fitness", view: "/fitness" },
  { section: "texts", label: "Texty stránok", href: "/admin/texty", view: "/" },
  { section: "site", label: "Kontaktné údaje", href: "/admin/texty", view: "/#kontakt" },
];

export default function AdminHome() {
  const updates = getSectionUpdates();
  const stats = [
    { label: "tréningov v rozvrhu", value: getTimetable().length },
    { label: "fotiek vo fitness", value: getGallery("fitness").length },
    { label: "fotiek z tréningov", value: getGallery("treningy").length },
  ];
  return (
    <>
      <PageTitle title="Prehľad" description="Zmeny sa na webe prejavia hneď po uložení." />

      <ul className="divide-y divide-rule rounded-lg border border-rule">
        {SECTIONS.map((s) => (
          <li key={s.section} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div>
              <Link href={s.href} className="font-semibold hover:underline">
                {s.label}
              </Link>
              <p className="text-sm text-ash">
                {updates[s.section] ? `Naposledy upravené ${formatDate(updates[s.section]!)}` : "Zatiaľ neupravené"}
              </p>
            </div>
            <div className="flex gap-4 text-sm">
              <Link href={s.view} target="_blank" className="link-underline text-chalk/80">
                Zobraziť na webe
              </Link>
              <Link href={s.href} className="link-underline">
                Upraviť
              </Link>
            </div>
          </li>
        ))}
      </ul>

      <dl className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
        {stats.map((s) => (
          <div key={s.label}>
            <dt className="text-sm text-ash">{s.label}</dt>
            <dd className="font-display text-4xl font-bold">{s.value}</dd>
          </div>
        ))}
      </dl>

      <section className="mt-12 border-t border-rule pt-8">
        <h2 className="text-lg font-semibold">Záloha</h2>
        <p className="mt-1 max-w-2xl text-sm text-ash">
          Stiahne databázu so všetkým obsahom a všetky nahrané fotky v jednom archíve. Server si navyše robí zálohu
          každú noc.
        </p>
        <a
          href="/admin/zaloha"
          className="mt-4 inline-flex items-center gap-2 rounded-md border border-rule bg-steel px-4 py-2.5 text-sm font-semibold hover:border-ash"
        >
          <Download aria-hidden className="size-4" /> Stiahnuť zálohu
        </a>
      </section>
    </>
  );
}
