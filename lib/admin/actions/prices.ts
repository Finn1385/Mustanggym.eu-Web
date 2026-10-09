"use server";

import { z } from "zod";
import { db, schema } from "@/db";
import { published } from "@/lib/admin/mutate";
import { fail, ok, type ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/admin/session";

const pricesSchema = z.array(
  z.object({
    title: z.string().trim().min(1, "Každá skupina potrebuje názov.").max(60),
    icon: z.string().min(1),
    items: z
      .array(
        z.object({
          label: z.string().trim().min(1, "Každá položka potrebuje názov.").max(120),
          amountCents: z.number().int().min(0, "Cena nemôže byť záporná.").max(10_000_00),
          note: z.string().trim().max(160).optional(),
        }),
      )
      .min(1, "Každá skupina potrebuje aspoň jednu položku."),
  }),
);

/** Replaces the whole price list; order in the array is the order on the website. */
export async function savePrices(groups: unknown): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = pricesSchema.safeParse(groups);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Cenník obsahuje neplatné údaje.");
  db.transaction((tx) => {
    tx.delete(schema.priceGroups).run();
    parsed.data.forEach((g, sort) => {
      const { id } = tx
        .insert(schema.priceGroups)
        .values({ title: g.title, icon: g.icon, sort })
        .returning({ id: schema.priceGroups.id })
        .get();
      tx.insert(schema.priceItems)
        .values(g.items.map((i, j) => ({ groupId: id, label: i.label, amountCents: i.amountCents, note: i.note || null, sort: j })))
        .run();
    });
  });
  published("prices", user.email);
  return ok("Cenník je uložený.");
}
