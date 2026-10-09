import crypto from "node:crypto";
import { count, eq } from "drizzle-orm";
import { hashPassword } from "better-auth/crypto";
import { db, schema } from "@/db";

export const MIN_PASSWORD_LENGTH = 12;

/** Creates a user with an email+password credential, bypassing the disabled public sign-up. */
export async function createUser(input: { email: string; name: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  if (input.password.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Heslo musí mať aspoň ${MIN_PASSWORD_LENGTH} znakov.`);
  }
  const existing = db.select({ id: schema.user.id }).from(schema.user).where(eq(schema.user.email, email)).get();
  if (existing) throw new Error(`Používateľ ${email} už existuje.`);

  const id = crypto.randomUUID();
  const password = await hashPassword(input.password);
  db.transaction((tx) => {
    tx.insert(schema.user).values({ id, email, name: input.name.trim() || email, emailVerified: true }).run();
    tx.insert(schema.account)
      .values({ id: crypto.randomUUID(), accountId: id, providerId: "credential", userId: id, password })
      .run();
  });
  return id;
}

/** Replaces a user's password and signs them out everywhere. */
export async function setPassword(email: string, newPassword: string) {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error(`Heslo musí mať aspoň ${MIN_PASSWORD_LENGTH} znakov.`);
  }
  const u = db.select().from(schema.user).where(eq(schema.user.email, email.trim().toLowerCase())).get();
  if (!u) throw new Error(`Používateľ ${email} neexistuje.`);
  const password = await hashPassword(newPassword);
  db.transaction((tx) => {
    tx.update(schema.account).set({ password, updatedAt: new Date() }).where(eq(schema.account.userId, u.id)).run();
    tx.delete(schema.session).where(eq(schema.session.userId, u.id)).run();
  });
}

export function countUsers(): number {
  return db.select({ n: count() }).from(schema.user).get()?.n ?? 0;
}
