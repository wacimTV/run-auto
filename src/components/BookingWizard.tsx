"use client";

import React, { useState, useEffect } from "react";
import { format, addDays } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ChevronLeft,
  Loader2,
  ShieldAlert,
} from "lucide-react";
import { GARAGE_CONFIG } from "@/config/garage";
import { DayAvailability } from "@/types";

interface BookingWizardProps {
  initialServiceId?: string;
}

export default function BookingWizard({ initialServiceId }: BookingWizardProps) {
  // Steps: 1 = Service, 2 = Vehicle, 3 = Client, 4 = Date & Time, 5 = Review & Submit, 6 = Success
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    initialServiceId || GARAGE_CONFIG.services[0].id
  );
  const [isCustomService, setIsCustomService] = useState(false);
  const [problemDescription, setProblemDescription] = useState("");

  const [vehicle, setVehicle] = useState({
    make: "",
    model: "",
    year: "",
    fuel: "Essence",
    licensePlate: "",
  });

  const [client, setClient] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    preferredContact: "phone" as "phone" | "sms" | "email",
  });

  // Date and slots state
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availability, setAvailability] = useState<DayAvailability | null>(null);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successData, setSuccessData] = useState<{
    id: string;
    date: string;
    time: string;
    serviceName: string;
  } | null>(null);

  // Anti-spam trap
  const [honeypot, setHoneypot] = useState("");

  // Génération des 21 prochains jours pour la sélection de date
  const availableDays = Array.from({ length: 21 }, (_, i) => {
    const d = addDays(new Date(), i + 1); // Commencer à demain pour garantir la prise en charge
    return {
      dateStr: format(d, "yyyy-MM-dd"),
      dayOfWeek: d.getDay(),
      displayDate: format(d, "EEE d MMM", { locale: fr }),
      fullDate: format(d, "EEEE d MMMM yyyy", { locale: fr }),
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    };
  });

  // Initialisation de la première date disponible
  useEffect(() => {
    const firstValidDay = availableDays.find((d) => !d.isWeekend);
    if (firstValidDay && !selectedDate) {
      setSelectedDate(firstValidDay.dateStr);
    }
  }, []);

  // Chargement des créneaux dès changement de date
  useEffect(() => {
    if (!selectedDate) return;

    let isMounted = true;
    setLoadingSlots(true);
    setErrorMessage(null);

    fetch(`/api/slots?date=${selectedDate}`)
      .then((res) => res.json())
      .then((data: DayAvailability) => {
        if (!isMounted) return;
        setAvailability(data);
        setSelectedTime(""); // Réinitialiser l'heure lors d'un changement de jour
        setLoadingSlots(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error("Erreur de récupération des créneaux", err);
        setErrorMessage("Impossible de charger les créneaux pour cette date.");
        setLoadingSlots(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Validation par étape
  const canProceedStep1 = isCustomService ? problemDescription.trim().length > 3 : Boolean(selectedServiceId);
  const canProceedStep2 = vehicle.make.trim().length > 1 && vehicle.model.trim().length > 0;
  const canProceedStep3 =
    client.firstName.trim().length > 1 &&
    client.lastName.trim().length > 1 &&
    client.phone.trim().length >= 8 &&
    client.email.includes("@");
  const canProceedStep4 = Boolean(selectedDate && selectedTime);

  const getSelectedServiceName = () => {
    if (isCustomService) return "Demande sur-mesure / Diagnostic approfondi";
    const s = GARAGE_CONFIG.services.find((item) => item.id === selectedServiceId);
    return s ? s.title : "Prestation sélectionnée";
  };

  // Soumission finale
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        website_trap: honeypot, // Honeypot
        serviceId: isCustomService ? "custom" : selectedServiceId,
        serviceName: getSelectedServiceName(),
        isCustomRequest: isCustomService,
        problemDescription,
        vehicle,
        client,
        date: selectedDate,
        time: selectedTime,
      };

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue lors de la réservation.");
      }

      setSuccessData({
        id: data.appointment.id,
        date: selectedDate,
        time: selectedTime,
        serviceName: data.appointment.serviceName,
      });
      setCurrentStep(6);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur de connexion";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-aluminium rounded-2xl p-6 sm:p-10 shadow-[0_14px_40px_-10px_rgba(23,25,29,0.07)] relative overflow-hidden">
      {/* Decorative ambient red accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-racing/[0.04] rounded-full blur-3xl pointer-events-none" />

      {/* Trap Honeypot field for anti-spam bots */}
      <input
        type="text"
        name="website_trap"
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      {/* Progress Steps Header */}
      {currentStep <= 5 && (
        <div className="mb-10">
          <div className="flex items-center justify-between text-xs font-bold tracking-wider uppercase text-technique mb-3">
            <span>Étape {currentStep} sur 5</span>
            <span className="text-racing">
              {currentStep === 1 && "Choix de l'intervention"}
              {currentStep === 2 && "Votre véhicule"}
              {currentStep === 3 && "Vos coordonnées"}
              {currentStep === 4 && "Date & Créneau"}
              {currentStep === 5 && "Récapitulatif & Envoi"}
            </span>
          </div>

          <div className="w-full h-2 bg-aluminium rounded-full overflow-hidden flex">
            {[1, 2, 3, 4, 5].map((step) => (
              <div
                key={step}
                className={`flex-1 transition-all duration-300 ${
                  step <= currentStep ? "bg-racing" : "bg-transparent"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Error Message Banner */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-xl bg-racing-soft border border-racing/30 flex items-start gap-3 text-racing text-sm">
          <AlertCircle className="w-5 h-5 text-racing shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

      {/* STEP 1: SERVICE SELECTION */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-carbone mb-2">Sélectionnez la prestation souhaitée</h2>
            <p className="text-sm text-technique">
              Choisissez l&apos;intervention requise ou décrivez votre besoin particulier pour un diagnostic ciblé.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {GARAGE_CONFIG.services.map((srv) => {
              const isSelected = !isCustomService && selectedServiceId === srv.id;
              const isE85 = srv.slug === "conversion-bioethanol-e85";
              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    setIsCustomService(false);
                    setSelectedServiceId(srv.id);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? isE85
                        ? "bg-e85-soft border-e85 shadow-sm"
                        : "bg-racing-soft border-racing shadow-sm"
                      : "bg-glacier border-aluminium hover:border-racing/45 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 gap-2">
                    <span className="text-sm font-bold text-carbone">{srv.title}</span>
                    {srv.badge && (
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                          isE85
                            ? "bg-e85-soft text-e85 border border-e85/30"
                            : "bg-racing-soft text-racing border border-racing/25"
                        }`}
                      >
                        {srv.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-technique line-clamp-2">{srv.shortDescription}</p>
                  <div
                    className={`mt-2.5 text-[11px] font-semibold flex items-center justify-between ${
                      isE85 ? "text-e85" : "text-racing"
                    }`}
                  >
                    <span>{srv.priceNotice}</span>
                    <span className="text-technique font-medium">
                      Durée estimée : ~{srv.estimatedDurationMinutes} min
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Custom option */}
            <div
              onClick={() => setIsCustomService(true)}
              className={`p-4 rounded-xl border cursor-pointer transition-all md:col-span-2 ${
                isCustomService
                  ? "bg-racing-soft border-racing shadow-sm"
                  : "bg-glacier border-aluminium hover:border-racing/45 hover:bg-white"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-bold text-carbone">Autre demande / Symptôme spécifique</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white border border-aluminium text-technique">
                  Personnalisé
                </span>
              </div>
              <p className="text-xs text-technique">
                Bruit suspect, voyant inhabituel, vibration ou demande spécifique non répertoriée ci-dessus.
              </p>
            </div>
          </div>

          {/* Description textarea */}
          <div>
            <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-2">
              Précisions sur le problème ou vos remarques {isCustomService ? "(Obligatoire)" : "(Facultatif)"}
            </label>
            <textarea
              value={problemDescription}
              onChange={(e) => setProblemDescription(e.target.value)}
              placeholder="Ex: bruit de claquement à l'avant gauche lors des braquages, voyant moteur orange allumé depuis 2 jours..."
              rows={3}
              className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              disabled={!canProceedStep1}
              onClick={() => setCurrentStep(2)}
              className="btn-racing px-7 py-3 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Continuer vers le véhicule</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: VEHICLE INFORMATION */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-carbone mb-2">Informations sur votre véhicule</h2>
            <p className="text-sm text-technique">
              Ces informations permettent à nos mécaniciens de préparer l&apos;outillage et les pièces adéquates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Marque *
              </label>
              <input
                type="text"
                required
                value={vehicle.make}
                onChange={(e) => setVehicle({ ...vehicle, make: e.target.value })}
                placeholder="Ex: Peugeot, Renault, Audi, BMW, Toyota..."
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Modèle *
              </label>
              <input
                type="text"
                required
                value={vehicle.model}
                onChange={(e) => setVehicle({ ...vehicle, model: e.target.value })}
                placeholder="Ex: 308, Clio 5, A4, Série 3, Yaris..."
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Motorisation / Énergie
              </label>
              <select
                value={vehicle.fuel}
                onChange={(e) => setVehicle({ ...vehicle, fuel: e.target.value })}
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone focus:outline-none focus:bg-white focus:border-racing transition-colors"
              >
                <option value="Essence">Essence</option>
                <option value="Bioéthanol E85 / FlexFuel">Bioéthanol E85 / FlexFuel</option>
                <option value="Diesel">Diesel</option>
                <option value="Hybride">Hybride / Hybride rechargeable</option>
                <option value="Électrique">100% Électrique</option>
                <option value="GPL">GPL / Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Année de mise en circulation (facultatif)
              </label>
              <input
                type="text"
                value={vehicle.year}
                onChange={(e) => setVehicle({ ...vehicle, year: e.target.value })}
                placeholder="Ex: 2019"
                maxLength={4}
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Immatriculation (facultatif mais recommandé pour devis pièces)
              </label>
              <input
                type="text"
                value={vehicle.licensePlate}
                onChange={(e) => setVehicle({ ...vehicle, licensePlate: e.target.value.toUpperCase() })}
                placeholder="Ex: AA-123-BB"
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="text-sm font-medium text-technique hover:text-carbone flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              disabled={!canProceedStep2}
              onClick={() => setCurrentStep(3)}
              className="btn-racing px-7 py-3 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Continuer vers vos coordonnées</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CLIENT INFORMATION */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-carbone mb-2">Vos coordonnées</h2>
            <p className="text-sm text-technique">
              Nous utilisons ces données exclusivement pour la confirmation et le suivi de votre intervention.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Prénom *
              </label>
              <input
                type="text"
                required
                value={client.firstName}
                onChange={(e) => setClient({ ...client, firstName: e.target.value })}
                placeholder="Votre prénom"
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Nom *
              </label>
              <input
                type="text"
                required
                value={client.lastName}
                onChange={(e) => setClient({ ...client, lastName: e.target.value })}
                placeholder="Votre nom"
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Téléphone mobile *
              </label>
              <input
                type="tel"
                required
                value={client.phone}
                onChange={(e) => setClient({ ...client, phone: e.target.value })}
                placeholder="06 12 34 56 78"
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-1.5">
                Adresse e-mail *
              </label>
              <input
                type="email"
                required
                value={client.email}
                onChange={(e) => setClient({ ...client, email: e.target.value })}
                placeholder="votre.email@domaine.fr"
                className="w-full bg-glacier border border-aluminium rounded-xl px-4 py-3 text-sm text-carbone placeholder-technique/60 focus:outline-none focus:bg-white focus:border-racing transition-colors"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-2">
                Moyen de contact préféré pour la confirmation
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: "phone", label: "Appel téléphonique" },
                  { id: "sms", label: "SMS" },
                  { id: "email", label: "E-mail" },
                ].map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setClient({ ...client, preferredContact: option.id as "phone" | "sms" | "email" })
                    }
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border text-center transition-all ${
                      client.preferredContact === option.id
                        ? "bg-racing-soft border-racing text-racing"
                        : "bg-glacier border-aluminium text-technique hover:border-racing/40 hover:text-carbone"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="text-sm font-medium text-technique hover:text-carbone flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              disabled={!canProceedStep3}
              onClick={() => setCurrentStep(4)}
              className="btn-racing px-7 py-3 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Continuer vers le créneau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: DATE & TIME SLOTS */}
      {currentStep === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-carbone mb-2">Date et horaire d&apos;intervention</h2>
            <p className="text-sm text-technique">
              Atelier ouvert du lundi au vendredi (09:00 - 19:00). Sélectionnez votre créneau.
            </p>
          </div>

          {/* Date Picker Ribbon */}
          <div>
            <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-2.5">
              1. Choisissez un jour ouvrable
            </label>
            <div className="flex gap-2 overflow-x-auto pb-3 pt-1 scrollbar-thin">
              {availableDays.map((d) => {
                const isSelected = selectedDate === d.dateStr;
                return (
                  <button
                    key={d.dateStr}
                    type="button"
                    disabled={d.isWeekend}
                    onClick={() => setSelectedDate(d.dateStr)}
                    className={`shrink-0 flex flex-col items-center py-3 px-4 rounded-xl border text-xs transition-all ${
                      d.isWeekend
                        ? "opacity-40 cursor-not-allowed bg-glacier border-aluminium text-technique"
                        : isSelected
                        ? "bg-racing border-racing text-white font-bold shadow-md shadow-racing/20"
                        : "bg-glacier border-aluminium text-carbone hover:border-racing/50 hover:bg-white"
                      }`}
                  >
                    <span className="capitalize">{d.displayDate.split(" ")[0]}</span>
                    <span className="text-base font-extrabold mt-0.5">{d.displayDate.split(" ")[1]}</span>
                    <span className="text-[10px]">{d.displayDate.split(" ")[2]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots Grid */}
          <div>
            <label className="block text-xs font-bold text-carbone uppercase tracking-wider mb-2.5">
              2. Sélectionnez votre heure de dépôt du véhicule
            </label>

            {loadingSlots ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-technique">
                <Loader2 className="w-6 h-6 animate-spin text-racing" />
                <span className="text-xs">Vérification des disponibilités en temps réel...</span>
              </div>
            ) : availability && !availability.isOpen ? (
              <div className="p-6 rounded-xl bg-glacier border border-aluminium text-center text-sm text-technique">
                Le garage est fermé ce jour ({availability.dayName}). Veuillez choisir un autre jour de la semaine.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {availability?.slots.map((slot) => {
                  const isSelected = selectedTime === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedTime(slot.time)}
                      className={`p-3 rounded-xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                        !slot.isAvailable
                          ? "opacity-40 cursor-not-allowed bg-glacier border-aluminium text-technique line-through"
                          : isSelected
                          ? "bg-racing border-racing text-white shadow-md shadow-racing/20 font-bold"
                          : "bg-glacier border-aluminium text-carbone hover:border-racing/50 hover:bg-white"
                        }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{slot.time}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(3)}
              className="text-sm font-medium text-technique hover:text-carbone flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              disabled={!canProceedStep4}
              onClick={() => setCurrentStep(5)}
              className="btn-racing px-7 py-3 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <span>Vérifier le récapitulatif</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: REVIEW & CONFIRM */}
      {currentStep === 5 && (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-carbone mb-2">Récapitulatif de votre demande</h2>
            <p className="text-sm text-technique">
              Vérifiez l&apos;exactitude des informations avant d&apos;envoyer votre demande de rendez-vous.
            </p>
          </div>

          <div className="bg-glacier border border-aluminium rounded-xl p-5 space-y-4">
            {/* Service */}
            <div className="flex items-start justify-between pb-3 border-b border-aluminium">
              <div>
                <span className="text-xs uppercase text-technique font-semibold block">Prestation</span>
                <span className="text-base font-bold text-carbone">{getSelectedServiceName()}</span>
                {problemDescription && (
                  <p className="text-xs text-technique mt-1 italic">« {problemDescription} »</p>
                )}
              </div>
              <button
                onClick={() => setCurrentStep(1)}
                className="text-xs font-semibold text-racing hover:underline"
              >
                Modifier
              </button>
            </div>

            {/* Vehicle */}
            <div className="flex items-start justify-between pb-3 border-b border-aluminium">
              <div>
                <span className="text-xs uppercase text-technique font-semibold block">Véhicule</span>
                <span className="text-sm font-bold text-carbone">
                  {vehicle.make} {vehicle.model} ({vehicle.fuel})
                </span>
                {vehicle.licensePlate && (
                  <span className="text-xs font-semibold text-racing block mt-0.5">
                    Immatriculation : {vehicle.licensePlate}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCurrentStep(2)}
                className="text-xs font-semibold text-racing hover:underline"
              >
                Modifier
              </button>
            </div>

            {/* Date and Time */}
            <div className="flex items-start justify-between pb-3 border-b border-aluminium">
              <div>
                <span className="text-xs uppercase text-technique font-semibold block">Date &amp; Heure</span>
                <span className="text-sm font-bold text-racing flex items-center gap-1.5 mt-0.5">
                  <CalendarIcon className="w-4 h-4 text-racing" />
                  {selectedDate} à {selectedTime}
                </span>
              </div>
              <button
                onClick={() => setCurrentStep(4)}
                className="text-xs font-semibold text-racing hover:underline"
              >
                Modifier
              </button>
            </div>

            {/* Client */}
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs uppercase text-technique font-semibold block">Client</span>
                <span className="text-sm font-bold text-carbone">
                  {client.firstName} {client.lastName}
                </span>
                <p className="text-xs text-technique">
                  {client.phone} • {client.email}
                </p>
              </div>
              <button
                onClick={() => setCurrentStep(3)}
                className="text-xs font-semibold text-racing hover:underline"
              >
                Modifier
              </button>
            </div>
          </div>

          {/* Distinction légale & transparence demandée */}
          <div className="p-4 rounded-xl bg-racing-soft border border-racing/25 text-xs text-technique flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-racing shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-carbone mb-0.5">Engagement de transparence Run Auto</p>
              <p>
                Votre demande est transmise immédiatement à notre atelier. Afin de vous garantir une prise en charge personnalisée sans attente, notre équipe valide chaque disponibilité sous 2h ouvrées par {client.preferredContact === "sms" ? "SMS" : client.preferredContact === "email" ? "e-mail" : "téléphone"}.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              onClick={() => setCurrentStep(4)}
              className="text-sm font-medium text-technique hover:text-carbone flex items-center gap-1.5 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Retour</span>
            </button>

            <button
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="btn-racing px-8 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmer la demande de rendez-vous</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 6: SUCCESS CONFIRMATION */}
      {currentStep === 6 && successData && (
        <div className="py-8 text-center space-y-6">
          <div className="w-16 h-16 rounded-full bg-racing-soft border border-racing flex items-center justify-center mx-auto text-racing shadow-lg shadow-racing/15">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest font-bold text-racing">
              Demande envoyée • En attente de confirmation
            </span>
            <h2 className="text-3xl font-extrabold text-carbone mt-1">
              Merci, votre demande est bien enregistrée !
            </h2>
            <p className="text-sm text-technique max-w-lg mx-auto mt-2">
              Référence du dossier : <strong className="text-carbone font-mono">{successData.id}</strong>
            </p>
          </div>

          <div className="bg-glacier border border-aluminium rounded-xl p-6 max-w-md mx-auto text-left text-sm space-y-2">
            <div className="flex justify-between">
              <span className="text-technique">Intervention :</span>
              <span className="text-carbone font-bold">{successData.serviceName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-technique">Date &amp; Heure :</span>
              <span className="text-racing font-bold">
                {successData.date} à {successData.time}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-technique">Lieu :</span>
              <span className="text-carbone">52 bd de Roux, 13004 Marseille</span>
            </div>
          </div>

          <p className="text-xs text-technique max-w-md mx-auto leading-relaxed">
            Un e-mail récapitulatif a été généré. Notre chef d&apos;atelier vous contactera très rapidement par téléphone ({client.phone}) pour valider définitivement les détails de l&apos;intervention.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                setCurrentStep(1);
                setSuccessData(null);
              }}
              className="btn-outline-racing px-6 py-2.5 rounded-xl text-xs font-bold"
            >
              Faire une autre demande
            </button>
            <a
              href={`tel:${GARAGE_CONFIG.contact.phone.replace(/\s/g, "")}`}
              className="text-xs font-semibold text-carbone bg-glacier border border-aluminium px-6 py-2.5 rounded-xl hover:border-racing/40 transition-colors"
            >
              Joindre l&apos;atelier en direct ({GARAGE_CONFIG.contact.phoneDisplay})
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
