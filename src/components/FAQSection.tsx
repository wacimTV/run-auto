"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Phone } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

export default function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const faqs = [
    {
      question: "Tous les véhicules essence sont-ils compatibles avec la conversion au bioéthanol E85 ?",
      answer:
        "Non, la compatibilité ne peut jamais être garantie sans étude préalable. Chaque véhicule fait l'objet d'une vérification technique à l'atelier (motorisation, système d'injection, état général) afin de déterminer la solution d'adaptation à l'E85 appropriée et conforme à la réglementation.",
    },
    {
      question: "Comment se déroule une reprogrammation moteur chez Run Auto ?",
      answer:
        "Toute intervention commence par un diagnostic électronique complet pour vérifier l'absence de défaut et la bonne santé du moteur. Nous adaptons ensuite les paramètres moteur selon votre véhicule et sa motorisation, puis réalisons des contrôles après intervention. Nous n'annonçons jamais de gains chiffrés non vérifiés.",
    },
    {
      question: "Un voyant est allumé au tableau de bord : pouvez-vous simplement l'effacer ?",
      answer:
        "Effacer un code défaut sans identifier sa cause ne résout pas la panne : le voyant réapparaît généralement très vite. Grâce à notre équipement TOPDON Phoenix Max et à l'étude des schémas électriques constructeur, nous recherchons l'origine réelle du problème afin de vous proposer une réparation adaptée.",
    },
    {
      question: "En quoi consistent vos « Solutions FAP » ?",
      answer:
        "Nos Solutions FAP portent exclusivement sur le diagnostic, l'analyse des causes d'encrassement (capteurs, injection, EGR, usage), l'entretien et la remise en conformité du système de dépollution, dans le strict respect de la réglementation en vigueur et en préservant les dispositifs antipollution.",
    },
    {
      question: "Réalisez-vous le montage de pneumatiques ou le parallélisme ?",
      answer:
        "Non. Run Auto n'effectue pas le montage de pneumatiques, le parallélisme ni l'équilibrage des roues. En revanche, notre pôle de mécanique générale prend en charge le freinage (plaquettes, disques), l'embrayage, la distribution, les éléments du train roulant et l'entretien périodique.",
    },
    {
      question: "Comment se déroule la confirmation de mon rendez-vous en ligne ?",
      answer:
        "Lorsque vous réservez un créneau sur le site, votre demande est immédiatement enregistrée dans notre atelier. Notre équipe étudie votre besoin et votre modèle de véhicule, puis vous confirme le rendez-vous sous 2 heures ouvrées (du lundi au vendredi, 09h00–19h00) par téléphone, SMS ou e-mail.",
    },
  ];

  return (
    <section className="py-24 bg-white border-t border-aluminium relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-racing-soft border border-racing/25 text-xs text-racing font-extrabold uppercase tracking-wider mb-4">
            <HelpCircle className="w-3.5 h-3.5 text-racing" />
            <span>Foire Aux Questions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carbone mb-4 font-display">
            Réponses à vos questions techniques
          </h2>
          <p className="text-sm text-technique">
            Bioéthanol E85, reprogrammation, diagnostic électronique, Solutions FAP et prise en charge à Marseille.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl bg-white border transition-all duration-200 ${
                  isOpen
                    ? "border-racing/50 shadow-[0_8px_24px_-6px_rgba(215,25,32,0.08)]"
                    : "border-aluminium shadow-2xs"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-carbone hover:text-racing transition-colors"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-racing shrink-0 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-technique leading-relaxed border-t border-aluminium pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-12 p-6 rounded-2xl bg-glacier border border-aluminium text-center flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-left">
            <p className="text-sm font-extrabold text-carbone">
              Une question spécifique sur la compatibilité de votre véhicule ?
            </p>
            <p className="text-xs text-technique">
              Notre équipe vous répond directement par téléphone du lundi au vendredi.
            </p>
          </div>
          <a
            href={`tel:${GARAGE_CONFIG.contact.phone.replace(/\s/g, "")}`}
            className="btn-racing px-5 py-3 rounded-xl text-xs font-bold flex items-center gap-2 shrink-0"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{GARAGE_CONFIG.contact.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </section>
  );
}
