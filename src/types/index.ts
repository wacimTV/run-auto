export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "ready"
  | "completed"
  | "cancelled";

export type PreferredContactMethod = "phone" | "sms" | "email";

export interface VehicleInfo {
  make: string; // Ex: Renault, Peugeot, BMW, Audi, etc.
  model: string; // Ex: Clio IV, 308, Série 3, RS3, etc.
  year?: string; // Année facultative
  fuel?: string; // Essence, Bioéthanol E85, Diesel, Hybride, Électrique
  licensePlate?: string; // Immatriculation facultative (ex: AA-123-BB)
}

export interface ClientInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferredContact: PreferredContactMethod;
}

export interface Appointment {
  id: string;
  createdAt: string;
  serviceId: string;
  serviceName: string;
  isCustomRequest: boolean;
  problemDescription?: string;
  vehicle: VehicleInfo;
  client: ClientInfo;
  date: string; // Format YYYY-MM-DD
  time: string; // Format HH:mm (ex: "09:00", "14:00")
  status: AppointmentStatus;
  internalNotes?: string;
  mileageKm?: string; // Kilométrage compteur (ex: "128 500 km")
  obdCodes?: string; // Codes défauts calculateurs / OBD (ex: "P0171, P0420")
  quoteAmountCents?: number | null; // Montant devis / facture en centimes
  ipAddress?: string;
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  ipAddress?: string;
}

export interface SlotAvailability {
  time: string;
  isAvailable: boolean;
  reason?: string;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  isOpen: boolean;
  dayName: string;
  slots: SlotAvailability[];
}

export interface AdminUser {
  username: string;
  role: "admin";
}

/* ── Types Administration Atelier (Modèle Grillade de Malpa adapté Mécanicien) ── */

export interface OpeningHourEntry {
  dayOfWeek: number; // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi
  openTime: string; // ex. "09:00"
  closeTime: string; // ex. "19:00"
  closed: boolean;
}

export interface ClosureEntry {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string; // ex. "Congés d'été", "Inventaire outillage", "Jour férié"
}

export interface AdminServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  sort: number;
}

export interface AdminServiceItem {
  id: string;
  slug: string;
  categoryId: string;
  title: string;
  shortDescription: string;
  priceNotice: string; // ex. "Sur devis gratuit" ou "À partir de 390 € TTC"
  priceCents?: number | null;
  estimatedDurationMinutes: number;
  durationLabel?: string;
  badge?: string;
  equipmentNote?: string; // ex. "Station TOPDON Phoenix Max • Schémas constructeurs"
  compatibleFuels: string[]; // Codes motorisations compatibles : ESSENCE, E85, DIESEL, HYBRIDE, ELECTRIQUE, UTILITAIRE
  image?: string;
  featured: boolean;
  available: boolean;
  sort: number;
}

export interface WorkshopOffer {
  id: string;
  title: string; // ex. "Pack Conversion Bioéthanol E85 + Contrôle Allumage"
  badge: string; // ex. "Offre E85", "Forfait Diagnostic", "Pack Révision"
  priceCents: number | null; // null = "Sur devis"
  description: string;
  active: boolean;
  sort: number;
}

export interface PartnerPlatform {
  id: string;
  name: string; // ex. "idGarages (Réf. GA7683)", "Google Maps", "PagesJaunes"
  url: string;
  active: boolean;
  sort: number;
}

export interface GalleryPhoto {
  id: string;
  src: string;
  alt: string;
  vehicleTag?: string; // ex. "Audi RS3 • Reprogrammation Moteur"
  sort: number;
  createdAt: string;
}

export interface GarageReview {
  id: string;
  author: string;
  vehicle: string; // ex. "Client idGarages" ou "Golf 7 GTI — Conversion E85"
  rating: number; // 4 ou 5
  source: string; // ex. "idGarages", "Google"
  date: string; // ex. "16 juillet 2026"
  comment: string;
  createdAt: string;
}

export interface GarageSettings {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  street: string;
  postalCode: string;
  city: string;
  latitude: number;
  longitude: number;
  slotCapacity: number; // Nombre de véhicules / ponts max par créneau d'1h
  bookingLeadHours: number; // Délai minimum en heures avant un RDV en ligne
  onlineBookingEnabled: boolean; // Activer / désactiver la prise de RDV en ligne
  flagshipEquipment: string; // ex. "TOPDON Phoenix Max"
  idGaragesRef: string; // ex. "GA7683"
  verifiedRating: number; // ex. 4.7
  verifiedReviewCount: string; // ex. "68"
  supportedBrands: string; // ex. "Toutes marques (Européennes, Allemandes, Françaises, Asiatiques)"
  announcement: string; // Bandeau d'annonce en haut du site (vide = masqué)
  parkingInfo: string; // Infos stationnement & dépôt véhicule
  transportInfo: string; // Infos accès transports (Métro, Bus RTM)
  warrantyNote: string; // Mention garantie constructeur / pièces d'origine
  googleMapsUrl: string;
  googleReviewUrl: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  snapchat: string;
  heroImage: string;
  workshopImage: string;
}

export interface SiteAdminState {
  settings: GarageSettings;
  hours: OpeningHourEntry[];
  closures: ClosureEntry[];
  categories: AdminServiceCategory[];
  services: AdminServiceItem[];
  offers: WorkshopOffer[];
  platforms: PartnerPlatform[];
  gallery: GalleryPhoto[];
  reviews: GarageReview[];
}
