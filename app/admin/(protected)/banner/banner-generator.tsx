"use client";

import { useEffect, useState } from "react";
import { Download, LoaderCircle } from "lucide-react";
import { Field, Panel, inputClass } from "@/components/admin/ui";

export function BannerGenerator({ photos, defaultTitle, defaultNote, defaultBg }: {
  photos: { id: number; label: string }[];
  defaultTitle: string;
  defaultNote: string;
  defaultBg: string;
}) {
  const [title, setTitle] = useState(defaultTitle);
  const [note, setNote] = useState(defaultNote);
  const [bg, setBg] = useState(defaultBg);

  const query = new URLSearchParams({ title, note, bg }).toString();
  // Typing shouldn't fire a render request per keystroke.
  const [previewQuery, setPreviewQuery] = useState(query);
  useEffect(() => {
    const t = setTimeout(() => setPreviewQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);
  const [loadedQuery, setLoadedQuery] = useState<string | null>(null);
  const src = `/admin/banner/obrazok?${previewQuery}`;

  return (
    <div className="space-y-6">
      <Panel title="Náhľad" description="Na mobile Facebook oreže okraje, preto je rozvrh v strede s rezervou.">
        <div className="relative overflow-hidden rounded-md border border-rule bg-ink" style={{ aspectRatio: "1640 / 720" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={src}
            src={src}
            alt="Náhľad banneru s rozvrhom"
            width={1640}
            height={720}
            onLoad={() => setLoadedQuery(previewQuery)}
            onError={() => setLoadedQuery(previewQuery)}
            className="h-auto w-full"
          />
          {loadedQuery !== query && (
            <div className="absolute inset-0 flex items-center justify-center bg-ink/40">
              <LoaderCircle aria-label="Generujem náhľad" className="size-8 animate-spin" />
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-wrap items-center gap-4">
          <a
            href={`/admin/banner/obrazok?${query}&download`}
            download
            className="inline-flex items-center justify-center gap-2 rounded-md bg-mustang px-4 py-2.5 text-sm font-semibold text-chalk transition-colors hover:bg-mustang-deep"
          >
            <Download aria-hidden className="size-4" /> Stiahnuť PNG
          </a>
          <p className="text-sm text-ash">Na Facebooku: Upraviť titulnú fotku → Nahrať fotku.</p>
        </div>
      </Panel>

      <Panel title="Nastavenia">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Nadpis">
            <input className={inputClass} value={title} maxLength={40} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Poznámka" hint="Napr. odkedy rozvrh platí. Nechajte prázdne, ak ju nechcete.">
            <input className={inputClass} value={note} maxLength={60} onChange={(e) => setNote(e.target.value)} />
          </Field>
          <Field label="Fotka v pozadí" className="sm:col-span-2">
            <select className={inputClass} value={bg} onChange={(e) => setBg(e.target.value)}>
              <option value="none">Bez fotky</option>
              {photos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Panel>
    </div>
  );
}
