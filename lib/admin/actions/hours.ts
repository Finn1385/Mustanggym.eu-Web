"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { published } from "@/lib/admin/mutate";
import { fail, ok, type ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/admin/session";
import { DAYS, toMinutes } from "@/lib/hours";

const time = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);

export async function saveHours(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireAdmin();
  const rows: { day: number; opens: string | null; closes: string | null; closed: boolean }[] = [];
  for (let day = 0; day < 7; day++) {
    const closed = form.get(`closed-${day}`) === "on";
    if (closed) {
      rows.push({ day, opens: null, closes: null, closed: true });
      continue;
    }
    const opens = time.safeParse(form.get(`opens-${day}`));
    const closes = time.safeParse(form.get(`closes-${day}`));
    if (!opens.success || !closes.success) return fail(`${DAYS[day].name}: zadajte čas otvorenia aj zatvorenia.`);
    if (toMinutes(closes.data) <= toMinutes(opens.data)) {
      return fail(`${DAYS[day].name}: čas zatvorenia musí byť neskôr ako čas otvorenia.`);
    }
    rows.push({ day, opens: opens.data, closes: closes.data, closed: false });
  }
  db.transaction((tx) => {
    for (const row of rows) {
      tx.insert(schema.openingHours)
        .values(row)
        .onConflictDoUpdate({ target: schema.openingHours.day, set: row })
        .run();
    }
  });
  published("hours", user.email);
  return ok("Otváracie hodiny sú uložené.");
}
