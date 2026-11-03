import React from "react";
import type { Metadata } from "next";
import ServicesCatalogue from "@/components/ServicesCatalogue";
import Link from "next/link";
import { ShieldCheck, Cpu, Wrench, Fuel, Gauge, FileText, Calendar } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

export const metadata: Metadata = {
  title:
    "Prestations : Bioéthanol E85, Reprogrammation Moteur, Électronique & Mécanique à Marseille",
  description:
    "Découvrez toutes les prestations de l'atelier Run Auto à Marseille (13004) : conversion bioéthanol E85, reprogrammation moteur, diagnostic électronique TOPDON Phoenix Max, recherche de panne sur schémas électriques, ajout d'options, Solutions FAP et mécanique générale.",
};

export default function PrestationsPage() {
  return (
    <div className="pt-12 pb-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mb-6">
        <div className="max-w-3xl">
          <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-2 block">
            Pôles d&apos;Expertise • Marseille 13004
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-carbone mb-6 font-display">
            Nos Prestations Automobiles à Marseille
          </h1>
          <p className="text-base text-technique leading-relaxed">
            Run Auto réunit dans un même atelier au 52 boulevard de Roux (13004 Marseille) l&apos;adaptation au superéthanol E85, la reprogrammation moteur, l&apos;électronique automobile avancée, la recherche de pannes complexes sur schémas électriques, les Solutions FAP conformes et la mécanique générale.
          </p>
        </div>

        {/* Reassurance Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8 border-t border-aluminium">
          <div className="p-4 rounded-2xl bg-glacier border border-aluminium flex items-center gap-3">
            <Fuel className="w-5 h-5 text-e85 shrink-0" />
            <span className="text-xs text-carbone font-bold">
              Étude de compatibilité E85 avant toute conversion
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-glacier border border-aluminium flex items-center gap-3">
            <Gauge className="w-5 h-5 text-racing shrink-0" />
            <span className="text-xs text-carbone font-bold">
              Diagnostic complet avant et après reprogrammation
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-glacier border border-aluminium flex items-center gap-3">
            <Cpu className="w-5 h-5 text-racing shrink-0" />
            <span className="text-xs text-carbone font-bold">
              Équipement {GARAGE_CONFIG.equipment.flagshipName} &amp; schémas constructeur
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-glacier border border-aluminium flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-racing shrink-0" />
            <span className="text-xs text-carbone font-bold">
              Devis préalable systématique et respect réglementaire
            </span>
          </div>
        </div>
      </div>

      <ServicesCatalogue />

      {/* Scope clarification & CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-10">
        <div className="p-6 sm:p-8 rounded-2xl bg-glacier border border-aluminium flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1 max-w-2xl">
            <p className="text-sm font-extrabold text-carbone flex items-center gap-2">
              <Wrench className="w-4 h-4 text-racing" />
              Périmètre d&apos;intervention de l&apos;atelier
            </p>
            <p className="text-xs text-technique leading-relaxed">
              Run Auto est spécialisé en électronique automobile, gestion moteur, conversion E85, Solutions FAP et mécanique générale (freinage, embrayage, distribution, train roulant, révision). L&apos;atelier n&apos;effectue pas le montage de pneumatiques, le parallélisme ni l&apos;équilibrage des roues.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/contact#formulaire"
              className="btn-outline-racing px-5 py-3 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5 text-racing" />
              <span>Demander un devis</span>
            </Link>
            <Link
              href="/prendre-rendez-vous"
              className="btn-racing px-6 py-3 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2"
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
