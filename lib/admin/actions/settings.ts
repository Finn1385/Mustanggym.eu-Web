"use server";

import { db, schema } from "@/db";
import { published } from "@/lib/admin/mutate";
import { fail, ok, type ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/admin/session";
import { settingSchemas, type SettingKey } from "@/lib/content/settings";

const EDITABLE = ["site", "fitness", "treningy"] as const satisfies SettingKey[];

export async function saveSetting(key: (typeof EDITABLE)[number], value: unknown): Promise<ActionResult> {
  const user = await requireAdmin();
  if (!EDITABLE.includes(key)) return fail("Toto nastavenie sa nedá upraviť.");
  const parsed = settingSchemas[key].safeParse(value);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return fail(`Skontrolujte pole „${issue?.path.join(".") || key}“: ${issue?.message ?? "neplatná hodnota"}.`);
  }
  db.insert(schema.settings)
    .values({ key, value: parsed.data })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: parsed.data } })
    .run();
  published(key === "site" ? "site" : "texts", user.email);
  return ok("Uložené.");
}
