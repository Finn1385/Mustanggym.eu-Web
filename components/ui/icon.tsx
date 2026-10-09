import {
  CalendarDays,
  Clock,
  CreditCard,
  Dumbbell,
  HeartPulse,
  IdCard,
  Maximize,
  ShowerHead,
  Sparkles,
  Ticket,
  Timer,
  Trophy,
  Users,
  type LucideProps,
} from "lucide-react";

/** Icons that editors can choose in the admin. Keys are stored in the database. */
export const ICONS = {
  maximize: { label: "Rozloha", Icon: Maximize },
  dumbbell: { label: "Činka", Icon: Dumbbell },
  "credit-card": { label: "Karta", Icon: CreditCard },
  ticket: { label: "Vstupenka", Icon: Ticket },
  "id-card": { label: "Permanentka", Icon: IdCard },
  users: { label: "Skupina", Icon: Users },
  clock: { label: "Hodiny", Icon: Clock },
  timer: { label: "Časovač", Icon: Timer },
  calendar: { label: "Kalendár", Icon: CalendarDays },
  heart: { label: "Zdravie", Icon: HeartPulse },
  trophy: { label: "Výsledky", Icon: Trophy },
  shower: { label: "Sprchy", Icon: ShowerHead },
  sparkles: { label: "Novinka", Icon: Sparkles },
} as const;

export type IconName = keyof typeof ICONS;

export function Icon({ name, ...props }: { name: string } & LucideProps) {
  const entry = ICONS[name as IconName] ?? ICONS.dumbbell;
  return <entry.Icon aria-hidden strokeWidth={1.75} {...props} />;
}
