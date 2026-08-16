const reviews = [
  {
    title: "Qualité rare",
    text: "Le cuir et la finition ELVARO tiennent vraiment la promesse haut de gamme.",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Pointures justes",
    text: "Taille habituelle, nickel. Le paiement à la livraison rassure.",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Service soigné",
    text: "Commande sans compte, confirmation WhatsApp, reçu le lendemain à Ariana.",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80",
  },
];

export function Reviews() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 md:px-6">
      <p className="text-[11px] tracking-[0.28em] uppercase text-[#C5A059]">Témoignages</p>
      <h2 className="mb-8 mt-2 font-[family-name:var(--font-display)] text-4xl tracking-[0.12em] text-[var(--fg)] md:text-5xl">
        AVIS
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {reviews.map((r) => (
          <article key={r.title} className="gold-frame overflow-hidden rounded-[4px] bg-[var(--panel)]">
            <div className="p-6">
              <h3 className="text-lg font-semibold tracking-wide">{r.title}</h3>
              <p className="mt-2 text-sm text-[var(--muted)]">{r.text}</p>
              <p className="mt-3 text-sm font-semibold text-[#C5A059]">★ {r.rating}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.image} alt="" className="h-40 w-full object-cover" />
          </article>
        ))}
      </div>
    </section>
  );
}
