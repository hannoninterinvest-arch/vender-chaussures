import Link from "next/link";
import { BrandLockup, OfficialLockup } from "@/components/Logo";
import { Footsteps } from "@/components/Footsteps";
import { brand } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="mt-8 border-t border-[#C5A059]/30 bg-[#070707] text-[#EDE8DE]">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 md:grid-cols-4 md:px-6">
        <div>
          <BrandLockup light />
          <p className="mt-4 flex items-center gap-3 text-[11px] tracking-[0.2em] uppercase text-[#C5A059]">
            <Footsteps className="scale-75 origin-left" />
            {brand.slogan}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-[#EDE8DE]/70">{brand.activity}.</p>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C5A059]">Collection</p>
          <ul className="mt-4 space-y-2 text-sm text-[#F3EDE2]/80">
            <li>
              <Link href="/shop?category=ville" className="transition-colors hover:text-[#C9A45C]">Ville</Link>
            </li>
            <li>
              <Link href="/shop?category=ceremonie" className="transition-colors hover:text-[#C9A45C]">Cérémonie</Link>
            </li>
            <li>
              <Link href="/shop?category=mocassins" className="transition-colors hover:text-[#C9A45C]">Mocassins</Link>
            </li>
            <li>
              <Link href="/shop?category=bottes" className="transition-colors hover:text-[#C9A45C]">Bottes</Link>
            </li>
            <li>
              <Link href="/shop?category=femme" className="transition-colors hover:text-[#C9A45C]">Femme</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C5A059]">Boutique</p>
          <ul className="mt-4 space-y-2 text-sm text-[#F3EDE2]/80">
            <li>
              <Link href="/shop" className="transition-colors hover:text-[#C9A45C]">Toute la collection</Link>
            </li>
            <li>
              <Link href="/cart" className="transition-colors hover:text-[#C9A45C]">Panier</Link>
            </li>
            <li>
              <Link href="/checkout" className="transition-colors hover:text-[#C9A45C]">Commander</Link>
            </li>
            <li>
              <Link href="/vendeur" className="transition-colors hover:text-[#C9A45C]">Espace équipe</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#C5A059]">Contact</p>
          <ul className="mt-4 space-y-2 text-sm text-[#EDE8DE]/80">
            <li>
              <a href={brand.phoneHref} className="hover:text-[#C5A059]">{brand.phone}</a>
            </li>
            <li>
              <a href={brand.whatsapp} target="_blank" rel="noreferrer" className="hover:text-[#C5A059]">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={`mailto:${brand.email}`} className="hover:text-[#C5A059]">{brand.email}</a>
            </li>
            <li>{brand.address}</li>
          </ul>
        </div>
      </div>
      <div className="gold-line mx-auto max-w-[1280px]" />
      <div className="px-4 py-10 text-center">
        <OfficialLockup className="mx-auto h-auto w-[240px] md:w-[320px]" />
        <p className="mt-4 text-[11px] tracking-[0.16em] uppercase text-[#EDE8DE]/50">
          © {new Date().getFullYear()} {brand.name} {brand.byline} — Tunisie
        </p>
      </div>
    </footer>
  );
}
