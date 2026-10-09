"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { MoveButtons, move } from "@/components/admin/move-buttons";
import { Button, Field, Panel, SaveBar, inputClass } from "@/components/admin/ui";
import { ICONS } from "@/components/ui/icon";
import { saveSetting } from "@/lib/admin/actions/settings";
import type { ActionResult } from "@/lib/admin/result";
import type { SettingValue } from "@/lib/content/settings";

function useSettingForm<K extends "site" | "fitness" | "treningy">(key: K, initial: SettingValue<K>) {
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, startTransition] = useTransition();
  const dirty = useMemo(() => JSON.stringify(value) !== saved, [value, saved]);
  const patch = (p: Partial<SettingValue<K>>) => setValue((v) => ({ ...v, ...p }));
  const submit = (
    e: React.FormEvent,
    transform: (v: SettingValue<K>) => unknown = (v) => v,
    onSaved?: () => void,
  ) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveSetting(key, transform(value));
      setResult(res);
      if (res?.ok) {
        setSaved(JSON.stringify(value));
        onSaved?.();
      }
    });
  };
  return { value, patch, submit, result, pending, dirty };
}

function coordinate(input: string) {
  const n = Number(input.replace(",", "."));
  return input.trim() === "" || Number.isNaN(n) ? null : n;
}

export function SiteForm({ initial }: { initial: SettingValue<"site"> }) {
  const f = useSettingForm("site", initial);
  const v = f.value;
  const [lat, setLat] = useState(initial.lat?.toString() ?? "");
  const [lng, setLng] = useState(initial.lng?.toString() ?? "");
  const [savedCoords, setSavedCoords] = useState(() => `${lat}|${lng}`);
  const text = (key: keyof typeof v, label: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, hint?: string) => (
    <Field label={label} hint={hint}>
      <input value={String(v[key] ?? "")} onChange={(e) => f.patch({ [key]: e.target.value })} className={inputClass} {...props} />
    </Field>
  );
  return (
    <form
      onSubmit={(e) =>
        f.submit(
          e,
          (val) => ({ ...val, lat: coordinate(lat), lng: coordinate(lng) }),
          () => setSavedCoords(`${lat}|${lng}`),
        )
      }
    >
      <Panel title="Kontakt a údaje o firme">
        <div className="grid gap-5 sm:grid-cols-2">
          {text("name", "Názov", { required: true })}
          {text("tagline", "Krátky popis", { required: true, maxLength: 160 }, "Zobrazuje sa pod stavom na úvode a vo výsledkoch Google.")}
          {text("phone", "Telefón", { required: true, type: "tel" })}
          {text("email", "E-mail", { required: true, type: "email" })}
          {text("street", "Ulica a číslo", { required: true })}
          <div className="grid grid-cols-[8rem_1fr] gap-3">
            {text("zip", "PSČ", { required: true })}
            {text("city", "Mesto", { required: true })}
          </div>
          {text("mapsUrl", "Odkaz na mapu", { type: "url" }, "Odkaz z Google Máp (Zdieľať → Kopírovať odkaz).")}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Zemepisná šírka" hint="Napr. 48.9876">
              <input value={lat} onChange={(e) => setLat(e.target.value)} inputMode="decimal" className={inputClass} />
            </Field>
            <Field label="Zemepisná dĺžka" hint="Napr. 22.1567">
              <input value={lng} onChange={(e) => setLng(e.target.value)} inputMode="decimal" className={inputClass} />
            </Field>
          </div>
          {text("facebook", "Facebook", { type: "url" })}
          {text("instagram", "Instagram", { type: "url" })}
        </div>
        <label className="mt-5 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={v.multisport} onChange={(e) => f.patch({ multisport: e.target.checked })} className="size-4 accent-mustang" />
          Akceptujeme kartu MultiSport
        </label>
      </Panel>
      <SaveBar pending={f.pending} result={f.result} viewHref="/#kontakt" dirty={f.dirty || `${lat}|${lng}` !== savedCoords} />
    </form>
  );
}

export function FitnessTextsForm({ initial }: { initial: SettingValue<"fitness"> }) {
  const f = useSettingForm("fitness", initial);
  const features = f.value.features;
  const setFeature = (i: number, p: Partial<(typeof features)[number]>) =>
    f.patch({ features: features.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <form onSubmit={(e) => f.submit(e)}>
      <Panel title="Stránka Fitness centrum">
        <Field label="Úvodný text" hint="Pod nadpisom stránky a na úvode pri odkaze na fitness.">
          <textarea value={f.value.intro} onChange={(e) => f.patch({ intro: e.target.value })} rows={3} maxLength={400} className={inputClass} />
        </Field>
        <h3 className="mt-8 mb-3 text-sm font-semibold">Čo u nás nájdete</h3>
        <ul className="space-y-4">
          {features.map((feat, i) => (
            <li key={i} className="grid gap-3 rounded-md border border-rule p-4 sm:grid-cols-[10rem_1fr_auto]">
              <select value={feat.icon} onChange={(e) => setFeature(i, { icon: e.target.value })} aria-label="Ikona" className={inputClass}>
                {Object.entries(ICONS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <div className="space-y-3">
                <input value={feat.title} required onChange={(e) => setFeature(i, { title: e.target.value })} aria-label="Nadpis" placeholder="Nadpis" className={inputClass} />
                <textarea value={feat.text} onChange={(e) => setFeature(i, { text: e.target.value })} rows={2} aria-label="Text" placeholder="Text" className={inputClass} />
              </div>
              <span className="flex items-start">
                <MoveButtons index={i} length={features.length} label={feat.title} onMove={(d) => f.patch({ features: move(features, i, d) })} />
                <Button type="button" variant="ghost" aria-label={`Odstrániť ${feat.title}`} onClick={() => f.patch({ features: features.filter((_, j) => j !== i) })}>
                  <Trash2 aria-hidden className="size-4" />
                </Button>
              </span>
            </li>
          ))}
        </ul>
        <Button
          type="button"
          variant="secondary"
          className="mt-4"
          disabled={features.length >= 8}
          onClick={() => f.patch({ features: [...features, { icon: "dumbbell", title: "", text: "" }] })}
        >
          <Plus aria-hidden className="size-4" /> Pridať bod
        </Button>
      </Panel>
      <SaveBar pending={f.pending} result={f.result} viewHref="/fitness" dirty={f.dirty} />
    </form>
  );
}

export function TreningyTextsForm({ initial }: { initial: SettingValue<"treningy"> }) {
  const f = useSettingForm("treningy", initial);
  return (
    <form onSubmit={(e) => f.submit(e)}>
      <Panel title="Stránka Skupinové tréningy">
        <Field label="Úvodný text" hint="Pod nadpisom stránky a na úvode pri odkaze na tréningy.">
          <textarea value={f.value.intro} onChange={(e) => f.patch({ intro: e.target.value })} rows={3} maxLength={400} className={inputClass} />
        </Field>
      </Panel>
      <SaveBar pending={f.pending} result={f.result} viewHref="/treningy" dirty={f.dirty} />
    </form>
  );
}
