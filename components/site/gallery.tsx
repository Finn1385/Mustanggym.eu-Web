"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

export type GalleryPhoto = {
  id: number;
  src: string;
  alt: string;
  width: number;
  height: number;
  blurDataUrl: string;
};

export function Gallery({ photos, label }: { photos: GalleryPhoto[]; label: string }) {
  const stripRef = useRef<HTMLUListElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const [current, setCurrent] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);

  const scrollStrip = (dir: 1 | -1) => {
    const el = stripRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const open = (index: number, opener: HTMLButtonElement) => {
    openerRef.current = opener;
    setCurrent(index);
    dialogRef.current?.showModal();
  };

  const close = useCallback(() => dialogRef.current?.close(), []);

  const step = useCallback(
    (dir: 1 | -1) => setCurrent((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClose = () => {
      setCurrent(null);
      openerRef.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    dialog.addEventListener("close", onClose);
    dialog.addEventListener("keydown", onKey);
    return () => {
      dialog.removeEventListener("close", onClose);
      dialog.removeEventListener("keydown", onKey);
    };
  }, [step]);

  if (photos.length === 0) return null;
  const photo = current === null ? null : photos[current];

  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollStrip(-1)}
          className="inline-flex size-11 items-center justify-center rounded-full border border-rule hover:border-chalk"
          aria-label="Predchádzajúce fotky"
        >
          <ChevronLeft aria-hidden className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => scrollStrip(1)}
          className="inline-flex size-11 items-center justify-center rounded-full border border-rule hover:border-chalk"
          aria-label="Ďalšie fotky"
        >
          <ChevronRight aria-hidden className="size-5" />
        </button>
      </div>

      {/* scroll-padding must match the padding: otherwise the browser snaps on load, which counts
          as a scroll and stops Chrome from reporting LCP for the whole page. */}
      <ul
        ref={stripRef}
        aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 gap-3 overflow-x-auto scroll-smooth px-4 pb-4 [scrollbar-width:thin] sm:mx-0 sm:scroll-px-0 sm:px-0"
      >
        {photos.map((p, i) => (
          <li key={p.id} className="w-[82%] shrink-0 snap-start sm:w-[46%] lg:w-[31.5%]">
            <button
              type="button"
              onClick={(e) => open(i, e.currentTarget)}
              className="group relative block aspect-[4/3] w-full overflow-hidden bg-steel"
              aria-label={`Zväčšiť fotku: ${p.alt}`}
            >
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="(min-width: 64rem) 30vw, (min-width: 40rem) 45vw, 82vw"
                quality={70}
                placeholder="blur"
                blurDataURL={p.blurDataUrl}
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        aria-label={photo?.alt ?? label}
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-ink/97 p-0 text-chalk backdrop:bg-ink/80"
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {photo && (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between px-4 py-3">
              <p className="tabular text-sm text-ash" aria-live="polite">
                {current! + 1} / {photos.length}
              </p>
              <button
                type="button"
                onClick={close}
                className="inline-flex items-center gap-2 py-2 font-semibold"
                autoFocus
              >
                <X aria-hidden className="size-6" /> Zavrieť
              </button>
            </div>
            <figure className="relative mx-4 flex-1" onClick={(e) => e.target === e.currentTarget && close()}>
              <Image
                key={photo.id}
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="100vw"
                quality={80}
                placeholder="blur"
                blurDataURL={photo.blurDataUrl}
                className="object-contain"
              />
            </figure>
            <div className="flex items-center justify-between gap-4 px-4 py-4">
              <button
                type="button"
                onClick={() => step(-1)}
                className="inline-flex size-12 items-center justify-center rounded-full border border-rule hover:border-chalk"
                aria-label="Predchádzajúca fotka"
              >
                <ChevronLeft aria-hidden className="size-6" />
              </button>
              <p className="text-center text-chalk/85">{photo.alt}</p>
              <button
                type="button"
                onClick={() => step(1)}
                className="inline-flex size-12 items-center justify-center rounded-full border border-rule hover:border-chalk"
                aria-label="Ďalšia fotka"
              >
                <ChevronRight aria-hidden className="size-6" />
              </button>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
