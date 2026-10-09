import { DAYS, displayTime } from "@/lib/hours";
import type { Slot } from "@/lib/content/queries";

function bySlotDay(slots: Slot[]) {
  return DAYS.map((_, day) => slots.filter((s) => s.day === day));
}

/** Week grid on desktop, a day-by-day list on phones. Today is marked with the red rail. */
export function Timetable({ slots, today }: { slots: Slot[]; today: number }) {
  const days = bySlotDay(slots);
  // Weekend columns only appear when there is something on them.
  const visible = DAYS.map((_, d) => d).filter((d) => d < 5 || days[d].length > 0 || d === today);

  return (
    <>
      <div
        className="hidden border-t border-rule md:grid"
        style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}
      >
        {visible.map((d) => {
          const isToday = d === today;
          return (
            <section key={d} aria-label={DAYS[d].name} className="border-l border-rule first:border-l-0">
              <h3
                className={`px-4 py-3 text-lg font-semibold ${isToday ? "bg-mustang text-chalk" : "text-chalk/85"}`}
              >
                {DAYS[d].name}
                {isToday && <span className="ml-2 text-sm font-normal">dnes</span>}
              </h3>
              <ul className={`min-h-48 px-4 pt-4 pb-8 ${isToday ? "bg-steel" : ""}`}>
                {days[d].length === 0 && <li className="pt-2 text-ash">Bez tréningov</li>}
                {days[d].map((s) => (
                  <li key={s.id} className="py-3">
                    <time dateTime={s.time} className="block font-display text-5xl leading-none font-bold">
                      {displayTime(s.time)}
                    </time>
                    <span className="mt-1 block text-lg">{s.className}</span>
                    {s.note && <span className="block text-sm text-ash">{s.note}</span>}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <ol className="border-t border-rule md:hidden">
        {DAYS.map((day, d) => {
          const isToday = d === today;
          const list = days[d];
          return (
            <li key={d} className={`border-b border-rule py-4 ${isToday ? "bg-steel" : ""}`}>
              <h3 className={`flex items-baseline justify-between px-4 font-semibold ${isToday ? "rail" : ""}`}>
                <span>{day.name}</span>
                {isToday && <span className="text-sm font-normal text-chalk/75">dnes</span>}
              </h3>
              {list.length === 0 ? (
                <p className="mt-1 px-4 text-ash">Bez tréningov</p>
              ) : (
                <ul className="mt-2 space-y-2 px-4">
                  {list.map((s) => (
                    <li key={s.id} className="flex items-baseline gap-4">
                      <time dateTime={s.time} className="w-16 shrink-0 font-display text-3xl leading-none font-bold">
                        {displayTime(s.time)}
                      </time>
                      <span className="text-lg">
                        {s.className}
                        {s.note && <span className="block text-sm text-ash">{s.note}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
    </>
  );
}
