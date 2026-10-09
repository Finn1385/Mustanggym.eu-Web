"use client";

import { useRef, useState } from "react";
import { useFormAction } from "@/components/admin/use-form-action";
import { ImagePlus } from "lucide-react";
import { Button, Field, Panel, Status, inputClass } from "@/components/admin/ui";
import { uploadPhotos } from "@/lib/admin/actions/gallery";

export function UploadForm({ gallery }: { gallery: string }) {
  const [names, setNames] = useState<string[]>([]);
  const { result, pending, onSubmit } = useFormAction(uploadPhotos, {
    onSuccess: (form) => {
      form.reset();
      setNames([]);
    },
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [over, setOver] = useState(false);

  const sync = () => setNames(Array.from(inputRef.current?.files ?? []).map((f) => f.name));

  return (
    <Panel title="Nahrať fotky" description="JPG, PNG, WebP alebo AVIF, najviac 15 MB na fotku.">
      <form onSubmit={onSubmit} className="space-y-4">
        <input type="hidden" name="gallery" value={gallery} />
        <label
          onDragOver={(e) => {
            e.preventDefault();
            setOver(true);
          }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setOver(false);
            if (inputRef.current && e.dataTransfer.files.length) {
              inputRef.current.files = e.dataTransfer.files;
              sync();
            }
          }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-6 py-10 text-center ${
            over ? "border-chalk bg-steel" : "border-rule hover:border-ash"
          }`}
        >
          <ImagePlus aria-hidden className="size-8 text-ash" />
          <span className="font-semibold">Pretiahnite fotky sem alebo kliknite a vyberte ich</span>
          <span className="text-sm text-ash">
            {names.length ? `Vybrané: ${names.join(", ")}` : "Môžete vybrať viac fotiek naraz."}
          </span>
          <input
            ref={inputRef}
            type="file"
            name="photos"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            required
            onChange={sync}
            className="sr-only"
          />
        </label>
        <Field label="Popis fotiek" hint="Použije sa pre všetky nahrané fotky. Neskôr ho môžete upraviť pri každej fotke zvlášť.">
          <input name="alt" required minLength={3} maxLength={160} placeholder="Napr. Činkáreň s lavicami a kotúčmi" className={inputClass} />
        </Field>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={pending}>{pending ? "Nahrávam…" : "Nahrať"}</Button>
          <Status result={result} />
        </div>
      </form>
    </Panel>
  );
}
