const items = [
  {
    title: "Cuir premium",
    text: "Matières nobles, finitions soignées.",
    icon: (
      <path
        d="M12 4c4 3 7 7 7 11a7 7 0 1 1-14 0c0-4 3-8 7-11z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
      />
    ),
  },
  {
    title: "Fabrication expert",
    text: "Savoir-faire industriel tunisien.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M12 4v16M4 12h16M7 7l10 10M17 7 7 17" stroke="currentColor" strokeWidth="1.2" />
      </>
    ),
  },
  {
    title: "Confort supérieur",
    text: "Pensé pour chaque pas.",
    icon: (
      <path
        d="M5 16c2-6 5-9 7-10 2 1 5 4 7 10-3 2-11 2-14 0z"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
      />
    ),
  },
  {
    title: "Qualité internationale",
    text: "Standards haut de gamme.",
    icon: (
      <>
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.4" />
        <path d="M4 12h16M12 4c2.5 2.5 4 5.5 4 8s-1.5 5.5-4 8c-2.5-2.5-4-5.5-4-8s1.5-5.5 4-8z" stroke="currentColor" strokeWidth="1.2" />
      </>
    ),
  },
  {
    title: "Design intemporel",
    text: "Lignes nettes, élégance durable.",
    icon: (
      <path
        d="M12 3.5 14.5 9l6 .5-4.5 4 1.5 5.8L12 16.5 6.5 19.3 8 13.5 3.5 9.5 9.5 9z"
        stroke="currentColor"
        strokeWidth="1.3"
        fill="none"
      />
    ),
  },
];

export function Pillars() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 py-14 md:px-6">
      <div className="gold-line mb-10" />
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.title} className="text-center">
            <svg className="mx-auto h-8 w-8 text-[#C5A059]" viewBox="0 0 24 24" fill="none" aria-hidden>
              {item.icon}
            </svg>
            <p className="mt-3 text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C5A059]">
              {item.title}
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">{item.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
