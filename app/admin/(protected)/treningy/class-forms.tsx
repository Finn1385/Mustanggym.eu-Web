"use client";

import { Trash2 } from "lucide-react";
import { Button, Status, inputClass } from "@/components/admin/ui";
import { useFormAction } from "@/components/admin/use-form-action";
import { createClass, deleteClass, updateClass } from "@/lib/admin/actions/classes";

export function AddClassForm() {
  const { result, pending, onSubmit } = useFormAction(createClass, { onSuccess: (form) => form.reset() });
  return (
    <form onSubmit={onSubmit} className="flex flex-wrap items-center gap-3">
      <input name="name" required minLength={2} maxLength={60} placeholder="Napr. Pilates" aria-label="Názov tréningu" className={`${inputClass} max-w-sm`} />
      <Button type="submit" disabled={pending}>Pridať</Button>
      <Status result={result} />
    </form>
  );
}

export function ClassRow({ cls, usage }: { cls: { id: number; name: string; active: boolean }; usage: string[] }) {
  const save = useFormAction(updateClass);
  const remove = useFormAction(deleteClass, { confirm: `Naozaj odstrániť tréning „${cls.name}“?` });
  const result = remove.result ?? save.result;
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <form onSubmit={save.onSubmit} className="flex flex-1 flex-wrap items-center gap-3">
          <input type="hidden" name="id" value={cls.id} />
          <input name="name" defaultValue={cls.name} required aria-label="Názov tréningu" className={`${inputClass} max-w-xs`} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={cls.active} className="size-4 accent-mustang" />
            Dostupný v rozvrhu
          </label>
          <Button type="submit" variant="secondary" disabled={save.pending}>Uložiť</Button>
        </form>
        <form onSubmit={remove.onSubmit}>
          <input type="hidden" name="id" value={cls.id} />
          <Button
            type="submit"
            variant="danger"
            disabled={remove.pending || usage.length > 0}
            title={usage.length ? "Tréning je v rozvrhu" : undefined}
            aria-label={`Odstrániť ${cls.name}`}
          >
            <Trash2 aria-hidden className="size-4" />
          </Button>
        </form>
      </div>
      {usage.length > 0 && <p className="text-xs text-ash">V rozvrhu: {usage.join(", ")}</p>}
      <Status result={result} />
    </div>
  );
}
