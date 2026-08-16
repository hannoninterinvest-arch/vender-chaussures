"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/Logo";
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
        if (!cancelled) setSite({ ...defaultSite, ...data, coverImages: data.coverImages?.length ? data.coverImages : defaultSite.coverImages });
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
      <div className="mb-8 grid items-end gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex flex-col items-start gap-4">
          <div className="anim-fade-up flex items-center gap-3 text-[var(--gold)]">
            <LogoMark className="h-10 w-8" />
            <span className="text-[11px] tracking-[0.32em] uppercase">{brand.byline}</span>
          </div>
          <h1 className="font-[family-name:var(--font-display)] leading-[0.92] tracking-[0.12em]">
            <span className="anim-fade-up anim-d1 block text-[42px] text-[var(--fg)] sm:text-[64px] md:text-[84px]">
              L&apos;EXCELLENCE
            </span>
            <span className="anim-fade-up anim-d2 gold-text block text-[42px] sm:text-[64px] md:text-[84px]">
              À CHAQUE PAS
            </span>
          </h1>
        </div>
        <div className="anim-fade-up anim-d3 hidden justify-end lg:flex">
          <LogoMark className="logo-float h-44 w-32 opacity-90" />
        </div>
      </div>

      <div className="anim-fade-up anim-d4 gold-frame relative overflow-hidden rounded-[4px] bg-[#14110C]">
        {current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current}
            src={current}
            alt={site.heroTitle || "Collection ELVARO"}
            className="hero-photo h-[420px] w-full object-cover opacity-80 md:h-[560px]"
          />
        ) : (
          <div className="grid h-[420px] place-items-center md:h-[560px]">
            <LogoMark className="h-40 w-28 opacity-80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-transparent" />
        <LogoMark className="pointer-events-none absolute right-8 top-8 hidden h-24 w-[72px] opacity-80 md:block" />
        <div className="absolute bottom-8 left-6 right-6 md:left-12">
          <p className="text-[11px] tracking-[0.28em] uppercase text-[#C9A45C]">{site.heroKicker}</p>
          <p className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.14em] text-[#F3EDE2] md:text-5xl">
            {site.heroTitle}
          </p>
          <p className="mt-2 max-w-md text-sm text-[#F3EDE2]/75">{site.heroSubtitle}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/shop?drop=new" className="gold-btn inline-flex rounded-sm px-8 py-3 text-xs uppercase">
              Découvrir
            </Link>
            <Link
              href="/shop"
              className="gold-btn-ghost inline-flex rounded-sm px-8 py-3 text-xs uppercase"
            >
              Toute la collection
            </Link>
          </div>
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
