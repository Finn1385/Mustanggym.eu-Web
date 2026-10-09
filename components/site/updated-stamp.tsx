import { formatDate } from "@/lib/format";

export function UpdatedStamp({ date, className = "" }: { date?: Date; className?: string }) {
  if (!date) return null;
  return (
    <p className={`text-sm ${className}`}>
      Aktualizované <time dateTime={date.toISOString().slice(0, 10)}>{formatDate(date)}</time>
    </p>
  );
}
