import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection, LegalShell } from "@/components/LegalShell";
import { brand } from "@/lib/brand";
import { LOCAL_DELIVERY_TND, PAIR_WEIGHT_KG } from "@/lib/shipping-config";

export const metadata: Metadata = { title: "Livraison et retours | ELVARO", description: "Tarifs et conditions de livraison, échanges et remboursements." };
export default function LivraisonRetours() {
  return <LegalShell title="Livraison et retours" intro="Nos modalités de livraison et les démarches pour demander un échange, une annulation ou un remboursement.">
    <LegalSection title="Livraison en Tunisie">
      <p>Le forfait national actuellement configuré est de <strong>{LOCAL_DELIVERY_TND} TND par commande</strong>. Le prix de livraison figure au récapitulatif avant validation. Les délais peuvent varier selon la région et le transporteur.</p>
    </LegalSection>
    <LegalSection title="Livraison internationale">
      <p>Le prix dépend du pays de destination, du transporteur et du poids calculé à raison d'environ <strong>{PAIR_WEIGHT_KG} kg par paire</strong>, emballage inclus. Le montant est calculé et présenté avant la commande. Un tarif qualifié d'estimatif ne permet pas d'imposer ensuite un supplément sans accord du client.</p>
      <p>Des frais de douane ou taxes locales peuvent être perçus par les autorités du pays de destination.</p>
    </LegalSection>
    <LegalSection title="Annulation et retours">
      <p>Pour annuler une commande, contactez-nous le plus rapidement possible avant l'expédition. Vous pouvez demander l'échange de chaussures non portées dans un délai commercial annoncé de <strong>7 jours après livraison</strong>. Contactez le service client avant d'expédier les articles et conservez votre preuve d'achat.</p>
      <p>Les conditions et frais éventuels de retour, ainsi que les possibilités de remboursement, sont communiqués au cas par cas et ne réduisent jamais les garanties ou droits légaux du consommateur.</p>
    </LegalSection>
    <LegalSection title="Contacter le service client">
      <p>E-mail : <a href={`mailto:${brand.email}`} className="underline">{brand.email}</a> · Téléphone : <a href={brand.phoneHref} className="underline">{brand.phone}</a> · <Link href="/contact" className="underline">Formulaire de contact</Link>.</p>
    </LegalSection>
  </LegalShell>;
}
