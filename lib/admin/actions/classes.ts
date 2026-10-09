"use server";

import { eq, ne, and, count } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { published } from "@/lib/admin/mutate";
import { fail, ok, type ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/admin/session";

const name = z.string().trim().min(2, "Názov musí mať aspoň 2 znaky.").max(60, "Názov je príliš dlhý.");

function nameTaken(value: string, exceptId?: number) {
  const where = exceptId
    ? and(eq(schema.classes.name, value), ne(schema.classes.id, exceptId))
    : eq(schema.classes.name, value);
  return !!db.select({ id: schema.classes.id }).from(schema.classes).where(where).get();
}

export async function createClass(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = name.safeParse(form.get("name"));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  if (nameTaken(parsed.data)) return fail(`Tréning „${parsed.data}“ už existuje.`);
  db.insert(schema.classes).values({ name: parsed.data }).run();
  return ok(`Tréning „${parsed.data}“ je pridaný.`);
}

export async function updateClass(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireAdmin();
  const id = Number(form.get("id"));
  const parsed = name.safeParse(form.get("name"));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  if (nameTaken(parsed.data, id)) return fail(`Tréning „${parsed.data}“ už existuje.`);
  db.update(schema.classes)
    .set({ name: parsed.data, active: form.get("active") === "on" })
    .where(eq(schema.classes.id, id))
    .run();
  published("timetable", user.email);
  return ok("Uložené.");
}

export async function deleteClass(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const id = Number(form.get("id"));
  const used = db.select({ n: count() }).from(schema.timetableSlots).where(eq(schema.timetableSlots.classId, id)).get();
  if (used && used.n > 0) return fail("Tréning je v rozvrhu. Najprv ho odstráňte z rozvrhu.");
  db.delete(schema.classes).where(eq(schema.classes.id, id)).run();
  return ok("Tréning je odstránený.");
}
