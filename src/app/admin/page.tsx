import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { requireAdmin } from "@/lib/auth";
import { storage } from "@/lib/storage";
import {
  COMPATIBLE_FUELS,
  DAY_NAMES,
  formatDateFr,
  formatPriceCents,
  formatTime,
  parisNow,
} from "@/lib/motorisations";
import {
  addClosure,
  addGalleryPhoto,
  addGarageReview,
  createCategory,
  createServiceItem,
  createWorkshopIntake,
  deleteAppointmentAction,
  deleteCategory,
  deleteClosure,
  deleteContactMessageAction,
  deleteGalleryPhoto,
  deleteGarageReview,
  deletePartnerPlatform,
  deleteServiceItem,
  deleteWorkshopOffer,
  logoutAdmin,
  savePartnerPlatform,
  saveWorkshopOffer,
  toggleMessageStatus,
  updateAppointmentMechanicSheet,
  updateAppointmentStatusAction,
  updateCategory,
  updateHoursAndCapacity,
  updateServiceItem,
  updateSettings,
} from "@/lib/actions/admin";
import { AdminWorkshopMonitor } from "@/components/admin/AdminWorkshopMonitor";
import { AppointmentStatus } from "@/types";

export const dynamic = "force-dynamic";

const WORKSHOP_STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "À confirmer",
  confirmed: "RDV Confirmé",
  in_progress: "Sur le pont",
  ready: "Prêt (Clés OK)",
  completed: "Restitué",
  cancelled: "Annulé",
};

function getStatusBadgeClass(status: AppointmentStatus): string {
  switch (status) {
    case "ready":
    case "completed":
      return "bg-e85-soft text-e85 border border-e85/30";
    case "in_progress":
      return "bg-carbone text-white border border-carbone";
    case "confirmed":
      return "bg-e85/15 text-e85 border border-e85/30";
    case "cancelled":
      return "bg-glacier text-technique border border-aluminium";
    case "pending":
    default:
      return "bg-racing-soft text-racing border border-racing/30";
  }
}

async function DashboardContent({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string; q?: string }>;
}) {
  await requireAdmin();
  const filters = await searchParams;
  const dateFilter = filters.date?.trim() ?? "";
  const statusFilter = filters.status?.trim() ?? "";
  const searchQuery = filters.q?.trim().toLowerCase() ?? "";
  const todayYmd = parisNow().ymd;

  const [siteState, allAppointments, messages] = await Promise.all([
    storage.getSiteAdminState(),
    storage.getAppointments(),
    storage.getContacts(),
  ]);

  const {
    settings,
    hours,
    closures,
    categories,
    services,
    offers,
    platforms,
    gallery,
    reviews,
  } = siteState;

  // Dossiers actifs en atelier : véhicules du jour en premier, puis en cours / à confirmer
  const workshopQueue = [...allAppointments]
    .filter(
      (a) =>
        a.date === todayYmd ||
        a.status === "pending" ||
        a.status === "in_progress" ||
        a.status === "ready" ||
        (a.status === "confirmed" && a.date >= todayYmd)
    )
    .sort((a, b) => {
      const aToday = a.date === todayYmd ? 1 : 0;
      const bToday = b.date === todayYmd ? 1 : 0;
      if (aToday !== bToday) return bToday - aToday;
      const aInBay = a.status === "in_progress" || a.status === "ready" ? 1 : 0;
      const bInBay = b.status === "in_progress" || b.status === "ready" ? 1 : 0;
      if (aInBay !== bInBay) return bInBay - aInBay;
      return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
    });

  // Rendez-vous filtrés pour la section 1
  const filteredReservations = allAppointments.filter((r) => {
    if (dateFilter && r.date !== dateFilter) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    if (searchQuery) {
      const hay = [
        r.id,
        r.client.firstName,
        r.client.lastName,
        r.client.phone,
        r.client.email,
        r.vehicle.make,
        r.vehicle.model,
        r.vehicle.licensePlate ?? "",
        r.serviceName,
        r.obdCodes ?? "",
      ]
        .join(" ")
        .toLowerCase();
      if (!hay.includes(searchQuery)) return false;
    }
    return true;
  });

  // Timestamp du dernier événement (RDV ou message) pour déclencher l'alerte sonore temps réel
  const latestAptStamp = allAppointments.reduce((max, a) => {
    const t = new Date(a.createdAt).getTime() || 0;
    return t > max ? t : max;
  }, 0);
  const latestMsgStamp = messages.reduce((max, m) => {
    const t = new Date(m.createdAt).getTime() || 0;
    return t > max ? t : max;
  }, 0);
  const latestSignalStamp = Math.max(latestAptStamp, latestMsgStamp);

  const activeBaysCount = allAppointments.filter(
    (a) =>
      a.status === "in_progress" ||
      a.status === "ready" ||
      (a.date === todayYmd && a.status === "confirmed")
  ).length;
  const pendingCount = allAppointments.filter((r) => r.status === "pending").length;
  const unreadCount = messages.filter((m) => m.status === "new").length;
  const activeOffersCount = offers.filter((o) => o.active).length;

  const inputClass =
    "w-full rounded-xl border border-aluminium bg-glacier px-3.5 py-2.5 text-xs text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors";
  const labelClass =
    "block text-[11px] font-bold uppercase tracking-wider text-carbone mb-1.5";
  const cardClass =
    "rounded-2xl border border-aluminium bg-white p-6 sm:p-8 shadow-[0_8px_28px_-8px_rgba(23,25,29,0.06)]";

  return (
    <div className="min-h-svh bg-glacier text-carbone pb-24">
      <AdminWorkshopMonitor latestSignalStamp={latestSignalStamp} />

      {/* ── HEADER STICKY + NAVIGATION PAR ANCRES (STYLE GRILLADE DE MALPA) ── */}
      <header className="sticky top-0 z-40 border-b border-aluminium bg-white/95 backdrop-blur-xl shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-wrap items-center justify-between gap-4 py-3.5">
          <div className="flex items-center gap-3.5">
            <Image
              src="/images/logo-run-auto.png"
              alt="Logo Run Auto Marseille"
              width={120}
              height={52}
              priority
              className="h-11 w-auto object-contain"
            />
            <div className="border-l border-aluminium pl-3.5">
              <h1 className="font-display text-lg sm:text-xl font-extrabold uppercase text-carbone leading-tight">
                Administration · {settings.name}
              </h1>
              <p className="text-xs text-technique">
                Toute modification enregistrée ici est visible immédiatement sur le site.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="rounded-xl border border-aluminium bg-glacier hover:border-racing hover:text-racing px-4 py-2 text-xs font-bold text-carbone transition-colors"
            >
              Voir le site public ↗
            </Link>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="btn-racing rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Déconnexion
              </button>
            </form>
          </div>
        </div>

        <nav
          aria-label="Sections admin"
          className="border-t border-aluminium bg-carbone text-white"
        >
          <ul className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-wrap gap-x-5 gap-y-2 py-2.5 text-xs font-bold uppercase tracking-wider">
            <li>
              <a
                href="#sec-atelier"
                className="text-amber-400 hover:underline flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Suivi Atelier ({activeBaysCount} sur pont / jour)
              </a>
            </li>
            <li>
              <a href="#sec-reservations" className="hover:text-amber-400 transition-colors">
                Rendez-vous ({pendingCount} en attente)
              </a>
            </li>
            <li>
              <a href="#sec-messages" className="hover:text-amber-400 transition-colors">
                Devis &amp; Messages ({unreadCount} non lus)
              </a>
            </li>
            <li>
              <a href="#sec-prestations" className="hover:text-amber-400 transition-colors">
                Prestations ({services.length})
              </a>
            </li>
            <li>
              <a href="#sec-forfaits" className="hover:text-amber-400 transition-colors">
                Forfaits &amp; Offres ({activeOffersCount})
              </a>
            </li>
            <li>
              <a href="#sec-horaires" className="hover:text-amber-400 transition-colors">
                Horaires &amp; Ponts
              </a>
            </li>
            <li>
              <a href="#sec-reglages" className="hover:text-amber-400 transition-colors">
                Équipements &amp; Réglages
              </a>
            </li>
            <li>
              <a href="#sec-galerie" className="hover:text-amber-400 transition-colors">
                Galerie &amp; Avis ({reviews.length})
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 mt-8 space-y-12">
        {/* ── 0. SUIVI ATELIER EN DIRECT & VÉHICULES SUR LE PONT ──────── */}
        <section id="sec-atelier" className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-aluminium pb-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase text-carbone">
                Suivi Atelier en Direct &amp; Ponts ({workshopQueue.length})
              </h2>
              <p className="text-xs text-technique mt-0.5">
                Véhicules du jour ({formatDateFr(todayYmd)}) et interventions en cours affichés en
                premier · Rafraîchissement automatique toutes les 30 s + signal sonore.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-glacier border border-aluminium px-3 py-1 text-xs font-bold text-carbone">
                Valise : {settings.flagshipEquipment}
              </span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                  settings.onlineBookingEnabled
                    ? "bg-e85-soft text-e85 border border-e85/30"
                    : "bg-racing-soft text-racing border border-racing/30"
                }`}
              >
                RDV en ligne : {settings.onlineBookingEnabled ? "Activés" : "Désactivés"}
              </span>
            </div>
          </div>

          {/* Formulaire rapide : Prise en charge véhicule au comptoir / téléphone */}
          <details className="mt-5 rounded-2xl border border-racing/35 bg-racing-soft/25 p-4 group">
            <summary className="cursor-pointer font-display text-sm font-extrabold uppercase text-racing flex items-center justify-between">
              <span>+ Prise en charge rapide véhicule (Client au comptoir ou par téléphone)</span>
              <span className="text-xs font-semibold text-carbone group-open:rotate-180 transition-transform">
                ▼
              </span>
            </summary>
            <form action={createWorkshopIntake} className="mt-4 space-y-3 border-t border-racing/20 pt-4">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <input
                  name="lastName"
                  placeholder="Nom du client *"
                  required
                  className={inputClass}
                />
                <input
                  name="firstName"
                  placeholder="Prénom"
                  className={inputClass}
                />
                <input
                  name="phone"
                  placeholder="Téléphone *"
                  required
                  className={inputClass}
                />
                <input
                  name="email"
                  type="email"
                  placeholder="Email (pour notif. véhicule prêt)"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <input
                  name="make"
                  placeholder="Marque (ex. Audi, Peugeot) *"
                  required
                  className={inputClass}
                />
                <input
                  name="model"
                  placeholder="Modèle (ex. RS3, 308) *"
                  required
                  className={inputClass}
                />
                <input
                  name="licensePlate"
                  placeholder="Immatriculation (ex. AA-123-BB)"
                  className={`${inputClass} uppercase font-mono`}
                />
                <select name="fuel" defaultValue="Essence" className={inputClass}>
                  <option value="Essence">Essence</option>
                  <option value="Bioéthanol E85">Bioéthanol E85</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Hybride">Hybride</option>
                  <option value="Électrique">Électrique</option>
                </select>
                <input
                  name="mileageKm"
                  placeholder="Kilométrage (ex. 125 000 km)"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                <select name="serviceId" className={`${inputClass} lg:col-span-2`}>
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                  <option value="Diagnostic & Recherche de panne">
                    Autre intervention sur mesure
                  </option>
                </select>
                <input
                  type="date"
                  name="date"
                  defaultValue={todayYmd}
                  required
                  className={inputClass}
                />
                <input
                  type="time"
                  name="time"
                  defaultValue="09:00"
                  required
                  className={inputClass}
                />
                <select name="status" defaultValue="in_progress" className={inputClass}>
                  <option value="in_progress">Sur le pont (En cours)</option>
                  <option value="confirmed">RDV Confirmé</option>
                  <option value="pending">À confirmer</option>
                  <option value="ready">Prêt à restituer</option>
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <input
                  name="obdCodes"
                  placeholder="Codes défauts OBD relevés (ex. P0171, P0420)"
                  className={inputClass}
                />
                <input
                  name="quoteAmount"
                  placeholder="Montant Devis / Facture € TTC (ex. 390.00)"
                  className={inputClass}
                />
                <input
                  name="problemDescription"
                  placeholder="Symptômes client / Travaux demandés"
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-racing rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
                >
                  + Créer la fiche d&apos;entrée atelier
                </button>
              </div>
            </form>
          </details>

          {workshopQueue.length === 0 ? (
            <p className="mt-6 text-sm text-technique">
              Aucun véhicule en attente ou sur le pont pour aujourd&apos;hui.
            </p>
          ) : (
            <div className="mt-6 space-y-4">
              {workshopQueue.map((apt) => {
                const isToday = apt.date === todayYmd;
                return (
                  <div
                    key={apt.id}
                    className={`rounded-2xl border p-5 transition-all ${
                      apt.status === "pending"
                        ? "border-racing bg-racing-soft/15"
                        : apt.status === "in_progress"
                          ? "border-carbone bg-glacier/70"
                          : apt.status === "ready"
                            ? "border-e85 bg-e85-soft/20"
                            : "border-aluminium bg-glacier/40"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div className="space-y-2 text-sm flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-3 py-0.5 text-xs font-extrabold uppercase ${getStatusBadgeClass(
                              apt.status
                            )}`}
                          >
                            {WORKSHOP_STATUS_LABELS[apt.status] ?? apt.status}
                          </span>
                          {isToday ? (
                            <span className="rounded bg-racing px-2 py-0.5 text-[11px] font-bold text-white uppercase">
                              Aujourd&apos;hui
                            </span>
                          ) : null}
                          <strong className="font-display text-lg font-extrabold uppercase text-carbone">
                            {apt.vehicle.make} {apt.vehicle.model}
                            {apt.vehicle.year ? ` (${apt.vehicle.year})` : ""}
                          </strong>
                          {apt.vehicle.licensePlate ? (
                            <span className="rounded-md border-2 border-carbone bg-white px-2.5 py-0.5 font-mono text-xs font-black tracking-wider text-carbone shadow-2xs">
                              {apt.vehicle.licensePlate}
                            </span>
                          ) : null}
                          {apt.vehicle.fuel ? (
                            <span className="rounded-lg bg-white border border-aluminium px-2 py-0.5 text-xs font-semibold text-technique">
                              {apt.vehicle.fuel}
                            </span>
                          ) : null}
                          {apt.quoteAmountCents !== undefined &&
                          apt.quoteAmountCents !== null ? (
                            <span className="font-display text-base font-extrabold text-racing">
                              {formatPriceCents(apt.quoteAmountCents)}
                            </span>
                          ) : null}
                        </div>

                        <p className="text-xs text-carbone">
                          🗓️ Créneau : <strong>{formatDateFr(apt.date)}</strong> à{" "}
                          <strong className="text-racing">{formatTime(apt.time)}</strong> · 👤{" "}
                          <strong>
                            {apt.client.firstName} {apt.client.lastName}
                          </strong>{" "}
                          · 📞{" "}
                          <a
                            href={`tel:${apt.client.phone}`}
                            className="font-bold text-racing underline"
                          >
                            {apt.client.phone}
                          </a>
                          {apt.client.email ? ` · ✉️ ${apt.client.email}` : ""} ·{" "}
                          <span className="font-mono text-[11px] text-technique">#{apt.id}</span>
                        </p>

                        <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs">
                          <span className="rounded-lg border border-aluminium bg-white px-3 py-1 font-bold text-carbone">
                            🔧 Prestation : {apt.serviceName}
                          </span>
                          {apt.mileageKm ? (
                            <span className="rounded-lg border border-aluminium bg-white px-2.5 py-1 text-technique">
                              Compteur : <strong className="text-carbone">{apt.mileageKm}</strong>
                            </span>
                          ) : null}
                          {apt.obdCodes ? (
                            <span className="rounded-lg border border-racing/30 bg-racing-soft px-2.5 py-1 font-mono text-xs font-bold text-racing">
                              OBD : {apt.obdCodes}
                            </span>
                          ) : null}
                        </div>

                        {apt.problemDescription ? (
                          <p className="text-xs text-technique italic">
                            Symptômes / Demande client : « {apt.problemDescription} »
                          </p>
                        ) : null}
                      </div>

                      {/* Boutons de statut direct (Flux Atelier Mécanicien) */}
                      <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                        {(
                          [
                            "pending",
                            "confirmed",
                            "in_progress",
                            "ready",
                            "completed",
                            "cancelled",
                          ] as const
                        ).map((st) => (
                          <form key={st} action={updateAppointmentStatusAction}>
                            <input type="hidden" name="id" value={apt.id} />
                            <input type="hidden" name="status" value={st} />
                            <button
                              type="submit"
                              disabled={apt.status === st}
                              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors disabled:opacity-40 ${
                                apt.status === st
                                  ? "border-carbone bg-carbone text-white"
                                  : "border-aluminium bg-white text-carbone hover:border-racing hover:text-racing"
                              }`}
                            >
                              {WORKSHOP_STATUS_LABELS[st]}
                            </button>
                          </form>
                        ))}
                        <form action={deleteAppointmentAction}>
                          <input type="hidden" name="id" value={apt.id} />
                          <button
                            type="submit"
                            className="rounded-xl border border-racing/40 bg-white px-3 py-1.5 text-xs font-bold text-racing hover:bg-racing hover:text-white transition-colors"
                          >
                            Supprimer
                          </button>
                        </form>
                      </div>
                    </div>

                    {/* Fiche technique mécanicien inline (Kilométrage, Codes OBD, Devis €, Notes d'atelier) */}
                    <form
                      action={updateAppointmentMechanicSheet}
                      className="mt-3 pt-3 border-t border-aluminium/80 grid gap-2 sm:grid-cols-2 lg:grid-cols-5 items-center"
                    >
                      <input type="hidden" name="id" value={apt.id} />
                      <input
                        name="mileageKm"
                        defaultValue={apt.mileageKm ?? ""}
                        placeholder="Kilométrage (ex. 142 000 km)"
                        aria-label="Kilométrage"
                        className="rounded-lg border border-aluminium bg-white px-3 py-1.5 text-xs text-carbone"
                      />
                      <input
                        name="obdCodes"
                        defaultValue={apt.obdCodes ?? ""}
                        placeholder="Codes défauts OBD (ex. P0171)"
                        aria-label="Codes défauts OBD"
                        className="rounded-lg border border-aluminium bg-white px-3 py-1.5 text-xs font-mono text-carbone"
                      />
                      <input
                        name="quoteAmount"
                        defaultValue={
                          apt.quoteAmountCents !== undefined &&
                          apt.quoteAmountCents !== null
                            ? (apt.quoteAmountCents / 100).toFixed(2)
                            : ""
                        }
                        placeholder="Devis / Facture € TTC"
                        aria-label="Montant devis en euros"
                        className="rounded-lg border border-aluminium bg-white px-3 py-1.5 text-xs text-carbone"
                      />
                      <input
                        name="internalNotes"
                        defaultValue={apt.internalNotes ?? ""}
                        placeholder="Notes mécanicien (pièces commandées, travaux réalisés…)"
                        aria-label="Notes mécanicien"
                        className="rounded-lg border border-aluminium bg-white px-3 py-1.5 text-xs text-carbone"
                      />
                      <button
                        type="submit"
                        className="rounded-lg bg-carbone hover:bg-racing text-white px-3 py-1.5 text-xs font-bold transition-colors"
                      >
                        Enregistrer fiche atelier
                      </button>
                    </form>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 1. RENDEZ-VOUS & HISTORIQUE D'INTERVENTIONS ───────────── */}
        <section id="sec-reservations" className={cardClass}>
          <div className="flex flex-wrap items-end justify-between gap-4 border-b border-aluminium pb-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase text-carbone">
                1. Rendez-vous &amp; Planning Atelier ({filteredReservations.length})
              </h2>
              <p className="text-xs text-technique mt-0.5">
                Capacité actuelle : {settings.slotCapacity} véhicule(s) / pont(s) max par créneau
                d&apos;1h · Délai min. en ligne : {settings.bookingLeadHours}h.
              </p>
            </div>

            <form method="get" className="flex flex-wrap items-center gap-2 text-xs">
              <input
                type="text"
                name="q"
                defaultValue={filters.q ?? ""}
                placeholder="Plaque, client, modèle, OBD…"
                className="rounded-xl border border-aluminium bg-glacier px-3 py-2 text-carbone"
              />
              <input
                type="date"
                name="date"
                defaultValue={dateFilter}
                className="rounded-xl border border-aluminium bg-glacier px-3 py-2 text-carbone"
              />
              <select
                name="status"
                defaultValue={statusFilter}
                className="rounded-xl border border-aluminium bg-glacier px-3 py-2 text-carbone"
              >
                <option value="">Tous les statuts</option>
                <option value="pending">À confirmer</option>
                <option value="confirmed">RDV Confirmé</option>
                <option value="in_progress">Sur le pont</option>
                <option value="ready">Prêt (Clés OK)</option>
                <option value="completed">Restitué / Terminé</option>
                <option value="cancelled">Annulé</option>
              </select>
              <button
                type="submit"
                className="btn-racing rounded-xl px-4 py-2 text-xs font-bold uppercase"
              >
                Filtrer
              </button>
              {dateFilter || statusFilter || searchQuery ? (
                <Link
                  href="/admin#sec-reservations"
                  className="rounded-xl border border-aluminium bg-glacier px-3 py-2 text-xs font-semibold text-carbone hover:border-racing"
                >
                  Réinitialiser
                </Link>
              ) : null}
            </form>
          </div>

          {filteredReservations.length === 0 ? (
            <p className="mt-6 text-sm text-technique">
              Aucun rendez-vous pour ces critères.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {filteredReservations.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-col justify-between gap-4 rounded-xl border border-aluminium bg-glacier/50 p-4 lg:flex-row lg:items-center"
                >
                  <div className="space-y-1 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${getStatusBadgeClass(
                          r.status
                        )}`}
                      >
                        {WORKSHOP_STATUS_LABELS[r.status] ?? r.status}
                      </span>
                      <strong className="font-display text-base font-extrabold uppercase text-carbone">
                        {r.client.firstName} {r.client.lastName}
                      </strong>
                      <span className="text-technique font-semibold">
                        · {r.vehicle.make} {r.vehicle.model}
                        {r.vehicle.fuel ? ` (${r.vehicle.fuel})` : ""}
                      </span>
                      {r.vehicle.licensePlate ? (
                        <span className="rounded border border-carbone bg-white px-2 py-0.5 font-mono text-xs font-bold text-carbone">
                          {r.vehicle.licensePlate}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-carbone">
                      📅 <strong>{formatDateFr(r.date)}</strong> à{" "}
                      <strong className="text-racing">{formatTime(r.time)}</strong> · 🔧{" "}
                      <strong>{r.serviceName}</strong> · 📞{" "}
                      <a
                        href={`tel:${r.client.phone}`}
                        className="font-bold text-racing underline"
                      >
                        {r.client.phone}
                      </a>{" "}
                      · ✉️ {r.client.email}
                    </p>
                    {r.problemDescription ? (
                      <p className="text-xs text-technique">
                        Note client : « {r.problemDescription} »
                      </p>
                    ) : null}
                    {r.internalNotes || r.obdCodes || r.mileageKm ? (
                      <p className="text-xs font-semibold text-carbone">
                        📋 Fiche Atelier :{" "}
                        {r.mileageKm ? `Compteur ${r.mileageKm} · ` : ""}
                        {r.obdCodes ? `OBD [${r.obdCodes}] · ` : ""}
                        {r.internalNotes ?? ""}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    {(
                      [
                        "pending",
                        "confirmed",
                        "in_progress",
                        "ready",
                        "completed",
                        "cancelled",
                      ] as const
                    ).map((st) => (
                      <form key={st} action={updateAppointmentStatusAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value={st} />
                        <button
                          type="submit"
                          disabled={r.status === st}
                          className="rounded-lg border border-aluminium bg-white px-2.5 py-1.5 text-xs font-semibold text-carbone hover:border-racing hover:text-racing disabled:opacity-40"
                        >
                          {WORKSHOP_STATUS_LABELS[st]}
                        </button>
                      </form>
                    ))}
                    <form action={deleteAppointmentAction}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="rounded-lg border border-racing/40 bg-white px-2.5 py-1.5 text-xs font-semibold text-racing hover:bg-racing hover:text-white"
                      >
                        Supprimer
                      </button>
                    </form>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── 2. DEMANDES DE DEVIS & MESSAGES DE CONTACT ────────────── */}
        <section id="sec-messages" className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-aluminium pb-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold uppercase text-carbone">
                2. Demandes de devis E85 / Reprog &amp; Messages ({messages.length})
              </h2>
              <p className="text-xs text-technique mt-0.5">
                Demandes reçues depuis le formulaire de contact et d&apos;étude de compatibilité.
              </p>
            </div>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-racing px-3 py-1 text-xs font-bold text-white uppercase">
                {unreadCount} non lu(s)
              </span>
            ) : null}
          </div>

          {messages.length === 0 ? (
            <p className="mt-6 text-sm text-technique">
              Aucun message reçu pour le moment.
            </p>
          ) : (
            <div className="mt-6 space-y-3">
              {messages.map((m) => {
                const isUnread = m.status === "new";
                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border p-4 ${
                      isUnread
                        ? "border-racing bg-racing-soft/20"
                        : "border-aluminium bg-glacier/50"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="text-sm flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                            m.status === "new"
                              ? "bg-racing text-white"
                              : m.status === "replied"
                                ? "bg-e85-soft text-e85 border border-e85/30"
                                : "bg-white text-technique border border-aluminium"
                          }`}
                        >
                          {m.status === "new"
                            ? "Nouveau"
                            : m.status === "replied"
                              ? "Répondu"
                              : "Lu"}
                        </span>
                        <strong className="text-carbone">{m.name}</strong> ·{" "}
                        <a
                          href={`mailto:${m.email}?subject=${encodeURIComponent(
                            `Re: ${m.subject}`
                          )}`}
                          className="font-bold text-racing underline"
                        >
                          {m.email}
                        </a>
                        {m.phone ? (
                          <>
                            {" "}
                            ·{" "}
                            <a
                              href={`tel:${m.phone}`}
                              className="font-bold text-carbone hover:text-racing"
                            >
                              📞 {m.phone}
                            </a>
                          </>
                        ) : null}
                        <span className="text-xs text-technique">
                          · {new Date(m.createdAt).toLocaleString("fr-FR")}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <form action={toggleMessageStatus}>
                          <input type="hidden" name="id" value={m.id} />
                          <input
                            type="hidden"
                            name="status"
                            value={m.status === "new" ? "read" : "new"}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-aluminium bg-white px-3 py-1 text-xs font-semibold text-carbone hover:border-racing"
                          >
                            {m.status === "new"
                              ? "Marquer comme lu"
                              : "Marquer non lu"}
                          </button>
                        </form>
                        <form action={toggleMessageStatus}>
                          <input type="hidden" name="id" value={m.id} />
                          <input type="hidden" name="status" value="replied" />
                          <button
                            type="submit"
                            disabled={m.status === "replied"}
                            className="rounded-lg border border-e85/40 bg-white px-3 py-1 text-xs font-semibold text-e85 hover:bg-e85 hover:text-white disabled:opacity-40"
                          >
                            Marquer répondu
                          </button>
                        </form>
                        <form action={deleteContactMessageAction}>
                          <input type="hidden" name="id" value={m.id} />
                          <button
                            type="submit"
                            className="rounded-lg border border-racing/40 bg-white px-3 py-1 text-xs font-semibold text-racing hover:bg-racing hover:text-white"
                          >
                            Supprimer
                          </button>
                        </form>
                      </div>
                    </div>

                    <p className="mt-2 text-xs font-extrabold uppercase tracking-wider text-racing">
                      Objet : {m.subject}
                    </p>
                    <p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-aluminium bg-white p-3.5 text-sm text-carbone">
                      {m.message}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── 3. CATALOGUE DES PRESTATIONS ATELIER ──────────────────── */}
        <section id="sec-prestations" className={`${cardClass} space-y-8`}>
          <div>
            <h2 className="font-display text-2xl font-extrabold uppercase text-carbone">
              3. Gestion des Prestations Atelier (E85, Reprog, Diagnostic, FAP, Mécanique)
            </h2>
            <p className="text-xs text-technique mt-0.5">
              Ajoutez des prestations, modifiez les mentions tarifaires, les durées d&apos;intervention,
              l&apos;outillage utilisé et cochez les motorisations compatibles.
            </p>
          </div>

          {/* Ajouter une nouvelle prestation */}
          <form
            action={createServiceItem}
            className="space-y-4 rounded-2xl border border-racing/35 bg-glacier/70 p-5"
          >
            <h3 className="font-display text-lg font-extrabold text-racing uppercase">
              + Ajouter une nouvelle prestation à l&apos;atelier
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <select name="categoryId" required className={inputClass}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <input
                name="title"
                placeholder="Nom de la prestation *"
                required
                className={inputClass}
              />
              <input
                name="priceNotice"
                placeholder="Mention prix (ex. À partir de 390 € / Sur devis) *"
                required
                className={inputClass}
              />
              <input
                name="badge"
                placeholder="Badge (ex. Forte demande, Spécialité)"
                className={inputClass}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <input
                name="shortDescription"
                placeholder="Description technique courte *"
                required
                className={`${inputClass} lg:col-span-2`}
              />
              <input
                name="estimatedDurationMinutes"
                type="number"
                defaultValue={60}
                min={15}
                step={15}
                placeholder="Durée estimée (min)"
                className={inputClass}
              />
              <input
                name="equipmentNote"
                placeholder="Outillage (ex. Valise TOPDON Phoenix Max)"
                className={inputClass}
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                name="durationLabel"
                placeholder="Libellé durée optionnel (ex. Selon motorisation)"
                className={inputClass}
              />
              <input
                type="file"
                name="imageFile"
                accept="image/*"
                aria-label="Photo de la prestation"
                className={inputClass}
              />
            </div>

            <fieldset className="rounded-xl border border-aluminium bg-white p-3.5">
              <legend className="px-2 text-xs font-bold text-carbone">
                Motorisations &amp; architectures véhicules compatibles
              </legend>
              <div className="mt-1 flex flex-wrap gap-3 text-xs">
                {COMPATIBLE_FUELS.map((f) => (
                  <label key={f.code} className="inline-flex items-center gap-1.5 text-carbone">
                    <input
                      type="checkbox"
                      name="compatibleFuels"
                      value={f.code}
                      defaultChecked={["ESSENCE", "E85", "DIESEL"].includes(f.code)}
                      className="size-3.5 accent-racing"
                    />
                    <span>{f.label}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-wrap items-center justify-between gap-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-carbone">
                <input
                  type="checkbox"
                  name="featured"
                  defaultChecked
                  className="size-4 accent-racing"
                />
                Mettre en avant sur la page d&apos;accueil
              </label>
              <button
                type="submit"
                className="btn-racing rounded-xl px-5 py-2.5 text-xs font-bold uppercase tracking-wider"
              >
                Ajouter au catalogue
              </button>
            </div>
          </form>

          {/* Ajouter un pôle d'expertise / catégorie */}
          <form
            action={createCategory}
            className="flex flex-wrap items-center gap-3 rounded-xl border border-aluminium bg-glacier p-4"
          >
            <span className="font-display text-sm font-extrabold uppercase text-carbone">
              Nouveau pôle d&apos;expertise :
            </span>
            <input
              name="name"
              placeholder="Nom (ex. Climatisation & Pneumatiques)"
              required
              className="rounded-xl border border-aluminium bg-white px-3 py-2 text-xs text-carbone"
            />
            <input
              name="description"
              placeholder="Description courte du pôle"
              className="min-w-60 flex-1 rounded-xl border border-aluminium bg-white px-3 py-2 text-xs text-carbone"
            />
            <input
              name="sort"
              type="number"
              defaultValue={categories.length + 1}
              aria-label="Ordre d'affichage"
              className="w-20 rounded-xl border border-aluminium bg-white px-3 py-2 text-xs text-carbone"
            />
            <button
              type="submit"
              className="rounded-xl border border-carbone bg-carbone text-white hover:bg-racing hover:border-racing px-4 py-2 text-xs font-bold transition-colors"
            >
              Créer le pôle
            </button>
          </form>

          {/* Liste des pôles et prestations */}
          <div className="space-y-6">
            {categories.map((cat) => {
              const catServices = services.filter((s) => s.categoryId === cat.id);
              return (
                <div
                  key={cat.id}
                  className="rounded-2xl border border-aluminium bg-glacier/60 p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-aluminium pb-3">
                    <form action={updateCategory} className="flex flex-wrap items-center gap-2">
                      <input type="hidden" name="id" value={cat.id} />
                      <input
                        name="name"
                        defaultValue={cat.name}
                        aria-label="Nom du pôle"
                        className="font-display rounded-xl border border-aluminium bg-white px-3 py-1.5 text-base font-extrabold uppercase text-carbone"
                      />
                      <input
                        name="description"
                        defaultValue={cat.description}
                        placeholder="Description"
                        aria-label="Description du pôle"
                        className="min-w-56 rounded-xl border border-aluminium bg-white px-3 py-1.5 text-xs text-carbone"
                      />
                      <input
                        name="sort"
                        type="number"
                        defaultValue={cat.sort}
                        aria-label="Ordre"
                        className="w-16 rounded-xl border border-aluminium bg-white px-2 py-1.5 text-xs text-carbone"
                      />
                      <button
                        type="submit"
                        className="rounded-xl border border-aluminium bg-white px-3 py-1.5 text-xs font-bold text-carbone hover:border-racing hover:text-racing"
                      >
                        Enregistrer pôle
                      </button>
                    </form>

                    <form action={deleteCategory}>
                      <input type="hidden" name="id" value={cat.id} />
                      <button
                        type="submit"
                        className="rounded-xl border border-racing/40 bg-white px-3 py-1.5 text-xs font-bold text-racing hover:bg-racing hover:text-white"
                      >
                        Supprimer pôle
                      </button>
                    </form>
                  </div>

                  {catServices.length === 0 ? (
                    <p className="mt-3 text-xs text-technique">
                      Aucune prestation dans ce pôle pour le moment.
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {catServices.map((item) => {
                        const activeFuels = new Set(item.compatibleFuels ?? []);
                        return (
                          <div
                            key={item.id}
                            className="rounded-xl border border-aluminium bg-white p-4 shadow-2xs"
                          >
                            <form action={updateServiceItem} className="space-y-3">
                              <input type="hidden" name="id" value={item.id} />
                              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                                <select
                                  name="categoryId"
                                  defaultValue={item.categoryId}
                                  aria-label="Pôle d'expertise"
                                  className="rounded-lg border border-aluminium bg-glacier px-3 py-2 text-xs text-carbone"
                                >
                                  {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                                <input
                                  name="title"
                                  defaultValue={item.title}
                                  aria-label="Nom de la prestation"
                                  className="rounded-lg border border-aluminium bg-glacier px-3 py-2 text-xs font-bold text-carbone"
                                />
                                <input
                                  name="priceNotice"
                                  defaultValue={item.priceNotice}
                                  placeholder="Mention tarifaire (ex. Sur devis)"
                                  aria-label="Mention tarifaire"
                                  className="rounded-lg border border-aluminium bg-glacier px-3 py-2 text-xs font-semibold text-racing"
                                />
                                <input
                                  name="badge"
                                  defaultValue={item.badge ?? ""}
                                  placeholder="Badge (ex. Forte demande)"
                                  aria-label="Badge"
                                  className="rounded-lg border border-aluminium bg-glacier px-3 py-2 text-xs text-carbone"
                                />
                                <div className="flex items-center gap-1.5">
                                  <input
                                    name="estimatedDurationMinutes"
                                    type="number"
                                    defaultValue={item.estimatedDurationMinutes}
                                    aria-label="Durée en minutes"
                                    title="Durée estimée (minutes)"
                                    className="w-20 rounded-lg border border-aluminium bg-glacier px-2.5 py-2 text-xs text-carbone"
                                  />
                                  <span className="text-[11px] text-technique">min</span>
                                  <input
                                    name="sort"
                                    type="number"
                                    defaultValue={item.sort}
                                    aria-label="Ordre"
                                    title="Ordre d'affichage"
                                    className="w-16 rounded-lg border border-aluminium bg-glacier px-2 py-2 text-xs text-carbone"
                                  />
                                </div>
                              </div>

                              <div className="grid gap-2 sm:grid-cols-3">
                                <input
                                  name="shortDescription"
                                  defaultValue={item.shortDescription}
                                  placeholder="Description courte"
                                  aria-label="Description courte"
                                  className="rounded-lg border border-aluminium bg-glacier px-3 py-2 text-xs text-carbone"
                                />
                                <input
                                  name="equipmentNote"
                                  defaultValue={item.equipmentNote ?? ""}
                                  placeholder="Outillage / Diagnostic utilisé"
                                  aria-label="Outillage"
                                  className="rounded-lg border border-aluminium bg-glacier px-3 py-2 text-xs text-carbone"
                                />
                                <input
                                  type="file"
                                  name="imageFile"
                                  accept="image/*"
                                  aria-label="Remplacer la photo"
                                  className="rounded-lg border border-aluminium bg-glacier px-3 py-1.5 text-xs text-carbone"
                                />
                              </div>

                              <div className="flex flex-wrap gap-2.5 rounded-lg border border-aluminium bg-glacier/60 p-2.5 text-[11px]">
                                <span className="font-bold text-carbone">Motorisations :</span>
                                {COMPATIBLE_FUELS.map((f) => (
                                  <label
                                    key={f.code}
                                    className="inline-flex items-center gap-1 text-carbone"
                                  >
                                    <input
                                      type="checkbox"
                                      name="compatibleFuels"
                                      value={f.code}
                                      defaultChecked={activeFuels.has(f.code)}
                                      className="size-3.5 accent-racing"
                                    />
                                    <span>{f.label}</span>
                                  </label>
                                ))}
                              </div>

                              <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
                                <div className="flex flex-wrap items-center gap-4">
                                  <label className="flex items-center gap-1.5 font-semibold text-carbone">
                                    <input
                                      type="checkbox"
                                      name="available"
                                      defaultChecked={item.available}
                                      className="size-4 accent-e85"
                                    />
                                    Réservable en ligne ({item.priceNotice})
                                  </label>
                                  <label className="flex items-center gap-1.5 font-semibold text-carbone">
                                    <input
                                      type="checkbox"
                                      name="featured"
                                      defaultChecked={item.featured}
                                      className="size-4 accent-racing"
                                    />
                                    Mis en avant (accueil)
                                  </label>
                                  {item.image ? (
                                    <label className="flex items-center gap-1.5 text-racing font-semibold">
                                      <input
                                        type="checkbox"
                                        name="clearImage"
                                        className="size-4 accent-racing"
                                      />
                                      Retirer la photo actuelle
                                    </label>
                                  ) : (
                                    <span className="text-technique">Aucune photo</span>
                                  )}
                                </div>

                                <button
                                  type="submit"
                                  className="rounded-lg bg-carbone hover:bg-racing px-4 py-1.5 font-bold text-white transition-colors"
                                >
                                  Enregistrer
                                </button>
                              </div>
                            </form>

                            <form action={deleteServiceItem} className="mt-2 flex justify-end">
                              <input type="hidden" name="id" value={item.id} />
                              <button
                                type="submit"
                                className="text-xs font-semibold text-racing hover:underline"
                              >
                                Supprimer cette prestation
                              </button>
                            </form>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3bis. FORFAITS & OFFRES ATELIER ───────────────────────── */}
        <section id="sec-forfaits" className={`${cardClass} space-y-6`}>
          <div>
            <h2 className="font-display text-2xl font-extrabold uppercase text-carbone">
              Forfaits &amp; Offres Atelier (Pack E85, Bilan Diagnostic, Révision…)
            </h2>
            <p className="text-xs text-technique mt-0.5">
              Les forfaits actifs mettent en avant vos offres packagées (Conversion E85, Diagnostic
              TOPDON Phoenix Max, Entretien).
            </p>
          </div>

          <form
            action={saveWorkshopOffer}
            className="grid gap-3 rounded-2xl border border-racing/35 bg-glacier/70 p-5 sm:grid-cols-2 lg:grid-cols-5"
          >
            <input
              name="title"
              placeholder="Titre du forfait *"
              required
              className={inputClass}
            />
            <input
              name="badge"
              placeholder="Badge (ex. Offre E85, Diagnostic)"
              className={inputClass}
            />
            <input
              name="price"
              placeholder="Prix en € (vide = Sur devis)"
              className={inputClass}
            />
            <input
              name="description"
              placeholder="Détails inclus dans le forfait"
              className={`${inputClass} sm:col-span-2 lg:col-span-1`}
            />
            <button
              type="submit"
              className="btn-racing rounded-xl px-4 py-2.5 text-xs font-bold uppercase"
            >
              + Ajouter le forfait
            </button>
          </form>

          {offers.length > 0 ? (
            <div className="space-y-3">
              {offers.map((of) => (
                <div
                  key={of.id}
                  className="flex flex-wrap items-center gap-2 rounded-xl border border-aluminium bg-glacier/60 p-3"
                >
                  <form
                    action={saveWorkshopOffer}
                    className="flex flex-1 flex-wrap items-center gap-2"
                  >
                    <input type="hidden" name="id" value={of.id} />
                    <input
                      name="title"
                      defaultValue={of.title}
                      aria-label="Titre"
                      className="w-52 rounded-lg border border-aluminium bg-white px-3 py-1.5 text-xs font-bold text-carbone"
                    />
                    <input
                      name="badge"
                      defaultValue={of.badge}
                      placeholder="Badge"
                      aria-label="Badge"
                      className="w-36 rounded-lg border border-aluminium bg-white px-3 py-1.5 text-xs text-racing font-semibold"
                    />
                    <input
                      name="price"
                      defaultValue={
                        of.priceCents !== null && of.priceCents !== undefined
                          ? (of.priceCents / 100).toFixed(2)
                          : ""
                      }
                      placeholder="Sur devis (€)"
                      aria-label="Prix"
                      className="w-28 rounded-lg border border-aluminium bg-white px-3 py-1.5 text-xs text-carbone"
                    />
                    <input
                      name="description"
                      defaultValue={of.description}
                      placeholder="Description"
                      aria-label="Description"
                      className="min-w-48 flex-1 rounded-lg border border-aluminium bg-white px-3 py-1.5 text-xs text-carbone"
                    />
                    <input
                      name="sort"
                      type="number"
                      defaultValue={of.sort}
                      aria-label="Ordre"
                      className="w-16 rounded-lg border border-aluminium bg-white px-2 py-1.5 text-xs text-carbone"
                    />
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-carbone">
                      <input
                        type="checkbox"
                        name="active"
                        defaultChecked={of.active}
                        className="size-4 accent-e85"
                      />
                      Actif
                    </label>
                    <button
                      type="submit"
                      className="rounded-lg bg-carbone hover:bg-racing px-3 py-1.5 text-xs font-bold text-white transition-colors"
                    >
                      Enregistrer
                    </button>
                  </form>
                  <form action={deleteWorkshopOffer}>
                    <input type="hidden" name="id" value={of.id} />
                    <button
                      type="submit"
                      className="px-2 text-xs font-semibold text-racing hover:underline"
                    >
                      Supprimer
                    </button>
                  </form>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-technique">Aucun forfait créé pour le moment.</p>
          )}
        </section>

        {/* ── 4. HORAIRES, CAPACITÉ DES PONTS & FERMETURES ──────────── */}
        <section id="sec-horaires" className={`${cardClass} space-y-8`}>
          <div>
            <h2 className="font-display text-2xl font-extrabold uppercase text-carbone">
              4. Horaires d&apos;ouverture, capacité des ponts &amp; fermetures exceptionnelles
            </h2>
            <p className="text-xs text-technique mt-0.5">
              Pilotez les créneaux réservables en ligne et les jours de fermeture de l&apos;atelier.
            </p>
          </div>

          <form action={updateHoursAndCapacity} className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="adm-cap" className={labelClass}>
                  Capacité maximale par créneau d&apos;1h (véhicules / ponts en simultané)
                </label>
                <input
                  id="adm-cap"
                  name="slotCapacity"
                  type="number"
                  min={1}
                  max={10}
                  defaultValue={settings.slotCapacity}
                  className={inputClass}
                />
              </div>
              <div>
                <label htmlFor="adm-lead" className={labelClass}>
                  Délai minimum avant réservation en ligne (en heures)
                </label>
                <input
                  id="adm-lead"
                  name="bookingLeadHours"
                  type="number"
                  min={1}
                  max={72}
                  defaultValue={settings.bookingLeadHours}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="space-y-2">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const h = hours.find((x) => x.dayOfWeek === d) ?? {
                  dayOfWeek: d,
                  openTime: "09:00",
                  closeTime: "19:00",
                  closed: d === 0 || d === 6,
                };
                return (
                  <div
                    key={d}
                    className="grid items-center gap-3 rounded-xl border border-aluminium bg-glacier/60 px-4 py-3 sm:grid-cols-4"
                  >
                    <span className="font-display font-extrabold uppercase text-carbone">
                      {DAY_NAMES[d]}
                    </span>
                    <label className="flex items-center gap-2 text-xs font-semibold text-carbone">
                      Ouverture
                      <input
                        type="time"
                        name={`open_${d}`}
                        defaultValue={h.openTime}
                        className="rounded-lg border border-aluminium bg-white px-2.5 py-1.5 text-carbone"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-carbone">
                      Fermeture
                      <input
                        type="time"
                        name={`close_${d}`}
                        defaultValue={h.closeTime}
                        className="rounded-lg border border-aluminium bg-white px-2.5 py-1.5 text-carbone"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs font-semibold text-racing">
                      <input
                        type="checkbox"
                        name={`closed_${d}`}
                        defaultChecked={h.closed}
                        className="size-4 accent-racing"
                      />
                      Atelier fermé ce jour
                    </label>
                  </div>
                );
              })}
            </div>

            <button
              type="submit"
              className="btn-racing rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              Enregistrer les horaires et la capacité des ponts
            </button>
          </form>

          <div className="border-t border-aluminium pt-6">
            <h3 className="font-display text-lg font-extrabold uppercase text-carbone">
              Fermetures exceptionnelles (Congés, Jours fériés, Inventaire outillage)
            </h3>
            <form action={addClosure} className="mt-3 flex flex-wrap gap-3">
              <input
                type="date"
                name="date"
                required
                aria-label="Date de fermeture"
                className="rounded-xl border border-aluminium bg-glacier px-3.5 py-2 text-xs text-carbone"
              />
              <input
                name="reason"
                placeholder="Motif (ex. Congés d'été, Inventaire, Formation électronique…)"
                className="min-w-60 flex-1 rounded-xl border border-aluminium bg-glacier px-3.5 py-2 text-xs text-carbone"
              />
              <button
                type="submit"
                className="rounded-xl border border-carbone bg-carbone text-white hover:bg-racing hover:border-racing px-4 py-2 text-xs font-bold transition-colors"
              >
                + Bloquer cette date
              </button>
            </form>

            {closures.length > 0 ? (
              <ul className="mt-4 space-y-2 text-xs">
                {closures.map((c) => (
                  <li
                    key={c.id}
                    className="flex items-center justify-between rounded-xl border border-aluminium bg-glacier/60 px-4 py-2.5"
                  >
                    <span className="text-carbone">
                      <strong>{formatDateFr(c.date)}</strong> ({c.date})
                      {c.reason ? ` — ${c.reason}` : ""}
                    </span>
                    <form action={deleteClosure}>
                      <input type="hidden" name="id" value={c.id} />
                      <input type="hidden" name="date" value={c.date} />
                      <button
                        type="submit"
                        className="font-bold text-racing hover:underline"
                      >
                        Débloquer / Retirer
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-xs text-technique">
                Aucune fermeture exceptionnelle programmée.
              </p>
            )}
          </div>
        </section>

        {/* ── 5. PARTENAIRES AUTO, ÉQUIPEMENTS & RÉGLAGES GÉNÉRAUX ──── */}
        <section id="sec-reglages" className={`${cardClass} space-y-8`}>
          <h2 className="font-display text-2xl font-extrabold uppercase text-carbone">
            5. Annuaires partenaires, infos atelier, équipements &amp; réseaux sociaux
          </h2>

          <div className="space-y-4">
            <h3 className="font-display text-lg font-extrabold text-racing uppercase">
              Plateformes &amp; Annuaires Auto (idGarages, Google Maps, PagesJaunes…)
            </h3>
            {platforms.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-aluminium bg-glacier/60 p-3"
              >
                <form
                  action={savePartnerPlatform}
                  className="flex flex-1 flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="id" value={p.id} />
                  <input
                    name="name"
                    defaultValue={p.name}
                    aria-label="Nom de la plateforme"
                    className="w-52 rounded-lg border border-aluminium bg-white px-3 py-1.5 text-xs font-bold text-carbone"
                  />
                  <input
                    name="url"
                    defaultValue={p.url}
                    aria-label="URL de la plateforme"
                    className="min-w-64 flex-1 rounded-lg border border-aluminium bg-white px-3 py-1.5 text-xs text-carbone"
                  />
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-carbone">
                    <input
                      type="checkbox"
                      name="active"
                      defaultChecked={p.active}
                      className="size-4 accent-e85"
                    />
                    Active
                  </label>
                  <button
                    type="submit"
                    className="rounded-lg bg-carbone hover:bg-racing px-3 py-1.5 text-xs font-bold text-white transition-colors"
                  >
                    Enregistrer
                  </button>
                </form>
                <form action={deletePartnerPlatform}>
                  <input type="hidden" name="id" value={p.id} />
                  <button
                    type="submit"
                    className="px-2 text-xs font-semibold text-racing hover:underline"
                  >
                    Supprimer
                  </button>
                </form>
              </div>
            ))}

            <form
              action={savePartnerPlatform}
              className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed border-aluminium p-3"
            >
              <input
                name="name"
                placeholder="Nouvel annuaire / partenaire (ex. PagesJaunes, AutoPlus)"
                required
                className="w-64 rounded-lg border border-aluminium bg-glacier px-3 py-1.5 text-xs text-carbone"
              />
              <input
                name="url"
                placeholder="https://..."
                required
                className="min-w-64 flex-1 rounded-lg border border-aluminium bg-glacier px-3 py-1.5 text-xs text-carbone"
              />
              <button
                type="submit"
                className="rounded-lg border border-carbone bg-carbone text-white hover:bg-racing px-4 py-1.5 text-xs font-bold transition-colors"
              >
                + Ajouter partenaire
              </button>
            </form>
          </div>

          <form
            action={updateSettings}
            className="space-y-5 border-t border-aluminium pt-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-display text-lg font-extrabold text-racing uppercase">
                Infos générales du garage, valise diagnostic, garantie, GPS &amp; réseaux
              </h3>
              <label className="flex items-center gap-2 rounded-xl border border-racing/40 bg-racing-soft/30 px-4 py-2 text-xs font-bold text-carbone">
                <input
                  type="checkbox"
                  name="onlineBookingEnabled"
                  defaultChecked={settings.onlineBookingEnabled}
                  className="size-4 accent-racing"
                />
                Activer la prise de RDV en ligne (/prendre-rendez-vous)
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div>
                <label className={labelClass}>Nom du garage</label>
                <input name="name" defaultValue={settings.name} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Téléphone atelier</label>
                <input name="phone" defaultValue={settings.phone} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>
                  WhatsApp (ex. 33618318915, vide = masqué)
                </label>
                <input
                  name="whatsapp"
                  defaultValue={settings.whatsapp}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Adresse (rue)</label>
                <input
                  name="street"
                  defaultValue={settings.street}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Code postal</label>
                <input
                  name="postalCode"
                  defaultValue={settings.postalCode}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Ville</label>
                <input name="city" defaultValue={settings.city} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>
                  Équipement de diagnostic phare (affiché sur le site)
                </label>
                <input
                  name="flagshipEquipment"
                  defaultValue={settings.flagshipEquipment}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Référence partenaire idGarages</label>
                <input
                  name="idGaragesRef"
                  defaultValue={settings.idGaragesRef}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Note moyenne vérifiée (/5)</label>
                <input
                  name="verifiedRating"
                  defaultValue={settings.verifiedRating}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Nombre d&apos;avis vérifiés</label>
                <input
                  name="verifiedReviewCount"
                  defaultValue={settings.verifiedReviewCount}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Marques &amp; parcs automobiles pris en charge</label>
                <input
                  name="supportedBrands"
                  defaultValue={settings.supportedBrands}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Email public de l&apos;atelier</label>
                <input
                  name="email"
                  defaultValue={settings.email}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Lien fiche Google Maps</label>
                <input
                  name="googleMapsUrl"
                  defaultValue={settings.googleMapsUrl}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Lien « Laisser un avis (idGarages / Google) »
                </label>
                <input
                  name="googleReviewUrl"
                  defaultValue={settings.googleReviewUrl}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Instagram (vide = masqué)</label>
                <input
                  name="instagram"
                  defaultValue={settings.instagram}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Facebook (vide = masqué)</label>
                <input
                  name="facebook"
                  defaultValue={settings.facebook}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>TikTok (vide = masqué)</label>
                <input
                  name="tiktok"
                  defaultValue={settings.tiktok}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Snapchat (vide = masqué)</label>
                <input
                  name="snapchat"
                  defaultValue={settings.snapchat}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Latitude GPS de l&apos;atelier</label>
                <input
                  name="latitude"
                  defaultValue={settings.latitude}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Longitude GPS de l&apos;atelier</label>
                <input
                  name="longitude"
                  defaultValue={settings.longitude}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>
                  Bandeau d&apos;annonce en haut du site (vide = masqué)
                </label>
                <input
                  name="announcement"
                  defaultValue={settings.announcement}
                  placeholder="Ex. Offre Bioéthanol E85 : Étude de compatibilité et diagnostic calculateur offerts ce mois-ci !"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Infos accès &amp; dépose véhicule devant l&apos;atelier
                </label>
                <input
                  name="parkingInfo"
                  defaultValue={settings.parkingInfo}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Infos transports à proximité (Métro, Bus RTM)
                </label>
                <input
                  name="transportInfo"
                  defaultValue={settings.transportInfo}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>
                  Mention légale Garantie Constructeur &amp; Pièces certifiées
                </label>
                <input
                  name="warrantyNote"
                  defaultValue={settings.warrantyNote}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Photo principale d&apos;accueil (Hero)</label>
                <input
                  type="file"
                  name="heroImageFile"
                  accept="image/*"
                  className={inputClass}
                />
                {settings.heroImage ? (
                  <label className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-racing">
                    <input type="checkbox" name="clearHeroImage" className="size-4" />
                    Réinitialiser la photo d&apos;accueil par défaut
                  </label>
                ) : null}
              </div>
              <div>
                <label className={labelClass}>Photo principale « L&apos;Atelier »</label>
                <input
                  type="file"
                  name="workshopImageFile"
                  accept="image/*"
                  className={inputClass}
                />
                {settings.workshopImage ? (
                  <label className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-racing">
                    <input type="checkbox" name="clearWorkshopImage" className="size-4" />
                    Réinitialiser la photo de l&apos;atelier par défaut
                  </label>
                ) : null}
              </div>
            </div>

            <button
              type="submit"
              className="btn-racing rounded-xl px-6 py-2.5 text-xs font-bold uppercase tracking-wider"
            >
              Enregistrer tous les réglages de l&apos;atelier
            </button>
          </form>
        </section>

        {/* ── 6. GALERIE PHOTOS ATELIER & AVIS CLIENTS VÉRIFIÉS ─────── */}
        <section id="sec-galerie" className={`${cardClass} space-y-8`}>
          <div>
            <h2 className="font-display text-2xl font-extrabold uppercase text-carbone">
              6. Galerie photos de l&apos;atelier &amp; avis clients vérifiés
            </h2>
            <p className="text-xs text-technique mt-0.5">
              Publiez les photos de vos réalisations (conversions E85, reprogrammations, diagnostics)
              et les avis vérifiés de vos automobilistes.
            </p>
          </div>

          <div>
            <h3 className="font-display text-lg font-extrabold text-racing uppercase">
              Ajouter une photo de réalisation ou d&apos;équipement à la galerie
            </h3>
            <form
              action={addGalleryPhoto}
              className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 items-center"
            >
              <input
                type="file"
                name="file"
                accept="image/*"
                required
                aria-label="Fichier photo"
                className={inputClass}
              />
              <input
                name="vehicleTag"
                placeholder="Véhicule / Intervention (ex. Golf 8 GTI • E85)"
                className={inputClass}
              />
              <input
                name="alt"
                placeholder="Description SEO de la photo *"
                required
                className={inputClass}
              />
              <button
                type="submit"
                className="btn-racing rounded-xl px-4 py-2.5 text-xs font-bold uppercase"
              >
                + Ajouter à la galerie
              </button>
            </form>

            {gallery.length > 0 ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {gallery.map((g) => (
                  <li
                    key={g.id}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-aluminium bg-glacier/60 p-3 text-xs"
                  >
                    <div>
                      {g.vehicleTag ? (
                        <span className="inline-block rounded bg-racing-soft px-2 py-0.5 text-[10px] font-bold text-racing uppercase mb-1">
                          {g.vehicleTag}
                        </span>
                      ) : null}
                      <p className="font-semibold text-carbone line-clamp-2">{g.alt}</p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-aluminium/70">
                      <a
                        href={g.src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11px] font-semibold text-technique hover:text-carbone"
                      >
                        Voir l&apos;image ↗
                      </a>
                      <form action={deleteGalleryPhoto}>
                        <input type="hidden" name="id" value={g.id} />
                        <button
                          type="submit"
                          className="font-bold text-racing hover:underline"
                        >
                          Supprimer
                        </button>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-xs text-technique">
                Aucune photo dans la galerie.
              </p>
            )}
          </div>

          <div className="border-t border-aluminium pt-6">
            <h3 className="font-display text-lg font-extrabold text-racing uppercase">
              Ajouter un avis client vérifié (idGarages / Google)
            </h3>
            <form
              action={addGarageReview}
              className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
            >
              <input
                name="author"
                placeholder="Prénom / Nom du client *"
                required
                className={inputClass}
              />
              <input
                name="vehicle"
                placeholder="Véhicule / Intervention (ex. Clio 4 • E85)"
                className={inputClass}
              />
              <select
                name="rating"
                defaultValue="5"
                aria-label="Note"
                className={inputClass}
              >
                <option value="5">5 / 5 ★</option>
                <option value="4">4 / 5 ★</option>
              </select>
              <input
                name="source"
                defaultValue="idGarages"
                placeholder="Source (idGarages, Google)"
                className={inputClass}
              />
              <input
                name="date"
                placeholder="Date (ex. 16 juillet 2026)"
                className={inputClass}
              />
              <input
                name="comment"
                placeholder="Texte exact de l'avis client *"
                required
                className={`${inputClass} sm:col-span-2 lg:col-span-4`}
              />
              <button
                type="submit"
                className="rounded-xl border border-carbone bg-carbone text-white hover:bg-racing hover:border-racing px-4 py-2.5 text-xs font-bold uppercase transition-colors"
              >
                Publier l&apos;avis
              </button>
            </form>

            {reviews.length > 0 ? (
              <ul className="mt-4 space-y-2 text-xs">
                {reviews.map((r) => (
                  <li
                    key={r.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-aluminium bg-glacier/60 px-4 py-3"
                  >
                    <span className="text-carbone">
                      <strong>{r.author}</strong> ·{" "}
                      <span className="text-technique">{r.vehicle}</span> (
                      <strong className="text-racing">{r.rating}/5</strong> · {r.source} ·{" "}
                      {r.date}) : « {r.comment} »
                    </span>
                    <form action={deleteGarageReview}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="font-bold text-racing hover:underline"
                      >
                        Supprimer
                      </button>
                    </form>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; status?: string; q?: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-svh bg-glacier flex items-center justify-center p-8 text-sm font-semibold text-technique">
          Chargement du tableau de bord atelier Run Auto…
        </div>
      }
    >
      <DashboardContent searchParams={searchParams} />
    </Suspense>
  );
}
