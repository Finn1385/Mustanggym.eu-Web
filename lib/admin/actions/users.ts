"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db, schema } from "@/db";
import { fail, ok, type ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/admin/session";
import { createUser } from "@/lib/admin/users";

const newUser = z.object({
  name: z.string().trim().max(80),
  email: z.email("Zadajte platný e-mail."),
  password: z.string(),
});

export async function addUser(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const parsed = newUser.safeParse(Object.fromEntries(form));
  if (!parsed.success) return fail(parsed.error.issues[0].message);
  try {
    await createUser(parsed.data);
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Používateľa sa nepodarilo vytvoriť.");
  }
  revalidatePath("/admin/ucet");
  return ok(`Používateľ ${parsed.data.email} sa môže prihlásiť.`);
}

export async function removeUser(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const me = await requireAdmin();
  const id = String(form.get("id"));
  if (id === me.id) return fail("Nemôžete odstrániť sám seba.");
  db.delete(schema.user).where(eq(schema.user.id, id)).run();
  revalidatePath("/admin/ucet");
  return ok("Používateľ je odstránený.");
}
