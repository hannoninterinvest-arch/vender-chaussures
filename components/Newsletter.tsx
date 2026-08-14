"use client";

import { FormEvent, useState } from "react";
import { useToast } from "./Toast";

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
    toast("Inscrit au club — 15% sur ta prochaine commande.");
  }

  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-16 md:px-6">
      <div className="relative overflow-hidden rounded-[28px] bg-[#5B6AF6] px-6 py-12 text-white md:px-12 md:py-16">
        <div className="max-w-xl">
          <h2 className="text-3xl font-black leading-tight md:text-4xl">
            REJOINS LE KICKSPLUS CLUB ET OBTIENS 15%
          </h2>
          <p className="mt-3 text-white/85">
            Pas de compte boutique — juste un e-mail pour les drops et la réduction.
          </p>
          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Adresse e-mail"
              className="flex-1 rounded-lg border-2 border-white/30 bg-transparent px-4 py-3 text-white placeholder:text-white/60 outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#2D2D2D] px-6 py-3 font-semibold"
            >
              ENVOYER
            </button>
          </form>
        </div>
        <p className="pointer-events-none absolute -bottom-6 right-6 hidden text-[120px] font-black leading-none text-white/20 md:block">
          KICKS<span className="text-[#FF8A00]">.</span>
        </p>
      </div>
    </section>
  );
}
