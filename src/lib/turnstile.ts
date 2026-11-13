import "server-only";

/**
 * Vérification Cloudflare Turnstile (anti-robot, sans cookie publicitaire).
 * Tant que TURNSTILE_SECRET_KEY n'est pas configurée, la vérification est ignorée
 * (le honeypot et la limitation de requêtes restent actifs).
 */
export function isTurnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(token: unknown, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (typeof token !== "string" || token.length === 0 || token.length > 2048) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "local") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
    });
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch (error) {
    console.error("[TURNSTILE] Vérification impossible :", error);
    return false;
  }
}
