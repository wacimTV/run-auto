import { NextRequest, NextResponse } from "next/server";
import { storage } from "@/lib/storage";
import { verifyAdminSession } from "@/lib/auth";
import { AppointmentStatus } from "@/types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => ({}));
  const { status } = body;
  const internalNotes =
    typeof body.internalNotes === "string" ? body.internalNotes.slice(0, 2000) : undefined;

  const validStatuses: AppointmentStatus[] = ["pending", "confirmed", "cancelled", "completed"];
  if (!status || !validStatuses.includes(status)) {
    return NextResponse.json({ error: "Statut invalide" }, { status: 400 });
  }

  let updated;
  try {
    updated = await storage.updateAppointmentStatus(id, status, internalNotes);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Erreur lors de la mise à jour";
    return NextResponse.json({ error: msg }, { status: 409 });
  }
  if (!updated) {
    return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
  }

  return NextResponse.json({ success: true, appointment: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await storage.deleteAppointment(id);
  if (!deleted) {
    return NextResponse.json({ error: "Rendez-vous introuvable" }, { status: 404 });
  }

  return NextResponse.json({ success: true, message: "Rendez-vous supprimé" });
}
