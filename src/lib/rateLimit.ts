import "server-only";
import { createHash } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";

/**
 * Limitation du nombre de requêtes (anti-spam / anti force brute).
 *
 * - Avec Supabase : compteur partagé entre toutes les instances serverless
 *   (fonction SQL atomique `hit_rate_limit`, voir supabase/schema.sql).
 * - Sans Supabase (dev local) ou si la fonction SQL est absente : repli en mémoire.
 *
 * Les clés sont hachées : aucune IP ni adresse e-mail n'est stockée en clair dans cette table.
 */

const memory = new Map<string, { count: number; start: number }>();

function hashKey(key: string): string {
  return createHash("sha256").update(`run-auto-rl:${key}`).digest("hex");
}

function memoryHit(key: string, max: number, windowSeconds: number): boolean {
  const now = Date.now();
  const entry = memory.get(key);
  if (!entry || now - entry.start > windowSeconds * 1000) {
    memory.set(key, { count: 1, start: now });
    return true;
  }
  entry.count += 1;
  return entry.count <= max;
}

/**
 * Enregistre une tentative et indique si elle est autorisée.
 * @returns true si la requête peut continuer, false si la limite est atteinte.
 */
export async function rateLimit(key: string, max: number, windowSeconds: number): Promise<boolean> {
  const hashed = hashKey(key);
  const db = getSupabaseAdmin();
  if (db) {
    const { data, error } = await db.rpc("hit_rate_limit", {
      p_key: hashed,
      p_max: max,
      p_window_seconds: windowSeconds,
    });
    if (!error && typeof data === "boolean") return data;
    console.error("[RATE LIMIT] Fonction hit_rate_limit indisponible, repli en mémoire :", error?.message);
  }
  return memoryHit(hashed, max, windowSeconds);
}

/** Remet un compteur à zéro (ex. après une connexion admin réussie). */
export async function resetRateLimit(key: string): Promise<void> {
  const hashed = hashKey(key);
  memory.delete(hashed);
  const db = getSupabaseAdmin();
  if (db) await db.from("rate_limits").delete().eq("key", hashed);
}
