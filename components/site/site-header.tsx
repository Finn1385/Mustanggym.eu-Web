"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import type { DayHours, TodayStatus } from "@/lib/hours";
import { StatusPill } from "./today-status";

const NAV = [
  { href: "/", label: "Úvod" },
  { href: "/fitness", label: "Fitness centrum" },
  { href: "/treningy", label: "Skupinové tréningy" },
  { href: "/#kontakt", label: "Kontakt" },
] as const;

export function SiteHeader({ hours, status }: { hours: DayHours[]; status: TodayStatus }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-rule bg-ink/95 backdrop-blur supports-[backdrop-filter]:bg-ink/85">
        <a
          href="#obsah"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-mustang focus:px-4 focus:py-2 focus:text-chalk"
        >
          Preskočiť na obsah
        </a>
        <div className="shell flex h-16 items-center gap-8 md:h-20">
          <Link
            href="/"
            className="relative z-10 -mb-6 self-start rounded-b-md bg-chalk px-2.5 pt-2.5 pb-2 shadow-[0_6px_0_0_var(--color-mustang)] md:-mb-8 md:px-3 md:pt-3"
            aria-label="Mustang Gym – úvod"
          >
            <Image src="/brand/logo.svg" alt="" width={1520} height={1080} preload className="h-auto w-20 md:w-24" />
          </Link>

          <nav aria-label="Hlavná navigácia" className="hidden lg:block">
            <ul className="flex gap-8">
              {NAV.map((item) => {
                const active = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`relative py-2 text-[1.0625rem] font-semibold whitespace-nowrap transition-colors after:absolute after:inset-x-0 after:-bottom-0.5 after:h-1 after:origin-left after:bg-mustang after:transition-transform ${
                        active ? "text-chalk after:scale-x-100" : "text-chalk/80 after:scale-x-0 hover:text-chalk hover:after:scale-x-100"
                      }`}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto hidden sm:block">
            <StatusPill hours={hours} initial={status} />
          </div>

          <button
            ref={toggleRef}
            type="button"
            className="ml-auto inline-flex items-center gap-2 py-2 font-semibold sm:ml-0 lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X aria-hidden className="size-6" /> : <Menu aria-hidden className="size-6" />}
            Menu
          </button>
        </div>
      </header>

      {/* Outside <header>: its backdrop-filter would make it the containing block for this fixed panel,
          collapsing the panel to the header's height. */}
      <div
        id="mobile-nav"
        hidden={!open}
        className="fixed inset-x-0 top-16 bottom-0 z-30 overflow-y-auto bg-ink md:top-20 lg:hidden"
      >
        <nav aria-label="Mobilná navigácia" className="shell flex flex-col gap-10 pt-14 pb-10">
          <ul className="space-y-2">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={`block py-1 font-display text-[3.25rem] leading-none font-bold ${
                    pathname === item.href ? "rail" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div>
            <StatusPill hours={hours} initial={status} />
          </div>
        </nav>
      </div>
    </>
  );
}
