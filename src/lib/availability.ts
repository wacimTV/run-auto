import { DAY_NAMES, parisNow } from "@/lib/motorisations";
import { DayAvailability, OpeningHourEntry, SlotAvailability } from "@/types";
import { storage } from "./storage";

/**
 * Génère les créneaux standards d'1 heure pour une journée selon la configuration des horaires
 */
export function getStandardSlotsFromEntry(entry?: OpeningHourEntry): string[] {
  if (!entry || entry.closed) return [];
  const [startH] = (entry.openTime || "09:00").split(":").map(Number);
  const [endH] = (entry.closeTime || "19:00").split(":").map(Number);
  if (Number.isNaN(startH) || Number.isNaN(endH) || endH <= startH) return [];

  const slots: string[] = [];
  for (let h = startH; h < endH; h++) {
    slots.push(`${h.toString().padStart(2, "0")}:00`);
  }
  return slots;
}

/**
 * Calcule la disponibilité précise de chaque créneau pour une date donnée (YYYY-MM-DD)
 * en tenant compte des horaires configurés dans /admin, de la capacité des ponts (slotCapacity)
 * et des fermetures exceptionnelles.
 */
export async function getDayAvailability(dateStr: string): Promise<DayAvailability> {
  const dateObj = new Date(dateStr + "T00:00:00");
  const dayIndex = dateObj.getDay();
  const dayName = DAY_NAMES[dayIndex] ?? "Fermé";

  const [siteState, existingBookings] = await Promise.all([
    storage.getSiteAdminState(),
    storage.getAppointmentsByDate(dateStr),
  ]);

  if (!siteState.settings.onlineBookingEnabled) {
    return {
      date: dateStr,
      isOpen: false,
      dayName,
      slots: [],
    };
  }

  const dayEntry = siteState.hours.find((h) => h.dayOfWeek === dayIndex);
  const isClosedExceptionally = siteState.closures.some((c) => c.date === dateStr);

  if (isClosedExceptionally || !dayEntry || dayEntry.closed) {
    return {
      date: dateStr,
      isOpen: false,
      dayName,
      slots: [],
    };
  }

  const standardSlots = getStandardSlotsFromEntry(dayEntry);
  const slotCapacity = Math.max(1, siteState.settings.slotCapacity || 1);
  const leadHours = Math.max(1, siteState.settings.bookingLeadHours ?? 2);

  // Compter combien de véhicules sont déjà prévus sur chaque créneau horaire
  const countByTime = new Map<string, number>();
  for (const b of existingBookings) {
    if (b.status !== "cancelled") {
      countByTime.set(b.time, (countByTime.get(b.time) ?? 0) + 1);
    }
  }

  const { ymd: today, hour: currentHour } = parisNow();
  const isToday = today === dateStr;

  const slots: SlotAvailability[] = standardSlots.map((time) => {
    const slotHour = parseInt(time.split(":")[0], 10);

    if (isToday && slotHour < currentHour + leadHours) {
      return {
        time,
        isAvailable: false,
        reason: "Créneau passé ou délai trop court",
      };
    }

    const bookedCount = countByTime.get(time) ?? 0;
    if (bookedCount >= slotCapacity) {
      return {
        time,
        isAvailable: false,
        reason: "Ponts complets sur ce créneau",
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
    return {
      available: false,
      error: "L'atelier est fermé à cette date (week-end ou fermeture exceptionnelle).",
    };
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
