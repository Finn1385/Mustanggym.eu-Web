import Link from "next/link";
import type { Site } from "@/lib/content/settings";

export function SiteFooter({ site }: { site: Site }) {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-rule">
      <div className="shell flex flex-col gap-6 py-10 text-sm text-ash md:flex-row md:items-center md:justify-between">
        <nav aria-label="Pätička">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li><Link href="/" className="hover:text-chalk">Úvod</Link></li>
            <li><Link href="/fitness" className="hover:text-chalk">Fitness centrum</Link></li>
            <li><Link href="/treningy" className="hover:text-chalk">Skupinové tréningy</Link></li>
            <li><Link href="/#kontakt" className="hover:text-chalk">Kontakt</Link></li>
          </ul>
        </nav>
        <p>
          © {year} {site.name}, {site.street}, {site.city}. Stránku vytvoril{" "}
          <a href="https://dcopik.me" target="_blank" rel="noopener noreferrer" className="link-underline text-chalk/85">
            Damián Čopík
          </a>
        </p>
      </div>
    </footer>
  );
}
