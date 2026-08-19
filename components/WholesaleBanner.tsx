import Link from "next/link";
import { Reveal } from "./Reveal";
import { brand } from "@/lib/brand";
import { WHOLESALE_MIN_QTY } from "@/lib/wholesale";

export function WholesaleBanner() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-4 md:px-6">
      <Reveal>
        <div className="gold-frame flex flex-col gap-6 rounded-[4px] bg-[var(--panel)] px-6 py-10 md:flex-row md:items-center md:justify-between md:px-12">
          <div className="max-w-xl">
            <p className="text-[11px] tracking-[0.28em] uppercase text-[var(--gold)]">
              Revendeurs & boutiques
            </p>
            <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] uppercase text-[var(--fg)] md:text-4xl">
              Acheter en gros
            </h2>
            <p className="mt-3 text-[var(--muted)]">
              À partir de {WHOLESALE_MIN_QTY} paires, prix négociable. Composez votre commande,
              laissez votre numéro : nous vous appelons.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row md:shrink-0">
            <Link href="/grossiste" className="gold-btn rounded-sm px-7 py-3.5 text-center text-xs uppercase">
              Demander un prix de gros
            </Link>
            <a
              href={brand.phoneHref}
              className="gold-btn-ghost rounded-sm px-7 py-3.5 text-center text-xs uppercase"
            >
              {brand.phone}
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
