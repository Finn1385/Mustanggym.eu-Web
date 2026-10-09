import type { Metadata, Viewport } from "next";
import { Archivo } from "next/font/google";
import { SITE_URL } from "@/lib/site";
import "./globals.css";

const sans = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mustang Gym Snina – fitness centrum a skupinové tréningy",
    template: "%s | Mustang Gym Snina",
  },
  description:
    "Rozlohou najväčšie fitness centrum v Snine. 800 m² posilňovne, kardio zóna, činkáreň a skupinové tréningy pod vedením trénera. Akceptujeme MultiSport.",
  applicationName: "Mustang Gym",
  openGraph: {
    type: "website",
    locale: "sk_SK",
    siteName: "Mustang Gym Snina",
  },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#161a1d",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sk" className={sans.variable} data-scroll-behavior="smooth">
      <head>
        {/* Big Shoulders is self-hosted via @font-face in globals.css (latin + latin-ext subsets). */}
        <link rel="preload" href="/fonts/big-shoulders-latin.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      </head>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
