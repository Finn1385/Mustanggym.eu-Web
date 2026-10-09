"use client";

import { useEffect, useState } from "react";
import { todayStatus, type DayHours, type TodayStatus } from "@/lib/hours";

/** Starts from the server-rendered status and re-evaluates every minute in the visitor's browser. */
export function useTodayStatus(hours: DayHours[], initial: TodayStatus, live = true) {
  const [status, setStatus] = useState(initial);
  useEffect(() => {
    if (!live) return;
    const tick = () => setStatus(todayStatus(hours));
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, [hours, live]);
  return status;
}

export function StatusPill({ hours, initial }: { hours: DayHours[]; initial: TodayStatus }) {
  const status = useTodayStatus(hours, initial);
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-semibold whitespace-nowrap ${
        status.open ? "bg-mustang text-chalk" : "bg-steel text-chalk/85"
      }`}
    >
      <span
        aria-hidden
        className={`size-2 rounded-full ${status.open ? "bg-chalk motion-safe:animate-pulse" : "bg-ash"}`}
      />
      {status.headline}
    </p>
  );
}

export function StatusHeadline({
  hours,
  initial,
  live = true,
}: {
  hours: DayHours[];
  initial: TodayStatus;
  live?: boolean;
}) {
  const status = useTodayStatus(hours, initial, live);
  return (
    <>
      <p className="font-display text-display font-extrabold tracking-[-0.01em] text-balance" aria-live="polite">
        {status.headline}
      </p>
      {status.detail && <p className="mt-3 text-lg text-chalk/85 md:text-2xl">{status.detail}</p>}
    </>
  );
}
