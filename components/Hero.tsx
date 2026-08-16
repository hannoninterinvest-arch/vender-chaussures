import Link from "next/link";
import { LogoMark } from "@/components/Logo";
import { brand } from "@/lib/brand";

export function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-8 md:px-6">
      <div className="mb-8 flex flex-col items-start gap-4">
        <div className="flex items-center gap-3 text-[#C5A059]">
          <LogoMark className="h-8 w-6" />
          <span className="text-[11px] tracking-[0.32em] uppercase">{brand.byline}</span>
        </div>
        <h1 className="font-[family-name:var(--font-display)] leading-[0.92] tracking-[0.12em]">
          <span className="block text-[42px] text-[#EDE8DE] sm:text-[64px] md:text-[84px]">
            L&apos;EXCELLENCE
          </span>
          <span className="block text-[42px] text-[#C5A059] sm:text-[64px] md:text-[84px]">
            À CHAQUE PAS
          </span>
        </h1>
      </div>

      <div className="gold-frame relative overflow-hidden rounded-[4px] bg-[#1A1A1B]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1600&q=80"
          alt="Collection ELVARO"
          className="h-[420px] w-full object-cover opacity-80 md:h-[540px]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute bottom-8 left-6 right-6 md:left-12">
          <p className="text-[11px] tracking-[0.28em] uppercase text-[#C5A059]">Collection</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.14em] text-[#EDE8DE] md:text-5xl">
            CUIR PREMIUM
          </p>
          <p className="mt-2 max-w-md text-sm text-[#EDE8DE]/75">
            Fabrication tunisienne, confort et design intemporel — commande sans compte.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/shop?drop=new" className="gold-btn inline-flex rounded-sm px-8 py-3 text-xs uppercase">
              Découvrir
            </Link>
            <Link
              href="/shop"
              className="inline-flex rounded-sm border border-[#C5A059] px-8 py-3 text-xs font-semibold tracking-[0.08em] uppercase text-[#C5A059] hover:bg-[#C5A059]/10"
            >
              Toute la collection
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
