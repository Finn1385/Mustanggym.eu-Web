import "server-only";
import { revalidatePath } from "next/cache";
import { db, schema } from "@/db";
import type { Section } from "@/lib/content/queries";

/** Records who changed a public section and refreshes every page that shows it. */
export function published(section: Section, by: string) {
  const now = new Date();
  db.insert(schema.sectionUpdates)
    .values({ section, updatedAt: now, updatedBy: by })
    .onConflictDoUpdate({ target: schema.sectionUpdates.section, set: { updatedAt: now, updatedBy: by } })
    .run();
  revalidatePath("/", "layout");
}
