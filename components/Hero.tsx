"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Footsteps } from "@/components/Footsteps";
import { BrandMark } from "@/components/Logo";
import { brand } from "@/lib/brand";
import { fetchSite } from "@/lib/api";
import { defaultSite, type SiteHome } from "@/lib/site";

export function Hero() {
  const [site, setSite] = useState<SiteHome>(defaultSite);
  const [index, setIndex] = useState(0);
  const photos = site.coverImages.filter(Boolean);

  useEffect(() => {
    let cancelled = false;
    fetchSite()
      .then((data) => {
        if (!cancelled)
          setSite({
            ...defaultSite,
            ...data,
            coverImages: data.coverImages?.length ? data.coverImages : defaultSite.coverImages,
          });
      })
      .catch(() => {
        if (!cancelled) setSite(defaultSite);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (photos.length < 2) return;
    const timer = window.setInterval(() => {
      setIndex((n) => (n + 1) % photos.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [photos.length]);

  const current = photos[index] || "";

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-6 pt-10 md:px-6">
      <div className="mb-8">
        <div className="flex max-w-3xl flex-col items-start gap-5">
          <p className="anim-fade-up text-[11px] tracking-[0.32em] uppercase text-[var(--gold)]">{brand.byline}</p>
          <h1 className="font-[family-name:var(--font-display)] leading-[0.92] tracking-[0.12em]">
            <span className="anim-fade-up anim-d2 block text-[36px] text-[var(--fg)] sm:text-[56px] md:text-[72px]">
              L&apos;EXCELLENCE
            </span>
            <span className="anim-fade-up anim-d3 mt-2 flex flex-wrap items-center gap-4">
              <span className="gold-text block text-[36px] sm:text-[56px] md:text-[72px]">À CHAQUE PAS</span>
              <Footsteps className="hidden sm:inline-flex" />
            </span>
          </h1>
          <p className="anim-fade-up anim-d4 max-w-md text-sm leading-relaxed text-[var(--muted)]">
            {brand.slogan} — cuir premium, allure de ville et de cérémonie.
          </p>
          <Footsteps className="anim-fade-up anim-d4 sm:hidden" />
        </div>
      </div>

      <div className="anim-fade-up anim-d4 gold-frame relative overflow-hidden rounded-[4px] bg-[#14110C]">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current}
            src={current}
            alt={site.heroTitle || "Collection ELVARO"}
            className="hero-photo h-[420px] w-full object-cover opacity-90 md:h-[560px]"
          />
        ) : (
          <div className="h-[420px] bg-[#14110C] md:h-[560px]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
        <div className="absolute bottom-8 left-6 right-6 md:left-12 md:right-40">
          <p className="text-[11px] tracking-[0.28em] uppercase text-[#C9A45C]">{site.heroKicker}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.14em] text-[#F3EDE2] md:text-5xl">
            {site.heroTitle}
          </p>
          <p className="mt-2 max-w-md text-sm text-[#F3EDE2]/75">{site.heroSubtitle}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/shop?drop=new" className="gold-btn inline-flex rounded-sm px-8 py-3 text-xs uppercase">
              Découvrir
            </Link>
            <Link href="/shop" className="gold-btn-ghost inline-flex rounded-sm px-8 py-3 text-xs uppercase">
              Toute la collection
            </Link>
          </div>
        </div>
        <div className="pointer-events-none absolute right-4 top-4 md:right-8 md:top-8">
          <BrandMark
            size="xl"
            className="hidden drop-shadow-[0_8px_24px_rgba(0,0,0,0.45)] sm:inline-flex"
          />
        </div>
        {photos.length > 1 && (
          <div className="absolute bottom-8 right-6 flex gap-2 md:right-12">
            {photos.map((url, i) => (
              <button
                key={url}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 w-2 rounded-full ${i === index ? "bg-[#C9A45C]" : "bg-white/40"}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
