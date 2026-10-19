import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/LegalShell";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Politique de confidentialité | ELVARO", description: "Protection des données personnelles des visiteurs et clients ELVARO." };
export default function Confidentialite() {
  return <LegalShell title="Politique de confidentialité" intro="Informations sur les données nécessaires au traitement des commandes et à la relation client.">
    <LegalSection title="1. Responsable du traitement">
      <p><strong>{brand.legalName}</strong>, exploitant de la boutique ELVARO, peut être contacté à l'adresse <a href={`mailto:${brand.email}`} className="underline">{brand.email}</a>.</p>
    </LegalSection>
    <LegalSection title="2. Données collectées">
      <p>Lorsque vous commandez, les données demandées peuvent comprendre : nom, téléphone, pays, ville, adresse de livraison, produits, pointures, quantités, choix du paiement et instructions facultatives. Lorsque vous nous contactez, nous recevons les coordonnées et le contenu que vous choisissez de transmettre.</p>
    </LegalSection>
    <LegalSection title="3. Finalités des traitements">
      <p>Nous traitons les données pour préparer les commandes, organiser les livraisons, communiquer avec les clients, traiter les réclamations, prévenir les fraudes et satisfaire aux obligations comptables ou légales. L'envoi de communications promotionnelles doit reposer sur un choix volontaire du destinataire.</p>
    </LegalSection>
    <LegalSection title="4. Destinataires">
      <p>Les prestataires de transport, d'hébergement ou de paiement ne reçoivent que les données utiles à leur intervention. Les informations de paiement sont traitées par les prestataires concernés si le paiement en ligne est activé.</p>
    </LegalSection>
    <LegalSection title="5. Conservation">
      <p>Les données de commande sont conservées le temps nécessaire à l'exécution du contrat et pendant les durées exigées par les règles comptables, fiscales et légales. Les demandes au service client sont conservées jusqu'à leur traitement et pendant le temps nécessaire au suivi d'un éventuel litige.</p>
    </LegalSection>
    <LegalSection title="6. Droits des personnes">
      <p>Vous pouvez demander l'accès et la rectification de vos données ainsi que, lorsque la réglementation le permet, leur suppression ou vous opposer à certains traitements. Écrivez à <a href={`mailto:${brand.email}`} className="underline">{brand.email}</a>. Ne transmettez pas inutilement de pièces d'identité sensibles dans votre premier message.</p>
    </LegalSection>
    <LegalSection title="7. Sécurité et mises à jour">
      <p>Nous cherchons à limiter l'accès aux informations aux personnes qui en ont besoin. Cette politique peut évoluer en cas de modification des services ou de la réglementation applicable.</p>
    </LegalSection>
  </LegalShell>;
}
