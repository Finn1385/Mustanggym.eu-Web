import Link from "next/link";

export default function NotFound() {
  return (
    <main className="shell flex min-h-dvh flex-col justify-center py-24">
      <p className="rail font-display text-display font-extrabold">404</p>
      <h1 className="mt-6 text-2xl font-semibold">Táto stránka neexistuje.</h1>
      <p className="mt-2 text-chalk/80">Možno bola presunutá. Rozvrh, otváracie hodiny aj cenník nájdete na úvode.</p>
      <Link href="/" className="mt-8 inline-block w-fit bg-mustang px-6 py-3 font-semibold text-chalk hover:bg-mustang-deep">
        Prejsť na úvod
      </Link>
    </main>
  );
}
