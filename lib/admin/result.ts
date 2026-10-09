export type ActionResult = { ok: true; message: string } | { ok: false; error: string } | null;

export const ok = (message = "Uložené."): ActionResult => ({ ok: true, message });
export const fail = (error: string): ActionResult => ({ ok: false, error });
