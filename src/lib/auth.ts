import "server-only";
import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * AUTHENTIFICATION DE L'ESPACE ADMINISTRATEUR
 *
 * - Au premier démarrage, utilise ADMIN_PASSWORD (env).
 * - Dès qu'un mot de passe est défini depuis l'admin (« Sécurité »), il est stocké
 *   haché (bcrypt) dans la table Supabase `admin_credentials` (ou dans data/storage.json
 *   en local) et remplace ADMIN_PASSWORD.
 * - La session est un jeton signé HMAC-SHA256 avec date d'expiration ET numéro de version
 *   (`ver`). Changer le mot de passe incrémente `session_version`, invalidant instantanément
 *   toutes les sessions existantes.
 */

const ADMIN_COOKIE_NAME = "run_auto_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 12; // 12 heures
const MIN_ENV_PASSWORD_LENGTH = 10;
export const MIN_NEW_PASSWORD_LENGTH = 12;

const FORBIDDEN_PRODUCTION_PASSWORDS = new Set(["RunAuto2026!"]);

interface StoredCredentials {
  passwordHash: string;
  sessionVersion: number;
}

const LOCAL_STORAGE_FILE = path.join(process.cwd(), "data", "storage.json");

async function loadStoredCredentials(): Promise<StoredCredentials | null> {
  const db = getSupabaseAdmin();
  if (db) {
    const { data, error } = await db
      .from("admin_credentials")
      .select("password_hash, session_version")
      .eq("id", "main")
      .maybeSingle();
    if (error) {
      // Table pas encore créée (schema.sql pas relancé) : repli sur ADMIN_PASSWORD.
      if (error.code === "42P01" || error.code === "PGRST205") return null;
      // Toute autre erreur (réseau, Supabase indisponible) : on refuse la connexion
      // plutôt que de revenir à l'ancien mot de passe ADMIN_PASSWORD.
      console.error("[ADMIN AUTH] Lecture admin_credentials impossible :", error.message);
      throw new Error("Vérification des identifiants impossible pour le moment.");
    }
    if (data?.password_hash) {
      return {
        passwordHash: String(data.password_hash),
        sessionVersion: Number(data.session_version ?? 1),
      };
    }
    return null;
  }

  if (process.env.VERCEL) return null;

  try {
    if (!fs.existsSync(LOCAL_STORAGE_FILE)) return null;
    const raw = JSON.parse(fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8"));
    if (raw?.adminCredentials?.passwordHash) {
      return {
        passwordHash: String(raw.adminCredentials.passwordHash),
        sessionVersion: Number(raw.adminCredentials.sessionVersion ?? 1),
      };
    }
  } catch {
    // ignore
  }
  return null;
}

async function saveStoredCredentials(creds: StoredCredentials): Promise<void> {
  const db = getSupabaseAdmin();
  if (db) {
    const { error } = await db.from("admin_credentials").upsert({
      id: "main",
      password_hash: creds.passwordHash,
      session_version: creds.sessionVersion,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      console.error("[ADMIN AUTH] Erreur sauvegarde admin_credentials :", error.message);
      throw new Error(
        "Impossible d'enregistrer le mot de passe (vérifiez que la table admin_credentials existe dans Supabase)."
      );
    }
    return;
  }

  if (process.env.VERCEL) {
    throw new Error("Base de données Supabase requise sur Vercel pour changer le mot de passe.");
  }

  const dir = path.dirname(LOCAL_STORAGE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  let data: Record<string, unknown> = {};
  if (fs.existsSync(LOCAL_STORAGE_FILE)) {
    try {
      data = JSON.parse(fs.readFileSync(LOCAL_STORAGE_FILE, "utf-8"));
    } catch {
      data = {};
    }
  }
  data.adminCredentials = creds;
  const tmp = `${LOCAL_STORAGE_FILE}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tmp, LOCAL_STORAGE_FILE);
}

function getEnvAdminPassword(): string | null {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (!password) return null;

  if (process.env.NODE_ENV === "production") {
    if (
      FORBIDDEN_PRODUCTION_PASSWORDS.has(password) ||
      password.length < MIN_ENV_PASSWORD_LENGTH
    ) {
      console.error(
        "[ADMIN AUTH] ADMIN_PASSWORD est absent, trop court ou correspond au mot de passe de démonstration."
      );
      return null;
    }
  }
  return password;
}

/** Indique si l'espace admin est correctement configuré (sans révéler le secret). */
export async function isAdminConfigured(): Promise<boolean> {
  const stored = await loadStoredCredentials();
  if (stored) return true;
  return getEnvAdminPassword() !== null;
}

async function getSigningSecret(stored?: StoredCredentials | null): Promise<string | null> {
  const explicit = process.env.ADMIN_SESSION_SECRET?.trim();
  if (explicit && explicit.length >= 32) return explicit;

  const creds = stored !== undefined ? stored : await loadStoredCredentials();
  if (creds) {
    return createHash("sha256")
      .update(`run-auto-session-secret:${creds.passwordHash}`)
      .digest("hex");
  }

  const password = getEnvAdminPassword();
  if (!password) return null;
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

async function createToken(overrideCreds?: StoredCredentials | null): Promise<string | null> {
  const creds = overrideCreds !== undefined ? overrideCreds : await loadStoredCredentials();
  const secret = await getSigningSecret(creds);
  if (!secret) return null;
  const sessionVersion = creds?.sessionVersion ?? 0;
  const payload = Buffer.from(
    JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS,
      ver: sessionVersion,
      nonce: randomBytes(16).toString("hex"),
    })
  ).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

async function isTokenValid(token: string): Promise<boolean> {
  const creds = await loadStoredCredentials();
  const secret = await getSigningSecret(creds);
  if (!secret) return false;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload, secret))) return false;

  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf-8"));
    const expectedVer = creds?.sessionVersion ?? 0;
    return (
      typeof data.exp === "number" &&
      data.exp > Math.floor(Date.now() / 1000) &&
      (data.ver ?? 0) === expectedVer
    );
  } catch {
    return false;
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const session = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!session?.value) return false;
  try {
    return await isTokenValid(session.value);
  } catch {
    // Identifiants illisibles (base indisponible) : accès refusé
    return false;
  }
}

/** À appeler en tête de chaque page et Server Action admin. */
export async function requireAdmin(): Promise<void> {
  const ok = await verifyAdminSession();
  if (!ok) redirect("/admin/login");
}

export async function setAdminSession(overrideCreds?: StoredCredentials | null): Promise<boolean> {
  const token = await createToken(overrideCreds);
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

export async function validatePassword(password: string): Promise<boolean> {
  if (typeof password !== "string" || !password || password.length > 200) return false;
  const stored = await loadStoredCredentials();
  if (stored) {
    return bcrypt.compare(password, stored.passwordHash);
  }
  const expected = getEnvAdminPassword();
  if (!expected) return false;
  return safeEqual(password, expected);
}

/**
 * Change le mot de passe admin (stocké en bcrypt), incrémente la version de session
 * (invalidant toutes les autres sessions actives) et rafraîchit la session courante.
 */
export async function updateAdminPassword(
  currentPassword: string,
  newPassword: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const validCurrent = await validatePassword(currentPassword);
  if (!validCurrent) {
    return { ok: false, error: "L'ancien mot de passe est incorrect." };
  }
  if (newPassword.length < MIN_NEW_PASSWORD_LENGTH) {
    return {
      ok: false,
      error: `Le nouveau mot de passe doit contenir au moins ${MIN_NEW_PASSWORD_LENGTH} caractères.`,
    };
  }
  if (newPassword.length > 200) {
    return { ok: false, error: "Le mot de passe est trop long." };
  }
  if (FORBIDDEN_PRODUCTION_PASSWORDS.has(newPassword)) {
    return { ok: false, error: "Ce mot de passe est interdit. Choisissez-en un autre." };
  }

  const prev = await loadStoredCredentials();
  const nextVersion = (prev?.sessionVersion ?? 0) + 1;
  const passwordHash = await bcrypt.hash(newPassword, 12);
  const nextCreds: StoredCredentials = { passwordHash, sessionVersion: nextVersion };

  await saveStoredCredentials(nextCreds);
  await setAdminSession(nextCreds);
  return { ok: true };
}
