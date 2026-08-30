"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Footsteps } from "@/components/Footsteps";
import { BrandMark } from "@/components/Logo";
import { brand } from "@/lib/brand";
import { fetchSite } from "@/lib/api";
import { isVideoUrl, toCoverSlides, videoPoster, type CoverSlide } from "@/lib/media";
import { defaultSite, type SiteHome } from "@/lib/site";

export function Hero() {
  const [site, setSite] = useState<SiteHome>(defaultSite);
  const [index, setIndex] = useState(0);

  const slides = useMemo<CoverSlide[]>(() => {
    const images = toCoverSlides(site.coverImages);
    const videos = (site.coverVideos || []).filter(Boolean).map((url) => ({
      type: "video" as const,
      url,
    }));
    const merged = [...videos, ...images.filter((s) => !isVideoUrl(s.url))];
    return merged.length ? merged : toCoverSlides(defaultSite.coverImages);
  }, [site.coverImages, site.coverVideos]);

  useEffect(() => {
    let cancelled = false;
    fetchSite()
      .then((data) => {
        if (!cancelled)
          setSite({
            ...defaultSite,
            ...data,
            coverImages: data.coverImages?.length ? data.coverImages : defaultSite.coverImages,
            coverVideos: data.coverVideos || [],
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
    if (slides.length < 2) return;
    const current = slides[index];
    const delay = current?.type === "video" ? 9000 : 5200;
    const timer = window.setInterval(() => {
      setIndex((n) => (n + 1) % slides.length);
    }, delay);
    return () => window.clearInterval(timer);
  }, [slides, index]);

  const current = slides[index];

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
        {current?.type === "video" ? (
          <video
            key={current.url}
            src={current.url}
            poster={videoPoster(current.url)}
            className="h-[420px] w-full object-cover opacity-90 md:h-[560px]"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={current.url}
            src={current.url}
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
        {slides.length > 1 && (
          <div className="absolute bottom-8 right-6 flex gap-2 md:right-12">
            {slides.map((slide, i) => (
              <button
                key={`${slide.type}-${slide.url}-${i}`}
                type="button"
                aria-label={slide.type === "video" ? `Vidéo ${i + 1}` : `Image ${i + 1}`}
                onClick={() => setIndex(i)}
                className={`h-2 rounded-full ${
                  i === index ? "w-5 bg-[#C9A45C]" : "w-2 bg-white/40"
                } ${slide.type === "video" ? "ring-1 ring-white/70" : ""}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
