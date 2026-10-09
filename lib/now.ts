/**
 * The current time, or a fixed time from `?now=2026-10-10T19:00` when not in production,
 * so the "today" states can be checked without waiting for them.
 */
export function resolveNow(param: string | string[] | undefined): { now: Date; frozen: boolean } {
  if (process.env.NODE_ENV !== "production" && typeof param === "string") {
    const d = new Date(param);
    if (!Number.isNaN(d.getTime())) return { now: d, frozen: true };
  }
  return { now: new Date(), frozen: false };
}
