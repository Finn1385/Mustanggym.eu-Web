"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { published } from "@/lib/admin/mutate";
import { fail, ok, type ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/admin/session";

const slotsSchema = z.array(
  z.object({
    day: z.number().int().min(0).max(6),
    time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Zadajte čas v tvare 17:00."),
    classId: z.number().int().positive("Vyberte tréning."),
    note: z.string().trim().max(80).optional(),
  }),
);

/** Replaces the whole timetable in one transaction (it's small and edited as a whole). */
export async function saveTimetable(slots: unknown): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = slotsSchema.safeParse(slots);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Rozvrh obsahuje neplatné údaje.");
  try {
    db.transaction((tx) => {
      tx.delete(schema.timetableSlots).run();
      if (parsed.data.length) {
        tx.insert(schema.timetableSlots)
          .values(parsed.data.map((s) => ({ ...s, note: s.note || null })))
          .run();
      }
    });
  } catch {
    return fail("Niektorý z tréningov už neexistuje. Obnovte stránku a skúste to znova.");
  }
  published("timetable", user.email);
  return ok("Rozvrh je uložený.");
}
