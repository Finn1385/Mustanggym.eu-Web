"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, inputClass } from "@/components/admin/ui";
import { handle } from "@/components/admin/use-form-action";
import { authClient } from "@/lib/auth-client";

function message(error: { status?: number; message?: string; code?: string } | null) {
  if (!error) return null;
  if (error.status === 429) return "Príliš veľa pokusov. Počkajte minútu a skúste to znova.";
  if (error.code === "INVALID_EMAIL_OR_PASSWORD" || error.status === 401) return "Nesprávny e-mail alebo heslo.";
  if (error.code === "INVALID_CODE" || error.code === "INVALID_TWO_FACTOR_AUTHENTICATION") return "Kód nie je správny. Skúste aktuálny kód z aplikácie.";
  return error.message || "Prihlásenie sa nepodarilo.";
}

export function LoginForm() {
  const router = useRouter();
  const [step, setStep] = useState<"password" | "totp">("password");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [useBackup, setUseBackup] = useState(false);

  async function onPassword(form: FormData) {
    setPending(true);
    setError(null);
    const { data, error } = await authClient.signIn.email({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setPending(false);
    if (error) return setError(message(error));
    if (data && "twoFactorRedirect" in data && data.twoFactorRedirect) return setStep("totp");
    router.replace("/admin");
    router.refresh();
  }

  async function onCode(form: FormData) {
    setPending(true);
    setError(null);
    const code = String(form.get("code")).replace(/\s/g, "");
    const { error } = useBackup
      ? await authClient.twoFactor.verifyBackupCode({ code, trustDevice: form.get("trust") === "on" })
      : await authClient.twoFactor.verifyTotp({ code, trustDevice: form.get("trust") === "on" });
    setPending(false);
    if (error) return setError(message(error));
    router.replace("/admin");
    router.refresh();
  }

  return step === "password" ? (
    <form onSubmit={handle(onPassword)} className="mt-8 space-y-5">
      <Field label="E-mail">
        <input name="email" type="email" autoComplete="username" required className={inputClass} />
      </Field>
      <Field label="Heslo">
        <input name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </Field>
      {error && <p role="alert" className="text-sm text-[#ff8a8d]">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Prihlasujem…" : "Prihlásiť sa"}
      </Button>
    </form>
  ) : (
    <form onSubmit={handle(onCode)} className="mt-8 space-y-5">
      <Field
        label={useBackup ? "Záložný kód" : "Kód z overovacej aplikácie"}
        hint={useBackup ? "Každý záložný kód sa dá použiť len raz." : "6-miestny kód z Google Authenticator, 1Password a pod."}
      >
        <input
          name="code"
          inputMode={useBackup ? "text" : "numeric"}
          autoComplete="one-time-code"
          required
          autoFocus
          className={`${inputClass} tabular tracking-widest`}
        />
      </Field>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="trust" className="size-4 accent-mustang" /> Dôverovať tomuto zariadeniu 30 dní
      </label>
      {error && <p role="alert" className="text-sm text-[#ff8a8d]">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Overujem…" : "Overiť a prihlásiť"}
      </Button>
      <button type="button" className="link-underline text-sm text-ash" onClick={() => setUseBackup((v) => !v)}>
        {useBackup ? "Použiť kód z aplikácie" : "Nemám prístup k aplikácii, použiť záložný kód"}
      </button>
    </form>
  );
}
