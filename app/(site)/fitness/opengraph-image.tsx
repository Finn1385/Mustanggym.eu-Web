import { ogSize, renderOg } from "@/lib/seo/og";

export const alt = "Fitness centrum Mustang Gym Snina";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Fitness centrum", "Mustang Gym, Snina");
}
