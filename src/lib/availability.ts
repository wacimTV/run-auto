import { GARAGE_CONFIG } from "@/config/garage";
import { DayAvailability, SlotAvailability } from "@/types";
import { storage } from "./storage";

/**
 * Génère les créneaux standards pour une journée selon la configuration
 */
export function getStandardSlotsForDay(dayIndex: number): string[] {
  const dayConfig = GARAGE_CONFIG.openingHours.find((d) => d.dayIndex === dayIndex);
  if (!dayConfig || !dayConfig.isOpen) return [];

  const slots: string[] = [];

  for (const range of dayConfig.slots) {
    const [startH] = range.open.split(":").map(Number);
    const [endH] = range.close.split(":").map(Number);

    for (let h = startH; h < endH; h++) {
      const slotStr = `${h.toString().padStart(2, "0")}:00`;
      slots.push(slotStr);
    }
  }

  return slots;
}

/** Date (YYYY-MM-DD) et heure actuelles à Paris, quel que soit le fuseau du serveur. */
function getParisNow(): { today: string; hour: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";
  return { today: `${get("year")}-${get("month")}-${get("day")}`, hour: parseInt(get("hour"), 10) };
}

/**
 * Calcule la disponibilité précise de chaque créneau pour une date donnée (YYYY-MM-DD)
 */
export async function getDayAvailability(dateStr: string): Promise<DayAvailability> {
  const dateObj = new Date(dateStr + "T00:00:00");
  const dayIndex = dateObj.getDay();
  const dayConfig = GARAGE_CONFIG.openingHours.find((d) => d.dayIndex === dayIndex);

  const dayName = dayConfig ? dayConfig.dayName : "Fermé";
  const isOpenDay = Boolean(dayConfig && dayConfig.isOpen);

  // Vérifier si la date est explicitement bloquée
  const blockedDates = await storage.getBlockedDates();
  if (blockedDates.includes(dateStr) || !isOpenDay) {
    return {
      date: dateStr,
      isOpen: false,
      dayName,
      slots: [],
    };
  }

  const standardSlots = getStandardSlotsForDay(dayIndex);
  const existingBookings = await storage.getAppointmentsByDate(dateStr);
  const bookedTimes = new Set(existingBookings.map((b) => b.time));

  // Heure de Marseille (le serveur Vercel tourne en UTC)
  const { today, hour: currentHour } = getParisNow();
  const isToday = today === dateStr;

  const slots: SlotAvailability[] = standardSlots.map((time) => {
    const slotHour = parseInt(time.split(":")[0], 10);

    // Si c'est aujourd'hui et l'heure est passée ou trop proche
    if (isToday && slotHour <= currentHour + 1) {
      return {
        time,
        isAvailable: false,
        reason: "Créneau passé ou délai trop court",
      };
    }

    // Si déjà réservé
    if (bookedTimes.has(time)) {
      return {
        time,
        isAvailable: false,
        reason: "Créneau déjà réservé",
      };
    }

    return {
      time,
      isAvailable: true,
    };
  });

  return {
    date: dateStr,
    isOpen: true,
    dayName,
    slots,
  };
}

/**
 * Vérifie si un créneau spécifique est valide et disponible
 */
export async function isSlotAvailable(
  dateStr: string,
  timeStr: string
): Promise<{ available: boolean; error?: string }> {
  const dayAvail = await getDayAvailability(dateStr);
  if (!dayAvail.isOpen) {
    return { available: false, error: "Le garage est fermé à cette date (week-end ou fermeture exceptionnelle)." };
  }

  const slot = dayAvail.slots.find((s) => s.time === timeStr);
  if (!slot) {
    return { available: false, error: "Créneau horaire non valide." };
  }

  if (!slot.isAvailable) {
    return { available: false, error: slot.reason || "Ce créneau n'est pas disponible." };
  }

  return { available: true };
}
