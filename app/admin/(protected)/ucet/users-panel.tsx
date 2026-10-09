"use client";

import { ShieldCheck, Trash2 } from "lucide-react";
import { Button, Field, Panel, Status, inputClass } from "@/components/admin/ui";
import { useFormAction } from "@/components/admin/use-form-action";
import { addUser, removeUser } from "@/lib/admin/actions/users";

type U = { id: string; name: string; email: string; twoFactorEnabled: boolean | null };

export function UsersPanel({ users, meId, minLength }: { users: U[]; meId: string; minLength: number }) {
  const add = useFormAction(addUser, { onSuccess: (form) => form.reset() });
  const remove = useFormAction(removeUser);

  return (
    <Panel title="Používatelia" description="Každý používateľ môže upravovať celý web. Nové heslo mu odovzdajte osobne.">
      <ul className="divide-y divide-rule">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0">
            <div>
              <p className="font-semibold">
                {u.name} {u.id === meId && <span className="text-sm font-normal text-ash">(vy)</span>}
              </p>
              <p className="flex items-center gap-2 text-sm text-ash">
                {u.email}
                {u.twoFactorEnabled && <ShieldCheck aria-label="Dvojfázové overenie zapnuté" className="size-4" />}
              </p>
            </div>
            {u.id !== meId && (
              <form
                onSubmit={(e) => {
                  if (confirm(`Odstrániť používateľa ${u.email}?`)) remove.onSubmit(e);
                  else e.preventDefault();
                }}
              >
                <input type="hidden" name="id" value={u.id} />
                <Button type="submit" variant="danger" aria-label={`Odstrániť ${u.email}`}>
                  <Trash2 aria-hidden className="size-4" />
                </Button>
              </form>
            )}
          </li>
        ))}
      </ul>
      <Status result={remove.result} />

      <form onSubmit={add.onSubmit} className="mt-6 grid gap-4 border-t border-rule pt-6 sm:grid-cols-3">
        <Field label="Meno">
          <input name="name" maxLength={80} className={inputClass} />
        </Field>
        <Field label="E-mail">
          <input name="email" type="email" required className={inputClass} />
        </Field>
        <Field label="Heslo" hint={`Aspoň ${minLength} znakov.`}>
          <input name="password" type="password" autoComplete="new-password" minLength={minLength} required className={inputClass} />
        </Field>
        <div className="flex flex-wrap items-center gap-4 sm:col-span-3">
          <Button type="submit" disabled={add.pending}>Pridať používateľa</Button>
          <Status result={add.result} />
        </div>
      </form>
    </Panel>
  );
}
