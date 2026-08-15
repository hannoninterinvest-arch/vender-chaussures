import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#1F1F1F] text-white">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-14 md:grid-cols-4 md:px-6">
        <div>
          <p className="text-xl font-bold text-[#FF8A00]">À propos</p>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            La plus grande sneaker shop de Tunisie. Drops, classiques et
            outdoor — commande sans créer de compte, paiement à la livraison.
          </p>
        </div>
        <div>
          <p className="text-xl font-bold text-[#FF8A00]">Catégories</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/shop?category=running">Running</Link>
            </li>
            <li>
              <Link href="/shop?category=sneakers">Sneakers</Link>
            </li>
            <li>
              <Link href="/shop?category=basket">Basket</Link>
            </li>
            <li>
              <Link href="/shop?category=outdoor">Outdoor</Link>
            </li>
            <li>
              <Link href="/shop?category=lifestyle">Lifestyle</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xl font-bold text-[#FF8A00]">Boutique</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/shop">Tous les produits</Link>
            </li>
            <li>
              <Link href="/cart">Panier</Link>
            </li>
            <li>
              <Link href="/checkout">Commander</Link>
            </li>
            <li>
              <Link href="/vendeur">Espace équipe</Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xl font-bold text-[#FF8A00]">Livraison</p>
          <p className="mt-3 text-sm text-white/80">
            Tunis, Sfax, Sousse et tout le pays. Confirmation téléphone /
            WhatsApp avant expédition.
          </p>
        </div>
      </div>
      <div className="overflow-hidden border-t border-white/10 px-4 py-8 text-center">
        <p className="text-[72px] font-black leading-none tracking-tight text-white/10 md:text-[140px]">
          KICKS
        </p>
        <p className="text-xs text-white/60">© {new Date().getFullYear()} KICKS Tunisie — Tous droits réservés</p>
      </div>
    </footer>
  );
}
