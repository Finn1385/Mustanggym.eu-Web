import Image from "next/image";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/admin/session";
import { LoginForm } from "./login-form";

export const metadata = { title: "Prihlásenie" };

export default async function LoginPage() {
  if (await getSession()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-8 inline-block rounded-b-md bg-chalk px-3 pt-3 pb-2.5 shadow-[0_6px_0_0_var(--color-mustang)]">
          <Image src="/brand/logo.svg" alt="Mustang Gym" width={1520} height={1080} className="h-auto w-24" preload />
        </div>
        <h1 className="font-display text-5xl font-bold">Správa webu</h1>
        <p className="mt-2 text-ash">Prihláste sa, aby ste mohli upraviť hodiny, rozvrh, cenník a fotky.</p>
        <LoginForm />
      </div>
    </main>
  );
}
