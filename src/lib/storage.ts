import "server-only";
import fs from "fs";
import path from "path";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdmin } from "@/lib/supabase";
import { GARAGE_CONFIG, SERVICE_CATEGORIES } from "@/config/garage";
import {
  Appointment,
  ContactMessage,
  SiteAdminState,
  GarageSettings,
  OpeningHourEntry,
  ClosureEntry,
  AdminServiceCategory,
  AdminServiceItem,
  WorkshopOffer,
  PartnerPlatform,
  GalleryPhoto,
  GarageReview,
} from "@/types";

export const DOUBLE_BOOKING_ERROR =
  "Ce créneau est déjà réservé. Veuillez choisir un autre horaire.";

export interface AppointmentPatch {
  status?: Appointment["status"];
  internalNotes?: string;
  mileageKm?: string;
  obdCodes?: string;
  quoteAmountCents?: number | null;
}

function slugify(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `cat-${Date.now()}`
  );
}

export function defaultSiteAdminState(): SiteAdminState {
  const settings: GarageSettings = {
    name: GARAGE_CONFIG.name,
    phone: GARAGE_CONFIG.contact.phoneDisplay,
    whatsapp: "33618318915",
    email: GARAGE_CONFIG.contact.email,
    street: GARAGE_CONFIG.contact.address,
    postalCode: GARAGE_CONFIG.contact.postalCode,
    city: GARAGE_CONFIG.contact.city,
    latitude: GARAGE_CONFIG.contact.coordinates.latitude,
    longitude: GARAGE_CONFIG.contact.coordinates.longitude,
    slotCapacity: 1,
    bookingLeadHours: 2,
    onlineBookingEnabled: true,
    flagshipEquipment: GARAGE_CONFIG.equipment.flagshipName,
    idGaragesRef: GARAGE_CONFIG.partner.idGaragesRef,
    verifiedRating: GARAGE_CONFIG.reviewsSummary.verifiedAverageRating,
    verifiedReviewCount: String(GARAGE_CONFIG.reviewsSummary.reviewCount),
    supportedBrands:
      "Multimarque : Françaises, Allemandes (VAG, BMW, Mercedes), Européennes & Asiatiques",
    announcement: "",
    parkingInfo:
      "Accès direct et dépose véhicule au 52 boulevard de Roux, 13004 Marseille",
    transportInfo: "Métro M1 (station Chartreux ou Cinq Avenues) • Bus RTM lignes 7 et 42",
    warrantyNote:
      "Garantie constructeur préservée (Règlement UE n° 461/2010) • Devis transparent validé avant toute intervention • Diagnostic TOPDON Phoenix Max",
    googleMapsUrl: GARAGE_CONFIG.contact.googleMapsUrl,
    googleReviewUrl: GARAGE_CONFIG.partner.idGaragesUrl,
    instagram: "",
    facebook: "",
    tiktok: "",
    snapchat: "",
    heroImage: "/images/hero-performance-light.jpg",
    workshopImage: "/images/atelier-light.jpg",
  };

  const hours: OpeningHourEntry[] = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const found = GARAGE_CONFIG.openingHours.find((h) => h.dayIndex === d);
    return {
      dayOfWeek: d,
      openTime: found?.slots[0]?.open ?? "09:00",
      closeTime: found?.slots[0]?.close ?? "19:00",
      closed: found ? !found.isOpen : d === 0 || d === 6,
    };
  });

  const categories: AdminServiceCategory[] = SERVICE_CATEGORIES.map((c, idx) => ({
    id: c.id,
    name: c.label,
    slug: slugify(c.id),
    description: c.description,
    sort: idx + 1,
  }));

  const services: AdminServiceItem[] = GARAGE_CONFIG.services.map((s, idx) => {
    const isE85 = s.slug === "conversion-bioethanol-e85";
    const isReprog = s.slug === "reprogrammation-moteur";
    const isFap = s.slug === "solutions-fap";
    const defaultFuels = isE85
      ? ["ESSENCE", "E85", "HYBRIDE"]
      : isFap
        ? ["DIESEL", "UTILITAIRE"]
        : isReprog
          ? ["ESSENCE", "E85", "DIESEL", "TURBO_PERF", "BVA_DSG"]
          : ["ESSENCE", "E85", "DIESEL", "HYBRIDE", "UTILITAIRE"];

    return {
      id: s.id,
      slug: s.slug,
      categoryId: s.category,
      title: s.title,
      shortDescription: s.shortDescription,
      priceNotice: s.priceNotice,
      priceCents: null,
      estimatedDurationMinutes: s.estimatedDurationMinutes,
      durationLabel: s.durationLabel ?? "",
      badge: s.badge ?? "",
      equipmentNote:
        s.category === "Électronique automobile" || isReprog || isE85
          ? `Valise ${GARAGE_CONFIG.equipment.flagshipName} & outils dédiés`
          : "Outillage constructeur & pièces certifiées",
      compatibleFuels: defaultFuels,
      image: s.heroImage ?? "",
      featured: idx < 6,
      available: true,
      sort: idx + 1,
    };
  });

  const offers: WorkshopOffer[] = [
    {
      id: "offer-e85-bilan",
      title: "Étude de Compatibilité E85 + Lecture Calculateurs",
      badge: "Bioéthanol E85",
      priceCents: null,
      description:
        "Vérification de votre motorisation essence/hybride, contrôle de l'état d'allumage et chiffrage personnalisé pour rouler au Superéthanol E85.",
      active: true,
      sort: 1,
    },
    {
      id: "offer-diag-topdon",
      title: "Bilan Électronique Complet TOPDON Phoenix Max",
      badge: "Diagnostic Pro",
      priceCents: null,
      description:
        "Interrogation complète de tous les calculateurs du véhicule, lecture des défauts enregistrés, analyse des valeurs en temps réel et rapport d'intervention.",
      active: true,
      sort: 2,
    },
    {
      id: "offer-revision-securite",
      title: "Forfait Révision Constructeur + Contrôle Points de Sécurité",
      badge: "Entretien",
      priceCents: null,
      description:
        "Vidange huile certifiée norme constructeur, remplacement des filtres, contrôle visuel du freinage, des niveaux et remise à zéro de l'indicateur de maintenance.",
      active: true,
      sort: 3,
    },
  ];

  const platforms: PartnerPlatform[] = [
    {
      id: "plat-idgarages",
      name: `idGarages (${GARAGE_CONFIG.partner.idGaragesRef})`,
      url: GARAGE_CONFIG.partner.idGaragesUrl,
      active: true,
      sort: 1,
    },
    {
      id: "plat-google-maps",
      name: "Google Maps & Itinéraire GPS",
      url: GARAGE_CONFIG.contact.googleMapsUrl,
      active: true,
      sort: 2,
    },
  ];

  const gallery: GalleryPhoto[] = [
    {
      id: "gal-1",
      src: "/images/atelier-light.jpg",
      alt: "Atelier mécanique et électronique Run Auto à Marseille 13004",
      vehicleTag: "L'Atelier Run Auto • Marseille 13004",
      sort: 1,
      createdAt: "2026-11-01T09:00:00.000Z",
    },
    {
      id: "gal-2",
      src: "/images/diagnostic-tool-light.jpg",
      alt: "Diagnostic électronique multimarque avec valise TOPDON Phoenix Max",
      vehicleTag: "Diagnostic TOPDON Phoenix Max",
      sort: 2,
      createdAt: "2026-11-02T09:00:00.000Z",
    },
    {
      id: "gal-3",
      src: "/images/e85-bioethanol-light.jpg",
      alt: "Conversion et adaptation Bioéthanol E85 sur mesure à Marseille",
      vehicleTag: "Conversion Bioéthanol E85",
      sort: 3,
      createdAt: "2026-11-03T09:00:00.000Z",
    },
    {
      id: "gal-4",
      src: "/images/reprogrammation-light.jpg",
      alt: "Reprogrammation moteur et optimisation calculateur ECU",
      vehicleTag: "Reprogrammation & Cartographie ECU",
      sort: 4,
      createdAt: "2026-11-04T09:00:00.000Z",
    },
  ];

  const reviews: GarageReview[] = GARAGE_CONFIG.reviewsSummary.testimonials.map(
    (t, idx) => ({
      id: `rev-${idx + 1}`,
      author: t.author,
      vehicle: t.vehicle,
      rating: t.rating,
      source: GARAGE_CONFIG.reviewsSummary.sourceName,
      date: t.date,
      comment: t.comment,
      createdAt: "2026-07-16T10:00:00.000Z",
    })
  );

  return {
    settings,
    hours,
    closures: [],
    categories,
    services,
    offers,
    platforms,
    gallery,
    reviews,
  };
}

interface StorageBackend {
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: Appointment): Promise<Appointment>;
  updateAppointmentStatus(
    id: string,
    status: Appointment["status"],
    internalNotes?: string
  ): Promise<Appointment | null>;
  updateAppointmentDetails(
    id: string,
    patch: AppointmentPatch
  ): Promise<Appointment | null>;
  markAppointmentReminderSent(id: string, sentAt: string): Promise<void>;
  deleteAppointment(id: string): Promise<boolean>;
  getContacts(): Promise<ContactMessage[]>;
  createContact(contact: ContactMessage): Promise<ContactMessage>;
  updateContactStatus(
    id: string,
    status: ContactMessage["status"]
  ): Promise<ContactMessage | null>;
  deleteContact(id: string): Promise<boolean>;
  getBlockedDates(): Promise<string[]>;
  toggleBlockedDate(date: string, reason?: string): Promise<boolean>;
  getSiteAdminState(): Promise<SiteAdminState>;
  saveSiteAdminState(updater: (prev: SiteAdminState) => SiteAdminState): Promise<SiteAdminState>;
}

function sortAppointments(list: Appointment[]): Appointment[] {
  return list.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}:00`);
    const dateB = new Date(`${b.date}T${b.time}:00`);
    return dateB.getTime() - dateA.getTime();
  });
}

// ============================================================================
// Encodage / décodage des métadonnées mécanicien dans internal_notes (Supabase)
// Permet de stocker mileageKm, obdCodes et quoteAmountCents sans casser le schéma SQL existant
// ============================================================================
const META_PREFIX = "[[RUNAUTO_META:";
const META_SUFFIX = "]]\n";

function encodeInternalNotes(apt: {
  internalNotes?: string;
  mileageKm?: string;
  obdCodes?: string;
  quoteAmountCents?: number | null;
}): string | null {
  const hasMeta =
    Boolean(apt.mileageKm) ||
    Boolean(apt.obdCodes) ||
    (apt.quoteAmountCents !== undefined && apt.quoteAmountCents !== null);
  const cleanNotes = apt.internalNotes ?? "";
  if (!hasMeta && !cleanNotes) return null;
  if (!hasMeta) return cleanNotes;
  const metaJson = JSON.stringify({
    mileageKm: apt.mileageKm || undefined,
    obdCodes: apt.obdCodes || undefined,
    quoteAmountCents: apt.quoteAmountCents ?? undefined,
  });
  return `${META_PREFIX}${metaJson}${META_SUFFIX}${cleanNotes}`;
}

function decodeInternalNotes(raw: string | null): {
  internalNotes?: string;
  mileageKm?: string;
  obdCodes?: string;
  quoteAmountCents?: number | null;
} {
  if (!raw) return {};
  if (raw.startsWith(META_PREFIX)) {
    const endIdx = raw.indexOf(META_SUFFIX);
    if (endIdx !== -1) {
      const jsonPart = raw.slice(META_PREFIX.length, endIdx);
      const rest = raw.slice(endIdx + META_SUFFIX.length);
      try {
        const parsed = JSON.parse(jsonPart);
        return {
          internalNotes: rest || undefined,
          mileageKm: parsed.mileageKm,
          obdCodes: parsed.obdCodes,
          quoteAmountCents:
            typeof parsed.quoteAmountCents === "number" ? parsed.quoteAmountCents : null,
        };
      } catch {
        return { internalNotes: raw };
      }
    }
  }
  return { internalNotes: raw };
}

// ============================================================================
// Backend fichier JSON (et persistance locale de SiteAdminState)
// ============================================================================

interface StorageData {
  appointments: Appointment[];
  contacts: ContactMessage[];
  blockedDates: string[];
  blockedSlots: { date: string; time: string; reason?: string }[];
  siteAdmin?: Partial<SiteAdminState>;
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORAGE_FILE = path.join(DATA_DIR, "storage.json");

function emptyData(): StorageData {
  return {
    appointments: [],
    contacts: [],
    blockedDates: [],
    blockedSlots: [],
    siteAdmin: defaultSiteAdminState(),
  };
}

function readFile(): StorageData {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORAGE_FILE)) {
    const initial = emptyData();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(STORAGE_FILE, "utf-8"));
  } catch {
    const initial = emptyData();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

function writeFile(data: StorageData): void {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  const tempFile = `${STORAGE_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, STORAGE_FILE);
}

function mergeSiteAdminState(
  stored: Partial<SiteAdminState> | undefined,
  blockedDates: string[]
): SiteAdminState {
  const def = defaultSiteAdminState();
  const rawClosures = stored?.closures ?? [];
  const closureMap = new Map<string, ClosureEntry>();
  for (const c of rawClosures) {
    closureMap.set(c.date, c);
  }
  for (const d of blockedDates) {
    if (!closureMap.has(d)) {
      closureMap.set(d, {
        id: `clos-${d}`,
        date: d,
        reason: "Fermeture exceptionnelle de l'atelier",
      });
    }
  }
  const closures = Array.from(closureMap.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  );

  return {
    settings: { ...def.settings, ...(stored?.settings ?? {}) },
    hours: stored?.hours && stored.hours.length === 7 ? stored.hours : def.hours,
    closures,
    categories:
      stored?.categories && stored.categories.length > 0
        ? stored.categories
        : def.categories,
    services:
      stored?.services && stored.services.length > 0 ? stored.services : def.services,
    offers: stored?.offers ?? def.offers,
    platforms:
      stored?.platforms && stored.platforms.length > 0
        ? stored.platforms
        : def.platforms,
    gallery: stored?.gallery ?? def.gallery,
    reviews: stored?.reviews ?? def.reviews,
  };
}

// ============================================================================
// Backend Supabase
// ============================================================================

interface AppointmentRow {
  id: string;
  created_at: string;
  service_id: string;
  service_name: string;
  is_custom_request: boolean | null;
  problem_description: string | null;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string | null;
  vehicle_fuel: string | null;
  vehicle_license_plate: string | null;
  client_first_name: string;
  client_last_name: string;
  client_phone: string;
  client_email: string;
  preferred_contact: string | null;
  appointment_date: string;
  appointment_time: string;
  status: Appointment["status"];
  internal_notes: string | null;
  reminder_sent_at?: string | null;
  ip_address: string | null;
}

interface ContactRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessage["status"];
  ip_address: string | null;
}

function rowToAppointment(r: AppointmentRow): Appointment {
  const decoded = decodeInternalNotes(r.internal_notes);
  return {
    id: r.id,
    createdAt: r.created_at,
    serviceId: r.service_id,
    serviceName: r.service_name,
    isCustomRequest: Boolean(r.is_custom_request),
    problemDescription: r.problem_description ?? undefined,
    vehicle: {
      make: r.vehicle_make,
      model: r.vehicle_model,
      year: r.vehicle_year ?? undefined,
      fuel: r.vehicle_fuel ?? undefined,
      licensePlate: r.vehicle_license_plate ?? undefined,
    },
    client: {
      firstName: r.client_first_name,
      lastName: r.client_last_name,
      phone: r.client_phone,
      email: r.client_email,
      preferredContact:
        (r.preferred_contact as Appointment["client"]["preferredContact"]) ?? "phone",
    },
    date: r.appointment_date,
    time: r.appointment_time.slice(0, 5),
    status: r.status,
    internalNotes: decoded.internalNotes,
    mileageKm: decoded.mileageKm,
    obdCodes: decoded.obdCodes,
    quoteAmountCents: decoded.quoteAmountCents,
    reminderSentAt: r.reminder_sent_at ?? undefined,
    ipAddress: r.ip_address ?? undefined,
  };
}

function appointmentToRow(a: Appointment): AppointmentRow {
  return {
    id: a.id,
    created_at: a.createdAt,
    service_id: a.serviceId,
    service_name: a.serviceName,
    is_custom_request: a.isCustomRequest,
    problem_description: a.problemDescription || null,
    vehicle_make: a.vehicle.make,
    vehicle_model: a.vehicle.model,
    vehicle_year: a.vehicle.year || null,
    vehicle_fuel: a.vehicle.fuel || null,
    vehicle_license_plate: a.vehicle.licensePlate || null,
    client_first_name: a.client.firstName,
    client_last_name: a.client.lastName,
    client_phone: a.client.phone,
    client_email: a.client.email,
    preferred_contact: a.client.preferredContact,
    appointment_date: a.date,
    appointment_time: a.time,
    status: a.status,
    internal_notes: encodeInternalNotes(a),
    ip_address: a.ipAddress || null,
  };
}

function rowToContact(r: ContactRow): ContactMessage {
  return {
    id: r.id,
    createdAt: r.created_at,
    name: r.name,
    email: r.email,
    phone: r.phone ?? undefined,
    subject: r.subject,
    message: r.message,
    status: r.status,
    ipAddress: r.ip_address ?? undefined,
  };
}

function fail(context: string, error: { message: string }): never {
  console.error(`[SUPABASE ERROR] ${context}:`, error.message);
  throw new Error(`Erreur base de données (${context})`);
}

function supabaseBackend(db: SupabaseClient): StorageBackend {
  return {
    async getAppointments() {
      const { data, error } = await db.from("appointments").select("*");
      if (error) fail("lecture des rendez-vous", error);
      return sortAppointments((data as AppointmentRow[]).map(rowToAppointment));
    },

    async getAppointmentsByDate(date) {
      const { data, error } = await db
        .from("appointments")
        .select("*")
        .eq("appointment_date", date)
        .neq("status", "cancelled");
      if (error) fail("lecture des créneaux", error);
      return (data as AppointmentRow[]).map(rowToAppointment);
    },

    async createAppointment(appointment) {
      const state = await this.getSiteAdminState();
      const capacity = Math.max(1, state.settings.slotCapacity || 1);
      const row = appointmentToRow(appointment);
      const { error } = await db.rpc("book_appointment", {
        p_id: row.id,
        p_created_at: row.created_at,
        p_service_id: row.service_id,
        p_service_name: row.service_name,
        p_is_custom_request: Boolean(row.is_custom_request),
        p_problem_description: row.problem_description,
        p_vehicle_make: row.vehicle_make,
        p_vehicle_model: row.vehicle_model,
        p_vehicle_year: row.vehicle_year,
        p_vehicle_fuel: row.vehicle_fuel,
        p_vehicle_license_plate: row.vehicle_license_plate,
        p_client_first_name: row.client_first_name,
        p_client_last_name: row.client_last_name,
        p_client_phone: row.client_phone,
        p_client_email: row.client_email,
        p_preferred_contact: row.preferred_contact,
        p_appointment_date: row.appointment_date,
        p_appointment_time: row.appointment_time,
        p_status: row.status,
        p_internal_notes: row.internal_notes,
        p_ip_address: row.ip_address,
        p_capacity: capacity,
      });
      if (error) {
        if (error.code === "23505" || error.code === "P0001" || /SLOT_FULL/i.test(error.message)) {
          throw new Error(DOUBLE_BOOKING_ERROR);
        }
        fail("création du rendez-vous", error);
      }
      return appointment;
    },

    async updateAppointmentStatus(id, status, internalNotes) {
      return this.updateAppointmentDetails(id, { status, internalNotes });
    },

    async updateAppointmentDetails(id, patch) {
      const { data: existingData } = await db
        .from("appointments")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (!existingData) return null;
      const current = rowToAppointment(existingData as AppointmentRow);
      const merged: Appointment = {
        ...current,
        status: patch.status ?? current.status,
        internalNotes:
          patch.internalNotes !== undefined ? patch.internalNotes : current.internalNotes,
        mileageKm: patch.mileageKm !== undefined ? patch.mileageKm : current.mileageKm,
        obdCodes: patch.obdCodes !== undefined ? patch.obdCodes : current.obdCodes,
        quoteAmountCents:
          patch.quoteAmountCents !== undefined
            ? patch.quoteAmountCents
            : current.quoteAmountCents,
      };

      const encodedNotes = encodeInternalNotes(merged);

      // Si on réactive un RDV annulé, vérification atomique de la capacité des ponts
      if (current.status === "cancelled" && merged.status !== "cancelled") {
        const state = await this.getSiteAdminState();
        const capacity = Math.max(1, state.settings.slotCapacity || 1);
        const { data: rpcData, error: rpcError } = await db.rpc(
          "update_appointment_status_checked",
          {
            p_id: id,
            p_status: merged.status,
            p_internal_notes: encodedNotes,
            p_capacity: capacity,
          }
        );
        if (rpcError) {
          if (
            rpcError.code === "23505" ||
            rpcError.code === "P0001" ||
            /SLOT_FULL/i.test(rpcError.message)
          ) {
            throw new Error(DOUBLE_BOOKING_ERROR);
          }
          fail("réactivation du rendez-vous", rpcError);
        }
        const row = Array.isArray(rpcData) ? rpcData[0] : rpcData;
        return row ? rowToAppointment(row as AppointmentRow) : null;
      }

      // Si le statut en base a une contrainte CHECK stricte ('pending','confirmed','cancelled','completed'),
      // on replie 'in_progress' / 'ready' sur 'confirmed' en base si la contrainte lève une erreur 23514.
      const dbPatch: Partial<AppointmentRow> = {
        status: merged.status,
        internal_notes: encodedNotes,
      };

      let { data, error } = await db
        .from("appointments")
        .update(dbPatch)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error && error.code === "23514") {
        const fallbackStatus =
          merged.status === "in_progress" || merged.status === "ready"
            ? "confirmed"
            : merged.status;
        const retry = await db
          .from("appointments")
          .update({ ...dbPatch, status: fallbackStatus })
          .eq("id", id)
          .select("*")
          .maybeSingle();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        if (error.code === "23505") throw new Error(DOUBLE_BOOKING_ERROR);
        fail("mise à jour du rendez-vous", error);
      }
      return data ? rowToAppointment(data as AppointmentRow) : null;
    },

    async markAppointmentReminderSent(id, sentAt) {
      const { error } = await db
        .from("appointments")
        .update({ reminder_sent_at: sentAt })
        .eq("id", id);
      if (error) fail("marquage du rappel", error);
    },

    async deleteAppointment(id) {
      const { data, error } = await db
        .from("appointments")
        .delete()
        .eq("id", id)
        .select("id");
      if (error) fail("suppression du rendez-vous", error);
      return (data?.length ?? 0) > 0;
    },

    async getContacts() {
      const { data, error } = await db
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) fail("lecture des messages", error);
      return (data as ContactRow[]).map(rowToContact);
    },

    async createContact(contact) {
      const row: ContactRow = {
        id: contact.id,
        created_at: contact.createdAt,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        subject: contact.subject,
        message: contact.message,
        status: contact.status,
        ip_address: contact.ipAddress || null,
      };
      const { error } = await db.from("contact_messages").insert(row);
      if (error) fail("enregistrement du message", error);
      return contact;
    },

    async updateContactStatus(id, status) {
      const { data, error } = await db
        .from("contact_messages")
        .update({ status })
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) fail("mise à jour du message", error);
      return data ? rowToContact(data as ContactRow) : null;
    },

    async deleteContact(id) {
      const { data, error } = await db
        .from("contact_messages")
        .delete()
        .eq("id", id)
        .select("id");
      if (error) fail("suppression du message", error);
      return (data?.length ?? 0) > 0;
    },

    async getBlockedDates() {
      const { data, error } = await db
        .from("blocked_dates")
        .select("date")
        .order("date");
      if (error) fail("lecture des fermetures", error);
      return (data as { date: string }[]).map((d) => d.date);
    },

    async toggleBlockedDate(date, reason) {
      const { data, error } = await db
        .from("blocked_dates")
        .delete()
        .eq("date", date)
        .select("date");
      if (error) fail("modification des fermetures", error);
      if ((data?.length ?? 0) > 0) return false;
      const { error: insertError } = await db
        .from("blocked_dates")
        .insert({ date, reason: reason || null });
      if (insertError) fail("modification des fermetures", insertError);
      return true;
    },

    async getSiteAdminState() {
      const blockedDates = await this.getBlockedDates();
      // Essayer de lire la table site_settings si elle existe dans Supabase, sinon repli local
      try {
        const { data, error } = await db
          .from("site_settings")
          .select("data")
          .eq("id", "main")
          .maybeSingle();
        if (!error && data?.data) {
          return mergeSiteAdminState(data.data as Partial<SiteAdminState>, blockedDates);
        }
      } catch {
        // Table optionnelle absente : repli sur fichier local ou défauts
      }
      if (!process.env.VERCEL) {
        const local = readFile();
        return mergeSiteAdminState(local.siteAdmin, blockedDates);
      }
      return mergeSiteAdminState(undefined, blockedDates);
    },

    async saveSiteAdminState(updater) {
      const current = await this.getSiteAdminState();
      const next = updater(current);
      const { error } = await db
        .from("site_settings")
        .upsert({ id: "main", data: next, updated_at: new Date().toISOString() });
      if (error) {
        // En local, repli sur le fichier JSON ; sur Vercel, on ne prétend pas avoir enregistré
        if (process.env.VERCEL) fail("enregistrement des réglages (table site_settings)", error);
        console.error("[SUPABASE] site_settings indisponible, repli local :", error.message);
      }
      if (!process.env.VERCEL) {
        const local = readFile();
        local.siteAdmin = next;
        local.blockedDates = next.closures.map((c) => c.date);
        writeFile(local);
      }
      return next;
    },
  };
}

// ============================================================================
// Implémentation Fichier JSON Local
// ============================================================================

const fileBackend: StorageBackend = {
  async getAppointments() {
    return sortAppointments(readFile().appointments);
  },

  async getAppointmentsByDate(date) {
    return readFile().appointments.filter(
      (apt) => apt.date === date && apt.status !== "cancelled"
    );
  },

  async createAppointment(appointment) {
    const data = readFile();
    const state = mergeSiteAdminState(data.siteAdmin, data.blockedDates);
    const sameSlotCount = data.appointments.filter(
      (apt) =>
        apt.date === appointment.date &&
        apt.time === appointment.time &&
        apt.status !== "cancelled"
    ).length;
    if (sameSlotCount >= Math.max(1, state.settings.slotCapacity)) {
      throw new Error(DOUBLE_BOOKING_ERROR);
    }
    data.appointments.push(appointment);
    writeFile(data);
    return appointment;
  },

  async updateAppointmentStatus(id, status, internalNotes) {
    return this.updateAppointmentDetails(id, { status, internalNotes });
  },

  async updateAppointmentDetails(id, patch) {
    const data = readFile();
    const apt = data.appointments.find((a) => a.id === id);
    if (!apt) return null;
    if (apt.status === "cancelled" && patch.status && patch.status !== "cancelled") {
      const state = mergeSiteAdminState(data.siteAdmin, data.blockedDates);
      const sameSlotCount = data.appointments.filter(
        (other) =>
          other.id !== id &&
          other.date === apt.date &&
          other.time === apt.time &&
          other.status !== "cancelled"
      ).length;
      if (sameSlotCount >= Math.max(1, state.settings.slotCapacity)) {
        throw new Error(DOUBLE_BOOKING_ERROR);
      }
    }
    if (patch.status !== undefined) apt.status = patch.status;
    if (patch.internalNotes !== undefined) apt.internalNotes = patch.internalNotes;
    if (patch.mileageKm !== undefined) apt.mileageKm = patch.mileageKm;
    if (patch.obdCodes !== undefined) apt.obdCodes = patch.obdCodes;
    if (patch.quoteAmountCents !== undefined)
      apt.quoteAmountCents = patch.quoteAmountCents;
    writeFile(data);
    return apt;
  },

  async markAppointmentReminderSent(id, sentAt) {
    const data = readFile();
    const apt = data.appointments.find((a) => a.id === id);
    if (!apt) return;
    apt.reminderSentAt = sentAt;
    writeFile(data);
  },

  async deleteAppointment(id) {
    const data = readFile();
    const prevLength = data.appointments.length;
    data.appointments = data.appointments.filter((apt) => apt.id !== id);
    if (data.appointments.length === prevLength) return false;
    writeFile(data);
    return true;
  },

  async getContacts() {
    return readFile().contacts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async createContact(contact) {
    const data = readFile();
    data.contacts.push(contact);
    writeFile(data);
    return contact;
  },

  async updateContactStatus(id, status) {
    const data = readFile();
    const msg = data.contacts.find((c) => c.id === id);
    if (!msg) return null;
    msg.status = status;
    writeFile(data);
    return msg;
  },

  async deleteContact(id) {
    const data = readFile();
    const prev = data.contacts.length;
    data.contacts = data.contacts.filter((c) => c.id !== id);
    if (data.contacts.length === prev) return false;
    writeFile(data);
    return true;
  },

  async getBlockedDates() {
    const data = readFile();
    const state = mergeSiteAdminState(data.siteAdmin, data.blockedDates);
    return state.closures.map((c) => c.date);
  },

  async toggleBlockedDate(date, reason) {
    const data = readFile();
    const state = mergeSiteAdminState(data.siteAdmin, data.blockedDates);
    const exists = state.closures.some((c) => c.date === date);
    if (exists) {
      state.closures = state.closures.filter((c) => c.date !== date);
      data.blockedDates = data.blockedDates.filter((d) => d !== date);
    } else {
      state.closures.push({
        id: `clos-${date}`,
        date,
        reason: reason || "Fermeture exceptionnelle de l'atelier",
      });
      if (!data.blockedDates.includes(date)) data.blockedDates.push(date);
    }
    data.siteAdmin = state;
    writeFile(data);
    return !exists;
  },

  async getSiteAdminState() {
    const data = readFile();
    return mergeSiteAdminState(data.siteAdmin, data.blockedDates);
  },

  async saveSiteAdminState(updater) {
    const data = readFile();
    const current = mergeSiteAdminState(data.siteAdmin, data.blockedDates);
    const next = updater(current);
    data.siteAdmin = next;
    data.blockedDates = next.closures.map((c) => c.date);
    writeFile(data);
    return next;
  },
};

// ============================================================================
// Sélection du backend
// ============================================================================

let backend: StorageBackend | null = null;

function getBackend(): StorageBackend {
  if (backend) return backend;

  const db = getSupabaseAdmin();

  if (db) {
    backend = supabaseBackend(db);
  } else if (process.env.VERCEL) {
    throw new Error(
      "Base de données non configurée : renseignez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans Vercel."
    );
  } else {
    backend = fileBackend;
  }
  return backend;
}

export const storage: StorageBackend = {
  getAppointments: () => getBackend().getAppointments(),
  getAppointmentsByDate: (date) => getBackend().getAppointmentsByDate(date),
  createAppointment: (a) => getBackend().createAppointment(a),
  updateAppointmentStatus: (id, status, notes) =>
    getBackend().updateAppointmentStatus(id, status, notes),
  updateAppointmentDetails: (id, patch) =>
    getBackend().updateAppointmentDetails(id, patch),
  markAppointmentReminderSent: (id, sentAt) =>
    getBackend().markAppointmentReminderSent(id, sentAt),
  deleteAppointment: (id) => getBackend().deleteAppointment(id),
  getContacts: () => getBackend().getContacts(),
  createContact: (c) => getBackend().createContact(c),
  updateContactStatus: (id, status) => getBackend().updateContactStatus(id, status),
  deleteContact: (id) => getBackend().deleteContact(id),
  getBlockedDates: () => getBackend().getBlockedDates(),
  toggleBlockedDate: (date, reason) => getBackend().toggleBlockedDate(date, reason),
  getSiteAdminState: () => getBackend().getSiteAdminState(),
  saveSiteAdminState: (updater) => getBackend().saveSiteAdminState(updater),
};
