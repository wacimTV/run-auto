import fs from "fs";
import path from "path";
import { Appointment, ContactMessage } from "@/types";

interface StorageData {
  appointments: Appointment[];
  contacts: ContactMessage[];
  blockedDates: string[]; // Dates YYYY-MM-DD bloquées exceptionnellement
  blockedSlots: { date: string; time: string; reason?: string }[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORAGE_FILE = path.join(DATA_DIR, "storage.json");

// Ensure data directory exists
function ensureStorage(): StorageData {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(STORAGE_FILE)) {
    const initialData: StorageData = {
      appointments: [],
      contacts: [],
      blockedDates: [],
      blockedSlots: [],
    };
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }

  try {
    const raw = fs.readFileSync(STORAGE_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    const initialData: StorageData = {
      appointments: [],
      contacts: [],
      blockedDates: [],
      blockedSlots: [],
    };
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(initialData, null, 2), "utf-8");
    return initialData;
  }
}

function saveStorage(data: StorageData): void {
  ensureStorage();
  const tempFile = `${STORAGE_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, STORAGE_FILE);
}

export const storage = {
  // Appointments
  getAppointments: (): Appointment[] => {
    const data = ensureStorage();
    return data.appointments.sort((a, b) => {
      // Trier par date puis heure décroissantes
      const dateA = new Date(`${a.date}T${a.time}:00`);
      const dateB = new Date(`${b.date}T${b.time}:00`);
      return dateB.getTime() - dateA.getTime();
    });
  },

  getAppointmentById: (id: string): Appointment | undefined => {
    const data = ensureStorage();
    return data.appointments.find((apt) => apt.id === id);
  },

  getAppointmentsByDate: (date: string): Appointment[] => {
    const data = ensureStorage();
    return data.appointments.filter(
      (apt) => apt.date === date && apt.status !== "cancelled"
    );
  },

  createAppointment: (appointment: Appointment): Appointment => {
    const data = ensureStorage();
    // Protection double-réservation
    const exists = data.appointments.some(
      (apt) =>
        apt.date === appointment.date &&
        apt.time === appointment.time &&
        apt.status !== "cancelled"
    );

    if (exists) {
      throw new Error("Ce créneau est déjà réservé. Veuillez choisir un autre horaire.");
    }

    data.appointments.push(appointment);
    saveStorage(data);
    return appointment;
  },

  updateAppointmentStatus: (
    id: string,
    status: Appointment["status"],
    internalNotes?: string
  ): Appointment | null => {
    const data = ensureStorage();
    const index = data.appointments.findIndex((apt) => apt.id === id);
    if (index === -1) return null;

    data.appointments[index].status = status;
    if (internalNotes !== undefined) {
      data.appointments[index].internalNotes = internalNotes;
    }

    saveStorage(data);
    return data.appointments[index];
  },

  deleteAppointment: (id: string): boolean => {
    const data = ensureStorage();
    const prevLength = data.appointments.length;
    data.appointments = data.appointments.filter((apt) => apt.id !== id);
    if (data.appointments.length !== prevLength) {
      saveStorage(data);
      return true;
    }
    return false;
  },

  // Contact Messages
  getContacts: (): ContactMessage[] => {
    const data = ensureStorage();
    return data.contacts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  createContact: (contact: ContactMessage): ContactMessage => {
    const data = ensureStorage();
    data.contacts.push(contact);
    saveStorage(data);
    return contact;
  },

  updateContactStatus: (
    id: string,
    status: ContactMessage["status"]
  ): ContactMessage | null => {
    const data = ensureStorage();
    const index = data.contacts.findIndex((c) => c.id === id);
    if (index === -1) return null;

    data.contacts[index].status = status;
    saveStorage(data);
    return data.contacts[index];
  },

  // Exceptions & Blocked Slots
  getBlockedSlots: () => {
    const data = ensureStorage();
    return {
      blockedDates: data.blockedDates,
      blockedSlots: data.blockedSlots,
    };
  },

  toggleBlockedDate: (date: string): boolean => {
    const data = ensureStorage();
    const exists = data.blockedDates.includes(date);
    if (exists) {
      data.blockedDates = data.blockedDates.filter((d) => d !== date);
    } else {
      data.blockedDates.push(date);
    }
    saveStorage(data);
    return !exists;
  },
};
