import { Appointment, ContactMessage } from "@/types";
import { GARAGE_CONFIG } from "@/config/garage";
import { escapeHtml } from "@/lib/validation";

// Expéditeur : tant que le domaine n'est pas vérifié dans Resend, utiliser "Run Auto <onboarding@resend.dev>"
// (Resend n'autorise alors l'envoi QU'À l'adresse du compte Resend).
const EMAIL_FROM = process.env.EMAIL_FROM || "Run Auto <onboarding@resend.dev>";

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

  const subjectClient = `Confirmation de votre demande de rendez-vous - ${GARAGE_CONFIG.name}`;

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
            <h2 style="color: #E10600;">RUN AUTO - MARSEILLE</h2>
            <p>Bonjour ${e.firstName} ${e.lastName},</p>
            <p>Nous avons bien reçu votre demande de rendez-vous pour votre véhicule <strong>${e.make} ${e.model}</strong>.</p>
            <div style="background: #161618; padding: 20px; border-left: 4px solid #E10600; margin: 20px 0;">
              <p><strong>Prestation :</strong> ${e.service}</p>
              <p><strong>Date souhaitée :</strong> ${e.date} à ${e.time}</p>
              <p><strong>Statut :</strong> Demande enregistrée, en attente de confirmation par nos équipes.</p>
            </div>
            <p>Notre atelier à Marseille (52 boulevard de Roux, 13004) vous recontactera sous 2h ouvrées au <strong>${e.phone}</strong>.</p>
            <p>Cordialement,<br>L'équipe Run Auto</p>
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
