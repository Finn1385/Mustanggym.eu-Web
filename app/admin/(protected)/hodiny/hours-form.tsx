"use client";

import { useState } from "react";
import { useFormAction } from "@/components/admin/use-form-action";
import { Panel, SaveBar, inputClass } from "@/components/admin/ui";
import { saveHours } from "@/lib/admin/actions/hours";
import { DAYS, type DayHours } from "@/lib/hours";

export function HoursForm({ hours }: { hours: DayHours[] }) {
  const { result, pending, onSubmit } = useFormAction(saveHours);
  const [closed, setClosed] = useState(() => hours.map((h) => h.closed));

  return (
    <form onSubmit={onSubmit}>
      <Panel>
        <table className="w-full">
          <thead className="sr-only">
            <tr><th>Deň</th><th>Otvára</th><th>Zatvára</th><th>Zatvorené</th></tr>
          </thead>
          <tbody className="divide-y divide-rule">
            {hours.map((h, i) => (
              <tr key={h.day}>
                <th scope="row" className="py-3 pr-4 text-left font-semibold">{DAYS[h.day].name}</th>
                <td className="py-3 pr-3">
                  <input
                    type="time"
                    name={`opens-${h.day}`}
                    defaultValue={h.opens ?? "07:00"}
                    disabled={closed[i]}
                    aria-label={`${DAYS[h.day].name}: otvára`}
                    className={`${inputClass} tabular w-32 disabled:opacity-40`}
                  />
                </td>
                <td className="py-3 pr-3">
                  <input
                    type="time"
                    name={`closes-${h.day}`}
                    defaultValue={h.closes ?? "20:00"}
                    disabled={closed[i]}
                    aria-label={`${DAYS[h.day].name}: zatvára`}
                    className={`${inputClass} tabular w-32 disabled:opacity-40`}
                  />
                </td>
                <td className="py-3">
                  <label className="flex items-center gap-2 text-sm whitespace-nowrap">
                    <input
                      type="checkbox"
                      name={`closed-${h.day}`}
                      defaultChecked={h.closed}
                      onChange={(e) => setClosed((c) => c.map((v, j) => (j === i ? e.target.checked : v)))}
                      className="size-4 accent-mustang"
                    />
                    Zatvorené
                  </label>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <SaveBar pending={pending} result={result} viewHref="/fitness" />
    </form>
  );
}
