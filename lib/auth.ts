import "server-only";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { twoFactor } from "better-auth/plugins/two-factor";
import { db, schema } from "@/db";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/users";
import { SITE_URL } from "@/lib/site";

function createAuth() {
  return betterAuth({
    appName: "Mustang Gym",
    baseURL: process.env.BETTER_AUTH_URL ?? SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
        twoFactor: schema.twoFactor,
      },
    }),
    emailAndPassword: {
      enabled: true,
      // Accounts are created by existing admins (or the CLI), never by visitors.
      disableSignUp: true,
      minPasswordLength: MIN_PASSWORD_LENGTH,
    },
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },
    rateLimit: {
      enabled: true,
      storage: "memory",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/two-factor/verify-totp": { window: 60, max: 5 },
        "/two-factor/verify-backup-code": { window: 60, max: 5 },
        "/change-password": { window: 60, max: 5 },
      },
    },
    advanced: {
      ipAddress: { ipAddressHeaders: ["x-forwarded-for", "x-real-ip"] },
    },
    plugins: [twoFactor({ issuer: "Mustang Gym" }), nextCookies()],
  });
}

type Auth = ReturnType<typeof createAuth>;
const globalForAuth = globalThis as unknown as { __mustangAuth?: Auth };

/** Created on first use so that importing this module during `next build` has no side effects. */
export function getAuth(): Auth {
  globalForAuth.__mustangAuth ??= createAuth();
  return globalForAuth.__mustangAuth;
}
