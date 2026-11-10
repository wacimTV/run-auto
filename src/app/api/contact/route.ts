import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { verifyAdminSession } from "@/lib/auth";
import { cleanString, EMAIL_REGEX, getClientIp, isValidPhone } from "@/lib/validation";
import { ContactMessage } from "@/types";

export async function GET() {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const contacts = await storage.getContacts();
  return NextResponse.json({ contacts });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
    }

    // Anti-spam honeypot
    if (typeof body.website_trap === "string" && body.website_trap.length > 0) {
      return NextResponse.json({ error: "Requête suspecte" }, { status: 400 });
    }

    const name = cleanString(body.name, 100);
    const email = cleanString(body.email, 120).toLowerCase();
    const phone = cleanString(body.phone, 25);
    const subject = cleanString(body.subject, 150);
    const message = cleanString(body.message, 4000);

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Veuillez renseigner votre nom, votre e-mail et votre message." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Adresse e-mail non valide." },
        { status: 400 }
      );
    }

    if (phone && !isValidPhone(phone)) {
      return NextResponse.json({ error: "Numéro de téléphone non valide." }, { status: 400 });
    }

    const contactId = `MSG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const newContact: ContactMessage = {
      id: contactId,
      createdAt: new Date().toISOString(),
      name,
      email,
      phone,
      subject: subject || "Demande d'information",
      message,
      status: "new",
      ipAddress: getClientIp(request.headers),
    };

    await storage.createContact(newContact);

    console.log(`[CONTACT SUBMITTED] Nouveau message ${newContact.id} - Sujet: ${newContact.subject}`);

    return NextResponse.json(
      {
        success: true,
        message: "Votre message a bien été envoyé. Notre équipe vous répondra dans les plus brefs délais.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CONTACT POST ERROR]", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
