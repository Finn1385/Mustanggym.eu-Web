import { ogSize, renderOg } from "@/lib/seo/og";

export const alt = "Mustang Gym Snina";
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOg("Mustang Gym", "Fitness centrum v Snine");
}
