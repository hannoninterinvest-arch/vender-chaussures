"use client";

import { Reveal } from "./Reveal";

const reviews = [
  {
    title: "Qualité rare",
    text: "Le cuir et la finition ELVARO tiennent vraiment la promesse haut de gamme.",
    rating: 5,
  },
  {
    title: "Pointures justes",
    text: "Taille habituelle, nickel. Le paiement à la livraison rassure.",
    rating: 5,
  },
  {
    title: "Service soigné",
    text: "Commande sans compte, confirmation WhatsApp, reçu le lendemain à Ariana.",
    rating: 5,
  },
];

export function Reviews() {
  return (
    <section className="store-section">
      <Reveal>
        <p className="section-kicker">Témoignages</p>
        <h2 className="section-title mb-8">Avis</h2>
      </Reveal>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {reviews.map((r, i) => (
          <Reveal key={r.title} delay={i * 90}>
            <article className="store-panel relative h-full overflow-hidden p-7 transition duration-500 hover:-translate-y-1">
              <span aria-hidden="true" className="absolute top-3 right-6 font-[family-name:var(--font-display)] text-7xl leading-none text-[var(--gold)] opacity-20">
                “
              </span>
              <div className="flex gap-0.5 text-[var(--gold)]" role="img" aria-label={`${r.rating} étoiles sur 5`}>
                {Array.from({ length: r.rating }, (_, star) => (
                  <svg key={star} viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="m10 1.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9l-5.2 2.8 1-5.9L1.5 7.7l5.9-.8L10 1.5Z" />
                  </svg>
                ))}
              </div>
              <h3 className="mt-5 font-[family-name:var(--font-display)] text-xl tracking-[0.06em] uppercase">{r.title}</h3>
              <div className="gold-line my-4 w-12" style={{ background: "var(--gold)" }} />
              <p className="text-[15px] leading-relaxed text-[var(--muted)]">{r.text}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
