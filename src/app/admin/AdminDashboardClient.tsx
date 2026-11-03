"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  Phone,
  LogOut,
  CalendarDays,
  MessageSquare,
  Wrench,
  Trash2,
  Search,
  Filter,
} from "lucide-react";
import { Appointment, ContactMessage, AppointmentStatus } from "@/types";
import { GARAGE_CONFIG } from "@/config/garage";

interface AdminDashboardClientProps {
  initialAppointments: Appointment[];
  initialContacts: ContactMessage[];
  initialBlockedDates: string[];
}

export default function AdminDashboardClient({
  initialAppointments,
  initialContacts,
  initialBlockedDates,
}: AdminDashboardClientProps) {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments);
  const [contacts] = useState<ContactMessage[]>(initialContacts);
  const [blockedDates, setBlockedDates] = useState<string[]>(initialBlockedDates);

  const [activeTab, setActiveTab] = useState<"appointments" | "contacts" | "calendar" | "services">("appointments");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApt, setSelectedApt] = useState<Appointment | null>(null);
  const [, setIsUpdating] = useState(false);

  // Date à bloquer manuellement
  const [newBlockedDate, setNewBlockedDate] = useState("");

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleUpdateStatus = async (id: string, newStatus: AppointmentStatus) => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setAppointments((prev) =>
          prev.map((apt) => (apt.id === id ? { ...apt, status: newStatus } : apt))
        );
        if (selectedApt && selectedApt.id === id) {
          setSelectedApt({ ...selectedApt, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Erreur lors de la mise à jour", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAppointment = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer définitivement ce rendez-vous ?")) return;

    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
        if (selectedApt?.id === id) setSelectedApt(null);
      }
    } catch (err) {
      console.error("Erreur suppression", err);
    }
  };

  const handleToggleBlockedDate = async (dateStr: string) => {
    if (!dateStr) return;
    try {
      const res = await fetch("/api/admin/toggle-date", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: dateStr }),
      });
      const data = await res.json();
      if (data.success) {
        if (data.isBlocked) {
          setBlockedDates((prev) => [...prev, dateStr]);
        } else {
          setBlockedDates((prev) => prev.filter((d) => d !== dateStr));
        }
        setNewBlockedDate("");
      }
    } catch (err) {
      console.error("Erreur toggle date", err);
    }
  };

  // KPIs
  const todayStr = new Date().toISOString().split("T")[0];
  const pendingCount = appointments.filter((a) => a.status === "pending").length;
  const todayCount = appointments.filter((a) => a.date === todayStr && a.status !== "cancelled").length;
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length;
  const contactsCount = contacts.length;

  // Filtered Appointments
  const filteredAppointments = appointments.filter((apt) => {
    const matchStatus = statusFilter === "all" || apt.status === statusFilter;
    const query = searchQuery.toLowerCase();
    const matchQuery =
      apt.client.lastName.toLowerCase().includes(query) ||
      apt.client.firstName.toLowerCase().includes(query) ||
      apt.client.phone.includes(query) ||
      apt.vehicle.make.toLowerCase().includes(query) ||
      apt.vehicle.model.toLowerCase().includes(query) ||
      (apt.vehicle.licensePlate && apt.vehicle.licensePlate.toLowerCase().includes(query)) ||
      apt.id.toLowerCase().includes(query);

    return matchStatus && matchQuery;
  });

  return (
    <div className="min-h-screen bg-glacier text-carbone pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        {/* Top Bar Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-aluminium mb-8">
          <div>
            <div className="flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-racing animate-pulse" />
              <h1 className="text-2xl font-black tracking-wide uppercase text-carbone font-display">
                Tableau de Bord Atelier • Run Auto
              </h1>
            </div>
            <p className="text-xs text-technique mt-1">
              52 boulevard de Roux, 13004 Marseille • Gestion des réservations et des disponibilités
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="btn-outline-racing px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Déconnexion</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-2xl bg-white border border-racing/30 shadow-[0_8px_24px_-6px_rgba(215,25,32,0.08)]">
            <span className="text-xs font-bold text-racing uppercase tracking-wider block mb-1">
              En Attente de Validation
            </span>
            <span className="text-3xl font-extrabold text-carbone">{pendingCount}</span>
            <span className="text-[11px] text-technique block mt-1">Demandes à confirmer</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-aluminium shadow-[0_8px_24px_-6px_rgba(23,25,29,0.04)]">
            <span className="text-xs font-bold text-technique uppercase tracking-wider block mb-1">
              Rendez-vous Aujourd&apos;hui
            </span>
            <span className="text-3xl font-extrabold text-carbone">{todayCount}</span>
            <span className="text-[11px] text-technique block mt-1">Véhicules attendus</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-aluminium shadow-[0_8px_24px_-6px_rgba(23,25,29,0.04)]">
            <span className="text-xs font-bold text-e85 uppercase tracking-wider block mb-1">
              Confirmés
            </span>
            <span className="text-3xl font-extrabold text-carbone">{confirmedCount}</span>
            <span className="text-[11px] text-technique block mt-1">Dossiers validés</span>
          </div>

          <div className="p-5 rounded-2xl bg-white border border-aluminium shadow-[0_8px_24px_-6px_rgba(23,25,29,0.04)]">
            <span className="text-xs font-bold text-technique uppercase tracking-wider block mb-1">
              Messages Reçus
            </span>
            <span className="text-3xl font-extrabold text-carbone">{contactsCount}</span>
            <span className="text-[11px] text-technique block mt-1">Demandes de devis</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-aluminium pb-3 mb-8 overflow-x-auto">
          {[
            { id: "appointments", label: "Demandes de Rendez-vous", icon: Calendar },
            { id: "contacts", label: "Messages de Contact", icon: MessageSquare },
            { id: "calendar", label: "Fermetures & Disponibilités", icon: CalendarDays },
            { id: "services", label: "Prestations Configurées", icon: Wrench },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "appointments" | "contacts" | "calendar" | "services")}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all ${
                  isActive
                    ? "bg-racing text-white shadow-md shadow-racing/20 font-bold"
                    : "bg-white border border-aluminium text-technique hover:text-carbone hover:border-racing/45"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: APPOINTMENTS */}
        {activeTab === "appointments" && (
          <div className="space-y-6">
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-aluminium shadow-[0_4px_16px_-6px_rgba(23,25,29,0.04)]">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-technique absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher par client, immatriculation, véhicule, réf..."
                  className="w-full bg-glacier border border-aluminium rounded-xl pl-10 pr-4 py-2 text-xs text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <Filter className="w-3.5 h-3.5 text-technique shrink-0" />
                {[
                  { id: "all", label: "Tous" },
                  { id: "pending", label: "En attente" },
                  { id: "confirmed", label: "Confirmés" },
                  { id: "completed", label: "Terminés" },
                  { id: "cancelled", label: "Annulés" },
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setStatusFilter(f.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      statusFilter === f.id
                        ? "bg-racing text-white font-bold"
                        : "bg-glacier text-technique hover:text-carbone"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Appointments Table */}
            {filteredAppointments.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-aluminium text-sm text-technique">
                Aucun rendez-vous correspondant au filtre.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAppointments.map((apt) => (
                  <div
                    key={apt.id}
                    className="p-5 rounded-2xl bg-white border border-aluminium hover:border-racing/40 shadow-[0_6px_20px_-6px_rgba(23,25,29,0.04)] transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6"
                  >
                    {/* Status & Date */}
                    <div className="flex items-start gap-4 min-w-[200px]">
                      <div className="w-12 h-12 rounded-xl bg-glacier border border-aluminium flex flex-col items-center justify-center shrink-0">
                        <span className="text-[10px] uppercase text-technique font-semibold">
                          {apt.date.split("-")[2]}
                        </span>
                        <span className="text-xs font-bold text-racing">{apt.time}</span>
                      </div>
                      <div>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-block mb-1 ${
                            apt.status === "pending"
                              ? "bg-racing-soft text-racing border border-racing/30"
                              : apt.status === "confirmed"
                              ? "bg-e85-soft text-e85 border border-e85/30"
                              : apt.status === "completed"
                              ? "bg-glacier text-carbone border border-aluminium"
                              : "bg-glacier text-technique border border-aluminium"
                          }`}
                        >
                          {apt.status === "pending" && "En attente"}
                          {apt.status === "confirmed" && "Confirmé"}
                          {apt.status === "completed" && "Terminé"}
                          {apt.status === "cancelled" && "Annulé"}
                        </span>
                        <p className="text-xs text-technique">{apt.date}</p>
                        <p className="text-[10px] font-mono text-technique/70">{apt.id}</p>
                      </div>
                    </div>

                    {/* Service & Problem */}
                    <div className="flex-1">
                      <p className="text-sm font-bold text-carbone">{apt.serviceName}</p>
                      {apt.problemDescription && (
                        <p className="text-xs text-technique mt-1 italic line-clamp-2">
                          « {apt.problemDescription} »
                        </p>
                      )}
                    </div>

                    {/* Vehicle */}
                    <div className="min-w-[180px]">
                      <p className="text-xs font-bold text-carbone">
                        {apt.vehicle.make} {apt.vehicle.model}
                      </p>
                      <p className="text-[11px] text-technique">{apt.vehicle.fuel}</p>
                      {apt.vehicle.licensePlate && (
                        <span className="text-[10px] font-mono font-bold text-racing bg-racing-soft px-1.5 py-0.5 rounded border border-racing/25 inline-block mt-0.5">
                          {apt.vehicle.licensePlate}
                        </span>
                      )}
                    </div>

                    {/* Client */}
                    <div className="min-w-[200px]">
                      <p className="text-xs font-bold text-carbone">
                        {apt.client.firstName} {apt.client.lastName}
                      </p>
                      <a
                        href={`tel:${apt.client.phone}`}
                        className="text-xs font-semibold text-racing hover:underline flex items-center gap-1 mt-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{apt.client.phone}</span>
                      </a>
                      <p className="text-[11px] text-technique">{apt.client.email}</p>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      {apt.status === "pending" && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, "confirmed")}
                          className="btn-e85 px-3 py-1.5 rounded-lg text-xs"
                        >
                          Confirmer
                        </button>
                      )}

                      {apt.status === "confirmed" && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, "completed")}
                          className="btn-outline-racing px-3 py-1.5 rounded-lg text-xs"
                        >
                          Terminé
                        </button>
                      )}

                      {apt.status !== "cancelled" && (
                        <button
                          onClick={() => handleUpdateStatus(apt.id, "cancelled")}
                          className="px-3 py-1.5 rounded-lg bg-glacier text-technique border border-aluminium text-xs font-semibold hover:bg-racing hover:text-white hover:border-racing transition-colors"
                        >
                          Annuler
                        </button>
                      )}

                      <button
                        onClick={() => handleDeleteAppointment(apt.id)}
                        className="p-2 rounded-lg text-racing hover:bg-racing-soft border border-transparent hover:border-racing/30 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CONTACT MESSAGES */}
        {activeTab === "contacts" && (
          <div className="space-y-4">
            {contacts.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border border-aluminium text-sm text-technique">
                Aucun message de contact pour l&apos;instant.
              </div>
            ) : (
              contacts.map((msg) => (
                <div
                  key={msg.id}
                  className="p-6 rounded-2xl bg-white border border-aluminium shadow-[0_6px_20px_-6px_rgba(23,25,29,0.04)] space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-aluminium pb-3">
                    <div>
                      <span className="text-xs font-bold text-carbone">{msg.name}</span>
                      <span className="text-xs text-technique ml-3">
                        ({msg.email} {msg.phone ? `• ${msg.phone}` : ""})
                      </span>
                    </div>
                    <span className="text-[11px] text-technique">
                      {new Date(msg.createdAt).toLocaleString("fr-FR")}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-racing">Objet : {msg.subject}</p>
                  <p className="text-sm text-carbone leading-relaxed bg-glacier p-4 rounded-xl border border-aluminium">
                    {msg.message}
                  </p>

                  <div className="flex items-center gap-4 pt-2">
                    <a
                      href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
                      className="btn-outline-racing px-4 py-1.5 rounded-lg text-xs font-semibold"
                    >
                      Répondre par e-mail
                    </a>
                    {msg.phone && (
                      <a
                        href={`tel:${msg.phone}`}
                        className="text-xs font-semibold text-racing hover:underline"
                      >
                        Appeler ({msg.phone})
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* TAB 3: CALENDAR & EXCEPTIONS */}
        {activeTab === "calendar" && (
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-white border border-aluminium shadow-[0_6px_20px_-6px_rgba(23,25,29,0.04)] space-y-4">
              <h3 className="text-lg font-bold text-carbone font-display">
                Bloquer une date exceptionnelle (fermeture atelier, congé, inventaire)
              </h3>
              <p className="text-xs text-technique">
                Les dates bloquées n&apos;apparaitront plus dans les créneaux disponibles du site public.
              </p>

              <div className="flex items-center gap-3">
                <input
                  type="date"
                  value={newBlockedDate}
                  onChange={(e) => setNewBlockedDate(e.target.value)}
                  className="bg-glacier border border-aluminium rounded-xl px-4 py-2.5 text-xs text-carbone focus:outline-none focus:bg-white focus:border-racing"
                />
                <button
                  type="button"
                  onClick={() => handleToggleBlockedDate(newBlockedDate)}
                  disabled={!newBlockedDate}
                  className="btn-racing px-5 py-2.5 rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  Bloquer / Débloquer cette date
                </button>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-aluminium shadow-[0_6px_20px_-6px_rgba(23,25,29,0.04)]">
              <h4 className="text-sm font-bold text-carbone mb-3">Dates actuellement bloquées</h4>
              {blockedDates.length === 0 ? (
                <p className="text-xs text-technique">Aucune date n&apos;est actuellement bloquée.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {blockedDates.map((dateStr) => (
                    <div
                      key={dateStr}
                      className="px-3 py-1.5 rounded-xl bg-racing-soft border border-racing/30 text-racing text-xs font-semibold flex items-center gap-2"
                    >
                      <span>{dateStr}</span>
                      <button
                        onClick={() => handleToggleBlockedDate(dateStr)}
                        className="text-racing hover:text-carbone font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: SERVICES OVERVIEW */}
        {activeTab === "services" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {GARAGE_CONFIG.services.map((srv) => {
              const isE85 = srv.slug === "conversion-bioethanol-e85";
              return (
                <div
                  key={srv.id}
                  className="p-5 rounded-2xl bg-white border border-aluminium shadow-[0_6px_20px_-6px_rgba(23,25,29,0.04)] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-carbone">{srv.title}</h4>
                    <span className="text-xs font-bold text-technique">
                      ~{srv.estimatedDurationMinutes} min
                    </span>
                  </div>
                  <p className="text-xs text-technique">{srv.shortDescription}</p>
                  <p className={`text-[11px] font-bold ${isE85 ? "text-e85" : "text-racing"}`}>
                    {srv.priceNotice}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
