"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import QRCode from "qrcode";
import { LogOut, ShieldCheck } from "lucide-react";
import { Button, Field, Panel, Status, inputClass } from "@/components/admin/ui";
import { handle } from "@/components/admin/use-form-action";
import { authClient } from "@/lib/auth-client";
import { fail, ok, type ActionResult } from "@/lib/admin/result";

function errorText(e: { status?: number; message?: string; code?: string }) {
  if (e.status === 429) return "Príliš veľa pokusov. Počkajte minútu.";
  if (e.code === "INVALID_PASSWORD" || e.code === "INVALID_EMAIL_OR_PASSWORD") return "Heslo nie je správne.";
  if (e.code === "PASSWORD_TOO_SHORT") return "Nové heslo je príliš krátke.";
  if (e.code === "INVALID_CODE" || e.code === "INVALID_TWO_FACTOR_AUTHENTICATION") return "Kód nie je správny.";
  return e.message || "Akcia sa nepodarila.";
}

export function PasswordForm({ minLength }: { minLength: number }) {
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, setPending] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const el = e.currentTarget;
    const form = new FormData(el);
    const newPassword = String(form.get("new"));
    if (newPassword !== form.get("repeat")) return setResult(fail("Nové heslá sa nezhodujú."));
    setPending(true);
    const { error } = await authClient.changePassword({
      currentPassword: String(form.get("current")),
      newPassword,
      revokeOtherSessions: true,
    });
    setPending(false);
    if (error) return setResult(fail(errorText(error)));
    el.reset();
    setResult(ok("Heslo je zmenené. Ostatné zariadenia boli odhlásené."));
  }
  return (
    <Panel title="Zmena hesla">
      <form onSubmit={onSubmit} className="grid max-w-md gap-4">
        <Field label="Súčasné heslo">
          <input name="current" type="password" autoComplete="current-password" required className={inputClass} />
        </Field>
        <Field label="Nové heslo" hint={`Aspoň ${minLength} znakov.`}>
          <input name="new" type="password" autoComplete="new-password" minLength={minLength} required className={inputClass} />
        </Field>
        <Field label="Nové heslo znova">
          <input name="repeat" type="password" autoComplete="new-password" minLength={minLength} required className={inputClass} />
        </Field>
        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" disabled={pending}>Zmeniť heslo</Button>
          <Status result={result} />
        </div>
      </form>
    </Panel>
  );
}

export function TwoFactorPanel({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, setPending] = useState(false);
  const [setup, setSetup] = useState<{ qr: string; secret: string; backupCodes: string[] } | null>(null);

  async function start(form: FormData) {
    setPending(true);
    const { data, error } = await authClient.twoFactor.enable({ password: String(form.get("password")) });
    setPending(false);
    if (error || !data) return setResult(fail(errorText(error ?? {})));
    if (!("totpURI" in data)) return setResult(fail("Overovacia aplikácia nie je dostupná."));
    const qr = await QRCode.toDataURL(data.totpURI, { margin: 1, width: 220 });
    const secret = new URL(data.totpURI).searchParams.get("secret") ?? "";
    setSetup({ qr, secret, backupCodes: data.backupCodes });
    setResult(null);
  }

  async function verify(form: FormData) {
    setPending(true);
    const { error } = await authClient.twoFactor.verifyTotp({ code: String(form.get("code")).replace(/\s/g, "") });
    setPending(false);
    if (error) return setResult(fail(errorText(error)));
    setSetup(null);
    setResult(ok("Dvojfázové overenie je zapnuté."));
    router.refresh();
  }

  async function disable(form: FormData) {
    if (!confirm("Naozaj vypnúť dvojfázové overenie?")) return;
    setPending(true);
    const { error } = await authClient.twoFactor.disable({ password: String(form.get("password")) });
    setPending(false);
    if (error) return setResult(fail(errorText(error)));
    setResult(ok("Dvojfázové overenie je vypnuté."));
    router.refresh();
  }

  return (
    <Panel
      title="Dvojfázové overenie"
      description="Pri prihlásení budete okrem hesla zadávať aj kód z aplikácie v mobile. Odporúčame, web je verejne dostupný."
    >
      {enabled && !setup ? (
        <form onSubmit={handle(disable)} className="grid max-w-md gap-4">
          <p className="flex items-center gap-2 font-semibold"><ShieldCheck aria-hidden className="size-5" /> Zapnuté</p>
          <Field label="Heslo na potvrdenie">
            <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
          </Field>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" variant="danger" disabled={pending}>Vypnúť</Button>
            <Status result={result} />
          </div>
        </form>
      ) : setup ? (
        <form onSubmit={handle(verify)} className="grid gap-6 md:grid-cols-[auto_1fr]">
          <div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={setup.qr} alt="QR kód pre overovaciu aplikáciu" width={220} height={220} className="rounded-md bg-white" />
            <p className="mt-2 max-w-[220px] text-xs break-all text-ash">Alebo zadajte kľúč ručne: {setup.secret}</p>
          </div>
          <div className="space-y-4">
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              <li>Naskenujte QR kód v aplikácii (Google Authenticator, Microsoft Authenticator, 1Password…).</li>
              <li>Uložte si záložné kódy na bezpečné miesto. Každý funguje raz, ak stratíte telefón.</li>
              <li>Zadajte 6-miestny kód z aplikácie.</li>
            </ol>
            <ul className="tabular grid grid-cols-2 gap-1 rounded-md border border-rule p-3 text-sm sm:grid-cols-3">
              {setup.backupCodes.map((c) => <li key={c}>{c}</li>)}
            </ul>
            <Field label="Kód z aplikácie">
              <input name="code" inputMode="numeric" autoComplete="one-time-code" required className={`${inputClass} tabular max-w-40 tracking-widest`} />
            </Field>
            <div className="flex flex-wrap items-center gap-4">
              <Button type="submit" disabled={pending}>Overiť a zapnúť</Button>
              <Status result={result} />
            </div>
          </div>
        </form>
      ) : (
        <form onSubmit={handle(start)} className="grid max-w-md gap-4">
          <Field label="Heslo na potvrdenie">
            <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
          </Field>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" disabled={pending}>Zapnúť dvojfázové overenie</Button>
            <Status result={result} />
          </div>
        </form>
      )}
    </Panel>
  );
}

export function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      type="button"
      variant="secondary"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        await authClient.signOut();
        router.replace("/admin/prihlasenie");
        router.refresh();
      }}
    >
      <LogOut aria-hidden className="size-4" /> Odhlásiť sa
    </Button>
  );
}
