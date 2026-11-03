import React from "react";
import type { Metadata } from "next";
import FAQSection from "@/components/FAQSection";
import Link from "next/link";
import { Calendar } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

export const metadata: Metadata = {
  title: "Foire Aux Questions (FAQ) | Run Auto Marseille 13004",
  description:
    "Toutes les réponses à vos questions sur la conversion Bioéthanol E85, la reprogrammation moteur, le diagnostic électronique TOPDON et les réparations chez Run Auto Marseille.",
};

export default function FAQPage() {
  return (
    <div className="pt-12 pb-24 bg-glacier">
      <div className="max-w-4xl mx-auto px-4 sm:px-8 mb-8 text-center">
        <span className="text-xs font-bold tracking-widest uppercase text-racing mb-2 block">
          Centre d&apos;Aide &amp; Questions
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-carbone mb-4 font-display">
          Foire Aux Questions
        </h1>
        <p className="text-base text-technique">
          Retrouvez les réponses aux interrogations les plus fréquentes des automobilistes à Marseille.
        </p>
      </div>

      <FAQSection />

      <div className="max-w-3xl mx-auto px-4 sm:px-8 mt-12 text-center">
        <div className="p-8 rounded-2xl bg-white border border-aluminium shadow-[0_8px_24px_-6px_rgba(23,25,29,0.05)] space-y-4">
          <h3 className="text-xl font-bold text-carbone font-display">
            Votre question n&apos;est pas répertoriée ?
          </h3>
          <p className="text-xs text-technique">
            Nous sommes joignables directement au {GARAGE_CONFIG.contact.phoneDisplay} ou via notre formulaire de contact en ligne.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/contact"
              className="btn-outline-racing px-6 py-2.5 rounded-xl text-xs font-semibold"
            >
              Envoyer un message
            </Link>
            <Link
              href="/prendre-rendez-vous"
              className="btn-racing px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Prendre rendez-vous</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
