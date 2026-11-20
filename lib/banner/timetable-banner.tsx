import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import sharp from "sharp";
import type { GalleryImage, Slot } from "@/lib/content/queries";
import { DAYS, displayTime } from "@/lib/hours";
import { UPLOAD_DIR } from "@/lib/paths";

export const BANNER_DEFAULT_TITLE = "Skupinové tréningy";

/** Facebook page cover size (the platform's recommended 2× upload). */
export const BANNER_SIZE = { width: 1640, height: 720 } as const;

const C = {
  ink: "#161a1d",
  chalk: "#f5f3f4",
  mustang: "#a4161a",
  rule: "#343b40",
  ash: "#9aa0a4",
};

/*
 * Facebook crops the cover differently per device: phones keep roughly the middle 1230 px of the width,
 * desktop keeps nearly everything but the profile picture sits over the bottom-left corner. Everything
 * that matters stays inside this padded box.
 */
const PAD_X = 205;
const PAD_Y = 76;

let fontsPromise: Promise<Buffer[]> | null = null;
function loadFonts() {
  fontsPromise ??= Promise.all(
    ["big-shoulders-800.ttf", "archivo-500.ttf", "archivo-600.ttf"].map((f) =>
      readFile(path.join(process.cwd(), "assets/fonts", f)),
    ),
  );
  return fontsPromise;
}

/** Same look as the site's `.duotone` heroes: grayscale + contrast, then multiplied with mustang red. */
async function duotone(file: string) {
  const { width, height } = BANNER_SIZE;
  const gray = await sharp(path.join(UPLOAD_DIR, path.basename(file)))
    .rotate()
    .resize(width, height, { fit: "cover", position: "attention" })
    .grayscale()
    // contrast(1.25) brightness(1.15), as in globals.css
    .linear(1.25 * 1.15, -128 * 0.25 * 1.15)
    .toColourspace("srgb")
    .png()
    .toBuffer();
  const tinted = await sharp(gray)
    .composite([{ input: { create: { width, height, channels: 3, background: C.mustang } }, blend: "multiply" }])
    .jpeg({ quality: 82 })
    .toBuffer();
  return `data:image/jpeg;base64,${tinted.toString("base64")}`;
}

export type BannerOptions = {
  slots: Slot[];
  title: string;
  note: string;
  background: GalleryImage | null;
};

export async function renderTimetableBanner({ slots, title, note, background }: BannerOptions) {
  const [[display, sans500, sans600], bg] = await Promise.all([
    loadFonts(),
    background ? duotone(background.file).catch(() => null) : null,
  ]);

  const byDay = DAYS.map((_, d) => slots.filter((s) => s.day === d));
  // Weekend columns only appear when there is something on them, like on the website.
  const visible = DAYS.map((_, d) => d).filter((d) => d < 5 || byDay[d].length > 0);
  const maxPerDay = Math.max(1, ...visible.map((d) => byDay[d].length));
  // Shrink entries when a busy day would overflow the column.
  const scale = maxPerDay <= 2 ? 1 : maxPerDay === 3 ? 0.8 : maxPerDay === 4 ? 0.64 : 0.52;
  const timeSize = Math.round(76 * scale);
  const nameSize = Math.round(25 * Math.max(scale, 0.8));
  const gap = Math.round(30 * scale);

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: C.ink }}>
        {bg && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={bg} alt="" width={BANNER_SIZE.width} height={BANNER_SIZE.height} style={{ position: "absolute", top: 0, left: 0 }} />
        )}
        {bg && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              backgroundImage:
                "linear-gradient(90deg, rgba(22,26,29,0.94) 0%, rgba(22,26,29,0.84) 55%, rgba(22,26,29,0.5) 100%)",
            }}
          />
        )}

        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            height: "100%",
            padding: `${PAD_Y}px ${PAD_X}px`,
          }}
        >
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
            <div style={{ display: "flex", borderLeft: `14px solid ${C.mustang}`, paddingLeft: 28 }}>
              <div
                style={{
                  fontFamily: "Big Shoulders",
                  fontSize: 96,
                  lineHeight: 0.86,
                  color: C.chalk,
                  textTransform: "uppercase",
                }}
              >
                {title}
              </div>
            </div>
            {note && (
              <div style={{ fontFamily: "Archivo", fontWeight: 500, fontSize: 24, color: C.ash, paddingBottom: 4 }}>
                {note}
              </div>
            )}
          </div>

          <div style={{ display: "flex", flex: 1, marginTop: 48, borderTop: `2px solid ${C.rule}` }}>
            {visible.map((d, i) => (
              <div
                key={d}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  borderLeft: i === 0 ? "none" : `2px solid ${C.rule}`,
                  padding: "0 20px",
                }}
              >
                <div
                  style={{
                    fontFamily: "Archivo",
                    fontWeight: 600,
                    fontSize: 30,
                    color: C.chalk,
                    padding: "20px 0 18px",
                  }}
                >
                  {DAYS[d].name}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap }}>
                  {byDay[d].length === 0 && (
                    <div style={{ fontFamily: "Archivo", fontWeight: 500, fontSize: 24, color: C.ash, paddingTop: 8 }}>
                      Bez tréningov
                    </div>
                  )}
                  {byDay[d].map((s) => (
                    <div key={s.id} style={{ display: "flex", flexDirection: "column" }}>
                      <div style={{ fontFamily: "Big Shoulders", fontSize: timeSize, lineHeight: 0.9, color: C.chalk }}>
                        {displayTime(s.time)}
                      </div>
                      <div
                        style={{
                          fontFamily: "Archivo",
                          fontWeight: 500,
                          fontSize: nameSize,
                          lineHeight: 1.15,
                          color: C.chalk,
                          marginTop: 6,
                        }}
                      >
                        {s.className}
                      </div>
                      {s.note && (
                        <div style={{ fontFamily: "Archivo", fontWeight: 500, fontSize: 20, color: C.ash, marginTop: 2 }}>
                          {s.note}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...BANNER_SIZE,
      fonts: [
        { name: "Big Shoulders", data: display, weight: 800, style: "normal" },
        { name: "Archivo", data: sans500, weight: 500, style: "normal" },
        { name: "Archivo", data: sans600, weight: 600, style: "normal" },
      ],
    },
  );
}
