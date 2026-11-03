import { cookies } from "next/headers";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";

/**
 * AUTHENTIFICATION DE L'ESPACE ADMINISTRATEUR
 *
 * - Le mot de passe est lu UNIQUEMENT depuis la variable d'environnement ADMIN_PASSWORD
 *   (aucune valeur par défaut codée en dur).
 * - En production, l'ancien mot de passe de démonstration est refusé.
 * - La session est un jeton signé HMAC-SHA256 avec date d'expiration (le mot de passe
 *   n'est jamais stocké dans le cookie).
 * - Les comparaisons sont réalisées à temps constant.
 */

const ADMIN_COOKIE_NAME = "run_auto_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12 heures
const MIN_PASSWORD_LENGTH = 10;

// Mot de passe de démonstration historique : interdit en production.
const FORBIDDEN_PRODUCTION_PASSWORDS = new Set(["RunAuto2026!"]);

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) return null;

  if (process.env.NODE_ENV === "production") {
    if (FORBIDDEN_PRODUCTION_PASSWORDS.has(password) || password.length < MIN_PASSWORD_LENGTH) {
      console.error(
        "[ADMIN AUTH] ADMIN_PASSWORD est absent, trop court ou correspond au mot de passe de démonstration. Connexion administrateur désactivée."
      );
      return null;
    }
  }
  return password;
}

/** Indique si l'espace admin est correctement configuré (sans révéler le secret). */
export function isAdminConfigured(): boolean {
  return getAdminPassword() !== null;
}

function getSigningSecret(): string | null {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit && explicit.length >= 32) return explicit;

  const password = getAdminPassword();
  if (!password) return null;
  // Secret dérivé : changer le mot de passe invalide automatiquement toutes les sessions.
  return createHash("sha256").update(`run-auto-session-secret:${password}`).digest("hex");
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const bufA = createHash("sha256").update(a).digest();
  const bufB = createHash("sha256").update(b).digest();
  return timingSafeEqual(bufA, bufB);
}

function createToken(): string | null {
  const secret = getSigningSecret();
  if (!secret) return null;
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
      nonce: randomBytes(16).toString("hex"),
    })
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

function isTokenValid(token: string): boolean {
  const secret = getSigningSecret();
  if (!secret) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload, secret))) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    return typeof data.exp === "number" && data.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!session?.value) return false;
  return isTokenValid(session.value);
}

export async function setAdminSession(): Promise<boolean> {
  const token = createToken();
  if (!token) return false;
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
  return true;
}

export async function clearAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

export function validatePassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected || typeof password !== "string") return false;
  return safeEqual(password, expected);
}

/* ------------------------------------------------------------------ */
/* Limitation des tentatives de connexion (best effort, en mémoire)    */
/* ------------------------------------------------------------------ */
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const loginAttempts = new Map<string, { count: number; firstAttempt: number }>();

export function isLoginRateLimited(ip: string): boolean {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function registerFailedLogin(ip: string): void {
  const entry = loginAttempts.get(ip);
  if (!entry || Date.now() - entry.firstAttempt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttempt: Date.now() });
  } else {
    entry.count += 1;
  }
}

export function resetLoginAttempts(ip: string): void {
  loginAttempts.delete(ip);
}
