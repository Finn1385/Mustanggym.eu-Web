import Image from "next/image";
import Link from "next/link";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/admin/session";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="border-b border-rule bg-ink px-4 py-4 lg:sticky lg:top-0 lg:h-dvh lg:border-r lg:border-b-0 lg:py-6">
        <Link href="/admin" className="mb-4 flex items-center gap-3 lg:mb-8">
          <span className="rounded-sm bg-chalk p-1.5">
            <Image src="/brand/logo.svg" alt="" width={1520} height={1080} className="h-auto w-10" />
          </span>
          <span className="font-semibold">Správa webu</span>
        </Link>
        <AdminNav email={user.email} />
      </aside>
      <main id="obsah" className="px-4 py-8 sm:px-8 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
