/**
 * Adresse publique du site, lue depuis NEXT_PUBLIC_APP_URL.
 * - Phase de test : https://xxx.vercel.app (site non référencé par Google)
 * - Production : https://runauto-marseille.fr
 */
const FALLBACK_URL = "https://runauto-marseille.fr";

function resolveSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_APP_URL?.trim() || FALLBACK_URL;
  try {
    return new URL(raw).origin;
  } catch {
    return FALLBACK_URL;
  }
}

export const SITE_URL = resolveSiteUrl();

/**
 * Le site n'est référencé par Google que sur son vrai nom de domaine,
 * jamais sur une adresse de test (.vercel.app, localhost).
 */
export const SITE_INDEXABLE = !/(\.vercel\.app|localhost|127\.0\.0\.1)$/i.test(new URL(SITE_URL).hostname);

export function absoluteUrl(path = ""): string {
  return `${SITE_URL}${path.startsWith("/") || path === "" ? path : `/${path}`}`;
}
