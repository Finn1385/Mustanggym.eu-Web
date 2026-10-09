import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth";

export async function getSession() {
  return getAuth().api.getSession({ headers: await headers() });
}

/**
 * Guards every admin page *and* every Server Action: actions are public HTTP endpoints,
 * so a layout check alone would not protect them.
 */
export async function requireAdmin() {
  const session = await getSession();
  if (!session) redirect("/admin/prihlasenie");
  return session.user;
}
