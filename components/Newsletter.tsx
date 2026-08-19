"use client";

import { FormEvent, useState } from "react";
import { BrandMark } from "./Logo";
import { useToast } from "./Toast";
import { Reveal } from "./Reveal";

export function Newsletter() {
  const toast = useToast();
  const [email, setEmail] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      toast("Entre une adresse e-mail valide.");
      return;
    }
    setEmail("");
    toast("Inscrit — 15% sur ta prochaine commande.");
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-16 md:px-6">
      <Reveal>
      <div className="gold-frame relative overflow-hidden rounded-[4px] bg-[var(--panel)] px-6 py-12 md:px-12 md:py-16">
        <div className="pointer-events-none absolute right-4 top-4 opacity-90 sm:right-8 sm:top-6">
          <BrandMark size="md" className="hidden sm:inline-flex" />
        </div>
        <div className="max-w-xl">
          <p className="text-[11px] tracking-[0.28em] uppercase text-[#C9A45C]">Cercle ELVARO</p>
          <h2 className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-[0.1em] text-[var(--fg)] md:text-4xl">
            REJOINS-NOUS ET OBTIENS 15%
          </h2>
          <p className="mt-3 text-[var(--muted)]">
            Pas de compte boutique — juste un e-mail pour les nouveautés et la réduction.
          </p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse e-mail"
              className="field flex-1"
            />
            <button type="submit" className="gold-btn rounded-sm px-6 py-3 text-xs uppercase">
              Envoyer
            </button>
          </form>
        </div>
      </div>
      </Reveal>
    </section>
  );
}
