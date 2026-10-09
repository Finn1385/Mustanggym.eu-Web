import path from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createUser, countUsers } from "@/lib/admin/users";
import { getDb } from "./index";
import { isEmpty, seed } from "./seed";

/** Runs on server start: apply migrations, seed an empty DB, create the first admin from env. */
export async function bootstrap() {
  const db = getDb();
  migrate(db, { migrationsFolder: path.join(process.cwd(), "db/migrations") });

  if (isEmpty(db)) {
    seed(db);
    console.log("[bootstrap] seeded empty database");
  }

  const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;
  if (ADMIN_EMAIL && ADMIN_PASSWORD && countUsers() === 0) {
    await createUser({ email: ADMIN_EMAIL, name: "Admin", password: ADMIN_PASSWORD });
    console.log(`[bootstrap] created admin ${ADMIN_EMAIL}`);
  }
}
