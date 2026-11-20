import { z } from "zod";
import { getAuth } from "@/lib/auth";
import { BANNER_DEFAULT_TITLE, renderTimetableBanner } from "@/lib/banner/timetable-banner";
import { getHero, getImage, getTimetable } from "@/lib/content/queries";

export const dynamic = "force-dynamic";

const query = z.object({
  title: z.string().trim().max(40).catch(""),
  note: z.string().trim().max(60).catch(""),
  // Gallery image id for the background, or "none".
  bg: z.string().catch(""),
  download: z.string().optional(),
});

/** The timetable as a Facebook cover image. Route handlers skip the admin layout, so check the session here. */
export async function GET(request: Request) {
  const session = await getAuth().api.getSession({ headers: request.headers });
  if (!session) return new Response("Unauthorized", { status: 401 });

  const params = query.parse(Object.fromEntries(new URL(request.url).searchParams));
  const id = Number(params.bg);
  const background =
    params.bg === "none" ? null : Number.isInteger(id) && id > 0 ? getImage(id) : getHero("treningy");

  const image = await renderTimetableBanner({
    slots: getTimetable(),
    title: params.title || BANNER_DEFAULT_TITLE,
    note: params.note,
    background,
  });

  const headers = new Headers(image.headers);
  headers.set("Cache-Control", "no-store");
  if (params.download !== undefined) {
    const date = new Date().toISOString().slice(0, 10);
    headers.set("Content-Disposition", `attachment; filename="rozvrh-banner-${date}.png"`);
  }
  return new Response(image.body, { status: image.status, headers });
}
