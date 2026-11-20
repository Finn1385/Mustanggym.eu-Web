import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { Announcement } from "@/lib/content/settings";

/** One quiet line above the hero's status: a red tag, the news, an arrow. No banner, nothing to dismiss. */
export function AnnouncementLine({ announcement: a }: { announcement: Announcement }) {
  const body = (
    <>
      <span className="shrink-0 bg-mustang px-2 py-1 text-xs leading-none font-bold tracking-wider uppercase">{a.label}</span>
      <span>
        <span className={a.href ? "link-underline" : undefined}>{a.text}</span>
        {a.href && (
          <ArrowRight aria-hidden className="ml-2 inline size-4 align-[-0.15em] transition-transform group-hover:translate-x-1" />
        )}
      </span>
    </>
  );
  // Phones: tag on its own line above the text, so the text gets the full width instead of a cramped column.
  const className =
    "group mb-8 flex max-w-md flex-col items-start gap-2.5 text-lg leading-snug text-balance text-chalk sm:max-w-none sm:flex-row sm:items-center sm:gap-3 md:mb-10";
  if (!a.href) return <p className={className}>{body}</p>;
  const external = /^https?:/.test(a.href);
  return (
    <Link href={a.href} className={className} {...(external ? { target: "_blank", rel: "noopener" } : {})}>
      {body}
    </Link>
  );
}

/** Small "Nové" tag after a class name in the timetables. */
export function NewTag() {
  return (
    <span className="ml-2 inline-block bg-mustang px-1.5 py-0.5 align-[0.15em] text-[0.6875rem] leading-none font-bold tracking-wider text-chalk uppercase">
      Nové
    </span>
  );
}
