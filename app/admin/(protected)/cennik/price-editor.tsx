"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { MoveButtons, move } from "@/components/admin/move-buttons";
import { Button, Field, Panel, SaveBar, inputClass } from "@/components/admin/ui";
import { ICONS } from "@/components/ui/icon";
import { savePrices } from "@/lib/admin/actions/prices";
import { fail, type ActionResult } from "@/lib/admin/result";
import { parsePrice } from "@/lib/format";

type Item = { label: string; price: string; note: string };
type Group = { title: string; icon: string; items: Item[] };

export function PriceEditor({ initial }: { initial: Group[] }) {
  const [groups, setGroups] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, startTransition] = useTransition();
  const dirty = useMemo(() => JSON.stringify(groups) !== saved, [groups, saved]);

  const setGroup = (gi: number, patch: Partial<Group>) =>
    setGroups((gs) => gs.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
  const setItem = (gi: number, ii: number, patch: Partial<Item>) =>
    setGroup(gi, { items: groups[gi].items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: { title: string; icon: string; items: { label: string; amountCents: number; note: string }[] }[] = [];
    for (const g of groups) {
      const items: (typeof payload)[number]["items"] = [];
      for (const it of g.items) {
        const amountCents = parsePrice(it.price);
        if (amountCents === null) return setResult(fail(`„${it.label || "Položka"}“: cenu zadajte ako číslo, napr. 4,00.`));
        items.push({ label: it.label, amountCents, note: it.note });
      }
      payload.push({ title: g.title, icon: g.icon, items });
    }
    startTransition(async () => {
      const res = await savePrices(payload);
      setResult(res);
      if (res?.ok) setSaved(JSON.stringify(groups));
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      {groups.map((g, gi) => (
        <Panel
          key={gi}
          actions={
            <span className="flex items-center gap-1">
              <MoveButtons index={gi} length={groups.length} label={g.title} onMove={(d) => setGroups((gs) => move(gs, gi, d))} />
              <Button
                type="button"
                variant="danger"
                aria-label={`Odstrániť skupinu ${g.title}`}
                onClick={() => confirm(`Odstrániť celú skupinu „${g.title}“?`) && setGroups((gs) => gs.filter((_, i) => i !== gi))}
              >
                <Trash2 aria-hidden className="size-4" />
              </Button>
            </span>
          }
          title={g.title || "Nová skupina"}
        >
          <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
            <Field label="Názov skupiny">
              <input value={g.title} required onChange={(e) => setGroup(gi, { title: e.target.value })} className={inputClass} />
            </Field>
            <Field label="Ikona">
              <select value={g.icon} onChange={(e) => setGroup(gi, { icon: e.target.value })} className={inputClass}>
                {Object.entries(ICONS).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </Field>
          </div>

          <ul className="mt-5 space-y-3 border-t border-rule pt-5">
            {g.items.map((it, ii) => (
              <li key={ii} className="grid gap-3 sm:grid-cols-[1fr_8rem_1fr_auto] sm:items-center">
                <input
                  value={it.label}
                  required
                  placeholder="Názov, napr. Jednorázový vstup"
                  onChange={(e) => setItem(gi, ii, { label: e.target.value })}
                  aria-label="Názov položky"
                  className={inputClass}
                />
                <div className="relative">
                  <input
                    value={it.price}
                    required
                    inputMode="decimal"
                    onChange={(e) => setItem(gi, ii, { price: e.target.value })}
                    aria-label={`Cena: ${it.label}`}
                    aria-invalid={parsePrice(it.price) === null}
                    className={`${inputClass} tabular pr-7 text-right`}
                  />
                  <span aria-hidden className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-ash">€</span>
                </div>
                <input
                  value={it.note}
                  placeholder="Poznámka (nepovinné)"
                  onChange={(e) => setItem(gi, ii, { note: e.target.value })}
                  aria-label={`Poznámka: ${it.label}`}
                  className={inputClass}
                />
                <span className="flex items-center">
                  <MoveButtons
                    index={ii}
                    length={g.items.length}
                    label={it.label}
                    onMove={(d) => setGroup(gi, { items: move(g.items, ii, d) })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    aria-label={`Odstrániť ${it.label}`}
                    onClick={() => setGroup(gi, { items: g.items.filter((_, j) => j !== ii) })}
                  >
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
            onClick={() => setGroup(gi, { items: [...g.items, { label: "", price: "", note: "" }] })}
          >
            <Plus aria-hidden className="size-4" /> Pridať položku
          </Button>
        </Panel>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={() => setGroups((gs) => [...gs, { title: "", icon: "ticket", items: [{ label: "", price: "", note: "" }] }])}
      >
        <Plus aria-hidden className="size-4" /> Pridať skupinu
      </Button>

      <SaveBar pending={pending} result={result} viewHref="/fitness#cennik" label="Uložiť cenník" dirty={dirty} />
    </form>
  );
}
