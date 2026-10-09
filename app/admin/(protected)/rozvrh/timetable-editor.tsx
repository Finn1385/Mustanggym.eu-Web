"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button, Panel, SaveBar, inputClass } from "@/components/admin/ui";
import { saveTimetable } from "@/lib/admin/actions/timetable";
import type { ActionResult } from "@/lib/admin/result";
import { DAYS } from "@/lib/hours";

type Slot = { day: number; time: string; classId: number; note: string };
type Row = Slot & { key: number };
type ClassOption = { id: number; name: string; active: boolean };

let nextKey = 0;
const withKeys = (slots: Slot[]): Row[] => slots.map((s) => ({ ...s, key: nextKey++ }));
const strip = (rows: Row[]) =>
  rows
    .map(({ day, time, classId, note }) => ({ day, time, classId, note }))
    .sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));

export function TimetableEditor({ initial, classes }: { initial: Slot[]; classes: ClassOption[] }) {
  const [rows, setRows] = useState(() => withKeys(initial));
  const [saved, setSaved] = useState(() => JSON.stringify(strip(withKeys(initial))));
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, startTransition] = useTransition();
  const dirty = useMemo(() => JSON.stringify(strip(rows)) !== saved, [rows, saved]);
  const firstActive = classes.find((c) => c.active)?.id ?? classes[0].id;

  const update = (key: number, patch: Partial<Slot>) =>
    setRows((r) => r.map((row) => (row.key === key ? { ...row, ...patch } : row)));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = strip(rows);
    startTransition(async () => {
      const res = await saveTimetable(payload);
      setResult(res);
      if (res?.ok) setSaved(JSON.stringify(payload));
    });
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {DAYS.map((day, d) => {
        const dayRows = rows.filter((r) => r.day === d);
        return (
          <Panel
            key={d}
            title={day.name}
            actions={
              <Button
                type="button"
                variant="secondary"
                onClick={() => setRows((r) => [...r, { key: nextKey++, day: d, time: "17:00", classId: firstActive, note: "" }])}
              >
                <Plus aria-hidden className="size-4" /> Pridať tréning
              </Button>
            }
          >
            {dayRows.length === 0 ? (
              <p className="text-sm text-ash">Bez tréningov.</p>
            ) : (
              <ul className="space-y-3">
                {dayRows.map((row) => (
                  <li key={row.key} className="grid gap-3 sm:grid-cols-[8rem_1fr_1fr_auto] sm:items-center">
                    <input
                      type="time"
                      required
                      value={row.time}
                      onChange={(e) => update(row.key, { time: e.target.value })}
                      aria-label={`${day.name}: čas`}
                      className={`${inputClass} tabular`}
                    />
                    <select
                      value={row.classId}
                      onChange={(e) => update(row.key, { classId: Number(e.target.value) })}
                      aria-label={`${day.name}: tréning`}
                      className={inputClass}
                    >
                      {classes
                        .filter((c) => c.active || c.id === row.classId)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                            {c.active ? "" : " (skrytý)"}
                          </option>
                        ))}
                    </select>
                    <input
                      value={row.note}
                      onChange={(e) => update(row.key, { note: e.target.value })}
                      placeholder="Poznámka (nepovinné)"
                      maxLength={80}
                      aria-label={`${day.name}: poznámka`}
                      className={inputClass}
                    />
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
                      aria-label={`Odstrániť tréning ${day.name} ${row.time}`}
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        );
      })}
      <SaveBar pending={pending} result={result} viewHref="/treningy" label="Uložiť rozvrh" dirty={dirty} />
    </form>
  );
}
