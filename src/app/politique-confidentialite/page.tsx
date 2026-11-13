import React from "react";
import type { Metadata } from "next";
import { GARAGE_CONFIG } from "@/config/garage";

export const metadata: Metadata = {
  title: "Politique de Confidentialité & RGPD | Run Auto Marseille",
  description: "Politique de protection des données personnelles et respect du RGPD pour le site Run Auto Marseille.",
};

const CARD =
  "space-y-4 p-6 rounded-2xl bg-white border border-aluminium shadow-[0_8px_24px_-6px_rgba(23,25,29,0.04)]";
const H2 = "text-xl font-bold text-carbone font-display";

export default function PolitiqueConfidentialitePage() {
  const { legal, contact, processors } = GARAGE_CONFIG;

  return (
    <div className="pt-12 pb-24 bg-glacier text-technique">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 space-y-10">
        <div>
          <span className="text-xs font-bold tracking-widest uppercase text-racing mb-2 block">
            Données Personnelles &amp; RGPD
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-carbone mb-4 font-display">
            Politique de Confidentialité
          </h1>
          <p className="text-sm text-technique">
            Run Auto s&apos;engage à protéger la vie privée des utilisateurs conformément au Règlement Général sur la Protection des Données (RGPD n° 2016/679) et à la loi Informatique et Libertés.
          </p>
        </div>

        <section className={CARD}>
          <h2 className={H2}>1. Responsable du traitement</h2>
          <p className="text-sm leading-relaxed">
            {legal.raisonSociale}, {legal.formeJuridique} immatriculée sous le SIREN {legal.siren}, dont le siège est situé{" "}
            {legal.siegeSocial}, représentée par {legal.directeurPublication}. Contact :{" "}
            <strong className="text-carbone">{legal.donneesPersonnellesDPO}</strong> · {contact.phoneDisplay}.
          </p>
        </section>

        <section className={CARD}>
          <h2 className={H2}>2. Données collectées, finalités et base légale</h2>
          <p className="text-sm leading-relaxed">
            Via le formulaire de rendez-vous et le formulaire de contact, nous collectons uniquement les données nécessaires au traitement de votre demande :
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1.5">
            <li><strong className="text-carbone">Identité et coordonnées :</strong> nom, prénom, téléphone, adresse e-mail et moyen de contact préféré, pour confirmer et suivre votre rendez-vous ou répondre à votre message.</li>
            <li><strong className="text-carbone">Informations du véhicule :</strong> marque, modèle, année, carburant, immatriculation (facultative), pour préparer l&apos;intervention.</li>
            <li><strong className="text-carbone">Message ou description du problème</strong> que vous rédigez.</li>
            <li><strong className="text-carbone">Données techniques :</strong> adresse IP au moment de l&apos;envoi, pour la sécurité du site et la lutte contre le spam.</li>
          </ul>
          <p className="text-sm leading-relaxed">
            Base légale : <strong className="text-carbone">mesures précontractuelles prises à votre demande</strong> (article 6.1.b du RGPD) pour les rendez-vous et devis,
            et <strong className="text-carbone">intérêt légitime</strong> (article 6.1.f) pour la sécurité du site. Aucune décision automatisée ni prospection commerciale n&apos;est réalisée à partir de ces données.
          </p>
        </section>

        <section className={CARD}>
          <h2 className={H2}>3. Destinataires et sous-traitants</h2>
          <p className="text-sm leading-relaxed">
            Vos données sont destinées exclusivement à l&apos;équipe de l&apos;atelier Run Auto. Elles ne sont{" "}
            <strong className="text-carbone">jamais vendues, louées ou cédées</strong>. Pour faire fonctionner le site, nous faisons appel aux prestataires techniques suivants, qui agissent uniquement sur nos instructions :
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1.5">
            {processors.map((p) => (
              <li key={p.name}>
                <strong className="text-carbone">{p.name}</strong> : {p.role} ({p.location})
              </li>
            ))}
          </ul>
          <p className="text-sm leading-relaxed">
            Lorsque des données sont susceptibles d&apos;être traitées hors de l&apos;Union européenne, ces prestataires s&apos;appuient sur les clauses contractuelles types de la Commission européenne et/ou le cadre de protection des données UE–États-Unis.
          </p>
        </section>

        <section className={CARD}>
          <h2 className={H2}>4. Durée de conservation</h2>
          <ul className="list-disc pl-5 text-sm space-y-1.5">
            <li><strong className="text-carbone">Demandes de rendez-vous et messages :</strong> 3 ans maximum à compter du dernier contact.</li>
            <li><strong className="text-carbone">Données de facturation</strong> (si vous devenez client) : 10 ans, conformément aux obligations comptables.</li>
            <li><strong className="text-carbone">Compteurs anti-spam :</strong> empreintes non réversibles, supprimées automatiquement sous 48 heures.</li>
          </ul>
        </section>

        <section className={CARD}>
          <h2 className={H2}>5. Vos droits</h2>
          <p className="text-sm leading-relaxed">
            Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de limitation, d&apos;opposition et de portabilité de vos données.
            Pour l&apos;exercer, écrivez à <strong className="text-carbone">{legal.donneesPersonnellesDPO}</strong> ou par courrier au {legal.siegeSocial}.
            Nous répondons dans un délai d&apos;un mois. Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL (www.cnil.fr).
          </p>
        </section>

        <section className={CARD}>
          <h2 className={H2}>6. Cookies et contenus tiers</h2>
          <p className="text-sm leading-relaxed">
            Ce site n&apos;utilise <strong className="text-carbone">aucun cookie publicitaire ni outil de mesure d&apos;audience</strong>. Seuls sont utilisés :
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1.5">
            <li>un cookie technique de session, réservé à l&apos;espace d&apos;administration du garage ;</li>
            <li>la vérification anti-robot Cloudflare Turnstile sur les formulaires, qui ne sert ni à vous suivre ni à faire de la publicité ;</li>
            <li>la carte Google Maps, <strong className="text-carbone">chargée uniquement si vous cliquez sur « Afficher la carte »</strong> : Google peut alors déposer ses propres cookies, selon sa politique de confidentialité.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
