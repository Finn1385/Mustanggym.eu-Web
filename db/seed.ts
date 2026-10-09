import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import { UPLOAD_DIR } from "@/lib/paths";
import { settingDefaults } from "@/lib/content/settings";
import type { getDb } from "./index";
import * as s from "./schema";

type DB = ReturnType<typeof getDb>;

const HOURS: [string | null, string | null][] = [
  ["07:00", "20:30"],
  ["07:00", "20:30"],
  ["07:00", "20:30"],
  ["07:00", "20:30"],
  ["07:00", "20:30"],
  [null, null],
  ["08:00", "20:00"],
];

const CLASS_NAMES = [
  "Kruhový tréning",
  "Strong Body",
  "Body Booster",
  "Body Forming",
  "Body Workout",
];

const TIMETABLE: [number, string, string][] = [
  [0, "08:00", "Kruhový tréning"],
  [0, "17:00", "Kruhový tréning"],
  [1, "17:00", "Strong Body"],
  [2, "08:00", "Body Booster"],
  [2, "17:00", "Body Forming"],
  [3, "17:00", "Body Workout"],
  [4, "08:00", "Strong Body"],
];

const PRICES = [
  {
    title: "Vstupy",
    icon: "ticket",
    items: [
      ["Jednorázový vstup", 400],
      ["Jednorázový vstup junior", 300],
    ],
  },
  {
    title: "Permanentky",
    icon: "id-card",
    items: [
      ["Mesačná permanentka do 18 rokov", 4000],
      ["Mesačná permanentka nad 18 rokov", 4500],
      ["Permanentka na 10 vstupov", 3300],
    ],
  },
] as const;

type SeedImage = {
  gallery: "fitness" | "treningy";
  file: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl: string;
};

/** Fills an empty database with the content of the original static site. */
export function seed(db: DB) {
  const mediaDir = path.join(process.cwd(), "db/seed-media");
  const manifest: SeedImage[] = fs.existsSync(path.join(mediaDir, "manifest.json"))
    ? JSON.parse(fs.readFileSync(path.join(mediaDir, "manifest.json"), "utf8"))
    : [];

  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  for (const img of manifest) {
    const target = path.join(UPLOAD_DIR, img.file);
    if (!fs.existsSync(target)) fs.copyFileSync(path.join(mediaDir, img.file), target);
  }

  db.transaction((tx) => {
    tx.insert(s.openingHours)
      .values(HOURS.map(([opens, closes], day) => ({ day, opens, closes, closed: !opens })))
      .run();

    const classIds = new Map<string, number>();
    for (const name of CLASS_NAMES) {
      const row = tx.insert(s.classes).values({ name }).returning({ id: s.classes.id }).get();
      classIds.set(name, row.id);
    }
    tx.insert(s.timetableSlots)
      .values(TIMETABLE.map(([day, time, name]) => ({ day, time, classId: classIds.get(name)! })))
      .run();

    PRICES.forEach((group, sort) => {
      const { id } = tx
        .insert(s.priceGroups)
        .values({ title: group.title, icon: group.icon, sort })
        .returning({ id: s.priceGroups.id })
        .get();
      tx.insert(s.priceItems)
        .values(group.items.map(([label, amountCents], i) => ({ groupId: id, label, amountCents, sort: i })))
        .run();
    });

    const heroes = { ...settingDefaults.heroes };
    manifest.forEach((img, sort) => {
      const { id } = tx
        .insert(s.galleryImages)
        .values({ ...img, sort })
        .returning({ id: s.galleryImages.id })
        .get();
      if (img.file === "fitness-hero.webp") heroes.home = heroes.fitness = id;
      if (img.file === "treningy-hero.webp") heroes.treningy = id;
    });

    const values = { ...settingDefaults, heroes };
    for (const [key, value] of Object.entries(values)) {
      tx.insert(s.settings).values({ key, value }).run();
    }

    tx.insert(s.sectionUpdates)
      .values([
        { section: "hours", updatedAt: new Date("2024-12-08T12:00:00Z") },
        { section: "prices", updatedAt: new Date("2026-10-09T12:00:00Z") },
        { section: "timetable", updatedAt: new Date("2026-09-16T12:00:00Z") },
      ])
      .run();
  });
}

export function isEmpty(db: DB) {
  return !db.select({ day: s.openingHours.day }).from(s.openingHours).where(eq(s.openingHours.day, 0)).get();
}
