import { DAYS, displayTime, isOpenDay, type DayHours } from "@/lib/hours";

function range(h: DayHours) {
  return isOpenDay(h) ? `${displayTime(h.opens)} – ${displayTime(h.closes)}` : "Zatvorené";
}

/** Compact week strip for the home page: 7 columns on desktop, a list on phones. */
export function HoursStrip({ hours, today }: { hours: DayHours[]; today: number }) {
  return (
    <ol className="grid border-y border-rule md:grid-cols-7">
      {hours.map((h) => {
        const isToday = h.day === today;
        return (
          <li
            key={h.day}
            className={`flex items-baseline justify-between gap-4 border-rule px-4 py-3 md:block md:border-l md:px-4 md:py-5 md:first:border-l-0 ${
              isToday ? "bg-mustang text-chalk" : "border-b last:border-b-0 md:border-b-0"
            }`}
          >
            <span className="font-display text-2xl font-bold md:text-4xl">
              <abbr title={DAYS[h.day].name} className="no-underline">
                {DAYS[h.day].short}
              </abbr>
              {isToday && <span className="sr-only"> (dnes)</span>}
            </span>
            <span className={`tabular md:mt-1 md:block ${isToday ? "" : isOpenDay(h) ? "text-chalk/90" : "text-ash"}`}>
              {range(h)}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Full opening-hours table for the fitness page. */
export function HoursTable({ hours, today }: { hours: DayHours[]; today: number }) {
  return (
    <table className="w-full text-lg">
      <caption className="sr-only">Otváracie hodiny fitness centra</caption>
      <tbody>
        {hours.map((h) => {
          const isToday = h.day === today;
          return (
            <tr key={h.day} className={`border-b border-rule ${isToday ? "bg-steel" : ""}`}>
              <th scope="row" className={`py-3.5 pr-6 text-left font-semibold ${isToday ? "rail" : "pl-5 md:pl-7"}`}>
                {DAYS[h.day].name}
                {isToday && <span className="ml-3 text-sm font-normal text-chalk/75">dnes</span>}
              </th>
              <td className={`tabular py-3.5 pr-4 text-right ${isOpenDay(h) ? "" : "text-ash"}`}>
                {isOpenDay(h) ? (
                  <>
                    <time dateTime={h.opens}>{displayTime(h.opens)}</time> –{" "}
                    <time dateTime={h.closes}>{displayTime(h.closes)}</time>
                  </>
                ) : (
                  "Zatvorené"
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
