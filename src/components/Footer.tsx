import React from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, Clock, Cpu, ChevronRight, Lock, Fuel } from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";

export default function Footer() {
  return (
    <footer className="bg-glacier border-t border-aluminium text-technique pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Col 1: Marque & Positionnement */}
          <div className="flex flex-col gap-5">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="w-10 h-10 rounded-lg bg-carbone border border-carbone flex items-center justify-center shadow-xs group-hover:bg-racing group-hover:border-racing transition-colors">
                <span className="text-white font-black tracking-tighter text-lg font-display italic">
                  R
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-[0.16em] text-carbone uppercase font-display">
                  RUN <span className="text-racing">AUTO</span>
                </span>
                <span className="text-[10px] tracking-[0.22em] text-technique uppercase font-semibold">
                  Marseille 13004
                </span>
              </div>
            </Link>

            <p className="text-sm leading-relaxed text-technique">
              Atelier automobile à Marseille spécialisé en adaptation bioéthanol E85, reprogrammation moteur, électronique automobile, diagnostic avancé, recherche de panne sur schémas électriques, Solutions FAP et mécanique générale.
            </p>

            <div className="flex items-center gap-2.5 text-xs text-carbone bg-white p-3.5 rounded-xl border border-aluminium shadow-2xs font-medium">
              <Cpu className="w-4 h-4 text-racing shrink-0" />
              <span>Diagnostic de dernière génération ({GARAGE_CONFIG.equipment.flagshipName}).</span>
            </div>
          </div>

          {/* Col 2: Prestations Spécialisées */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-carbone uppercase mb-5 flex items-center gap-2 font-display">
              <span className="w-2 h-2 rounded-full bg-racing" />
              Pôles d&apos;Expertise
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm">
              {GARAGE_CONFIG.services.slice(0, 7).map((service) => {
                const isE85 = service.slug === "conversion-bioethanol-e85";
                return (
                  <li key={service.id}>
                    <Link
                      href={`/prestations/${service.slug}`}
                      className={`transition-colors flex items-center gap-1.5 group ${
                        isE85
                          ? "text-carbone font-semibold hover:text-e85"
                          : "text-technique hover:text-racing"
                      }`}
                    >
                      <ChevronRight
                        className={`w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform shrink-0 ${
                          isE85 ? "text-e85" : "text-racing"
                        }`}
                      />
                      <span className="line-clamp-1">{service.title}</span>
                    </Link>
                  </li>
                );
              })}
              <li className="pt-1">
                <Link
                  href="/prestations"
                  className="text-racing hover:text-carbone font-bold text-xs flex items-center gap-1"
                >
                  Voir les {GARAGE_CONFIG.services.length} prestations →
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Horaires d'ouverture */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-carbone uppercase mb-5 flex items-center gap-2 font-display">
              <span className="w-2 h-2 rounded-full bg-racing" />
              Horaires d&apos;Ouverture
            </h3>
            <div className="flex flex-col gap-2.5 text-sm">
              <div className="flex justify-between pb-2.5 border-b border-aluminium">
                <span className="text-technique">Lundi – Vendredi</span>
                <span className="text-carbone font-bold">09:00 – 19:00</span>
              </div>
              <div className="flex justify-between pb-2.5 border-b border-aluminium text-technique/60">
                <span>Samedi</span>
                <span>Fermé</span>
              </div>
              <div className="flex justify-between text-technique/60">
                <span>Dimanche</span>
                <span>Fermé</span>
              </div>

              <div className="mt-4 p-3.5 rounded-xl bg-white border border-aluminium shadow-2xs text-xs space-y-2">
                <p className="flex items-center gap-2 text-carbone font-semibold">
                  <Clock className="w-3.5 h-3.5 text-racing shrink-0" />
                  Accueil sur rendez-vous
                </p>
                <Link
                  href="/contact?devis=e85#formulaire"
                  className="flex items-center gap-2 text-e85 hover:underline font-bold"
                >
                  <Fuel className="w-3.5 h-3.5 shrink-0" />
                  Demander une étude E85 →
                </Link>
              </div>
            </div>
          </div>

          {/* Col 4: Atelier & Contact */}
          <div>
            <h3 className="text-xs font-bold tracking-widest text-carbone uppercase mb-5 flex items-center gap-2 font-display">
              <span className="w-2 h-2 rounded-full bg-racing" />
              Coordonnées de l&apos;Atelier
            </h3>
            <ul className="flex flex-col gap-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-racing shrink-0 mt-0.5" />
                <div>
                  <p className="text-carbone font-bold">{GARAGE_CONFIG.contact.address}</p>
                  <p className="text-xs text-technique">
                    {GARAGE_CONFIG.contact.postalCode} {GARAGE_CONFIG.contact.city}
                  </p>
                  <a
                    href={GARAGE_CONFIG.contact.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-racing hover:underline mt-1 inline-block font-bold"
                  >
                    Obtenir l&apos;itinéraire GPS →
                  </a>
                </div>
              </li>

              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-racing shrink-0" />
                <a
                  href={`tel:${GARAGE_CONFIG.contact.phone.replace(/\s/g, "")}`}
                  className="text-carbone hover:text-racing font-extrabold transition-colors"
                >
                  {GARAGE_CONFIG.contact.phoneDisplay}
                </a>
              </li>

              <li className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-racing shrink-0" />
                <Link
                  href="/contact"
                  className="text-technique hover:text-racing text-xs font-medium transition-colors"
                >
                  Formulaire de contact &amp; demande de devis
                </Link>
              </li>

              <li className="pt-2">
                <Link
                  href="/prendre-rendez-vous"
                  className="btn-racing w-full py-2.5 px-4 rounded-xl text-center text-xs font-bold uppercase tracking-wider block"
                >
                  Prendre rendez-vous
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Mentions Légales & Droits */}
        <div className="pt-8 border-t border-aluminium flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-technique">
          <p className="font-medium">© {new Date().getFullYear()} RUN AUTO MARSEILLE. Tous droits réservés.</p>
          <div className="flex flex-wrap items-center gap-6">
            <Link href="/mentions-legales" className="hover:text-carbone transition-colors">
              Mentions légales
            </Link>
            <Link href="/politique-confidentialite" className="hover:text-carbone transition-colors">
              Politique de confidentialité (RGPD)
            </Link>
            <Link href="/faq" className="hover:text-carbone transition-colors">
              FAQ
            </Link>
            <Link
              href="/admin/login"
              className="text-technique/80 hover:text-racing transition-colors flex items-center gap-1"
            >
              <Lock className="w-3 h-3" />
              Espace Garage
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
