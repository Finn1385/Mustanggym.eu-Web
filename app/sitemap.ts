import type { MetadataRoute } from "next";
import { getSectionUpdates } from "@/lib/content/queries";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-dynamic";

export default function sitemap(): MetadataRoute.Sitemap {
  const u = getSectionUpdates();
  const latest = (...dates: (Date | undefined)[]) =>
    dates.filter((d): d is Date => !!d).sort((a, b) => b.getTime() - a.getTime())[0];
  return [
    { url: `${SITE_URL}/`, lastModified: latest(u.hours, u.prices, u.timetable, u.site), priority: 1 },
    { url: `${SITE_URL}/fitness`, lastModified: latest(u.hours, u.prices, u.gallery, u.texts), priority: 0.9 },
    { url: `${SITE_URL}/treningy`, lastModified: latest(u.timetable, u.gallery, u.texts), priority: 0.9 },
  ];
}
