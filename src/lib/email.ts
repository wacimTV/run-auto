import { Appointment } from "@/types";
import { GARAGE_CONFIG } from "@/config/garage";
import { escapeHtml } from "@/lib/validation";

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
        from: `Run Auto <notifications@runauto-marseille.fr>`,
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

    return res.ok;
  } catch (error) {
    console.error("[EMAIL ERROR] Erreur lors de l'envoi de l'e-mail:", error);
    return false;
  }
}
