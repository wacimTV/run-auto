import { Appointment, ContactMessage, GarageSettings } from "@/types";
import { GARAGE_CONFIG } from "@/config/garage";
import { escapeHtml } from "@/lib/validation";
import { getSiteData } from "@/lib/siteData";

// Expéditeur : tant que le domaine n'est pas vérifié dans Resend, utiliser "Run Auto <onboarding@resend.dev>"
// (Resend n'autorise alors l'envoi QU'À l'adresse du compte Resend).
const EMAIL_FROM = process.env.EMAIL_FROM || "Run Auto <onboarding@resend.dev>";

async function resolveSettings(override?: GarageSettings): Promise<{
  name: string;
  phone: string;
  fullAddress: string;
  city: string;
  googleReviewUrl: string;
}> {
  if (override) {
    return {
      name: override.name || GARAGE_CONFIG.name,
      phone: override.phone || GARAGE_CONFIG.contact.phoneDisplay,
      fullAddress: `${override.street}, ${override.postalCode} ${override.city}`,
      city: override.city || GARAGE_CONFIG.contact.city,
      googleReviewUrl: override.googleReviewUrl?.trim() || "",
    };
  }
  try {
    const { settings } = await getSiteData();
    return {
      name: settings.name || GARAGE_CONFIG.name,
      phone: settings.phone || GARAGE_CONFIG.contact.phoneDisplay,
      fullAddress: `${settings.street}, ${settings.postalCode} ${settings.city}`,
      city: settings.city || GARAGE_CONFIG.contact.city,
      googleReviewUrl: settings.googleReviewUrl?.trim() || "",
    };
  } catch {
    return {
      name: GARAGE_CONFIG.name,
      phone: GARAGE_CONFIG.contact.phoneDisplay,
      fullAddress: GARAGE_CONFIG.contact.fullAddress,
      city: GARAGE_CONFIG.contact.city,
      googleReviewUrl: "",
    };
  }
}

/** Alerte e-mail au garage pour chaque message du formulaire de contact. */
export async function sendContactNotification(contact: ContactMessage): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const garageEmail = process.env.GARAGE_NOTIFICATION_EMAIL;
  if (!apiKey || !garageEmail) {
    console.log("[EMAIL NOTICE] RESEND_API_KEY ou GARAGE_NOTIFICATION_EMAIL absent : alerte contact non envoyée.");
    return true;
  }

  const e = {
    name: escapeHtml(contact.name),
    email: escapeHtml(contact.email),
    phone: escapeHtml(contact.phone || "non renseigné"),
    subject: escapeHtml(contact.subject),
    message: escapeHtml(contact.message).replace(/\n/g, "<br>"),
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [garageEmail],
        reply_to: contact.email, // « Répondre » écrit directement au client
        subject: `Nouveau message : ${contact.subject.replace(/[\r\n]/g, " ").slice(0, 120)}`,
        html: `
          <div style="font-family: sans-serif; padding: 20px;">
            <h2>Nouveau message depuis le site</h2>
            <p><strong>De :</strong> ${e.name} (${e.email})</p>
            <p><strong>Téléphone :</strong> ${e.phone}</p>
            <p><strong>Objet :</strong> ${e.subject}</p>
            <div style="background: #f4f5f7; padding: 16px; border-left: 4px solid #E10600; margin: 16px 0;">${e.message}</div>
            <p>Vous pouvez répondre directement à cet e-mail. Message aussi visible dans l'espace admin (/admin).</p>
          </div>
        `,
      }),
    });
    if (!res.ok) console.error("[EMAIL ERROR] Resend contact:", res.status, await res.text());
    return res.ok;
  } catch (error) {
    console.error("[EMAIL ERROR] Alerte contact:", error);
    return false;
  }
}

export async function sendAppointmentNotifications(appointment: Appointment): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const info = await resolveSettings();

  const subjectClient = `Confirmation de votre demande de rendez-vous - ${info.name}`;

  // Journalisation sans données personnelles
  console.log(`[EMAIL NOTIFICATION] Preparation d'envoi pour RDV #${appointment.id}`);

  if (!apiKey) {
    console.log(
      `[EMAIL NOTICE] Clé RESEND_API_KEY non configurée. Les notifications sont simulées avec succès en mode local.`
    );
    return true;
  }

  // Toutes les données saisies par l'utilisateur sont échappées avant insertion HTML
  const e = {
    firstName: escapeHtml(appointment.client.firstName),
    lastName: escapeHtml(appointment.client.lastName),
    make: escapeHtml(appointment.vehicle.make),
    model: escapeHtml(appointment.vehicle.model),
    service: escapeHtml(appointment.serviceName),
    date: escapeHtml(appointment.date),
    time: escapeHtml(appointment.time),
    phone: escapeHtml(appointment.client.phone),
    garageName: escapeHtml(info.name),
    garageCity: escapeHtml(info.city),
    garageAddress: escapeHtml(info.fullAddress),
    garagePhone: escapeHtml(info.phone),
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [appointment.client.email],
        subject: subjectClient,
        html: `
          <div style="font-family: sans-serif; background: #0B0B0C; color: #F5F5F5; padding: 30px; border-radius: 8px;">
            <h2 style="color: #E10600;">${e.garageName.toUpperCase()} - ${e.garageCity.toUpperCase()}</h2>
            <p>Bonjour ${e.firstName} ${e.lastName},</p>
            <p>Nous avons bien reçu votre demande de rendez-vous pour votre véhicule <strong>${e.make} ${e.model}</strong>.</p>
            <div style="background: #161618; padding: 20px; border-left: 4px solid #E10600; margin: 20px 0;">
              <p><strong>Prestation :</strong> ${e.service}</p>
              <p><strong>Date souhaitée :</strong> ${e.date} à ${e.time}</p>
              <p><strong>Statut :</strong> Demande enregistrée, en attente de confirmation par nos équipes.</p>
            </div>
            <p>Notre atelier (${e.garageAddress} • ${e.garagePhone}) vous recontactera sous 2h ouvrées au <strong>${e.phone}</strong>.</p>
            <p>Cordialement,<br>L'équipe ${e.garageName}</p>
          </div>
        `,
      }),
    });

    if (!res.ok) console.error("[EMAIL ERROR] Resend client:", res.status, await res.text());

    // Alerte au garage pour chaque nouvelle demande
    const garageEmail = process.env.GARAGE_NOTIFICATION_EMAIL;
    if (garageEmail) {
      const resGarage = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: EMAIL_FROM,
          to: [garageEmail],
          subject: `Nouveau RDV : ${appointment.date} à ${appointment.time} - ${appointment.client.lastName}`,
          html: `
            <div style="font-family: sans-serif; padding: 20px;">
              <h2>Nouvelle demande de rendez-vous</h2>
              <p><strong>Client :</strong> ${e.firstName} ${e.lastName} - ${e.phone}</p>
              <p><strong>Véhicule :</strong> ${e.make} ${e.model}</p>
              <p><strong>Prestation :</strong> ${e.service}</p>
              <p><strong>Date souhaitée :</strong> ${e.date} à ${e.time}</p>
              <p>À confirmer depuis l'espace admin du site (/admin).</p>
            </div>
          `,
        }),
      });
      if (!resGarage.ok) console.error("[EMAIL ERROR] Resend garage:", resGarage.status, await resGarage.text());
    }

    return res.ok;
  } catch (error) {
    console.error("[EMAIL ERROR] Erreur lors de l'envoi de l'e-mail:", error);
    return false;
  }
}

/**
 * Envoie un e-mail au client lorsque le mécanicien met à jour le statut de son véhicule / RDV
 * (Confirmé, Prêt à restituer, ou Annulé).
 */
export async function sendAppointmentStatusEmail(
  appointment: Appointment,
  settingsOverride?: GarageSettings | string
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !appointment.client.email) return true;

  const info = await resolveSettings(
    typeof settingsOverride === "object" ? settingsOverride : undefined
  );
  const garageName =
    typeof settingsOverride === "string" ? settingsOverride : info.name;

  const statusLabels: Record<string, string> = {
    confirmed: "Rendez-vous confirmé par l'atelier ✅",
    in_progress: "Véhicule pris en charge sur le pont 🔧",
    ready: "Intervention terminée — Votre véhicule est prêt à être récupéré 🚗",
    completed: "Véhicule restitué — Merci de votre confiance",
    cancelled: "Rendez-vous annulé",
  };

  const label = statusLabels[appointment.status];
  if (!label) return true;

  const subject =
    appointment.status === "confirmed"
      ? `Rendez-vous confirmé — ${garageName}`
      : appointment.status === "ready"
        ? `Votre véhicule ${appointment.vehicle.make} ${appointment.vehicle.model} est prêt — ${garageName}`
        : `Mise à jour de votre dossier atelier — ${garageName}`;

  const e = {
    firstName: escapeHtml(appointment.client.firstName),
    lastName: escapeHtml(appointment.client.lastName),
    make: escapeHtml(appointment.vehicle.make),
    model: escapeHtml(appointment.vehicle.model),
    plate: escapeHtml(appointment.vehicle.licensePlate || "Non renseignée"),
    service: escapeHtml(appointment.serviceName),
    date: escapeHtml(appointment.date),
    time: escapeHtml(appointment.time),
    statusLabel: escapeHtml(label),
  };

  const reviewBlock =
    appointment.status === "completed" && info.googleReviewUrl
      ? `
            <div style="margin: 24px 0; padding: 18px; background: #22252B; border-radius: 8px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 14px;">Satisfait de notre intervention ? Votre retour aide d'autres automobilistes :</p>
              <a href="${escapeHtml(info.googleReviewUrl)}" style="display: inline-block; background: #D71920; color: #FFFFFF; text-decoration: none; font-weight: bold; padding: 12px 22px; border-radius: 8px; font-size: 14px;">Laisser un avis Google</a>
            </div>
        `
      : "";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [appointment.client.email],
        subject,
        html: `
          <div style="font-family: sans-serif; background: #17191D; color: #F5F5F5; padding: 30px; border-radius: 12px;">
            <h2 style="color: #D71920; margin-top: 0;">${escapeHtml(garageName.toUpperCase())} — ${escapeHtml(info.city.toUpperCase())}</h2>
            <p>Bonjour ${e.firstName} ${e.lastName},</p>
            <p>Voici une mise à jour concernant votre véhicule <strong>${e.make} ${e.model}</strong> (${e.plate}) :</p>
            <div style="background: #22252B; padding: 20px; border-left: 4px solid #D71920; margin: 20px 0; border-radius: 6px;">
              <p style="margin: 4px 0;"><strong>Statut actuel :</strong> ${e.statusLabel}</p>
              <p style="margin: 4px 0;"><strong>Intervention :</strong> ${e.service}</p>
              <p style="margin: 4px 0;"><strong>Créneau :</strong> ${e.date} à ${e.time}</p>
            </div>
            ${reviewBlock}
            <p>Atelier situé au <strong>${escapeHtml(info.fullAddress)}</strong> • Tél. : <strong>${escapeHtml(info.phone)}</strong>.</p>
            <p>Cordialement,<br>L'équipe ${escapeHtml(garageName)}</p>
          </div>
        `,
      }),
    });
    return res.ok;
  } catch (err) {
    console.error("[EMAIL ERROR] Notification statut RDV:", err);
    return false;
  }
}

/**
 * E-mail de rappel envoyé la veille aux rendez-vous confirmés (cron quotidien).
 */
export async function sendAppointmentReminderEmail(
  appointment: Appointment,
  settingsOverride?: GarageSettings
): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || !appointment.client.email) return true;

  const info = await resolveSettings(settingsOverride);
  const e = {
    firstName: escapeHtml(appointment.client.firstName),
    lastName: escapeHtml(appointment.client.lastName),
    make: escapeHtml(appointment.vehicle.make),
    model: escapeHtml(appointment.vehicle.model),
    plate: escapeHtml(appointment.vehicle.licensePlate || "Non renseignée"),
    service: escapeHtml(appointment.serviceName),
    date: escapeHtml(appointment.date),
    time: escapeHtml(appointment.time),
    garageName: escapeHtml(info.name),
    garageCity: escapeHtml(info.city),
    garageAddress: escapeHtml(info.fullAddress),
    garagePhone: escapeHtml(info.phone),
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: [appointment.client.email],
        subject: `Rappel de votre rendez-vous demain à ${appointment.time} — ${info.name}`,
        html: `
          <div style="font-family: sans-serif; background: #17191D; color: #F5F5F5; padding: 30px; border-radius: 12px;">
            <h2 style="color: #D71920; margin-top: 0;">RAPPEL RENDEZ-VOUS — ${e.garageName.toUpperCase()}</h2>
            <p>Bonjour ${e.firstName} ${e.lastName},</p>
            <p>Nous vous rappelons votre rendez-vous confirmé <strong>demain</strong> à notre atelier pour votre véhicule <strong>${e.make} ${e.model}</strong> (${e.plate}) :</p>
            <div style="background: #22252B; padding: 20px; border-left: 4px solid #D71920; margin: 20px 0; border-radius: 6px;">
              <p style="margin: 4px 0;"><strong>Date :</strong> ${e.date}</p>
              <p style="margin: 4px 0;"><strong>Heure de dépôt :</strong> ${e.time}</p>
              <p style="margin: 4px 0;"><strong>Prestation :</strong> ${e.service}</p>
              <p style="margin: 4px 0;"><strong>Adresse :</strong> ${e.garageAddress}</p>
            </div>
            <p>En cas d'empêchement, merci de nous prévenir au <strong>${e.garagePhone}</strong>.</p>
            <p>À demain,<br>L'équipe ${e.garageName} ${e.garageCity}</p>
          </div>
        `,
      }),
    });
    if (!res.ok) console.error("[EMAIL ERROR] Resend reminder:", res.status, await res.text());
    return res.ok;
  } catch (err) {
    console.error("[EMAIL ERROR] Envoi rappel RDV:", err);
    return false;
  }
}
