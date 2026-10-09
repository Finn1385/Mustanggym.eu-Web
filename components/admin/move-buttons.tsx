"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

export function move<T>(list: T[], index: number, dir: -1 | 1): T[] {
  const target = index + dir;
  if (target < 0 || target >= list.length) return list;
  const next = [...list];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

export function MoveButtons({ index, length, onMove, label }: {
  index: number;
  length: number;
  onMove: (dir: -1 | 1) => void;
  label: string;
}) {
  const cls = "inline-flex size-9 items-center justify-center rounded-md text-chalk/80 hover:bg-steel disabled:opacity-30";
  return (
    <span className="inline-flex">
      <button type="button" className={cls} disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Posunúť vyššie: ${label}`}>
        <ArrowUp aria-hidden className="size-4" />
      </button>
      <button type="button" className={cls} disabled={index === length - 1} onClick={() => onMove(1)} aria-label={`Posunúť nižšie: ${label}`}>
        <ArrowDown aria-hidden className="size-4" />
      </button>
    </span>
  );
}
