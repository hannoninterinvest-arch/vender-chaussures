"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import { brand } from "@/lib/brand";
import { useToast } from "./Toast";

export function Footer() {
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
    <footer className="site-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <Logo size="md" />
          <ul className="footer-links">
            <li>
              <Link href="/shop">Toute la collection</Link>
            </li>
            <li>
              <Link href="/grossiste">Achat en gros</Link>
            </li>
            <li>
              <Link href="/vendeur">Espace équipe</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="footer-heading">Shopping</p>
          <ul className="footer-links">
            <li>
              <Link href="/shop?category=ville">Ville</Link>
            </li>
            <li>
              <Link href="/shop?category=ceremonie">Cérémonie</Link>
            </li>
            <li>
              <Link href="/shop?category=mocassins">Mocassins</Link>
            </li>
            <li>
              <Link href="/shop?category=bottes">Bottes</Link>
            </li>
            <li>
              <Link href="/shop?category=femme">Femme</Link>
            </li>
            <li>
              <Link href="/cart">Panier</Link>
            </li>
            <li>
              <Link href="/checkout">Commander</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="footer-heading">Service client</p>
          <p className="footer-copy">
            Ouvert du lundi au vendredi. Appelez le{" "}
            <a href={brand.phoneHref}>{brand.phone}</a> ou écrivez-nous.
          </p>
          <ul className="footer-links mt-4">
            <li>
              <a href={brand.whatsapp} target="_blank" rel="noreferrer">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${brand.email}`}>{brand.email}</a>
            </li>
            <li>{brand.address}</li>
          </ul>
        </div>
        <div>
          <p className="footer-heading">Abonnez-vous à la newsletter</p>
          <p className="footer-copy">15% de réduction sur le premier achat.</p>
          <form onSubmit={onSubmit} className="footer-news">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre e-mail"
              aria-label="E-mail newsletter"
            />
            <button type="submit">Inscrivez-vous maintenant</button>
          </form>
        </div>
      </div>
      <div className="footer-legal">
        <p>
          © {new Date().getFullYear()} {brand.name} {brand.byline} — Tunisie
        </p>
      </div>
    </footer>
  );
}
