import { NextRequest, NextResponse } from "next/server";
import {
  validatePassword,
  setAdminSession,
  isAdminConfigured,
  isLoginRateLimited,
  registerFailedLogin,
  resetLoginAttempts,
} from "@/lib/auth";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";

  try {
    if (!isAdminConfigured()) {
      return NextResponse.json(
        { error: "Espace d'administration non configuré. Contactez le responsable technique du site." },
        { status: 503 }
      );
    }

    if (isLoginRateLimited(ip)) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez réessayer dans quelques minutes." },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const password = typeof body?.password === "string" ? body.password : "";

    if (!password || password.length > 200 || !validatePassword(password)) {
      registerFailedLogin(ip);
      return NextResponse.json(
        { error: "Mot de passe d'administration incorrect." },
        { status: 401 }
      );
    }

    const ok = await setAdminSession();
    if (!ok) {
      return NextResponse.json({ error: "Impossible d'ouvrir la session." }, { status: 500 });
    }
    resetLoginAttempts(ip);
    return NextResponse.json({ success: true, message: "Authentification réussie" });
  } catch {
    return NextResponse.json({ error: "Erreur de traitement" }, { status: 500 });
  }
}
