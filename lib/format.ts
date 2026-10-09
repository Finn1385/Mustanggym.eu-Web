const priceFormat = new Intl.NumberFormat("sk-SK", { style: "currency", currency: "EUR" });
const dateFormat = new Intl.DateTimeFormat("sk-SK", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
  timeZone: "Europe/Bratislava",
});

export function formatPrice(cents: number) {
  return priceFormat.format(cents / 100);
}

/** "4,00" / "4.5" / "45" → 400 / 450 / 4500; null when not a valid amount. */
export function parsePrice(input: string): number | null {
  const normalised = input.replace(/\s|€/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalised)) return null;
  return Math.round(Number(normalised) * 100);
}

export function priceInput(cents: number) {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export function formatDate(date: Date) {
  return dateFormat.format(date);
}

export function telHref(phone: string) {
  return `tel:${phone.replace(/[^\d+]/g, "")}`;
}
