"use client";

import { FormEvent } from "react";
import { LegalShell, LegalSection } from "@/components/LegalShell";
import { brand } from "@/lib/brand";

export default function Contact() {
  function prepareEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const subject = String(data.get("subject") || "Question générale");
    const message = String(data.get("message") || "").trim();
    if (!name || !email || !message) return;
    const body = `Nom : ${name}\nE-mail : ${email}\nTéléphone : ${String(data.get("phone") || "Non indiqué")}\n\n${message}`;
    window.location.href = `mailto:${brand.email}?subject=${encodeURIComponent("ELVARO - " + subject)}&body=${encodeURIComponent(body)}`;
  }
  return <LegalShell title="Contact" intro="Contactez l'équipe ELVARO pour toute demande relative à un produit, une commande ou un retour.">
    <LegalSection title="Service client — STE SCAROSSO">
      <p>Téléphone : <a href={brand.phoneHref} className="underline">{brand.phone}</a>.</p>
      <p>E-mail : <a href={`mailto:${brand.email}`} className="underline">{brand.email}</a>.</p>
      <p>Adresse de contact : {brand.address}.</p>
      <p>WhatsApp : <a href={brand.whatsapp} className="underline" rel="noopener noreferrer" target="_blank">{brand.phone}</a>.</p>
    </LegalSection>
    <section className="space-y-4">
      <h2 className="text-lg font-semibold">Formulaire de contact</h2>
      <p className="text-sm leading-6 text-[var(--muted)]">Ce formulaire prépare un e-mail dans votre application de messagerie. Pour transmettre votre demande, vérifiez puis envoyez cet e-mail. Le site ne l'envoie pas automatiquement.</p>
      <form onSubmit={prepareEmail} className="grid gap-4">
        <label className="grid gap-2 text-sm">Nom complet *<input name="name" className="field" type="text" required maxLength={120} autoComplete="name" /></label>
        <label className="grid gap-2 text-sm">E-mail *<input name="email" className="field" type="email" required maxLength={254} autoComplete="email" /></label>
        <label className="grid gap-2 text-sm">Téléphone<input name="phone" className="field" type="tel" maxLength={40} autoComplete="tel" /></label>
        <label className="grid gap-2 text-sm">Objet<select className="field" name="subject">
          <option>Question sur un produit</option>
          <option>Commande et paiement</option>
          <option>Livraison et suivi</option>
          <option>Retour ou remboursement</option>
          <option>Protection des données</option>
          <option>Autre demande</option>
        </select></label>
        <label className="grid gap-2 text-sm">Votre message *<textarea className="field" name="message" required minLength={10} maxLength={4000} rows={6}/></label>
        <p className="text-xs text-[var(--muted)]">Vos informations servent uniquement à traiter votre demande. Consultez notre <a href="/politique-confidentialite" className="underline">politique de confidentialité</a>.</p>
        <button className="gold-btn w-fit rounded-sm px-6 py-3 text-xs uppercase" type="submit">Préparer mon e-mail</button>
      </form>
    </section>
  </LegalShell>;
}
