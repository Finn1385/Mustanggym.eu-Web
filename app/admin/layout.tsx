import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { template: "%s | Správa webu", default: "Správa webu" },
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
