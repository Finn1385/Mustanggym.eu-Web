"use server";

import fs from "node:fs/promises";
import path from "node:path";
import { and, eq, max } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/db";
import { published } from "@/lib/admin/mutate";
import { fail, ok, type ActionResult } from "@/lib/admin/result";
import { requireAdmin } from "@/lib/admin/session";
import { getSetting } from "@/lib/content/queries";
import { processImage, randomImageName } from "@/lib/images";
import { UPLOAD_DIR } from "@/lib/paths";

const MAX_BYTES = 15 * 1024 * 1024;
const ACCEPTED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/tiff"]);
const gallerySchema = z.enum(["fitness", "treningy"]);
const altSchema = z.string().trim().min(3, "Popis fotky musí mať aspoň 3 znaky.").max(160, "Popis je príliš dlhý.");

export async function uploadPhotos(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const user = await requireAdmin();
  const gallery = gallerySchema.safeParse(form.get("gallery"));
  if (!gallery.success) return fail("Neznáma galéria.");
  const alt = altSchema.safeParse(form.get("alt"));
  if (!alt.success) return fail(alt.error.issues[0].message);

  const files = form.getAll("photos").filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) return fail("Vyberte aspoň jednu fotku.");
  for (const f of files) {
    if (!ACCEPTED.has(f.type)) return fail(`${f.name}: podporované sú fotky JPG, PNG, WebP a AVIF.`);
    if (f.size > MAX_BYTES) return fail(`${f.name}: fotka je väčšia ako 15 MB.`);
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const last = db
    .select({ sort: max(schema.galleryImages.sort) })
    .from(schema.galleryImages)
    .where(eq(schema.galleryImages.gallery, gallery.data))
    .get();
  let sort = (last?.sort ?? -1) + 1;

  for (const f of files) {
    let img;
    try {
      img = await processImage(Buffer.from(await f.arrayBuffer()));
    } catch {
      return fail(`${f.name}: súbor sa nepodarilo spracovať. Je to naozaj fotka?`);
    }
    const file = randomImageName();
    await fs.writeFile(path.join(UPLOAD_DIR, file), img.data);
    db.insert(schema.galleryImages)
      .values({
        gallery: gallery.data,
        file,
        alt: alt.data,
        width: img.width,
        height: img.height,
        blurDataUrl: img.blurDataUrl,
        sort: sort++,
      })
      .run();
  }
  published("gallery", user.email);
  return ok(files.length === 1 ? "Fotka je nahraná." : `Nahraných fotiek: ${files.length}.`);
}

const orderSchema = z.object({
  gallery: gallerySchema,
  photos: z.array(z.object({ id: z.number().int(), alt: altSchema })),
});

/** Saves the order and descriptions of a gallery's photos. */
export async function saveGallery(input: unknown): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = orderSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Neplatné údaje.");
  const { gallery, photos } = parsed.data;
  db.transaction((tx) => {
    photos.forEach((p, sort) => {
      tx.update(schema.galleryImages)
        .set({ alt: p.alt, sort })
        .where(and(eq(schema.galleryImages.id, p.id), eq(schema.galleryImages.gallery, gallery)))
        .run();
    });
  });
  published("gallery", user.email);
  return ok("Galéria je uložená.");
}

export async function deletePhoto(id: number): Promise<ActionResult> {
  const user = await requireAdmin();
  const photo = db.select().from(schema.galleryImages).where(eq(schema.galleryImages.id, id)).get();
  if (!photo) return fail("Fotka už neexistuje.");

  const heroes = getSetting("heroes");
  const nextHeroes = Object.fromEntries(
    Object.entries(heroes).map(([page, heroId]) => [page, heroId === id ? null : heroId]),
  );
  db.transaction((tx) => {
    tx.delete(schema.galleryImages).where(eq(schema.galleryImages.id, id)).run();
    tx.insert(schema.settings)
      .values({ key: "heroes", value: nextHeroes })
      .onConflictDoUpdate({ target: schema.settings.key, set: { value: nextHeroes } })
      .run();
  });
  await fs.rm(path.join(UPLOAD_DIR, path.basename(photo.file)), { force: true });
  published("gallery", user.email);
  return ok("Fotka je odstránená.");
}

const heroSchema = z.object({ page: z.enum(["home", "fitness", "treningy"]), id: z.number().int() });

export async function setHero(input: unknown): Promise<ActionResult> {
  const user = await requireAdmin();
  const parsed = heroSchema.safeParse(input);
  if (!parsed.success) return fail("Neplatné údaje.");
  const exists = db.select({ id: schema.galleryImages.id }).from(schema.galleryImages).where(eq(schema.galleryImages.id, parsed.data.id)).get();
  if (!exists) return fail("Fotka už neexistuje.");
  const heroes = { ...getSetting("heroes"), [parsed.data.page]: parsed.data.id };
  db.insert(schema.settings)
    .values({ key: "heroes", value: heroes })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: heroes } })
    .run();
  published("gallery", user.email);
  return ok("Úvodná fotka je nastavená.");
}
