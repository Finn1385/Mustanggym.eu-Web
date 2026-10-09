"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/admin/result";

/**
 * Like `<form action={…}>` but without React's automatic form reset, which would wipe the
 * user's input whenever the server rejects it. Spread `onSubmit` onto the form instead.
 */
export function useFormAction(
  action: (prev: ActionResult, form: FormData) => Promise<ActionResult>,
  { confirm: question, onSuccess }: { confirm?: string; onSuccess?: (form: HTMLFormElement) => void } = {},
) {
  const [result, setResult] = useState<ActionResult>(null);
  const [pending, startTransition] = useTransition();
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (question && !window.confirm(question)) return;
    const form = e.currentTarget;
    const data = new FormData(form, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(async () => {
      const res = await action(null, data);
      startTransition(() => setResult(res));
      if (res?.ok) onSuccess?.(form);
    });
  };
  return { result, pending, onSubmit };
}

/** onSubmit handler for client-only forms (auth calls), again without React's automatic reset. */
export function handle(fn: (form: FormData) => unknown) {
  return (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    fn(new FormData(e.currentTarget));
  };
}
