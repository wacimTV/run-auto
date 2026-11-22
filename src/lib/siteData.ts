import "server-only";
import { unstable_cache } from "next/cache";
import { GARAGE_CONFIG, ServiceItem } from "@/config/garage";
import { storage } from "@/lib/storage";
import { formatPriceCents } from "@/lib/motorisations";
import {
  AdminServiceCategory,
  AdminServiceItem,
  ClosureEntry,
  GalleryPhoto,
  GarageReview,
  GarageSettings,
  OpeningHourEntry,
  PartnerPlatform,
  SiteAdminState,
  WorkshopOffer,
} from "@/types";

/** Tag unique invalidé par updateTag(SITE_TAG) à chaque modification admin. */
export const SITE_TAG = "site";

/**
 * Prestation publique prête à l'affichage :
 * les champs gérés dans l'admin priment toujours, enrichis par les contenus éditoriaux
 * détaillés de GARAGE_CONFIG lorsqu'ils existent pour ce slug/id.
 */
export interface PublicServiceItem extends AdminServiceItem {
  categoryLabel: string;
  fullDescription: string;
  iconName: string;
  imageAlt: string;
  seoTitle?: string;
  seoDescription?: string;
  symptomsTitle?: string;
  symptoms: string[];
  benefits: string[];
  explainerTitle?: string;
  explainer?: string[];
  interventions?: ServiceItem["interventions"];
  faqs?: ServiceItem["faqs"];
  disclaimer?: string;
  quoteKey?: string;
  related?: string[];
  displayPrice: string;
}

export interface SiteData {
  settings: GarageSettings;
  hours: OpeningHourEntry[];
  closures: ClosureEntry[];
  categories: AdminServiceCategory[];
  /** Uniquement les prestations actives (available === true), triées par sort. */
  services: PublicServiceItem[];
  /** Toutes les prestations (y compris masquées), utile pour vérifications internes. */
  allServices: PublicServiceItem[];
  /** Uniquement les forfaits actifs, triés par sort. */
  offers: WorkshopOffer[];
  /** Uniquement les plateformes partenaires actives, triées par sort. */
  platforms: PartnerPlatform[];
  /** Photos de la galerie triées par sort. */
  gallery: GalleryPhoto[];
  /** Avis clients vérifiés. */
  reviews: GarageReview[];
}

function enrichService(
  srv: AdminServiceItem,
  categories: AdminServiceCategory[]
): PublicServiceItem {
  const base = GARAGE_CONFIG.services.find(
    (s) => s.id === srv.id || s.slug === srv.slug
  );
  const cat = categories.find((c) => c.id === srv.categoryId);
  const displayPrice =
    srv.priceCents !== null && srv.priceCents !== undefined
      ? formatPriceCents(srv.priceCents)
      : srv.priceNotice || "Sur devis gratuit";

  return {
    ...srv,
    categoryLabel: cat?.name || srv.categoryId,
    fullDescription: base?.fullDescription || srv.shortDescription,
    iconName: base?.iconName || "Wrench",
    imageAlt: base?.imageAlt || `${srv.title} chez Run Auto Marseille`,
    seoTitle: base?.seoTitle,
    seoDescription: base?.seoDescription,
    symptomsTitle: base?.symptomsTitle,
    symptoms: base?.symptoms ?? [
      "Besoin d'un contrôle ou d'une intervention ciblée sur votre véhicule",
      "Demande de diagnostic préalable et de devis transparent avant travaux",
    ],
    benefits: base?.benefits ?? [
      "Prise en charge par nos techniciens à Marseille",
      "Devis clair et accord préalable avant toute intervention",
      ...(srv.equipmentNote ? [srv.equipmentNote] : []),
    ],
    explainerTitle: base?.explainerTitle,
    explainer: base?.explainer,
    interventions: base?.interventions,
    faqs: base?.faqs,
    disclaimer: base?.disclaimer,
    quoteKey: base?.quoteKey,
    related: base?.related,
    displayPrice,
  };
}

function buildSiteData(state: SiteAdminState): SiteData {
  const categories = [...state.categories].sort((a, b) => a.sort - b.sort);
  const allServices = [...state.services]
    .sort((a, b) => a.sort - b.sort)
    .map((s) => enrichService(s, categories));
  const services = allServices.filter((s) => s.available);
  const offers = [...state.offers]
    .filter((o) => o.active)
    .sort((a, b) => a.sort - b.sort);
  const platforms = [...state.platforms]
    .filter((p) => p.active)
    .sort((a, b) => a.sort - b.sort);
  const gallery = [...state.gallery].sort((a, b) => a.sort - b.sort);

  return {
    settings: state.settings,
    hours: state.hours,
    closures: state.closures,
    categories,
    services,
    allServices,
    offers,
    platforms,
    gallery,
    reviews: state.reviews,
  };
}

const getCachedSiteData = unstable_cache(
  async (): Promise<SiteData> => {
    const state = await storage.getSiteAdminState();
    return buildSiteData(state);
  },
  ["run-auto-site-data"],
  {
    tags: [SITE_TAG],
    revalidate: 3600,
  }
);

/**
 * Chargeur unique côté serveur pour tout le site public.
 * Mis en cache via Next.js (`SITE_TAG`) et invalidé immédiatement par `invalidateSite()`.
 */
export async function getSiteData(): Promise<SiteData> {
  return getCachedSiteData();
}

export function formatPhoneHref(phone: string): string {
  const cleaned = phone.replace(/[^\d+]/g, "");
  return `tel:${cleaned}`;
}

export function formatWhatsAppHref(whatsapp: string): string | null {
  const digits = whatsapp.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}`;
}

export function formatFullAddress(settings: GarageSettings): string {
  return `${settings.street}, ${settings.postalCode} ${settings.city}`;
}

/* ------------------------------------------------------------------------ */
/* Versions allégées des prestations pour les composants client             */
/* ------------------------------------------------------------------------ */
/*
 * Tout ce qui est passé à un composant "use client" est sérialisé dans la page
 * et réhydraté par React. On n'envoie donc que les champs réellement affichés :
 * les textes longs (fullDescription, FAQ, symptômes, interventions…) restent côté serveur.
 */

/** Liens du pied de page. */
export type ServiceLink = Pick<PublicServiceItem, "id" | "slug" | "title">;

/** Cartes du catalogue de prestations. */
export type ServiceCard = Pick<
  PublicServiceItem,
  | "id"
  | "slug"
  | "title"
  | "categoryId"
  | "categoryLabel"
  | "shortDescription"
  | "badge"
  | "displayPrice"
  | "durationLabel"
  | "estimatedDurationMinutes"
  | "iconName"
  | "image"
  | "imageAlt"
  | "quoteKey"
  | "benefits"
>;

/** Choix de prestation du formulaire de rendez-vous. */
export type BookingService = Pick<
  PublicServiceItem,
  | "id"
  | "slug"
  | "title"
  | "shortDescription"
  | "badge"
  | "displayPrice"
  | "durationLabel"
  | "estimatedDurationMinutes"
>;

export function toServiceLinks(services: PublicServiceItem[]): ServiceLink[] {
  return services.map(({ id, slug, title }) => ({ id, slug, title }));
}

export function toServiceCards(services: PublicServiceItem[]): ServiceCard[] {
  return services.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    categoryId: s.categoryId,
    categoryLabel: s.categoryLabel,
    shortDescription: s.shortDescription,
    badge: s.badge,
    displayPrice: s.displayPrice,
    durationLabel: s.durationLabel,
    estimatedDurationMinutes: s.estimatedDurationMinutes,
    iconName: s.iconName,
    image: s.image,
    imageAlt: s.imageAlt,
    quoteKey: s.quoteKey,
    benefits: s.benefits.slice(0, 2), // la carte n'en affiche que 2
  }));
}

export function toBookingServices(services: PublicServiceItem[]): BookingService[] {
  return services.map((s) => ({
    id: s.id,
    slug: s.slug,
    title: s.title,
    shortDescription: s.shortDescription,
    badge: s.badge,
    displayPrice: s.displayPrice,
    durationLabel: s.durationLabel,
    estimatedDurationMinutes: s.estimatedDurationMinutes,
  }));
}
