/**
 * Motorisations & architectures véhicules prises en charge par l'atelier
 * (équivalent métier mécanique des filtres techniques sur chaque prestation).
 */
export const COMPATIBLE_FUELS = [
  { code: "ESSENCE", label: "Essence (Injection directe / indirecte)" },
  { code: "E85", label: "Superéthanol E85 / FlexFuel" },
  { code: "DIESEL", label: "Diesel (TDI, BlueHDi, dCi, CDI…)" },
  { code: "HYBRIDE", label: "Hybride / Micro-hybride" },
  { code: "ELECTRIQUE", label: "Électrique (Diagnostic & Freinage)" },
  { code: "TURBO_PERF", label: "Sportives & Turbo Performance" },
  { code: "UTILITAIRE", label: "Utilitaires légers & Flottes" },
  { code: "BVA_DSG", label: "Boîtes auto (DSG, S-Tronic, ZF, EAT8…)" },
] as const;

export const DAY_NAMES: Record<number, string> = {
  1: "Lundi",
  2: "Mardi",
  3: "Mercredi",
  4: "Jeudi",
  5: "Vendredi",
  6: "Samedi",
  0: "Dimanche",
};

export function formatDateFr(ymd: string): string {
  if (!ymd || !/^\d{4}-\d{2}-\d{2}$/.test(ymd)) return ymd;
  const [y, m, d] = ymd.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(dt);
}

export function formatTime(hhmm: string): string {
  if (!hhmm) return "";
  return hhmm.slice(0, 5).replace(":", "h");
}

export function formatPriceCents(cents: number | null | undefined): string {
  if (cents === null || cents === undefined) return "Sur devis";
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

export function parisNow(): { ymd: string; hour: number; minute: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return {
    ymd: `${get("year")}-${get("month")}-${get("day")}`,
    hour: parseInt(get("hour") || "0", 10),
    minute: parseInt(get("minute") || "0", 10),
  };
}
