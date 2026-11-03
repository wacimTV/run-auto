/**
 * Utilitaires de validation et d'assainissement côté serveur.
 */

export function cleanString(value: unknown, maxLength: number): string {
  if (typeof value !== "string") return "";
  // Supprime les caractères de contrôle (hors retours à la ligne / tabulations)
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, maxLength);
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/[\s.\-()]/g, "");
  return /^\+?\d{8,15}$/.test(digits);
}

/** Échappement HTML pour toute donnée utilisateur insérée dans un e-mail. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getClientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

