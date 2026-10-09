import { ogSize, renderOg } from "@/lib/seo/og";

export const alt = "Skupinové tréningy Mustang Gym Snina";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Skupinové tréningy", "Mustang Gym, Snina");
}
