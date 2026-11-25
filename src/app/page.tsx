import React from "react";
import type { Metadata } from "next";
import HeroSection from "@/components/HeroSection";
import HomeSpecialtySections from "@/components/HomeSpecialtySections";
import GaragePresentation from "@/components/GaragePresentation";
import ServicesCatalogue from "@/components/ServicesCatalogue";
import OffersSection from "@/components/OffersSection";
import GallerySection from "@/components/GallerySection";
import BookingWizard from "@/components/BookingWizard";
import ReviewsSection from "@/components/ReviewsSection";
import OpeningHoursAndMap from "@/components/OpeningHoursAndMap";
import FAQSection from "@/components/FAQSection";
import Link from "next/link";
import { Phone, Calendar, Sparkles, FileText } from "lucide-react";
import { getSiteData, toBookingServices, toServiceCards } from "@/lib/siteData";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const siteData = await getSiteData();
  const { settings, hours, categories, services, offers, platforms, gallery, reviews } = siteData;

  return (
    <>
      {/* 2–4. Hero immersif lumineux */}
      <HeroSection settings={settings} />

      {/* 5–12. Pôles prioritaires */}
      <HomeSpecialtySections settings={settings} services={services} />

      {/* Catalogue filtrable de l'ensemble des prestations actives */}
      <ServicesCatalogue
        services={toServiceCards(services)}
        categories={categories}
        onlineBookingEnabled={settings.onlineBookingEnabled}
      />

      {/* Forfaits & Offres Atelier configurés dans /admin */}
      <OffersSection offers={offers} />

      {/* 13. Présentation de l'atelier et du savoir-faire */}
      <GaragePresentation settings={settings} />

      {/* Galerie / Réalisations de l'atelier */}
      <GallerySection gallery={gallery} />

      {/* 14. Avis clients et témoignages vérifiés */}
      <ReviewsSection reviews={reviews} settings={settings} platforms={platforms} />

      {/* 15. Module de prise de rendez-vous en ligne */}
      {settings.onlineBookingEnabled ? (
        <section id="reservation" className="py-24 bg-white border-t border-aluminium relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-racing-soft border border-racing/25 text-xs text-racing font-extrabold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5 text-racing" />
                <span>Réservation En Ligne • Confirmation sous 2h ouvrées</span>
              </div>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-carbone mb-4 tracking-tight font-display">
                Planifiez votre passage à l&apos;atelier
              </h2>
              <p className="text-base text-technique">
                Sélectionnez votre prestation (Bioéthanol E85, reprogrammation, diagnostic électronique, recherche de panne, Solutions FAP ou mécanique), renseignez votre véhicule et choisissez votre créneau.
              </p>
            </div>

            <BookingWizard services={toBookingServices(services)} settings={settings} hours={hours} />
          </div>
        </section>
      ) : null}

      {/* Horaires & Accès Géographique */}
      <OpeningHoursAndMap settings={settings} hours={hours} />

      {/* FAQ */}
      <FAQSection settings={settings} />

      {/* Appel à l'action final */}
      <section className="py-20 bg-glacier border-t border-aluminium text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-8 relative z-10">
          <span className="text-xs font-extrabold tracking-widest uppercase text-racing mb-3 block">
            {settings.name} • {settings.street}, {settings.postalCode} {settings.city}
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-carbone mb-6 font-display">
            Un projet E85 ou reprogrammation ? Un voyant ou une panne électronique ?
          </h2>
          <p className="text-base text-technique max-w-xl mx-auto mb-8">
            Étude de compatibilité préalable, diagnostic professionnel {settings.flagshipEquipment} et devis transparent avant toute intervention.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {settings.onlineBookingEnabled ? (
              <Link
                href="/prendre-rendez-vous"
                className="btn-racing px-8 py-4 rounded-xl text-xs uppercase tracking-wider font-extrabold flex items-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Prendre rendez-vous</span>
              </Link>
            ) : null}

            <Link
              href="/contact#formulaire"
              className="btn-outline-racing px-8 py-4 rounded-xl text-xs uppercase tracking-wider font-bold flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-racing" />
              <span>Demander un devis</span>
            </Link>

            <a
              href={`tel:${settings.phone.replace(/\s/g, "")}`}
              className="btn-outline-racing px-7 py-4 rounded-xl text-xs font-bold flex items-center gap-2"
            >
              <Phone className="w-4 h-4 text-racing" />
              <span>{settings.phone}</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
