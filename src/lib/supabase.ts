import "server-only";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Client Supabase côté serveur (clé service_role, jamais exposée au navigateur).
 * Renvoie null si la base n'est pas configurée (développement local sans Supabase).
 */
let client: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (client !== undefined) return client;
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  client = url && key ? createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } }) : null;
  return client;
}
