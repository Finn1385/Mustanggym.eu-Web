import { asc } from "drizzle-orm";
import { db, schema } from "@/db";
import { PageTitle } from "@/components/admin/ui";
import { requireAdmin } from "@/lib/admin/session";
import { MIN_PASSWORD_LENGTH } from "@/lib/admin/users";
import { PasswordForm, SignOutButton, TwoFactorPanel } from "./account-forms";
import { UsersPanel } from "./users-panel";

export const metadata = { title: "Účet a používatelia" };

export default async function AccountPage() {
  const me = await requireAdmin();
  const users = db
    .select({ id: schema.user.id, name: schema.user.name, email: schema.user.email, twoFactorEnabled: schema.user.twoFactorEnabled })
    .from(schema.user)
    .orderBy(asc(schema.user.createdAt))
    .all();
  return (
    <>
      <PageTitle title="Účet a používatelia" description={`Prihlásený ako ${me.email}.`} />
      <div className="space-y-6">
        <PasswordForm minLength={MIN_PASSWORD_LENGTH} />
        <TwoFactorPanel enabled={!!me.twoFactorEnabled} />
        <UsersPanel users={users} meId={me.id} minLength={MIN_PASSWORD_LENGTH} />
        <SignOutButton />
      </div>
    </>
  );
}
