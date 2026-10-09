import { formatPrice } from "@/lib/format";
import type { PriceGroup } from "@/lib/content/queries";
import { Icon } from "@/components/ui/icon";
import { UpdatedStamp } from "./updated-stamp";

export function PricePanel({
  groups,
  updatedAt,
  multisport,
  headingLevel = 2,
}: {
  groups: PriceGroup[];
  updatedAt?: Date;
  multisport: boolean;
  headingLevel?: 2 | 3;
}) {
  if (groups.length === 0) return null;
  const H = `h${headingLevel}` as const;
  const Sub = `h${headingLevel + 1}` as "h3" | "h4";
  return (
    <section id="cennik" aria-labelledby="cennik-title" className="bg-chalk text-ink">
      <div className="shell grid gap-10 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-4">
          <H id="cennik-title" className="font-display text-heading font-bold">
            Cenník
          </H>
          <p className="mt-4 max-w-xs text-ink/75">Ceny vstupov a permanentiek do fitness centra.</p>
          {multisport && (
            <p className="mt-6 inline-flex items-center gap-2 font-semibold">
              <Icon name="credit-card" className="size-5 text-mustang" />
              Akceptujeme kartu MultiSport
            </p>
          )}
          <UpdatedStamp date={updatedAt} className="mt-6 text-ink/65" />
        </div>
        <div className="space-y-12 md:col-span-8">
          {groups.map((g) => (
            <div key={g.id}>
              <Sub className="flex items-center gap-3 text-lg font-semibold">
                <Icon name={g.icon} className="size-5 text-mustang" />
                {g.title}
              </Sub>
              <ul className="mt-3 border-t-2 border-ink">
                {g.items.map((item) => (
                  <li key={item.id} className="flex items-baseline gap-3 border-b border-ink/15 py-4">
                    <span className="text-lg">
                      {item.label}
                      {item.note && <span className="block text-sm text-ink/65">{item.note}</span>}
                    </span>
                    <span aria-hidden className="leader" />
                    <span className="font-display text-[2.25rem] leading-none font-bold whitespace-nowrap text-mustang">
                      {formatPrice(item.amountCents)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
