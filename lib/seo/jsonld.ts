import { DAYS, isOpenDay, type DayHours } from "@/lib/hours";
import type { PriceGroup } from "@/lib/content/queries";
import type { Site } from "@/lib/content/settings";
import { SITE_URL } from "@/lib/site";

export function gymJsonLd(site: Site, hours: DayHours[], prices: PriceGroup[], image?: string) {
  const amounts = prices.flatMap((g) => g.items.map((i) => i.amountCents / 100));
  return {
    "@context": "https://schema.org",
    "@type": "ExerciseGym",
    "@id": `${SITE_URL}/#gym`,
    name: site.name,
    description: site.tagline,
    url: SITE_URL,
    logo: `${SITE_URL}/brand/icon-512.png`,
    image: image ? `${SITE_URL}${image}` : `${SITE_URL}/brand/logo.png`,
    telephone: site.phone.replace(/\s/g, ""),
    email: site.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      postalCode: site.zip,
      addressLocality: site.city,
      addressCountry: "SK",
    },
    ...(site.lat != null && site.lng != null
      ? { geo: { "@type": "GeoCoordinates", latitude: site.lat, longitude: site.lng } }
      : {}),
    ...(site.mapsUrl ? { hasMap: site.mapsUrl } : {}),
    sameAs: [site.facebook, site.instagram].filter(Boolean),
    openingHoursSpecification: hours.filter(isOpenDay).map((h) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: `https://schema.org/${DAYS[h.day].schema}`,
      opens: h.opens,
      closes: h.closes,
    })),
    ...(amounts.length
      ? { priceRange: `${Math.min(...amounts).toFixed(2)} € – ${Math.max(...amounts).toFixed(2)} €`, currenciesAccepted: "EUR" }
      : {}),
    ...(site.multisport ? { paymentAccepted: "Hotovosť, karta MultiSport" } : {}),
  };
}

export function offerCatalogJsonLd(prices: PriceGroup[]) {
  return {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Cenník Mustang Gym",
    provider: { "@id": `${SITE_URL}/#gym` },
    itemListElement: prices.map((g) => ({
      "@type": "OfferCatalog",
      name: g.title,
      itemListElement: g.items.map((i) => ({
        "@type": "Offer",
        name: i.label,
        price: (i.amountCents / 100).toFixed(2),
        priceCurrency: "EUR",
      })),
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Úvod", path: "/" }, ...items].map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}
