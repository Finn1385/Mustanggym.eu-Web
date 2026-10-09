"use client";

import Link from "next/link";
import { CheckCircle2, AlertCircle } from "lucide-react";
import type { ActionResult } from "@/lib/admin/result";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export function Button({
  variant = "primary",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "danger" | "ghost" }) {
  const styles = {
    primary: "bg-mustang text-chalk hover:bg-mustang-deep",
    secondary: "border border-rule bg-steel text-chalk hover:border-ash",
    danger: "border border-rule text-chalk hover:border-mustang hover:bg-mustang",
    ghost: "text-chalk/80 hover:bg-steel hover:text-chalk",
  }[variant];
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export const inputClass =
  "w-full rounded-md border border-rule bg-ink px-3 py-2 text-[0.9375rem] text-chalk placeholder:text-ash/70 focus:border-chalk focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-1 aria-invalid:border-mustang";

export function Field({
  label,
  hint,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-semibold">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ash">{hint}</span>}
    </label>
  );
}

export function Status({ result, viewHref }: { result: ActionResult; viewHref?: string }) {
  if (!result) return <p aria-live="polite" className="sr-only" />;
  return (
    <p
      aria-live="polite"
      role={result.ok ? "status" : "alert"}
      className={`flex flex-wrap items-center gap-2 text-sm ${result.ok ? "text-chalk" : "text-[#ff8a8d]"}`}
    >
      {result.ok ? <CheckCircle2 aria-hidden className="size-4" /> : <AlertCircle aria-hidden className="size-4" />}
      {result.ok ? result.message : result.error}
      {result.ok && viewHref && (
        <Link href={viewHref} target="_blank" className="link-underline text-chalk/80">
          Zobraziť na webe
        </Link>
      )}
    </p>
  );
}

export function Panel({ title, description, children, actions }: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-rule bg-steel/60">
      {(title || actions) && (
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-rule px-5 py-4">
          <div>
            {title && <h2 className="text-lg font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-ash">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function SaveBar({ pending, result, viewHref, label = "Uložiť zmeny", dirty = true }: {
  pending: boolean;
  result: ActionResult;
  viewHref?: string;
  label?: string;
  dirty?: boolean;
}) {
  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-6 flex flex-wrap items-center gap-4 border-t border-rule bg-ink/95 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
      <Button type="submit" disabled={pending || !dirty}>
        {pending ? "Ukladám…" : label}
      </Button>
      <Status result={result} viewHref={viewHref} />
    </div>
  );
}

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-8">
      <h1 className="font-display text-5xl font-bold">{title}</h1>
      {description && <p className="mt-2 max-w-2xl text-ash">{description}</p>}
    </div>
  );
}
