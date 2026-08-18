"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { brand, whatsappHref } from "@/lib/brand";
import { useTheme } from "@/lib/theme";
import { Reveal } from "@/components/Reveal";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const light = theme === "light";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={light ? "Passer en mode sombre" : "Passer en mode clair"}
      title={light ? "Mode sombre" : "Mode clair"}
      className="icon-btn rounded-full p-2 text-[var(--gold)] ring-1 ring-[var(--gold)]/45 hover:bg-[var(--gold)]/12 hover:ring-[var(--gold)]"
    >
      {light ? (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M15 3.5A8.5 8.5 0 1 1 8.5 21 7 7 0 0 0 15 3.5z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  );
}

export function TrustBar() {
  const items = [
    { title: "Sans compte", text: "Commande en 2 minutes" },
    { title: "Paiement livré", text: "Espèces, Flouci ou D17" },
    { title: "Échange 7 jours", text: "Si non portées" },
    { title: "WhatsApp", text: brand.phone, href: whatsappHref() },
  ];
  return (
    <section className="mx-auto max-w-[1280px] px-4 md:px-6">
      <Reveal>
        <div className="gold-frame grid gap-4 rounded-[4px] bg-[var(--panel)] px-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => {
            const inner = (
              <>
                <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-[#C9A45C]">
                  {item.title}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{item.text}</p>
              </>
            );
            return item.href ? (
              <a key={item.title} href={item.href} target="_blank" rel="noreferrer" className="text-center transition-colors hover:text-[#C9A45C]">
                {inner}
              </a>
            ) : (
              <div key={item.title} className="text-center">
                {inner}
              </div>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}

export function CheckoutSteps({ step }: { step: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Panier", href: "/cart" },
    { n: 2, label: "Livraison", href: "/checkout" },
    { n: 3, label: "Confirmé", href: null },
  ] as const;
  return (
    <ol className="mb-8 flex items-center gap-2 text-[11px] font-semibold tracking-[0.16em] uppercase">
      {steps.map((s, i) => (
        <li key={s.n} className="flex items-center gap-2">
          {s.href && step > s.n ? (
            <Link href={s.href} className="text-[#C5A059] hover:underline">
              {s.n}. {s.label}
            </Link>
          ) : (
            <span className={step === s.n ? "text-[#C5A059]" : "text-[var(--muted)]"}>
              {s.n}. {s.label}
            </span>
          )}
          {i < steps.length - 1 ? <span className="text-[#C5A059]/40">—</span> : null}
        </li>
      ))}
    </ol>
  );
}

export function WhatsAppFab() {
  const path = usePathname();
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noreferrer"
      aria-label="Écrire sur WhatsApp"
      className={`wa-fab fixed left-5 z-40 grid h-12 w-12 place-items-center rounded-full bg-[#C9A45C] text-[#14110C] transition-transform hover:scale-105 ${
        path.startsWith("/products") ? "bottom-24 lg:bottom-5" : "bottom-5"
      }`}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.4-1.4a10 10 0 0 0 4.64 1.17h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2zm5.76 14.1c-.24.68-1.42 1.3-1.96 1.38-.5.08-1.14.11-1.84-.12-.42-.13-.97-.32-1.67-.62-2.94-1.27-4.85-4.23-5-4.42-.14-.2-1.18-1.57-1.18-3 0-1.42.74-2.12 1-2.4.24-.26.64-.38.86-.38h.62c.2 0 .46-.04.72.55.27.62.9 2.14.98 2.3.08.15.13.34.02.55-.1.2-.16.33-.31.5-.16.18-.33.4-.47.53-.16.16-.32.33-.14.64.18.32.8 1.32 1.72 2.14 1.18 1.05 2.18 1.38 2.5 1.54.32.15.5.13.69-.08.18-.2.8-.93 1.01-1.25.22-.32.43-.26.72-.16.3.1 1.88.89 2.2 1.05.32.16.54.24.62.37.08.14.08.78-.16 1.46z" />
      </svg>
    </a>
  );
}
