const reviews = [
  {
    title: "Bonne qualité",
    text: "Je recommande fortement KICKS — livraison rapide et paires authentiques.",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Pointures justes",
    text: "J’ai pris ma taille habituelle, nickel. Le paiement à la livraison rassure.",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80",
  },
  {
    title: "Service top",
    text: "Commande sans compte, confirmation WhatsApp, reçu le lendemain à Tunis.",
    rating: "5.0",
    image:
      "https://images.unsplash.com/photo-1605348532760-6753d2c43329?auto=format&fit=crop&w=800&q=80",
  },
];

export function Reviews() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-16 md:px-6">
      <div className="mb-8 flex items-end justify-between">
        <h2 className="text-4xl font-black tracking-tight text-[#1A1A1A] md:text-5xl">
          REVIEWS
        </h2>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {reviews.map((r) => (
          <article
            key={r.title}
            className="overflow-hidden rounded-[16px] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          >
            <div className="p-6">
              <h3 className="text-lg font-bold">{r.title}</h3>
              <p className="mt-2 text-sm text-[#666]">{r.text}</p>
              <p className="mt-3 text-sm font-semibold text-[#FF8A00]">★ {r.rating}</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={r.image} alt="" className="h-40 w-full object-cover" />
          </article>
        ))}
      </div>
    </section>
  );
}
