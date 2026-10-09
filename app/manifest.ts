import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Mustang Gym Snina",
    short_name: "Mustang Gym",
    description: "Fitness centrum a skupinové tréningy v Snine",
    lang: "sk",
    start_url: "/",
    display: "standalone",
    background_color: "#161a1d",
    theme_color: "#161a1d",
    icons: [
      { src: "/brand/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/brand/icon-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
