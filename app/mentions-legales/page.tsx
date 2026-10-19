import type { Metadata } from "next";
import { LegalSection, LegalShell } from "@/components/LegalShell";
import { brand } from "@/lib/brand";

export const metadata: Metadata = { title: "Mentions légales | ELVARO", description: "Informations sur la société exploitant ELVARO." };
export default function MentionsLegales() {
  return <LegalShell title="Mentions légales" intro="Identification du professionnel responsable des ventes de la boutique ELVARO.">
    <LegalSection title="Société exploitante">
      <p>Nom commercial : <strong>ELVARO</strong>.</p>
      <p>Exploitant et vendeur : <strong>{brand.legalName}</strong>.</p>
      <p>Activité : {brand.activity}.</p>
      <p>Forme juridique : <strong>{brand.legalForm}</strong>.</p>
      <p>Numéro RNE ou identifiant fiscal : <strong>{brand.registrationNumber}</strong>.</p>
      <p>Adresse de contact communiquée : {brand.address}.</p>
      <p>L'adresse du siège, la forme juridique et les références d'immatriculation doivent être confirmées à partir de l'extrait RNE officiel.</p>
    </LegalSection>
    <LegalSection title="Nous contacter">
      <p>Téléphone : <a href={brand.phoneHref} className="underline">{brand.phone}</a>.</p>
      <p>E-mail : <a href={`mailto:${brand.email}`} className="underline">{brand.email}</a>.</p>
      <p>Site internet : <a href={brand.web} className="underline">{brand.web}</a>.</p>
    </LegalSection>
    <LegalSection title="Propriété intellectuelle et réclamations">
      <p>Les photographies, textes et éléments graphiques présentés sur le site ne peuvent être réutilisés sans autorisation de leurs ayants droit.</p>
      <p>Pour une réclamation relative au site ou à une commande, contactez le service client à l'adresse ci-dessus.</p>
    </LegalSection>
    <LegalSection title="Droit applicable">
      <p>Les activités de la boutique sont soumises à la réglementation tunisienne applicable, sans préjudice des protections impératives éventuellement applicables aux consommateurs situés à l'étranger.</p>
    </LegalSection>
  </LegalShell>;
}
