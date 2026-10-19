import type { Metadata } from "next";
import Link from "next/link";
import { LegalSection, LegalShell } from "@/components/LegalShell";
import { brand } from "@/lib/brand";
import { LOCAL_DELIVERY_TND } from "@/lib/shipping-config";

export const metadata: Metadata = { title: "Conditions générales de vente | ELVARO", description: "Conditions de commande, paiement, livraison, annulation et retour." };
export default function CGV() {
  return <LegalShell title="Conditions générales de vente" intro="Ces informations sont accessibles avant validation d'une commande sur elvaroco.com.">
    <LegalSection title="1. Vendeur et champ d'application">
      <p>Les produits de la marque ELVARO sont commercialisés par <strong>{brand.legalName}</strong>. L'identité et les coordonnées de la société figurent dans les <Link href="/mentions-legales" className="underline">mentions légales</Link>.</p>
    </LegalSection>
    <LegalSection title="2. Produits et disponibilité">
      <p>Les fiches de produits indiquent les caractéristiques essentielles, pointures et couleurs. Les commandes sont soumises aux stocks disponibles ; le vendeur informe le client de toute indisponibilité et propose une solution ou le remboursement des montants déjà encaissés.</p>
    </LegalSection>
    <LegalSection title="3. Prix, taxes et frais">
      <p>La devise de référence est le dinar tunisien (TND). Le prix des produits, les frais de livraison et le total à payer sont présentés dans le récapitulatif avant confirmation. Les éventuelles taxes applicables doivent être prises en compte conformément au régime fiscal du vendeur.</p>
      <p>Selon la destination internationale, des droits ou taxes d'importation peuvent être perçus séparément par les autorités du pays concerné.</p>
    </LegalSection>
    <LegalSection title="4. Commandes et paiement">
      <p>Le client vérifie sa sélection, son adresse et le montant de la commande avant de la valider. Le paiement à la livraison est proposé pour les commandes tunisiennes. Le paiement électronique, notamment Flouci, n'est proposé que si le service est activé et disponible. Pour l'international, le paiement en ligne est requis lorsqu'il est disponible.</p>
    </LegalSection>
    <LegalSection title="5. Livraison">
      <p>Le forfait actuellement configuré pour une commande en Tunisie est de {LOCAL_DELIVERY_TND} TND. Les frais internationaux varient selon le pays, le transporteur et le poids de la commande. Les montants disponibles figurent à l'étape de commande avant confirmation.</p>
      <p>Si un tarif est indiqué comme estimatif, un supplément ne peut être imposé sans accord préalable du client. Les délais dépendent du lieu, du transporteur et des formalités. Voir <Link href="/livraison-retours" className="underline">Livraison et retours</Link>.</p>
    </LegalSection>
    <LegalSection title="6. Annulation, échange, retour et remboursement">
      <p>Pour annuler une commande non expédiée, contactez le service client dès que possible. Une demande d'échange commercial d'une paire non portée peut être adressée sous 7 jours après réception. Les modalités et éventuels frais de retour sont confirmés au préalable par le service client.</p>
      <p>En cas de produit défectueux, de non-conformité ou lorsqu'un droit légal au remboursement existe, les droits impératifs du consommateur prévalent sur les modalités commerciales. Un remboursement dû est effectué suivant le mode convenu conformément aux règles applicables.</p>
    </LegalSection>
    <LegalSection title="7. Réclamations et règlement des litiges">
      <p>Pour une réclamation, contactez <a href={`mailto:${brand.email}`} className="underline">{brand.email}</a> ou <a href={brand.phoneHref} className="underline">{brand.phone}</a>. Une solution amiable sera recherchée prioritairement. À défaut, les juridictions et procédures compétentes sont déterminées par le droit tunisien applicable, sans supprimer les droits impératifs du client.</p>
    </LegalSection>
  </LegalShell>;
}
