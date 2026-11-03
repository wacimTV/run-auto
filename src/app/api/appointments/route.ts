import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { isSlotAvailable } from "@/lib/availability";
import { verifyAdminSession } from "@/lib/auth";
import { sendAppointmentNotifications } from "@/lib/email";
import { GARAGE_CONFIG } from "@/config/garage";
import {
  cleanString,
  DATE_REGEX,
  EMAIL_REGEX,
  TIME_REGEX,
  getClientIp,
  isValidPhone,
} from "@/lib/validation";
import { Appointment, PreferredContactMethod } from "@/types";

const CUSTOM_SERVICE_NAME = "Demande sur-mesure / Diagnostic approfondi";
const ALLOWED_CONTACT: PreferredContactMethod[] = ["phone", "sms", "email"];

export async function GET() {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const appointments = storage.getAppointments();
  return NextResponse.json({ appointments });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }

    // Protection anti-spam honeypot
    if (typeof body.website_trap === "string" && body.website_trap.length > 0) {
      return NextResponse.json({ error: "Requête suspecte rejetée" }, { status: 400 });
    }

    const vehicle = body.vehicle && typeof body.vehicle === "object" ? body.vehicle : {};
    const client = body.client && typeof body.client === "object" ? body.client : {};

    const isCustomRequest = Boolean(body.isCustomRequest);
    const rawServiceId = cleanString(body.serviceId, 80);
    const problemDescription = cleanString(body.problemDescription, 2000);
    const date = cleanString(body.date, 10);
    const time = cleanString(body.time, 5);

    // Résolution de la prestation côté serveur (le nom n'est jamais pris tel quel du client)
    const service = GARAGE_CONFIG.services.find((s) => s.id === rawServiceId);
    let serviceId: string;
    let serviceName: string;
    if (isCustomRequest || rawServiceId === "custom") {
      serviceId = "custom";
      serviceName = CUSTOM_SERVICE_NAME;
    } else if (service) {
      serviceId = service.id;
      serviceName = service.title;
    } else {
      return NextResponse.json(
        { error: "Prestation inconnue. Veuillez sélectionner une prestation dans la liste." },
        { status: 400 }
      );
    }

    if (serviceId === "custom" && problemDescription.length < 4) {
      return NextResponse.json(
        { error: "Merci de décrire votre demande pour une prestation sur-mesure." },
        { status: 400 }
      );
    }

    if (!DATE_REGEX.test(date) || !TIME_REGEX.test(time)) {
      return NextResponse.json(
        { error: "Veuillez renseigner le service, la date et l'heure." },
        { status: 400 }
      );
    }

    const make = cleanString(vehicle.make, 60);
    const model = cleanString(vehicle.model, 80);
    if (make.length < 2 || model.length < 1) {
      return NextResponse.json(
        { error: "Veuillez renseigner la marque et le modèle du véhicule." },
        { status: 400 }
      );
    }

    const firstName = cleanString(client.firstName, 60);
    const lastName = cleanString(client.lastName, 60);
    const phone = cleanString(client.phone, 25);
    const email = cleanString(client.email, 120).toLowerCase();

    if (firstName.length < 2 || lastName.length < 2 || !phone || !email) {
      return NextResponse.json(
        { error: "Veuillez renseigner vos coordonnées complètes (nom, prénom, téléphone et e-mail)." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Adresse e-mail invalide." }, { status: 400 });
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json({ error: "Numéro de téléphone incomplet." }, { status: 400 });
    }

    const preferredContact: PreferredContactMethod = ALLOWED_CONTACT.includes(client.preferredContact)
      ? client.preferredContact
      : "phone";

    // Vérification de la disponibilité effective du créneau
    const availabilityCheck = isSlotAvailable(date, time);
    if (!availabilityCheck.available) {
      return NextResponse.json(
        { error: availabilityCheck.error || "Ce créneau n'est pas disponible." },
        { status: 409 }
      );
    }

    const appointmentId = `APT-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newAppointment: Appointment = {
      id: appointmentId,
      createdAt: new Date().toISOString(),
      serviceId,
      serviceName,
      isCustomRequest: serviceId === "custom",
      problemDescription,
      vehicle: {
        make,
        model,
        year: cleanString(vehicle.year, 4),
        fuel: cleanString(vehicle.fuel, 40),
        licensePlate: cleanString(vehicle.licensePlate, 15).toUpperCase(),
      },
      client: {
        firstName,
        lastName,
        phone,
        email,
        preferredContact,
      },
      date,
      time,
      status: "pending",
      ipAddress: getClientIp(request.headers),
    };

    // Sauvegarde atomique avec protection double réservation
    try {
      storage.createAppointment(newAppointment);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Ce créneau n'est pas disponible.";
      return NextResponse.json({ error: msg }, { status: 409 });
    }

    // Déclenchement de la notification (non-bloquant)
    sendAppointmentNotifications(newAppointment).catch((err) =>
      console.error("[NOTIFICATION FAILURE]", err)
    );

    // Réponse publique minimale (aucune donnée technique ou personnelle superflue)
    return NextResponse.json(
      {
        success: true,
        message: "Votre demande de rendez-vous a été enregistrée avec succès.",
        appointment: {
          id: newAppointment.id,
          serviceName: newAppointment.serviceName,
          date: newAppointment.date,
          time: newAppointment.time,
          status: newAppointment.status,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[APPOINTMENT POST ERROR]", error);
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
