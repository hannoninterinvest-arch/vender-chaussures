"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { BRAND } from "@/constants/branding";
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
    }, 5600);
    return () => window.clearInterval(timer);
  }, [photos.length]);

  const current = photos[index] || "";
  const prev = () => setIndex((n) => (n - 1 + photos.length) % photos.length);
  const next = () => setIndex((n) => (n + 1) % photos.length);

  return (
    <section className="hero-stage">
      {current ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={current}
          src={current}
          alt={site.heroTitle || `Collection ${BRAND.name}`}
          className="hero-photo"
        />
      ) : (
        <div className="hero-photo hero-photo-empty" />
      )}
      <div className="hero-veil" />
      <div className="hero-copy">
        <Logo size="xl" className="hero-logo" />
        <p className="hero-tagline">{BRAND.tagline}</p>
        <p className="hero-kicker">{site.heroKicker || "Nouvelle collection"}</p>
        <h1 className="hero-title">{site.heroTitle}</h1>
        {site.heroSubtitle ? <p className="hero-sub">{site.heroSubtitle}</p> : null}
        <Link href="/shop?drop=new" className="gold-btn-outline">
          Acheter maintenant
        </Link>
      </div>
      {photos.length > 1 ? (
        <>
          <button type="button" className="hero-arrow hero-arrow-prev" aria-label="Image précédente" onClick={prev}>
            ‹
          </button>
          <button type="button" className="hero-arrow hero-arrow-next" aria-label="Image suivante" onClick={next}>
            ›
          </button>
          <div className="hero-dots">
            {photos.map((url, i) => (
              <button
                key={url}
                type="button"
                aria-label={`Image ${i + 1}`}
                onClick={() => setIndex(i)}
                className={i === index ? "is-active" : ""}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
