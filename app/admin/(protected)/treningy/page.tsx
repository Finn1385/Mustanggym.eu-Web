import { PageTitle, Panel } from "@/components/admin/ui";
import { getClasses, getTimetable } from "@/lib/content/queries";
import { DAYS, displayTime } from "@/lib/hours";
import { AddClassForm, ClassRow } from "./class-forms";

export const metadata = { title: "Tréningy" };

export default function ClassesPage() {
  const slots = getTimetable();
  return (
    <>
      <PageTitle
        title="Tréningy"
        description="Zoznam tréningov, z ktorých vyberáte v rozvrhu. Skrytý tréning sa nedá pridať do rozvrhu, ale zostane v histórii."
      />
      <div className="space-y-6">
        <Panel title="Pridať tréning">
          <AddClassForm />
        </Panel>
        <Panel title="Všetky tréningy">
          <ul className="divide-y divide-rule">
            {getClasses().map((c) => {
              const usage = slots
                .filter((s) => s.classId === c.id)
                .map((s) => `${DAYS[s.day].short} ${displayTime(s.time)}`);
              return (
                <li key={c.id} className="py-3 first:pt-0 last:pb-0">
                  <ClassRow cls={c} usage={usage} />
                </li>
              );
            })}
          </ul>
        </Panel>
      </div>
    </>
  );
}
