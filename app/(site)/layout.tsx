import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { JsonLd } from "@/components/site/json-ld";
import { ScrollToTop } from "@/components/site/scroll-to-top";
import { getHero, getHours, getPrices, getSetting, mediaUrl } from "@/lib/content/queries";
import { todayStatus } from "@/lib/hours";
import { gymJsonLd } from "@/lib/seo/jsonld";

// Content lives in SQLite and is edited at runtime, so every page renders per request.
export const dynamic = "force-dynamic";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  const hours = getHours();
  const site = getSetting("site");
  const hero = getHero("home");
  return (
    <>
      <JsonLd data={gymJsonLd(site, hours, getPrices(), hero ? mediaUrl(hero.file) : undefined)} />
      <ScrollToTop />
      <SiteHeader hours={hours} status={todayStatus(hours)} />
      <main id="obsah">{children}</main>
      <SiteFooter site={site} />
    </>
  );
}
