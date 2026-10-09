import Image from "next/image";
import type { GalleryImage } from "@/lib/content/queries";
import { mediaUrl } from "@/lib/content/queries";

export function PageHero({ title, intro, image }: { title: string; intro?: string; image: GalleryImage | null }) {
  return (
    <section className="relative flex min-h-[22rem] items-end overflow-hidden md:min-h-[30rem]">
      {image && (
        <div className="duotone absolute inset-0">
          <Image
            src={mediaUrl(image.file)}
            alt=""
            fill
            preload
            fetchPriority="high"
            sizes="100vw"
            quality={70}
            placeholder="blur"
            blurDataURL={image.blurDataUrl}
            className="object-cover"
          />
        </div>
      )}
      <div aria-hidden className="absolute inset-0 bg-linear-to-t from-ink via-ink/55 to-ink/10" />
      <div className="shell relative pt-28 pb-10 md:pb-14">
        <h1 className="rail rail-draw font-display text-title font-extrabold">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-lg text-chalk/90 md:text-xl">{intro}</p>}
      </div>
    </section>
  );
}
