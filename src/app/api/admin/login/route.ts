import { NextRequest, NextResponse } from "next/server";
import { validatePassword, setAdminSession, isAdminConfigured } from "@/lib/auth";
import { rateLimit, resetRateLimit } from "@/lib/rateLimit";
import { getClientIp } from "@/lib/validation";

// 8 tentatives par IP sur 15 minutes, compteur partagé entre instances (Supabase)
const MAX_ATTEMPTS = 8;
const WINDOW_SECONDS = 15 * 60;

export async function POST(request: NextRequest) {
  const ip = getClientIp(request.headers);
  const rlKey = `admin-login:${ip}`;

  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { error: "Espace d'administration non configuré. Contactez le responsable technique du site." },
        { status: 503 }
      );
    }

    if (!(await rateLimit(rlKey, MAX_ATTEMPTS, WINDOW_SECONDS))) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password : "";

    if (!password || password.length > 200 || !validatePassword(password)) {
      return NextResponse.json(
        { error: "Mot de passe d'administration incorrect." },
        { status: 401 }
      );
    }

    const ok = await setAdminSession();
    if (!ok) {
      return NextResponse.json({ error: "Impossible d'ouvrir la session." }, { status: 500 });
    }
    await resetRateLimit(rlKey);
    return NextResponse.json({ success: true, message: "Authentification réussie" });
  } catch {
    return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
  }
}
