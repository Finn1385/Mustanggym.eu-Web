"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Clock, Dumbbell, ExternalLink, FileText, Images, LayoutDashboard, LogOut, Tag, UserCog } from "lucide-react";
import { authClient } from "@/lib/auth-client";

const ITEMS = [
  { href: "/admin", label: "Prehľad", Icon: LayoutDashboard },
  { href: "/admin/hodiny", label: "Otváracie hodiny", Icon: Clock },
  { href: "/admin/rozvrh", label: "Rozvrh", Icon: CalendarDays },
  { href: "/admin/treningy", label: "Tréningy", Icon: Dumbbell },
  { href: "/admin/cennik", label: "Cenník", Icon: Tag },
  { href: "/admin/galeria/fitness", label: "Galéria fitness", Icon: Images },
  { href: "/admin/galeria/treningy", label: "Galéria tréningy", Icon: Images },
  { href: "/admin/texty", label: "Texty a kontakt", Icon: FileText },
  { href: "/admin/ucet", label: "Účet a používatelia", Icon: UserCog },
] as const;

export function AdminNav({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <div className="flex h-full flex-col">
      <nav aria-label="Správa webu" className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
        <ul className="flex gap-1 lg:flex-col">
          {ITEMS.map(({ href, label, Icon }) => {
            const active = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap ${
                    active ? "bg-mustang text-chalk" : "text-chalk/80 hover:bg-steel hover:text-chalk"
                  }`}
                >
                  <Icon aria-hidden className="size-4" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-6 hidden space-y-1 border-t border-rule pt-4 text-sm lg:block">
        <a href="/" target="_blank" className="flex items-center gap-3 rounded-md px-3 py-2 text-chalk/80 hover:bg-steel">
          <ExternalLink aria-hidden className="size-4" /> Otvoriť web
        </a>
        <button
          type="button"
          onClick={async () => {
            await authClient.signOut();
            router.replace("/admin/prihlasenie");
            router.refresh();
          }}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-chalk/80 hover:bg-steel"
        >
          <LogOut aria-hidden className="size-4" /> Odhlásiť sa
        </button>
        <p className="truncate px-3 pt-2 text-xs text-ash">{email}</p>
      </div>
    </div>
  );
}
