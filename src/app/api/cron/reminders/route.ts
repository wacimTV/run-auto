import { NextRequest, NextResponse } from "next/server";
import { createHash, timingSafeEqual } from "crypto";
import { storage } from "@/lib/storage";
import { sendAppointmentReminderEmail } from "@/lib/email";
import { parisNow } from "@/lib/motorisations";

function safeSecretEqual(a: string, b: string): boolean {
  const bufA = createHash("sha256").update(a).digest();
  const bufB = createHash("sha256").update(b).digest();
  return timingSafeEqual(bufA, bufB);
}

/** Calcule la date du lendemain (YYYY-MM-DD) à partir de la date du jour à Paris. */
function getTomorrowParisYmd(): string {
  const { ymd } = parisNow();
  const [y, m, d] = ymd.split("-").map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + 1, 12, 0, 0));
  return next.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET?.trim();
  if (!expectedSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET non configuré." },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get("authorization") ?? "";
  const expectedHeader = `Bearer ${expectedSecret}`;
  if (!authHeader || !safeSecretEqual(authHeader, expectedHeader)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const tomorrowYmd = getTomorrowParisYmd();
  const [appointments, siteState] = await Promise.all([
    storage.getAppointmentsByDate(tomorrowYmd),
    storage.getSiteAdminState(),
  ]);

  const toRemind = appointments.filter(
    (apt) => apt.status === "confirmed" && !apt.reminderSentAt && apt.client.email
  );

  let sent = 0;
  let failed = 0;

  for (const apt of toRemind) {
    const ok = await sendAppointmentReminderEmail(apt, siteState.settings);
    if (ok) {
      await storage.markAppointmentReminderSent(apt.id, new Date().toISOString());
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return NextResponse.json({
    ok: true,
    targetDate: tomorrowYmd,
    candidates: toRemind.length,
    sent,
    failed,
  });
}
