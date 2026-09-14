"use client";

import { Reveal } from "./Reveal";

const reviews = [
  {
    title: "Qualité rare",
    text: "Le cuir et la finition ELVARO tiennent vraiment la promesse haut de gamme.",
    rating: "5.0",
    image: "/chaussures/oxford-cognac.jpg",
  },
  {
    title: "Pointures justes",
    text: "Taille habituelle, nickel. Le paiement à la livraison rassure.",
    rating: "5.0",
    image: "/chaussures/derby-navy.jpg",
  },
  {
    title: "Service soigné",
    text: "Commande sans compte, confirmation WhatsApp, reçu le lendemain à Ariana.",
    rating: "5.0",
    image: "/chaussures/mocassin-or.jpg",
  },
];

export function Reviews() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 md:px-6">
      <Reveal>
        <p className="text-[11px] tracking-[0.28em] uppercase text-[var(--gold)]">Témoignages</p>
        <h2 className="mb-8 mt-2 font-[family-name:var(--font-display)] text-3xl tracking-[0.12em] text-[var(--fg)] sm:text-4xl md:text-5xl">
          AVIS
        </h2>
      </Reveal>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {reviews.map((r, i) => (
          <Reveal key={r.title} delay={i * 90}>
          <article className="gold-frame overflow-hidden rounded-[4px] bg-[var(--panel)]">
            <div className="p-6">
              <h3 className="text-lg font-semibold tracking-wide">{r.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{r.text}</p>
              <p className="mt-3 text-sm font-semibold text-[var(--gold)]">★ {r.rating}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.image} alt="" className="h-40 w-full object-cover transition duration-700 hover:scale-105" />
          </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
