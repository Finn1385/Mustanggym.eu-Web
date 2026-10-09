import { PageTitle } from "@/components/admin/ui";
import { getSetting } from "@/lib/content/queries";
import { FitnessTextsForm, SiteForm, TreningyTextsForm } from "./forms";

export const metadata = { title: "Texty a kontakt" };

export default function TextsPage() {
  return (
    <>
      <PageTitle title="Texty a kontakt" description="Kontaktné údaje sa zobrazujú v pätičke, na úvode a v údajoch pre Google." />
      <div className="space-y-10">
        <SiteForm initial={getSetting("site")} />
        <FitnessTextsForm initial={getSetting("fitness")} />
        <TreningyTextsForm initial={getSetting("treningy")} />
      </div>
    </>
  );
}
