import Image from "next/image";
import Link from "next/link";
import { Contact } from "@/components/site/contact";
import { HoursStrip } from "@/components/site/hours";
import { PricePanel } from "@/components/site/price-panel";
import { SectionHeading } from "@/components/site/section-heading";
import { StatusHeadline } from "@/components/site/today-status";
import { UpdatedStamp } from "@/components/site/updated-stamp";
import {
  getHero,
  getHours,
  getPrices,
  getSectionUpdates,
  getSetting,
  getTimetable,
  mediaUrl,
} from "@/lib/content/queries";
import { DAYS, displayTime, localNow, todayStatus, toMinutes } from "@/lib/hours";
import { resolveNow } from "@/lib/now";

export const metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage({ searchParams }: PageProps<"/">) {
  const { now, frozen } = resolveNow((await searchParams).now);
  const hours = getHours();
  const status = todayStatus(hours, now);
  const todaySlots = getTimetable().filter((s) => s.day === status.day);
  const minutesNow = localNow(now).minutes;
  const site = getSetting("site");
  const fitness = getSetting("fitness");
  const treningy = getSetting("treningy");
  const updates = getSectionUpdates();
  const hero = getHero("home");
  const fitnessHero = getHero("fitness");
  const treningyHero = getHero("treningy");

  const doors = [
    { href: "/fitness", title: "Fitness centrum", text: fitness.intro, image: fitnessHero },
    { href: "/treningy", title: "Skupinové tréningy", text: treningy.intro, image: treningyHero },
  ];

  return (
    <>
      <section className="relative flex min-h-[calc(100svh-4rem)] items-end overflow-hidden md:min-h-[calc(100svh-5rem)]">
        {hero && (
          <div className="duotone absolute inset-0">
            <Image
              src={mediaUrl(hero.file)}
              alt=""
              fill
              preload
              fetchPriority="high"
              sizes="100vw"
              quality={70}
              placeholder="blur"
              blurDataURL={hero.blurDataUrl}
              className="object-cover"
            />
          </div>
        )}
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink via-ink/50 to-ink/5" />

        <div className="shell relative pt-32 pb-12 md:pb-16">
          <div className="rail rail-draw">
            <p className="text-lg text-chalk/90 md:text-2xl">Dnes je {DAYS[status.day].name.toLowerCase()}</p>
            <StatusHeadline hours={hours} initial={status} live={!frozen} />
            <section aria-labelledby="dnes-treningy" className="mt-8 max-w-2xl border-t border-chalk/25 pt-5 md:mt-10">
              <h2 id="dnes-treningy" className="text-base font-semibold text-chalk/85 md:text-lg">
                Dnešné skupinové tréningy
              </h2>
              {todaySlots.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-x-10 gap-y-4">
                  {todaySlots.map((s) => {
                    const started = toMinutes(s.time) <= minutesNow;
                    return (
                      <li key={s.id} className={`flex items-baseline gap-3 ${started ? "text-chalk/55" : ""}`}>
                        <time dateTime={s.time} className="font-display text-4xl leading-none font-bold md:text-5xl">
                          {displayTime(s.time)}
                        </time>
                        <span className="text-lg md:text-xl">
                          {s.className}
                          {started && <span className="ml-2 text-sm">už začal</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="mt-2 text-lg">Dnes nie je na programe žiadny tréning.</p>
              )}
              <Link href="/treningy" className="link-underline mt-4 inline-block text-chalk/90">
                Rozvrh na celý týždeň
              </Link>
            </section>
          </div>

          <h1 className="mt-12 max-w-3xl text-xl leading-snug md:mt-16 md:text-2xl">
            <span className="font-semibold">{site.name}</span>
            <span className="text-chalk/85">, {site.tagline.charAt(0).toLowerCase() + site.tagline.slice(1)}</span>
          </h1>
        </div>
      </section>

      <section aria-labelledby="hodiny-title" className="shell py-16 md:py-24">
        <SectionHeading
          id="hodiny-title"
          aside={<UpdatedStamp date={updates.hours} className="text-ash" />}
        >
          Otváracie hodiny
        </SectionHeading>
        <HoursStrip hours={hours} today={status.day} />
      </section>

      <nav aria-label="Ponuka" className="shell pb-16 md:pb-24">
        <ul className="border-t border-rule">
          {doors.map((d) => (
            <li key={d.href} className="border-b border-rule">
              <Link href={d.href} className="group grid items-center gap-6 py-8 md:grid-cols-[1fr_20rem] md:py-10">
                <span>
                  <span className="relative inline-block font-display text-title font-extrabold">
                    {d.title}
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-0 h-1.5 w-full origin-left scale-x-0 bg-mustang transition-transform duration-300 group-hover:scale-x-100 group-focus-visible:scale-x-100"
                    />
                  </span>
                  <span className="mt-4 block max-w-xl text-lg text-chalk/80">{d.text}</span>
                </span>
                {d.image && (
                  <span className="relative hidden aspect-[3/2] overflow-hidden bg-steel md:block">
                    <Image
                      src={mediaUrl(d.image.file)}
                      alt=""
                      fill
                      sizes="20rem"
                      quality={70}
                      placeholder="blur"
                      blurDataURL={d.image.blurDataUrl}
                      className="object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
                    />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <PricePanel groups={getPrices()} updatedAt={updates.prices} multisport={site.multisport} />

      <Contact site={site} />
    </>
  );
}
