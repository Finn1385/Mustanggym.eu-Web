import { PageTitle } from "@/components/admin/ui";
import { getHours } from "@/lib/content/queries";
import { HoursForm } from "./hours-form";

export const metadata = { title: "Otváracie hodiny" };

export default function HoursPage() {
  return (
    <>
      <PageTitle title="Otváracie hodiny" description="Platia pre fitness centrum. Zobrazujú sa na úvode, na stránke Fitness a v Google." />
      <HoursForm hours={getHours()} />
    </>
  );
}
