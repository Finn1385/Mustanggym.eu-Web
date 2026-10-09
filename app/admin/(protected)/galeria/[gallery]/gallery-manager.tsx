"use client";

import Image from "next/image";
import { useMemo, useState, useTransition } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Star, Trash2 } from "lucide-react";
import { Button, Panel, SaveBar, Status, inputClass } from "@/components/admin/ui";
import { deletePhoto, saveGallery, setHero } from "@/lib/admin/actions/gallery";
import type { ActionResult } from "@/lib/admin/result";

type Photo = { id: number; src: string; alt: string; blurDataUrl: string };
type HeroPage = "home" | "fitness" | "treningy";
const PAGE_LABEL: Record<HeroPage, string> = { home: "Úvod", fitness: "Fitness", treningy: "Tréningy" };

export function GalleryManager({
  gallery,
  photos: initial,
  heroes,
  heroPages,
  viewHref,
}: {
  gallery: "fitness" | "treningy";
  photos: Photo[];
  heroes: Record<HeroPage, number | null>;
  heroPages: HeroPage[];
  viewHref: string;
}) {
  const [photos, setPhotos] = useState(initial);
  const [saved, setSaved] = useState(() => JSON.stringify(initial));
  const [result, setResult] = useState<ActionResult>(null);
  const [itemResult, setItemResult] = useState<ActionResult>(null);
  const [pending, startTransition] = useTransition();
  const dirty = useMemo(() => JSON.stringify(photos) !== saved, [photos, saved]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    setPhotos((list) => {
      const from = list.findIndex((p) => p.id === active.id);
      const to = list.findIndex((p) => p.id === over.id);
      return arrayMove(list, from, to);
    });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveGallery({ gallery, photos: photos.map(({ id, alt }) => ({ id, alt })) });
      setResult(res);
      if (res?.ok) setSaved(JSON.stringify(photos));
    });
  }

  if (photos.length === 0) {
    return <Panel title="Fotky"><p className="text-sm text-ash">Galéria je prázdna. Nahrajte prvé fotky vyššie.</p></Panel>;
  }

  return (
    <form onSubmit={submit}>
      <Panel title={`Fotky (${photos.length})`} description="Poradie zmeníte potiahnutím za úchyt alebo klávesnicou (medzerník, šípky, medzerník).">
        <Status result={itemResult} />
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={photos.map((p) => p.id)} strategy={rectSortingStrategy}>
            <ul className="mt-2 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((p, i) => (
                <SortablePhoto
                  key={p.id}
                  photo={p}
                  index={i}
                  heroPages={heroPages}
                  heroes={heroes}
                  onAlt={(alt) => setPhotos((list) => list.map((x) => (x.id === p.id ? { ...x, alt } : x)))}
                  onHero={(page) => startTransition(async () => setItemResult(await setHero({ page, id: p.id })))}
                  onDelete={() => {
                    if (!confirm("Naozaj odstrániť túto fotku? Táto akcia sa nedá vrátiť.")) return;
                    startTransition(async () => setItemResult(await deletePhoto(p.id)));
                  }}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      </Panel>
      <SaveBar pending={pending} result={result} viewHref={viewHref} label="Uložiť poradie a popisy" dirty={dirty} />
    </form>
  );
}

function SortablePhoto({
  photo,
  index,
  heroPages,
  heroes,
  onAlt,
  onHero,
  onDelete,
}: {
  photo: Photo;
  index: number;
  heroPages: HeroPage[];
  heroes: Record<HeroPage, number | null>;
  onAlt: (alt: string) => void;
  onHero: (page: HeroPage) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: photo.id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`overflow-hidden rounded-lg border bg-ink ${isDragging ? "z-10 border-chalk shadow-2xl" : "border-rule"}`}
    >
      <div className="relative aspect-[4/3] bg-steel">
        <Image src={photo.src} alt="" fill sizes="(min-width: 64rem) 20rem, 50vw" placeholder="blur" blurDataURL={photo.blurDataUrl} className="object-cover" />
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Presunúť fotku ${index + 1}`}
          className="absolute top-2 left-2 inline-flex size-9 cursor-grab touch-none items-center justify-center rounded-md bg-ink/80 active:cursor-grabbing"
        >
          <GripVertical aria-hidden className="size-4" />
        </button>
        <span className="tabular absolute top-2 right-2 rounded bg-ink/80 px-2 py-1 text-xs">{index + 1}</span>
      </div>
      <div className="space-y-3 p-3">
        <textarea
          value={photo.alt}
          onChange={(e) => onAlt(e.target.value)}
          rows={2}
          required
          minLength={3}
          maxLength={160}
          aria-label={`Popis fotky ${index + 1}`}
          className={`${inputClass} resize-none text-sm`}
        />
        <div className="flex flex-wrap items-center gap-2">
          {heroPages.map((page) => {
            const active = heroes[page] === photo.id;
            return (
              <button
                key={page}
                type="button"
                onClick={() => !active && onHero(page)}
                aria-pressed={active}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  active ? "bg-mustang text-chalk" : "border border-rule text-chalk/80 hover:border-ash"
                }`}
              >
                <Star aria-hidden className={`size-3 ${active ? "fill-current" : ""}`} />
                {active ? `Úvodná fotka: ${PAGE_LABEL[page]}` : `Nastaviť ako úvodnú: ${PAGE_LABEL[page]}`}
              </button>
            );
          })}
          <Button type="button" variant="danger" className="ml-auto px-2.5 py-1.5" onClick={onDelete} aria-label={`Odstrániť fotku ${index + 1}`}>
            <Trash2 aria-hidden className="size-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}
