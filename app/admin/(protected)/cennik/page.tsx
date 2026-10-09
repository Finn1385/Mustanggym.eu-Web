import { PageTitle } from "@/components/admin/ui";
import { getPrices } from "@/lib/content/queries";
import { priceInput } from "@/lib/format";
import { PriceEditor } from "./price-editor";

export const metadata = { title: "Cenník" };

export default function PricesPage() {
  const groups = getPrices().map((g) => ({
    title: g.title,
    icon: g.icon,
    items: g.items.map((i) => ({ label: i.label, price: priceInput(i.amountCents), note: i.note ?? "" })),
  }));
  return (
    <>
      <PageTitle title="Cenník" description="Cenník fitness centra. Zobrazuje sa na úvode a na stránke Fitness." />
      <PriceEditor initial={groups} />
    </>
  );
}
