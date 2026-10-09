import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const ogSize = { width: 1200, height: 630 };

/** Brand card for social previews: logo on a chalk plate, title beside the red rail. */
export async function renderOg(title: string, subtitle: string) {
  const [font, logo] = await Promise.all([
    readFile(join(process.cwd(), "assets/fonts/big-shoulders-800.ttf")),
    readFile(join(process.cwd(), "public/brand/logo.png")),
  ]);
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#161a1d", padding: 72, alignItems: "center", gap: 64 }}>
        <div style={{ display: "flex", background: "#f5f3f4", padding: 28, borderBottom: "14px solid #a4161a" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={300} height={210} alt="" />
        </div>
        <div style={{ display: "flex", flexDirection: "column", borderLeft: "18px solid #a4161a", paddingLeft: 40 }}>
          <div style={{ fontFamily: "Big Shoulders", fontSize: 112, lineHeight: 0.9, color: "#f5f3f4" }}>{title}</div>
          <div style={{ fontFamily: "Big Shoulders", fontSize: 44, marginTop: 24, color: "#9aa0a4" }}>{subtitle}</div>
        </div>
      </div>
    ),
    { ...ogSize, fonts: [{ name: "Big Shoulders", data: font, weight: 800, style: "normal" }] },
  );
}
