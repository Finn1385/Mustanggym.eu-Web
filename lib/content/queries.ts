import "server-only";
import { cache } from "react";
import { asc, eq, inArray } from "drizzle-orm";
import { db, schema as s } from "@/db";
import type { DayHours } from "@/lib/hours";
import {
  settingDefaults,
  settingSchemas,
  type SettingKey,
  type SettingValue,
} from "./settings";

export type Section = "hours" | "timetable" | "prices" | "gallery" | "texts" | "site";

export const getHours = cache((): DayHours[] =>
  db.select().from(s.openingHours).orderBy(asc(s.openingHours.day)).all(),
);

export type Slot = { id: number; day: number; time: string; classId: number; className: string; note: string | null };

export const getTimetable = cache((): Slot[] =>
  db
    .select({
      id: s.timetableSlots.id,
      day: s.timetableSlots.day,
      time: s.timetableSlots.time,
      classId: s.timetableSlots.classId,
      className: s.classes.name,
      note: s.timetableSlots.note,
    })
    .from(s.timetableSlots)
    .innerJoin(s.classes, eq(s.classes.id, s.timetableSlots.classId))
    .orderBy(asc(s.timetableSlots.day), asc(s.timetableSlots.time))
    .all(),
);

export const getClasses = cache(() =>
  db.select().from(s.classes).orderBy(asc(s.classes.name)).all(),
);

export type PriceGroup = {
  id: number;
  title: string;
  icon: string;
  items: { id: number; label: string; amountCents: number; note: string | null }[];
};

export const getPrices = cache((): PriceGroup[] => {
  const groups = db.select().from(s.priceGroups).orderBy(asc(s.priceGroups.sort), asc(s.priceGroups.id)).all();
  if (groups.length === 0) return [];
  const items = db
    .select()
    .from(s.priceItems)
    .where(inArray(s.priceItems.groupId, groups.map((g) => g.id)))
    .orderBy(asc(s.priceItems.sort), asc(s.priceItems.id))
    .all();
  return groups.map((g) => ({
    id: g.id,
    title: g.title,
    icon: g.icon,
    items: items
      .filter((i) => i.groupId === g.id)
      .map(({ id, label, amountCents, note }) => ({ id, label, amountCents, note })),
  }));
});

export type GalleryName = "fitness" | "treningy";
export type GalleryImage = typeof s.galleryImages.$inferSelect;

export const getGallery = cache((gallery: GalleryName): GalleryImage[] =>
  db
    .select()
    .from(s.galleryImages)
    .where(eq(s.galleryImages.gallery, gallery))
    .orderBy(asc(s.galleryImages.sort), asc(s.galleryImages.id))
    .all(),
);

export const getImage = cache((id: number | null): GalleryImage | null =>
  id == null ? null : (db.select().from(s.galleryImages).where(eq(s.galleryImages.id, id)).get() ?? null),
);

/** Reads a setting, falling back to the default when it's missing or no longer matches its schema. */
export const getSetting = cache(<K extends SettingKey>(key: K): SettingValue<K> => {
  const row = db.select().from(s.settings).where(eq(s.settings.key, key)).get();
  const parsed = settingSchemas[key].safeParse(row?.value);
  return (parsed.success ? parsed.data : settingDefaults[key]) as SettingValue<K>;
});

export const getSectionUpdates = cache((): Partial<Record<Section, Date>> => {
  const rows = db.select().from(s.sectionUpdates).all();
  return Object.fromEntries(rows.map((r) => [r.section, r.updatedAt]));
});

export function getHero(page: "home" | "fitness" | "treningy") {
  return getImage(getSetting("heroes")[page]);
}

export function mediaUrl(file: string) {
  return `/media/${file}`;
}
