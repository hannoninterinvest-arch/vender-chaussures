import Link from "next/link";
import type { ReactNode } from "react";

export function LegalShell({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return <div className="mx-auto w-full max-w-[960px] px-4 py-12 md:px-6 md:py-20">
    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--gold)]">ELVARO · Informations et transparence</p>
    <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-[0.04em] md:text-4xl">{title}</h1>
    <p className="mt-4 max-w-[740px] text-sm leading-7 text-[var(--muted)]">{intro}</p>
    <div className="store-panel mt-8 space-y-8 rounded-sm p-6 md:p-10">{children}</div>
    <nav className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm underline underline-offset-4" aria-label="Informations commerciales">
      <Link href="/mentions-legales">Mentions légales</Link>
      <Link href="/cgv">CGV</Link>
      <Link href="/livraison-retours">Livraison et retours</Link>
      <Link href="/politique-confidentialite">Confidentialité</Link>
      <Link href="/contact">Contact</Link>
    </nav>
  </div>;
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="space-y-3">
    <h2 className="text-lg font-semibold">{title}</h2>
    <div className="space-y-3 text-sm leading-7 text-[var(--muted)]">{children}</div>
  </section>;
}
