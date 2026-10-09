import Link from "next/link";
import { PageTitle } from "@/components/admin/ui";
import { getClasses, getTimetable } from "@/lib/content/queries";
import { TimetableEditor } from "./timetable-editor";

export const metadata = { title: "Rozvrh" };

export default function TimetablePage() {
  const classes = getClasses();
  return (
    <>
      <PageTitle title="Rozvrh" description="Tréningy sa na webe zoradia podľa času. Víkend sa zobrazí, len keď sú na ňom tréningy." />
      {classes.length === 0 ? (
        <p>
          Najprv <Link href="/admin/treningy" className="link-underline">pridajte tréningy</Link>, potom ich môžete dať do rozvrhu.
        </p>
      ) : (
        <TimetableEditor
          initial={getTimetable().map(({ day, time, classId, note }) => ({ day, time, classId, note: note ?? "" }))}
          classes={classes}
        />
      )}
    </>
  );
}
