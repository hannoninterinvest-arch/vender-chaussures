import Link from "next/link";
import { BrandSignature } from "@/components/Logo";
import { Footsteps } from "@/components/Footsteps";
import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-[var(--line)] bg-[var(--panel)] text-[var(--fg)]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 md:grid-cols-4 md:px-6">
        <div>
          <BrandSignature size="lg" className="items-start" />
          <Footsteps className="mt-4 origin-left scale-75" />
          <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">{brand.activity}.</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)]">Collection</p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>
              <Link href="/shop?category=ville" className="transition-colors hover:text-[var(--gold)]">Ville</Link>
            </li>
            <li>
              <Link href="/shop?category=ceremonie" className="transition-colors hover:text-[var(--gold)]">Cérémonie</Link>
            </li>
            <li>
              <Link href="/shop?category=mocassins" className="transition-colors hover:text-[var(--gold)]">Mocassins</Link>
            </li>
            <li>
              <Link href="/shop?category=bottes" className="transition-colors hover:text-[var(--gold)]">Bottes</Link>
            </li>
            <li>
              <Link href="/shop?category=femme" className="transition-colors hover:text-[var(--gold)]">Femme</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)]">Boutique</p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>
              <Link href="/shop" className="transition-colors hover:text-[var(--gold)]">Toute la collection</Link>
            </li>
            <li>
              <Link href="/cart" className="transition-colors hover:text-[var(--gold)]">Panier</Link>
            </li>
            <li>
              <Link href="/checkout" className="transition-colors hover:text-[var(--gold)]">Commander</Link>
            </li>
            <li>
              <Link href="/grossiste" className="transition-colors hover:text-[var(--gold)]">
                Achat en gros
              </Link>
            </li>
            <li>
              <Link href="/vendeur" className="transition-colors hover:text-[var(--gold)]">Espace équipe</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[var(--gold)]">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-[var(--muted)]">
            <li>
              <a href={brand.phoneHref} className="hover:text-[var(--gold)]">{brand.phone}</a>
            </li>
            <li>
              <a href={brand.whatsapp} target="_blank" rel="noreferrer" className="hover:text-[var(--gold)]">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${brand.email}`} className="hover:text-[var(--gold)]">{brand.email}</a>
            </li>
            <li>{brand.address}</li>
          </ul>
        </div>
      </div>
      <div className="gold-line mx-auto max-w-[1280px]" />
      <div className="px-4 py-8 text-center">
        <p className="text-[11px] tracking-[0.16em] uppercase text-[var(--muted)]">
          © {new Date().getFullYear()} {brand.name} {brand.byline} — Tunisie
        </p>
      </div>
    </footer>
  );
}
