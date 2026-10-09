export const TIME_ZONE = "Europe/Bratislava";

export const DAYS = [
  { short: "Po", name: "Pondelok", on: "v pondelok", schema: "Monday" },
  { short: "Ut", name: "Utorok", on: "v utorok", schema: "Tuesday" },
  { short: "St", name: "Streda", on: "v stredu", schema: "Wednesday" },
  { short: "Št", name: "Štvrtok", on: "vo štvrtok", schema: "Thursday" },
  { short: "Pi", name: "Piatok", on: "v piatok", schema: "Friday" },
  { short: "So", name: "Sobota", on: "v sobotu", schema: "Saturday" },
  { short: "Ne", name: "Nedeľa", on: "v nedeľu", schema: "Sunday" },
] as const;

export type DayHours = { day: number; opens: string | null; closes: string | null; closed: boolean };

const WEEKDAY_INDEX: Record<string, number> = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };

/** Weekday (0 = Monday) and minutes since midnight in the gym's time zone. */
export function localNow(now: Date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    day: WEEKDAY_INDEX[get("weekday")] ?? 0,
    minutes: Number(get("hour")) * 60 + Number(get("minute")),
  };
}

export function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

/** "07:00" → "7:00" */
export function displayTime(time: string) {
  return time.replace(/^0(\d)/, "$1");
}

export function isOpenDay(h: DayHours | undefined): h is DayHours & { opens: string; closes: string } {
  return !!h && !h.closed && !!h.opens && !!h.closes;
}

export type TodayStatus = {
  day: number;
  open: boolean;
  headline: string;
  detail: string | null;
};

export function todayStatus(hours: DayHours[], now: Date = new Date()): TodayStatus {
  const { day, minutes } = localNow(now);
  const byDay = new Map(hours.map((h) => [h.day, h]));
  const today = byDay.get(day);

  if (isOpenDay(today)) {
    const opens = toMinutes(today.opens);
    const closes = toMinutes(today.closes);
    if (minutes >= opens && minutes < closes) {
      return { day, open: true, headline: `Otvorené do ${displayTime(today.closes)}`, detail: null };
    }
    if (minutes < opens) {
      return { day, open: false, headline: `Otvárame o ${displayTime(today.opens)}`, detail: "Dnes ešte zatvorené" };
    }
  }

  for (let offset = 1; offset <= 7; offset++) {
    const next = byDay.get((day + offset) % 7);
    if (isOpenDay(next)) {
      const when = offset === 1 ? "zajtra" : DAYS[next.day].on;
      return {
        day,
        open: false,
        headline: "Zatvorené",
        detail: `Otvárame ${when} o ${displayTime(next.opens)}`,
      };
    }
  }
  return { day, open: false, headline: "Zatvorené", detail: null };
}
