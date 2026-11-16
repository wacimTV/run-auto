import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Photos envoyées depuis l'espace administrateur.
 *
 * - Avec Supabase (production / Vercel) : stockées dans le bucket privé `uploads`
 *   de Supabase Storage (le disque de Vercel est effacé à chaque redémarrage).
 * - Sans Supabase (développement local) : dossier data/uploads.
 *
 * Dans les deux cas l'URL publique reste `/api/uploads/<fichier>` : la route
 * src/app/api/uploads/[name]/route.ts relit le fichier et le sert au navigateur.
 */

const MAX_BYTES = 8 * 1024 * 1024; // 8 Mo max
export const UPLOAD_BUCKET = "uploads";
export const UPLOAD_NAME_REGEX = /^[a-zA-Z0-9._-]+\.(webp|jpg|jpeg|png|avif)$/i;

const MIME_BY_EXT: Record<string, string> = {
  ".webp": "image/webp",
  ".png": "image/png",
  ".avif": "image/avif",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
};

export function getUploadDir() {
  return path.join(process.cwd(), "data", "uploads");
}

export function getUploadMime(name: string): string {
  return MIME_BY_EXT[path.extname(name).toLowerCase()] ?? "image/jpeg";
}

/** Détecte le vrai format à partir des premiers octets (le type annoncé par le navigateur n'est pas fiable). */
function detectImageExtension(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return ".jpg";
  if (buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return ".png";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") return ".webp";
  if (buf.toString("ascii", 4, 8) === "ftyp" && /avi[fs]/.test(buf.toString("ascii", 8, 12))) return ".avif";
  return null;
}

let bucketReady = false;
async function ensureBucket() {
  const db = getSupabaseAdmin();
  if (!db || bucketReady) return;
  const { error } = await db.storage.createBucket(UPLOAD_BUCKET, {
    public: false,
    fileSizeLimit: MAX_BYTES,
    allowedMimeTypes: Object.values(MIME_BY_EXT),
  });
  // Le bucket existe déjà : c'est normal après le premier envoi
  if (error && !/already exists|duplicate/i.test(error.message)) {
    console.error("[UPLOAD] Création du bucket impossible :", error.message);
  }
  bucketReady = true;
}

/**
 * Enregistre une image envoyée depuis l'espace administrateur.
 * Retourne l'URL publique (ex. `/api/uploads/xxx.jpg`) ou `""` si aucun fichier n'est fourni.
 */
export async function saveUploadedImage(file: File | null | undefined): Promise<string> {
  if (!file || typeof file === "string" || file.size === 0) return "";
  if (file.size > MAX_BYTES) {
    throw new Error("Fichier trop volumineux (maximum 8 Mo).");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const ext = detectImageExtension(buffer);
  if (!ext) {
    throw new Error("Format non supporté (utilisez JPG, PNG, WebP ou AVIF).");
  }
  const filename = `${Date.now()}-${randomBytes(6).toString("hex")}${ext}`;

  const db = getSupabaseAdmin();
  if (db) {
    await ensureBucket();
    const { error } = await db.storage.from(UPLOAD_BUCKET).upload(filename, buffer, {
      contentType: getUploadMime(filename),
      upsert: false,
    });
    if (error) {
      console.error("[UPLOAD] Envoi vers Supabase Storage impossible :", error.message);
      throw new Error("Impossible d'enregistrer la photo. Réessayez dans un instant.");
    }
  } else if (process.env.VERCEL) {
    throw new Error("Stockage des photos non configuré (Supabase requis sur Vercel).");
  } else {
    const dir = getUploadDir();
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, filename), buffer);
  }

  return `/api/uploads/${filename}`;
}

/** Relit une image enregistrée. Renvoie null si elle n'existe pas. */
export async function readUploadedImage(name: string): Promise<Buffer | null> {
  if (!UPLOAD_NAME_REGEX.test(name)) return null;
  const safeName = path.basename(name);

  const db = getSupabaseAdmin();
  if (db) {
    const { data, error } = await db.storage.from(UPLOAD_BUCKET).download(safeName);
    if (error || !data) return null;
    return Buffer.from(await data.arrayBuffer());
  }

  try {
    return await readFile(path.join(getUploadDir(), safeName));
  } catch {
    return null;
  }
}
