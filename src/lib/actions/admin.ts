"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  clearAdminSession,
  isAdminConfigured,
  MIN_NEW_PASSWORD_LENGTH,
  requireAdmin,
  setAdminSession,
  updateAdminPassword,
  validatePassword,
} from "@/lib/auth";
import { rateLimit, resetRateLimit } from "@/lib/rateLimit";
import {
  clampNumber,
  cleanString,
  DATE_REGEX,
  getClientIp,
  TIME_REGEX,
  validateHttpsUrl,
} from "@/lib/validation";
import { storage } from "@/lib/storage";
import { saveUploadedImage } from "@/lib/upload";
import { sendAppointmentStatusEmail } from "@/lib/email";
import { SITE_TAG } from "@/lib/siteData";
import { Appointment, AppointmentStatus } from "@/types";

function invalidateSite() {
  updateTag(SITE_TAG);
  revalidatePath("/", "layout");
  revalidatePath("/admin");
  revalidatePath("/prestations", "layout");
  revalidatePath("/le-garage");
  revalidatePath("/contact");
  revalidatePath("/prendre-rendez-vous");
  revalidatePath("/faq");
  revalidatePath("/mentions-legales");
  revalidatePath("/politique-confidentialite");
  revalidatePath("/sitemap.xml");
}

function slugify(s: string) {
  return (
    s
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `srv-${Date.now()}`
  );
}

function parseOptionalPriceCents(raw: unknown): number | null {
  const str = cleanString(raw, 20).replace(",", ".");
  if (!str) return null;
  const n = Number(str);
  if (Number.isNaN(n) || !Number.isFinite(n) || n < 0 || n > 100000) return null;
  return Math.round(n * 100);
}

export type LoginState = { error?: string };

export async function loginAdmin(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const rlKey = `admin-login:${ip}`;

  if (!(await rateLimit(rlKey, 8, 15 * 60))) {
    return {
      error: "Trop de tentatives de connexion. Réessayez dans 15 minutes.",
    };
  }

  const email = cleanString(formData.get("email"), 120);
  const password = String(formData.get("password") ?? "");
  const expectedEmail = process.env.ADMIN_EMAIL?.trim() ?? "";
  const emailOk =
    !expectedEmail || email.toLowerCase() === expectedEmail.toLowerCase();

  try {
    if (!(await isAdminConfigured())) {
      return {
        error:
          "Compte administrateur non configuré (vérifiez ADMIN_PASSWORD dans les variables d'environnement).",
      };
    }

    const passOk =
      emailOk && password.length <= 200 && (await validatePassword(password));
    if (!emailOk || !passOk) {
      return { error: "Identifiants administrateur incorrects." };
    }

    const sessionOk = await setAdminSession();
    if (!sessionOk) {
      return { error: "Impossible d'ouvrir la session administrateur." };
    }
  } catch {
    // Base de données momentanément indisponible : on refuse sans révéler de détail
    return { error: "Connexion impossible pour le moment. Réessayez dans quelques minutes." };
  }

  await resetRateLimit(rlKey);
  redirect("/admin");
}

export async function logoutAdmin() {
  await clearAdminSession();
  redirect("/admin/login");
}

export type PasswordChangeState = { error?: string; success?: string };

export async function changePasswordAction(
  _prev: PasswordChangeState,
  formData: FormData
): Promise<PasswordChangeState> {
  await requireAdmin();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: "Veuillez remplir les trois champs." };
  }
  if (newPassword.length < MIN_NEW_PASSWORD_LENGTH) {
    return {
      error: `Le nouveau mot de passe doit contenir au moins ${MIN_NEW_PASSWORD_LENGTH} caractères.`,
    };
  }
  if (newPassword !== confirmPassword) {
    return { error: "La confirmation ne correspond pas au nouveau mot de passe." };
  }

  try {
    const res = await updateAdminPassword(currentPassword, newPassword);
    if (!res.ok) return { error: res.error };
    return {
      success:
        "Mot de passe mis à jour et chiffré. Toutes les autres sessions ont été déconnectées.",
    };
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : "Impossible d'enregistrer le nouveau mot de passe.";
    return { error: msg };
  }
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
  const id = cleanString(formData.get("id"), 80);
  const status = cleanString(formData.get("status"), 20) as AppointmentStatus;
  if (!id || !VALID_APPOINTMENT_STATUSES.includes(status)) return;

  let updated: Appointment | null;
  try {
    updated = await storage.updateAppointmentDetails(id, { status });
  } catch (err: unknown) {
    const msg =
      err instanceof Error ? err.message : "Impossible de modifier ce rendez-vous.";
    redirect(`/admin?adminError=${encodeURIComponent(msg)}#sec-reservations`);
  }

  if (
    updated &&
    (status === "confirmed" ||
      status === "ready" ||
      status === "completed" ||
      status === "cancelled")
  ) {
    const state = await storage.getSiteAdminState();
    await sendAppointmentStatusEmail(updated, state.settings);
  }

  invalidateSite();
}

export async function updateAppointmentMechanicSheet(formData: FormData) {
  await requireAdmin();
  const id = cleanString(formData.get("id"), 80);
  if (!id) return;

  const mileageKm = cleanString(formData.get("mileageKm"), 40);
  const obdCodes = cleanString(formData.get("obdCodes"), 200);
  const internalNotes = cleanString(formData.get("internalNotes"), 2000);
  const quoteAmountCents = parseOptionalPriceCents(formData.get("quoteAmount"));

  const statusRaw = cleanString(formData.get("status"), 20) as AppointmentStatus;
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
  const firstName = cleanString(formData.get("firstName"), 60) || "Client";
  const lastName = cleanString(formData.get("lastName"), 60);
  const phone = cleanString(formData.get("phone"), 25);
  const email = cleanString(formData.get("email"), 120).toLowerCase();
  const make = cleanString(formData.get("make"), 60);
  const model = cleanString(formData.get("model"), 80);
  const year = cleanString(formData.get("year"), 4);
  const fuel = cleanString(formData.get("fuel"), 40) || "Essence";
  const licensePlate = cleanString(formData.get("licensePlate"), 20).toUpperCase();
  const serviceId = cleanString(formData.get("serviceId"), 80);
  const date = cleanString(formData.get("date"), 10);
  const time = cleanString(formData.get("time"), 5) || "09:00";
  const problemDescription = cleanString(formData.get("problemDescription"), 2000);
  const mileageKm = cleanString(formData.get("mileageKm"), 40);
  const obdCodes = cleanString(formData.get("obdCodes"), 200);
  const internalNotes = cleanString(formData.get("internalNotes"), 2000);
  const quoteAmountCents = parseOptionalPriceCents(formData.get("quoteAmount"));
  const statusRaw = cleanString(
    formData.get("status"),
    20
  ) as AppointmentStatus;
  const status = VALID_APPOINTMENT_STATUSES.includes(statusRaw)
    ? statusRaw
    : "in_progress";

  if (!lastName || !phone || !make || !model || !DATE_REGEX.test(date) || !TIME_REGEX.test(time)) {
    return;
  }

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
      email: email || state.settings.email || "atelier@runauto-marseille.fr",
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Créneau complet.";
    redirect(`/admin?adminError=${encodeURIComponent(msg)}#sec-atelier`);
  }

  invalidateSite();
}

export async function deleteAppointmentAction(formData: FormData) {
  await requireAdmin();
  const id = cleanString(formData.get("id"), 80);
  if (!id) return;
  await storage.deleteAppointment(id);
  invalidateSite();
}

/* ── 2. Messages & Demandes de Devis ─────────────────────────────────── */

export async function toggleMessageStatus(formData: FormData) {
  await requireAdmin();
  const id = cleanString(formData.get("id"), 80);
  const status = cleanString(formData.get("status"), 20) as
    | "new"
    | "read"
    | "replied";
  if (!id || !["new", "read", "replied"].includes(status)) return;
  await storage.updateContactStatus(id, status);
  revalidatePath("/admin");
}

export async function deleteContactMessageAction(formData: FormData) {
  await requireAdmin();
  const id = cleanString(formData.get("id"), 80);
  if (!id) return;
  await storage.deleteContact(id);
  revalidatePath("/admin");
}

/* ── 3. Catalogue des Prestations & Pôles d'Expertise ────────────────── */

export async function createCategory(formData: FormData) {
  await requireAdmin();
  const name = cleanString(formData.get("name"), 80);
  const description = cleanString(formData.get("description"), 300);
  const sort = Math.round(clampNumber(formData.get("sort"), 0, 1000, 0));
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
  const id = cleanString(formData.get("id"), 80);
  const name = cleanString(formData.get("name"), 80);
  const description = cleanString(formData.get("description"), 300);
  const sort = Math.round(clampNumber(formData.get("sort"), 0, 1000, 0));
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
  const id = cleanString(formData.get("id"), 80);
  if (!id) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    categories: prev.categories.filter((c) => c.id !== id),
  }));
  invalidateSite();
}

export async function createServiceItem(formData: FormData) {
  await requireAdmin();
  const categoryId = cleanString(formData.get("categoryId"), 80);
  const title = cleanString(formData.get("title"), 120);
  const shortDescription = cleanString(formData.get("shortDescription"), 400);
  const priceNotice =
    cleanString(formData.get("priceNotice"), 80) || "Sur devis gratuit";
  const priceCents = parseOptionalPriceCents(formData.get("price"));
  const estimatedDurationMinutes = Math.round(
    clampNumber(formData.get("estimatedDurationMinutes"), 15, 1440, 60)
  );
  const durationLabel = cleanString(formData.get("durationLabel"), 80);
  const badge = cleanString(formData.get("badge"), 40);
  const equipmentNote = cleanString(formData.get("equipmentNote"), 160);
  const compatibleFuels = formData
    .getAll("compatibleFuels")
    .map((v) => cleanString(v, 30))
    .filter(Boolean)
    .slice(0, 12);
  const featured = formData.get("featured") === "on";
  const available = formData.get("available") !== "off";
  const file = formData.get("imageFile") as File | null;

  if (!categoryId || !title) return;
  const uploaded = await saveUploadedImage(file);

  await storage.saveSiteAdminState((prev) => {
    const baseSlug = slugify(title);
    const slugExists = prev.services.some((s) => s.slug === baseSlug);
    const slug = slugExists ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;
    return {
      ...prev,
      services: [
        ...prev.services,
        {
          id: `srv-${baseSlug}-${Date.now().toString(36)}`,
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
  const id = cleanString(formData.get("id"), 100);
  const categoryId = cleanString(formData.get("categoryId"), 80);
  const title = cleanString(formData.get("title"), 120);
  const shortDescription = cleanString(formData.get("shortDescription"), 400);
  const priceNotice =
    cleanString(formData.get("priceNotice"), 80) || "Sur devis gratuit";
  const priceCents = parseOptionalPriceCents(formData.get("price"));
  const estimatedDurationMinutes = Math.round(
    clampNumber(formData.get("estimatedDurationMinutes"), 15, 1440, 60)
  );
  const durationLabel = cleanString(formData.get("durationLabel"), 80);
  const badge = cleanString(formData.get("badge"), 40);
  const equipmentNote = cleanString(formData.get("equipmentNote"), 160);
  const compatibleFuels = formData
    .getAll("compatibleFuels")
    .map((v) => cleanString(v, 30))
    .filter(Boolean)
    .slice(0, 12);
  const featured = formData.get("featured") === "on";
  const available = formData.get("available") === "on";
  const sort = Math.round(clampNumber(formData.get("sort"), 0, 1000, 0));
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
  const id = cleanString(formData.get("id"), 100);
  if (!id) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    services: prev.services.filter((s) => s.id !== id),
    // Mémorise la suppression pour qu'une prestation par défaut ne réapparaisse pas
    removedDefaultServiceIds: Array.from(
      new Set([...(prev.removedDefaultServiceIds ?? []), id])
    ),
  }));
  invalidateSite();
}

/* ── 3bis. Forfaits & Offres Atelier ─────────────────────────────────── */

export async function saveWorkshopOffer(formData: FormData) {
  await requireAdmin();
  const id = cleanString(formData.get("id"), 80);
  const title = cleanString(formData.get("title"), 120);
  const badge = cleanString(formData.get("badge"), 40);
  const description = cleanString(formData.get("description"), 400);
  const priceCents = parseOptionalPriceCents(formData.get("price"));
  const active = id ? formData.get("active") === "on" : true;
  const sort = Math.round(clampNumber(formData.get("sort"), 0, 1000, 0));
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
  const id = cleanString(formData.get("id"), 80);
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
  const slotCapacity = Math.round(
    clampNumber(formData.get("slotCapacity"), 1, 10, 1)
  );
  const bookingLeadHours = Math.round(
    clampNumber(formData.get("bookingLeadHours"), 0, 168, 2)
  );

  const hours = [1, 2, 3, 4, 5, 6, 0].map((d) => {
    const rawOpen = cleanString(formData.get(`open_${d}`), 5);
    const rawClose = cleanString(formData.get(`close_${d}`), 5);
    return {
      dayOfWeek: d,
      openTime: TIME_REGEX.test(rawOpen) ? rawOpen : "09:00",
      closeTime: TIME_REGEX.test(rawClose) ? rawClose : "19:00",
      closed: formData.get(`closed_${d}`) === "on",
    };
  });

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
  const date = cleanString(formData.get("date"), 10);
  const reason =
    cleanString(formData.get("reason"), 160) ||
    "Fermeture exceptionnelle de l'atelier";
  if (!DATE_REGEX.test(date)) return;

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
  const id = cleanString(formData.get("id"), 80);
  const date = cleanString(formData.get("date"), 10);
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
  const id = cleanString(formData.get("id"), 80);
  const name = cleanString(formData.get("name"), 80);
  const urlCheck = validateHttpsUrl(formData.get("url"), "L'URL de la plateforme");
  const active = id ? formData.get("active") === "on" : true;
  const sort = Math.round(clampNumber(formData.get("sort"), 0, 1000, 0));

  if (!name) return;
  if (!urlCheck.ok || !urlCheck.value) {
    const errMsg = !urlCheck.ok
      ? urlCheck.error
      : "L'URL de la plateforme est requise et doit commencer par https://";
    redirect(`/admin?adminError=${encodeURIComponent(errMsg)}#sec-reglages`);
  }

  const url = urlCheck.value;

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
  const id = cleanString(formData.get("id"), 80);
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

  const urlFields = {
    googleMapsUrl: validateHttpsUrl(formData.get("googleMapsUrl"), "Lien Google Maps"),
    googleReviewUrl: validateHttpsUrl(formData.get("googleReviewUrl"), "Lien d'avis Google"),
    instagram: validateHttpsUrl(formData.get("instagram"), "Lien Instagram"),
    facebook: validateHttpsUrl(formData.get("facebook"), "Lien Facebook"),
    tiktok: validateHttpsUrl(formData.get("tiktok"), "Lien TikTok"),
    snapchat: validateHttpsUrl(formData.get("snapchat"), "Lien Snapchat"),
  };

  const urlErrors: string[] = [];
  for (const res of Object.values(urlFields)) {
    if (!res.ok) urlErrors.push(res.error);
  }

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    settings: {
      ...prev.settings,
      name: cleanString(formData.get("name"), 80) || "Run Auto",
      phone: cleanString(formData.get("phone"), 25) || "06 18 31 89 15",
      whatsapp: cleanString(formData.get("whatsapp"), 25),
      email: cleanString(formData.get("email"), 120),
      street: cleanString(formData.get("street"), 120) || "52 boulevard de Roux",
      postalCode: cleanString(formData.get("postalCode"), 12) || "13004",
      city: cleanString(formData.get("city"), 60) || "Marseille",
      latitude: clampNumber(formData.get("latitude"), -90, 90, prev.settings.latitude),
      longitude: clampNumber(formData.get("longitude"), -180, 180, prev.settings.longitude),
      onlineBookingEnabled: formData.get("onlineBookingEnabled") === "on",
      flagshipEquipment:
        cleanString(formData.get("flagshipEquipment"), 100) || "TOPDON Phoenix Max",
      idGaragesRef: cleanString(formData.get("idGaragesRef"), 40) || "GA7683",
      verifiedRating:
        Math.round(
          clampNumber(formData.get("verifiedRating"), 1, 5, prev.settings.verifiedRating) * 10
        ) / 10,
      verifiedReviewCount: cleanString(formData.get("verifiedReviewCount"), 20) || "68",
      supportedBrands: cleanString(formData.get("supportedBrands"), 240),
      announcement: cleanString(formData.get("announcement"), 240),
      parkingInfo: cleanString(formData.get("parkingInfo"), 240),
      transportInfo: cleanString(formData.get("transportInfo"), 240),
      warrantyNote: cleanString(formData.get("warrantyNote"), 350),
      // Les champs URL invalides sont ignorés (valeur précédente conservée)
      googleMapsUrl: urlFields.googleMapsUrl.ok
        ? urlFields.googleMapsUrl.value
        : prev.settings.googleMapsUrl,
      googleReviewUrl: urlFields.googleReviewUrl.ok
        ? urlFields.googleReviewUrl.value
        : prev.settings.googleReviewUrl,
      instagram: urlFields.instagram.ok ? urlFields.instagram.value : prev.settings.instagram,
      facebook: urlFields.facebook.ok ? urlFields.facebook.value : prev.settings.facebook,
      tiktok: urlFields.tiktok.ok ? urlFields.tiktok.value : prev.settings.tiktok,
      snapchat: urlFields.snapchat.ok ? urlFields.snapchat.value : prev.settings.snapchat,
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

  if (urlErrors.length > 0) {
    redirect(
      `/admin?adminError=${encodeURIComponent(
        `Certains liens invalides ont été ignorés : ${urlErrors.join(" • ")}`
      )}#sec-reglages`
    );
  }
}

/* ── 6. Galerie Photos Atelier & Avis Clients Vérifiés ──────────────── */

export async function addGalleryPhoto(formData: FormData) {
  await requireAdmin();
  const alt = cleanString(formData.get("alt"), 200);
  const vehicleTag = cleanString(formData.get("vehicleTag"), 80);
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
  const id = cleanString(formData.get("id"), 80);
  if (!id) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    gallery: prev.gallery.filter((g) => g.id !== id),
  }));
  invalidateSite();
}

export async function addGarageReview(formData: FormData) {
  await requireAdmin();
  const author = cleanString(formData.get("author"), 80);
  const vehicle =
    cleanString(formData.get("vehicle"), 80) || "Client Atelier Run Auto";
  const rating = Math.round(clampNumber(formData.get("rating"), 1, 5, 5));
  const source = cleanString(formData.get("source"), 40) || "idGarages";
  const date =
    cleanString(formData.get("date"), 40) ||
    new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date());
  const comment = cleanString(formData.get("comment"), 1000);
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
  const id = cleanString(formData.get("id"), 80);
  if (!id) return;

  await storage.saveSiteAdminState((prev) => ({
    ...prev,
    reviews: prev.reviews.filter((r) => r.id !== id),
  }));
  invalidateSite();
}
