"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  isAdminConfigured,
  requireAdmin,
  setAdminSession,
  validatePassword,
} from "@/lib/auth";
import { rateLimit, resetRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/validation";
import { storage } from "@/lib/storage";
import { saveUploadedImage } from "@/lib/upload";
import { sendAppointmentStatusEmail } from "@/lib/email";
import { Appointment, AppointmentStatus } from "@/types";

function invalidateSite() {
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/prestations");
  revalidatePath("/le-garage");
  revalidatePath("/contact");
  revalidatePath("/prendre-rendez-vous");
}

function slugify(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || `srv-${Date.now()}`
  );
}

export type LoginState = { error?: string };

export async function loginAdmin(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const rlKey = `admin-login:${ip}`;

  if (!isAdminConfigured()) {
    return {
      error:
        "Compte administrateur non configuré (vérifiez ADMIN_PASSWORD dans .env.local).",
    };
  }

  if (!(await rateLimit(rlKey, 8, 15 * 60))) {
    return {
      error: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
    };
  }

  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const expectedEmail = process.env.ADMIN_EMAIL?.trim() ?? "";
  const emailOk =
    !expectedEmail || email.toLowerCase() === expectedEmail.toLowerCase();
  const passOk = emailOk && password.length <= 200 && validatePassword(password);

  if (!emailOk || !passOk) {
    return { error: "Identifiants administrateur incorrects." };
  }

  const sessionOk = await setAdminSession();
  if (!sessionOk) {
    return { error: "Impossible d'ouvrir la session administrateur." };
  }

  await resetRateLimit(rlKey);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

/* ── 0 & 1. Suivi Atelier (Ponts) & Rendez-vous ──────────────────────── */

const VALID_APPOINTMENT_STATUSES: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "in_progress",
  "ready",
  "completed",
  "cancelled",
];

export async function updateAppointmentStatusAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as AppointmentStatus;
  if (!id || !VALID_APPOINTMENT_STATUSES.includes(status)) return;

  const updated = await storage.updateAppointmentDetails(id, { status });
  if (
    updated &&
    (status === "confirmed" || status === "ready" || status === "cancelled")
  ) {
    const state = await storage.getSiteAdminState();
    await sendAppointmentStatusEmail(updated, state.settings.name);
  }

  invalidateSite();
}

export async function updateAppointmentMechanicSheet(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  const mileageKm = String(formData.get("mileageKm") ?? "").trim();
  const obdCodes = String(formData.get("obdCodes") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();
  const quoteStr = String(formData.get("quoteAmount") ?? "")
    .trim()
    .replace(",", ".");
  const quoteAmountCents =
    quoteStr !== "" && !Number.isNaN(Number(quoteStr))
      ? Math.round(Number(quoteStr) * 100)
      : null;

  const statusRaw = String(formData.get("status") ?? "").trim() as AppointmentStatus;
  const status = VALID_APPOINTMENT_STATUSES.includes(statusRaw)
    ? statusRaw
    : undefined;

  await storage.updateAppointmentDetails(id, {
    ...(status ? { status } : {}),
    mileageKm,
    obdCodes,
    internalNotes,
    quoteAmountCents,
  });

  invalidateSite();
}

export async function createWorkshopIntake(formData: FormData) {
  await requireAdmin();
  const firstName = String(formData.get("firstName") ?? "").trim() || "Client";
  const lastName = String(formData.get("lastName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const make = String(formData.get("make") ?? "").trim();
  const model = String(formData.get("model") ?? "").trim();
  const year = String(formData.get("year") ?? "").trim();
  const fuel = String(formData.get("fuel") ?? "Essence").trim();
  const licensePlate = String(formData.get("licensePlate") ?? "")
    .trim()
    .toUpperCase();
  const serviceId = String(formData.get("serviceId") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const time = String(formData.get("time") ?? "09:00").trim();
  const problemDescription = String(
    formData.get("problemDescription") ?? ""
  ).trim();
  const mileageKm = String(formData.get("mileageKm") ?? "").trim();
  const obdCodes = String(formData.get("obdCodes") ?? "").trim();
  const internalNotes = String(formData.get("internalNotes") ?? "").trim();
  const quoteStr = String(formData.get("quoteAmount") ?? "")
    .trim()
    .replace(",", ".");
  const quoteAmountCents =
    quoteStr !== "" && !Number.isNaN(Number(quoteStr))
      ? Math.round(Number(quoteStr) * 100)
      : null;
  const statusRaw = String(
    formData.get("status") ?? "in_progress"
  ).trim() as AppointmentStatus;
  const status = VALID_APPOINTMENT_STATUSES.includes(statusRaw)
    ? statusRaw
    : "in_progress";

  if (!lastName || !phone || !make || !model || !date) return;

  const state = await storage.getSiteAdminState();
  const srv = state.services.find((s) => s.id === serviceId);
  const serviceName = srv ? srv.title : serviceId || "Intervention Atelier";

  const apt: Appointment = {
    id: `RA-${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(),
    serviceId: srv?.id ?? "custom-intake",
    serviceName,
    isCustomRequest: !srv,
    problemDescription: problemDescription || undefined,
    vehicle: {
      make,
      model,
      year: year || undefined,
      fuel: fuel || undefined,
      licensePlate: licensePlate || undefined,
    },
    client: {
      firstName,
      lastName,
      phone,
      email: email || "atelier@runauto-marseille.fr",
      preferredContact: "phone",
    },
    date,
    time,
    status,
    mileageKm: mileageKm || undefined,
    obdCodes: obdCodes || undefined,
    quoteAmountCents,
    internalNotes: internalNotes || undefined,
  };

  try {
    await storage.createAppointment(apt);
  } catch {
    // En cas de créneau déjà occupé lors d'une saisie manuelle comptoir, décaler d'une minute symbolique ou enregistrer
    await storage.createAppointment({
      ...apt,
      time: `${time.slice(0, 3)}${String(Math.floor(Math.random() * 50) + 10).padStart(2, "0")}`,
    });
  }

  invalidateSite();
}

export async function deleteAppointmentAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await storage.deleteAppointment(id);
  invalidateSite();
}

/* ── 2. Messages & Demandes de Devis ─────────────────────────────────── */

export async function toggleMessageStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "read").trim() as
    | "new"
    | "read"
    | "replied";
  if (!id || !["new", "read", "replied"].includes(status)) return;
  await storage.updateContactStatus(id, status);
  revalidatePath("/admin");
}

export async function deleteContactMessageAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;
  await storage.deleteContact(id);
  revalidatePath("/admin");
}

/* ── 3. Catalogue des Prestations & Pôles d'Expertise ────────────────── */

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sort = Number(formData.get("sort") ?? 0);
  if (!name) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    categories: [
      ...prev.categories,
      {
        id: name,
        name,
        slug: slugify(name),
        description,
        sort,
      },
    ].sort((a, b) => a.sort - b.sort),
  }));
  invalidateSite();
}

export async function updateCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const sort = Number(formData.get("sort") ?? 0);
  if (!id || !name) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    categories: prev.categories
      .map((c) =>
        c.id === id ? { ...c, name, slug: slugify(name), description, sort } : c
      )
      .sort((a, b) => a.sort - b.sort),
  }));
  invalidateSite();
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    categories: prev.categories.filter((c) => c.id !== id),
  }));
  invalidateSite();
}

export async function createServiceItem(formData: FormData) {
  await requireAdmin();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const priceNotice =
    String(formData.get("priceNotice") ?? "").trim() || "Sur devis gratuit";
  const priceStr = String(formData.get("price") ?? "").trim().replace(",", ".");
  const priceCents =
    priceStr !== "" && !Number.isNaN(Number(priceStr))
      ? Math.round(Number(priceStr) * 100)
      : null;
  const estimatedDurationMinutes = Math.max(
    15,
    Number(formData.get("estimatedDurationMinutes") ?? 60)
  );
  const durationLabel = String(formData.get("durationLabel") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const equipmentNote = String(formData.get("equipmentNote") ?? "").trim();
  const compatibleFuels = formData
    .getAll("compatibleFuels")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const featured = formData.get("featured") === "on";
  const available = formData.get("available") !== "off";
  const file = formData.get("imageFile") as File | null;

  if (!categoryId || !title) return;
  const uploaded = await saveUploadedImage(file);

  await storage.saveSiteAdminState((prev) => {
    const slug = slugify(title);
    return {
      ...prev,
      services: [
        ...prev.services,
        {
          id: `srv-${slug}-${Date.now().toString(36)}`,
          slug,
          categoryId,
          title,
          shortDescription,
          priceNotice,
          priceCents,
          estimatedDurationMinutes,
          durationLabel,
          badge,
          equipmentNote,
          compatibleFuels,
          image: uploaded || "/images/atelier-light.jpg",
          featured,
          available,
          sort: prev.services.length + 1,
        },
      ],
    };
  });
  invalidateSite();
}

export async function updateServiceItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const shortDescription = String(formData.get("shortDescription") ?? "").trim();
  const priceNotice =
    String(formData.get("priceNotice") ?? "").trim() || "Sur devis gratuit";
  const priceStr = String(formData.get("price") ?? "").trim().replace(",", ".");
  const priceCents =
    priceStr !== "" && !Number.isNaN(Number(priceStr))
      ? Math.round(Number(priceStr) * 100)
      : null;
  const estimatedDurationMinutes = Math.max(
    15,
    Number(formData.get("estimatedDurationMinutes") ?? 60)
  );
  const durationLabel = String(formData.get("durationLabel") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const equipmentNote = String(formData.get("equipmentNote") ?? "").trim();
  const compatibleFuels = formData
    .getAll("compatibleFuels")
    .map((v) => String(v).trim())
    .filter(Boolean);
  const featured = formData.get("featured") === "on";
  const available = formData.get("available") === "on";
  const sort = Number(formData.get("sort") ?? 0);
  const clearImage = formData.get("clearImage") === "on";
  const file = formData.get("imageFile") as File | null;

  if (!id || !categoryId || !title) return;
  const uploaded = await saveUploadedImage(file);

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    services: prev.services
      .map((s) =>
        s.id === id
          ? {
              ...s,
              categoryId,
              title,
              shortDescription,
              priceNotice,
              priceCents,
              estimatedDurationMinutes,
              durationLabel,
              badge,
              equipmentNote,
              compatibleFuels,
              featured,
              available,
              sort,
              ...(clearImage ? { image: "" } : uploaded ? { image: uploaded } : {}),
            }
          : s
      )
      .sort((a, b) => a.sort - b.sort),
  }));
  invalidateSite();
}

export async function deleteServiceItem(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    services: prev.services.filter((s) => s.id !== id),
  }));
  invalidateSite();
}

/* ── 3bis. Forfaits & Offres Atelier ─────────────────────────────────── */

export async function saveWorkshopOffer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const badge = String(formData.get("badge") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceStr = String(formData.get("price") ?? "").trim().replace(",", ".");
  const priceCents =
    priceStr !== "" && !Number.isNaN(Number(priceStr))
      ? Math.round(Number(priceStr) * 100)
      : null;
  const active = id ? formData.get("active") === "on" : true;
  const sort = Number(formData.get("sort") ?? 0);
  if (!title) return;

  await storage.saveSiteAdminState((prev) => {
    if (id) {
      return {
        ...prev,
        offers: prev.offers
          .map((o) =>
            o.id === id
              ? { ...o, title, badge, description, priceCents, active, sort }
              : o
          )
          .sort((a, b) => a.sort - b.sort),
      };
    }
    return {
      ...prev,
      offers: [
        ...prev.offers,
        {
          id: `offer-${Date.now().toString(36)}`,
          title,
          badge,
          description,
          priceCents,
          active: true,
          sort: prev.offers.length + 1,
        },
      ],
    };
  });
  invalidateSite();
}

export async function deleteWorkshopOffer(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    offers: prev.offers.filter((o) => o.id !== id),
  }));
  invalidateSite();
}

/* ── 4. Horaires, Capacité des Ponts & Fermetures Exceptionnelles ───── */

export async function updateHoursAndCapacity(formData: FormData) {
  await requireAdmin();
  const slotCapacity = Math.max(1, Number(formData.get("slotCapacity") ?? 1));
  const bookingLeadHours = Math.max(
    1,
    Number(formData.get("bookingLeadHours") ?? 2)
  );

  const hours = [1, 2, 3, 4, 5, 6, 0].map((d) => ({
    dayOfWeek: d,
    openTime: String(formData.get(`open_${d}`) ?? "09:00"),
    closeTime: String(formData.get(`close_${d}`) ?? "19:00"),
    closed: formData.get(`closed_${d}`) === "on",
  }));

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    settings: {
      ...prev.settings,
      slotCapacity,
      bookingLeadHours,
    },
    hours,
  }));
  invalidateSite();
}

export async function addClosure(formData: FormData) {
  await requireAdmin();
  const date = String(formData.get("date") ?? "").trim();
  const reason =
    String(formData.get("reason") ?? "").trim() ||
    "Fermeture exceptionnelle de l'atelier";
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return;

  await storage.saveSiteAdminState((prev) => {
    const filtered = prev.closures.filter((c) => c.date !== date);
    return {
      ...prev,
      closures: [...filtered, { id: `clos-${date}`, date, reason }].sort((a, b) =>
        a.date.localeCompare(b.date)
      ),
    };
  });
  invalidateSite();
}

export async function deleteClosure(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  if (!id && !date) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    closures: prev.closures.filter((c) => c.id !== id && c.date !== date),
  }));
  invalidateSite();
}

/* ── 5. Plateformes Partenaires & Réglages Généraux ─────────────────── */

export async function savePartnerPlatform(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const active = id ? formData.get("active") === "on" : true;
  const sort = Number(formData.get("sort") ?? 0);
  if (!name || !url) return;

  await storage.saveSiteAdminState((prev) => {
    if (id) {
      return {
        ...prev,
        platforms: prev.platforms.map((p) =>
          p.id === id ? { ...p, name, url, active, sort } : p
        ),
      };
    }
    return {
      ...prev,
      platforms: [
        ...prev.platforms,
        {
          id: `plat-${Date.now().toString(36)}`,
          name,
          url,
          active: true,
          sort: prev.platforms.length + 1,
        },
      ],
    };
  });
  invalidateSite();
}

export async function deletePartnerPlatform(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    platforms: prev.platforms.filter((p) => p.id !== id),
  }));
  invalidateSite();
}

export async function updateSettings(formData: FormData) {
  await requireAdmin();
  const heroFile = formData.get("heroImageFile") as File | null;
  const workshopFile = formData.get("workshopImageFile") as File | null;
  const clearHero = formData.get("clearHeroImage") === "on";
  const clearWorkshop = formData.get("clearWorkshopImage") === "on";

  const heroUploaded = await saveUploadedImage(heroFile);
  const workshopUploaded = await saveUploadedImage(workshopFile);

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    settings: {
      ...prev.settings,
      name: String(formData.get("name") ?? "Run Auto").trim(),
      phone: String(formData.get("phone") ?? "06 18 31 89 15").trim(),
      whatsapp: String(formData.get("whatsapp") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      street: String(formData.get("street") ?? "52 boulevard de Roux").trim(),
      postalCode: String(formData.get("postalCode") ?? "13004").trim(),
      city: String(formData.get("city") ?? "Marseille").trim(),
      latitude: Number(formData.get("latitude") ?? 43.3082),
      longitude: Number(formData.get("longitude") ?? 5.4053),
      onlineBookingEnabled: formData.get("onlineBookingEnabled") === "on",
      flagshipEquipment: String(
        formData.get("flagshipEquipment") ?? "TOPDON Phoenix Max"
      ).trim(),
      idGaragesRef: String(formData.get("idGaragesRef") ?? "GA7683").trim(),
      verifiedRating: Number(
        String(formData.get("verifiedRating") ?? "4.7").replace(",", ".")
      ),
      verifiedReviewCount: String(
        formData.get("verifiedReviewCount") ?? "68"
      ).trim(),
      supportedBrands: String(formData.get("supportedBrands") ?? "").trim(),
      announcement: String(formData.get("announcement") ?? "").trim(),
      parkingInfo: String(formData.get("parkingInfo") ?? "").trim(),
      transportInfo: String(formData.get("transportInfo") ?? "").trim(),
      warrantyNote: String(formData.get("warrantyNote") ?? "").trim(),
      googleMapsUrl: String(formData.get("googleMapsUrl") ?? "").trim(),
      googleReviewUrl: String(formData.get("googleReviewUrl") ?? "").trim(),
      instagram: String(formData.get("instagram") ?? "").trim(),
      facebook: String(formData.get("facebook") ?? "").trim(),
      tiktok: String(formData.get("tiktok") ?? "").trim(),
      snapchat: String(formData.get("snapchat") ?? "").trim(),
      ...(clearHero
        ? { heroImage: "/images/hero-performance-light.jpg" }
        : heroUploaded
          ? { heroImage: heroUploaded }
          : {}),
      ...(clearWorkshop
        ? { workshopImage: "/images/atelier-light.jpg" }
        : workshopUploaded
          ? { workshopImage: workshopUploaded }
          : {}),
    },
  }));
  invalidateSite();
}

/* ── 6. Galerie Photos Atelier & Avis Clients Vérifiés ──────────────── */

export async function addGalleryPhoto(formData: FormData) {
  await requireAdmin();
  const alt = String(formData.get("alt") ?? "").trim();
  const vehicleTag = String(formData.get("vehicleTag") ?? "").trim();
  const file = formData.get("file") as File | null;
  if (!alt || !file || file.size === 0) return;

  const src = await saveUploadedImage(file);
  if (!src) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    gallery: [
      {
        id: `gal-${Date.now().toString(36)}`,
        src,
        alt,
        vehicleTag: vehicleTag || undefined,
        sort: prev.gallery.length + 1,
        createdAt: new Date().toISOString(),
      },
      ...prev.gallery,
    ],
  }));
  invalidateSite();
}

export async function deleteGalleryPhoto(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    gallery: prev.gallery.filter((g) => g.id !== id),
  }));
  invalidateSite();
}

export async function addGarageReview(formData: FormData) {
  await requireAdmin();
  const author = String(formData.get("author") ?? "").trim();
  const vehicle =
    String(formData.get("vehicle") ?? "").trim() || "Client Atelier Run Auto";
  const rating = Math.min(5, Math.max(1, Number(formData.get("rating") ?? 5)));
  const source = String(formData.get("source") ?? "idGarages").trim();
  const date =
    String(formData.get("date") ?? "").trim() ||
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  const comment = String(formData.get("comment") ?? "").trim();
  if (!author || !comment) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    reviews: [
      {
        id: `rev-${Date.now().toString(36)}`,
        author,
        vehicle,
        rating,
        source,
        date,
        comment,
        createdAt: new Date().toISOString(),
      },
      ...prev.reviews,
    ],
  }));
  invalidateSite();
}

export async function deleteGarageReview(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    reviews: prev.reviews.filter((r) => r.id !== id),
  }));
  invalidateSite();
}
