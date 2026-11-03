import React from "react";
import type { Metadata } from "next";
import { GARAGE_CONFIG } from "@/config/garage";

export const metadata: Metadata = {
  title: "Politique de Confidentialité & RGPD | Run Auto Marseille",
  description: "Politique de protection des données personnelles et respect du RGPD pour le site Run Auto Marseille.",
};

export default function PolitiqueConfidentialitePage() {
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

        <section className="space-y-4 p-6 rounded-2xl bg-white border border-aluminium shadow-[0_8px_24px_-6px_rgba(23,25,29,0.04)]">
          <h2 className="text-xl font-bold text-carbone font-display">1. Données collectées et finalités</h2>
          <p className="text-sm leading-relaxed">
            Dans le cadre de l&apos;utilisation de nos modules de réservation et formulaires de contact, nous collectons strictement les données nécessaires au traitement de votre demande :
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1.5">
            <li><strong className="text-carbone">Identité du client :</strong> Nom, prénom, téléphone et adresse e-mail (pour la confirmation et le suivi du rendez-vous).</li>
            <li><strong className="text-carbone">Informations du véhicule :</strong> Marque, modèle, motorisation, immatriculation facultative (pour préparer les outillages et les pièces détachées requises).</li>
            <li><strong className="text-carbone">Message ou motif :</strong> Descriptif du problème rencontré.</li>
          </ul>
        </section>

        <section className="space-y-4 p-6 rounded-2xl bg-white border border-aluminium shadow-[0_8px_24px_-6px_rgba(23,25,29,0.04)]">
          <h2 className="text-xl font-bold text-carbone font-display">2. Destinataires et conservation des données</h2>
          <p className="text-sm leading-relaxed">
            Vos données personnelles sont strictement destinées au personnel technique et administratif de l&apos;atelier Run Auto. Elles ne sont <strong className="text-carbone">en aucun cas vendues, louées ou cédées</strong> à des tiers publicitaires.
          </p>
          <p className="text-sm leading-relaxed">
            Les données relatives aux demandes de devis et rendez-vous sont conservées pendant la durée nécessaire à la gestion de la relation client et aux obligations légales de facturation (jusqu&apos;à 3 ans à compter du dernier contact pour les prospects).
          </p>
        </section>

        <section className="space-y-4 p-6 rounded-2xl bg-white border border-aluminium shadow-[0_8px_24px_-6px_rgba(23,25,29,0.04)]">
          <h2 className="text-xl font-bold text-carbone font-display">3. Vos droits d&apos;accès, de rectification et d&apos;effacement</h2>
          <p className="text-sm leading-relaxed">
            Conformément à la réglementation en vigueur, vous disposez d&apos;un droit d&apos;accès, de rectification, de portabilité et de suppression de vos données personnelles. Vous pouvez exercer ce droit à tout moment en adressant un e-mail à <strong className="text-carbone">{GARAGE_CONFIG.legal.donneesPersonnellesDPO}</strong> ou par courrier postal adressé au 52 boulevard de Roux, 13004 Marseille.
          </p>
        </section>

        <section className="space-y-4 p-6 rounded-2xl bg-white border border-aluminium shadow-[0_8px_24px_-6px_rgba(23,25,29,0.04)]">
          <h2 className="text-xl font-bold text-carbone font-display">4. Cookies &amp; Traçabilité</h2>
          <p className="text-sm leading-relaxed">
            Ce site n&apos;utilise aucun traceur publicitaire intrusif. Seuls des cookies strictement techniques essentiels au bon fonctionnement de la navigation, à la sécurité des sessions administratives et à la prévention des attaques automatisées peuvent être déposés.
          </p>
        </section>
      </div>
    </div>
  );
}
