import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth";
import { storage } from "@/lib/storage";
import { DATE_REGEX } from "@/lib/validation";

/**
 * Échappe une cellule CSV pour Excel (séparateur `;`, guillemets doublés)
 * et neutralise les injections de formules (=, +, -, @, tabulation, retour chariot).
 */
function csvCell(value: unknown): string {
  let str = value === null || value === undefined ? "" : String(value);
  str = str.replace(/\r?\n/g, " ");
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}

function buildCsv(headers: string[], rows: unknown[][]): string {
  const lines = [
    headers.map(csvCell).join(";"),
    ...rows.map((row) => row.map(csvCell).join(";")),
  ];
  // BOM UTF-8 pour ouverture directe dans Excel sans problème d'accents
  return "\uFEFF" + lines.join("\r\n");
}

export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") === "messages" ? "messages" : "appointments";
  const rawFrom = searchParams.get("from")?.trim() ?? "";
  const rawTo = searchParams.get("to")?.trim() ?? "";
  const from = DATE_REGEX.test(rawFrom) ? rawFrom : "";
  const to = DATE_REGEX.test(rawTo) ? rawTo : "";

  if (type === "messages") {
    const all = await storage.getContacts();
    const filtered = all.filter((m) => {
      const ymd = m.createdAt.slice(0, 10);
      if (from && ymd < from) return false;
      if (to && ymd > to) return false;
      return true;
    });

    const csv = buildCsv(
      ["ID", "Date", "Nom", "Email", "Téléphone", "Objet", "Message", "Statut"],
      filtered.map((m) => [
        m.id,
        m.createdAt,
        m.name,
        m.email,
        m.phone ?? "",
        m.subject,
        m.message,
        m.status,
      ])
    );

    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="run-auto-messages-${new Date().toISOString().slice(0, 10)}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const all = await storage.getAppointments();
  const filtered = all.filter((a) => {
    if (from && a.date < from) return false;
    if (to && a.date > to) return false;
    return true;
  });

  const csv = buildCsv(
    [
      "ID",
      "Date RDV",
      "Heure",
      "Statut",
      "Prestation",
      "Prénom",
      "Nom",
      "Téléphone",
      "Email",
      "Marque",
      "Modèle",
      "Année",
      "Carburant",
      "Immatriculation",
      "Kilométrage",
      "Codes OBD",
      "Montant Devis (€)",
      "Demande Client",
      "Notes Atelier",
      "Rappel envoyé le",
    ],
    filtered.map((a) => [
      a.id,
      a.date,
      a.time,
      a.status,
      a.serviceName,
      a.client.firstName,
      a.client.lastName,
      a.client.phone,
      a.client.email,
      a.vehicle.make,
      a.vehicle.model,
      a.vehicle.year ?? "",
      a.vehicle.fuel ?? "",
      a.vehicle.licensePlate ?? "",
      a.mileageKm ?? "",
      a.obdCodes ?? "",
      a.quoteAmountCents !== undefined && a.quoteAmountCents !== null
        ? (a.quoteAmountCents / 100).toFixed(2)
        : "",
      a.problemDescription ?? "",
      a.internalNotes ?? "",
      a.reminderSentAt ?? "",
    ])
  );

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="run-auto-rendez-vous-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
