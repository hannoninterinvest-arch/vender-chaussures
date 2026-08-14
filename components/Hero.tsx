import Link from "next/link";

export function Hero() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-6 md:px-6">
      <h1 className="mb-6 font-black leading-[0.9] tracking-tight">
        <span className="block text-[56px] text-[#1A1A1A] sm:text-[80px] md:text-[108px]">
          DO IT
        </span>
        <span className="block text-[56px] text-[#5B6AF6] sm:text-[80px] md:text-[108px]">
          RIGHT
        </span>
      </h1>

      <div className="relative overflow-hidden rounded-[28px] bg-[#1A1A1A]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80"
          alt="Nike Air Max"
          className="h-[420px] w-full object-cover opacity-90 md:h-[520px]"
        />
        <p className="absolute left-4 top-1/2 hidden -translate-y-1/2 -rotate-90 text-xs font-medium tracking-[0.2em] text-white/80 md:block">
          Produit Nike de l&apos;année
        </p>
        <div className="absolute bottom-8 left-6 right-6 md:left-16 md:right-auto">
          <p className="text-4xl font-black text-white md:text-5xl">NIKE AIR MAX</p>
          <p className="mt-2 max-w-md text-sm text-white/80">
            La nouvelle Air Max, pensée pour le confort de tous.
          </p>
          <Link
            href="/shop?drop=new"
            className="mt-5 inline-flex rounded-lg bg-[#5B6AF6] px-8 py-3 text-sm font-semibold text-white transition hover:bg-[#4a58e0]"
          >
            SHOP NOW
          </Link>
        </div>
      </div>
    </section>
  );
}
