import "server-only";
import fs from "fs";
import path from "path";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Appointment, ContactMessage } from "@/types";

/**
 * Couche de persistance.
 *
 * - Si NEXT_PUBLIC_SUPABASE_URL (ou SUPABASE_URL) et SUPABASE_SERVICE_ROLE_KEY sont définies,
 *   les données sont stockées dans Supabase (obligatoire en production / sur Vercel,
 *   car le disque des fonctions serverless est en lecture seule et non persistant).
 * - Sinon, en local uniquement, repli sur le fichier JSON data/storage.json.
 */

export const DOUBLE_BOOKING_ERROR = "Ce créneau est déjà réservé. Veuillez choisir un autre horaire.";

interface StorageBackend {
  getAppointments(): Promise<Appointment[]>;
  getAppointmentsByDate(date: string): Promise<Appointment[]>;
  createAppointment(appointment: Appointment): Promise<Appointment>;
  updateAppointmentStatus(
    id: string,
    status: Appointment["status"],
    internalNotes?: string
  ): Promise<Appointment | null>;
  deleteAppointment(id: string): Promise<boolean>;
  getContacts(): Promise<ContactMessage[]>;
  createContact(contact: ContactMessage): Promise<ContactMessage>;
  getBlockedDates(): Promise<string[]>;
  toggleBlockedDate(date: string): Promise<boolean>;
}

function sortAppointments(list: Appointment[]): Appointment[] {
  // Trier par date puis heure décroissantes
  return list.sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}:00`);
    const dateB = new Date(`${b.date}T${b.time}:00`);
    return dateB.getTime() - dateA.getTime();
  });
}

// ============================================================================
// Backend Supabase
// ============================================================================

interface AppointmentRow {
  id: string;
  created_at: string;
  service_id: string;
  service_name: string;
  is_custom_request: boolean | null;
  problem_description: string | null;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: string | null;
  vehicle_fuel: string | null;
  vehicle_license_plate: string | null;
  client_first_name: string;
  client_last_name: string;
  client_phone: string;
  client_email: string;
  preferred_contact: string | null;
  appointment_date: string;
  appointment_time: string;
  status: Appointment["status"];
  internal_notes: string | null;
  ip_address: string | null;
}

interface ContactRow {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: ContactMessage["status"];
  ip_address: string | null;
}

function rowToAppointment(r: AppointmentRow): Appointment {
  return {
    id: r.id,
    createdAt: r.created_at,
    serviceId: r.service_id,
    serviceName: r.service_name,
    isCustomRequest: Boolean(r.is_custom_request),
    problemDescription: r.problem_description ?? undefined,
    vehicle: {
      make: r.vehicle_make,
      model: r.vehicle_model,
      year: r.vehicle_year ?? undefined,
      fuel: r.vehicle_fuel ?? undefined,
      licensePlate: r.vehicle_license_plate ?? undefined,
    },
    client: {
      firstName: r.client_first_name,
      lastName: r.client_last_name,
      phone: r.client_phone,
      email: r.client_email,
      preferredContact: (r.preferred_contact as Appointment["client"]["preferredContact"]) ?? "phone",
    },
    date: r.appointment_date,
    // Postgres renvoie le type TIME au format HH:mm:ss
    time: r.appointment_time.slice(0, 5),
    status: r.status,
    internalNotes: r.internal_notes ?? undefined,
    ipAddress: r.ip_address ?? undefined,
  };
}

function appointmentToRow(a: Appointment): AppointmentRow {
  return {
    id: a.id,
    created_at: a.createdAt,
    service_id: a.serviceId,
    service_name: a.serviceName,
    is_custom_request: a.isCustomRequest,
    problem_description: a.problemDescription || null,
    vehicle_make: a.vehicle.make,
    vehicle_model: a.vehicle.model,
    vehicle_year: a.vehicle.year || null,
    vehicle_fuel: a.vehicle.fuel || null,
    vehicle_license_plate: a.vehicle.licensePlate || null,
    client_first_name: a.client.firstName,
    client_last_name: a.client.lastName,
    client_phone: a.client.phone,
    client_email: a.client.email,
    preferred_contact: a.client.preferredContact,
    appointment_date: a.date,
    appointment_time: a.time,
    status: a.status,
    internal_notes: a.internalNotes || null,
    ip_address: a.ipAddress || null,
  };
}

function rowToContact(r: ContactRow): ContactMessage {
  return {
    id: r.id,
    createdAt: r.created_at,
    name: r.name,
    email: r.email,
    phone: r.phone ?? undefined,
    subject: r.subject,
    message: r.message,
    status: r.status,
    ipAddress: r.ip_address ?? undefined,
  };
}

function fail(context: string, error: { message: string }): never {
  console.error(`[SUPABASE ERROR] ${context}:`, error.message);
  throw new Error(`Erreur base de données (${context})`);
}

function supabaseBackend(db: SupabaseClient): StorageBackend {
  return {
    async getAppointments() {
      const { data, error } = await db.from("appointments").select("*");
      if (error) fail("lecture des rendez-vous", error);
      return sortAppointments((data as AppointmentRow[]).map(rowToAppointment));
    },

    async getAppointmentsByDate(date) {
      const { data, error } = await db
        .from("appointments")
        .select("*")
        .eq("appointment_date", date)
        .neq("status", "cancelled");
      if (error) fail("lecture des créneaux", error);
      return (data as AppointmentRow[]).map(rowToAppointment);
    },

    async createAppointment(appointment) {
      const { error } = await db.from("appointments").insert(appointmentToRow(appointment));
      if (error) {
        // 23505 = violation d'unicité : le créneau vient d'être réservé par quelqu'un d'autre
        if (error.code === "23505") throw new Error(DOUBLE_BOOKING_ERROR);
        fail("création du rendez-vous", error);
      }
      return appointment;
    },

    async updateAppointmentStatus(id, status, internalNotes) {
      const patch: Partial<AppointmentRow> = { status };
      if (internalNotes !== undefined) patch.internal_notes = internalNotes;
      const { data, error } = await db
        .from("appointments")
        .update(patch)
        .eq("id", id)
        .select("*")
        .maybeSingle();
      if (error) {
        if (error.code === "23505") throw new Error(DOUBLE_BOOKING_ERROR);
        fail("mise à jour du rendez-vous", error);
      }
      return data ? rowToAppointment(data as AppointmentRow) : null;
    },

    async deleteAppointment(id) {
      const { data, error } = await db.from("appointments").delete().eq("id", id).select("id");
      if (error) fail("suppression du rendez-vous", error);
      return (data?.length ?? 0) > 0;
    },

    async getContacts() {
      const { data, error } = await db
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) fail("lecture des messages", error);
      return (data as ContactRow[]).map(rowToContact);
    },

    async createContact(contact) {
      const row: ContactRow = {
        id: contact.id,
        created_at: contact.createdAt,
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        subject: contact.subject,
        message: contact.message,
        status: contact.status,
        ip_address: contact.ipAddress || null,
      };
      const { error } = await db.from("contact_messages").insert(row);
      if (error) fail("enregistrement du message", error);
      return contact;
    },

    async getBlockedDates() {
      const { data, error } = await db.from("blocked_dates").select("date").order("date");
      if (error) fail("lecture des fermetures", error);
      return (data as { date: string }[]).map((d) => d.date);
    },

    async toggleBlockedDate(date) {
      const { data, error } = await db.from("blocked_dates").delete().eq("date", date).select("date");
      if (error) fail("modification des fermetures", error);
      if ((data?.length ?? 0) > 0) return false; // la date était bloquée -> débloquée
      const { error: insertError } = await db.from("blocked_dates").insert({ date });
      if (insertError) fail("modification des fermetures", insertError);
      return true;
    },
  };
}

// ============================================================================
// Backend fichier JSON (développement local uniquement)
// ============================================================================

interface StorageData {
  appointments: Appointment[];
  contacts: ContactMessage[];
  blockedDates: string[]; // Dates YYYY-MM-DD bloquées exceptionnellement
  blockedSlots: { date: string; time: string; reason?: string }[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORAGE_FILE = path.join(DATA_DIR, "storage.json");

function emptyData(): StorageData {
  return { appointments: [], contacts: [], blockedDates: [], blockedSlots: [] };
}

function readFile(): StorageData {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORAGE_FILE)) {
    const initial = emptyData();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
  try {
    return JSON.parse(fs.readFileSync(STORAGE_FILE, "utf-8"));
  } catch {
    const initial = emptyData();
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(initial, null, 2), "utf-8");
    return initial;
  }
}

function writeFile(data: StorageData): void {
  const tempFile = `${STORAGE_FILE}.tmp`;
  fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), "utf-8");
  fs.renameSync(tempFile, STORAGE_FILE);
}

const fileBackend: StorageBackend = {
  async getAppointments() {
    return sortAppointments(readFile().appointments);
  },

  async getAppointmentsByDate(date) {
    return readFile().appointments.filter((apt) => apt.date === date && apt.status !== "cancelled");
  },

  async createAppointment(appointment) {
    const data = readFile();
    const exists = data.appointments.some(
      (apt) => apt.date === appointment.date && apt.time === appointment.time && apt.status !== "cancelled"
    );
    if (exists) throw new Error(DOUBLE_BOOKING_ERROR);
    data.appointments.push(appointment);
    writeFile(data);
    return appointment;
  },

  async updateAppointmentStatus(id, status, internalNotes) {
    const data = readFile();
    const apt = data.appointments.find((a) => a.id === id);
    if (!apt) return null;
    apt.status = status;
    if (internalNotes !== undefined) apt.internalNotes = internalNotes;
    writeFile(data);
    return apt;
  },

  async deleteAppointment(id) {
    const data = readFile();
    const prevLength = data.appointments.length;
    data.appointments = data.appointments.filter((apt) => apt.id !== id);
    if (data.appointments.length === prevLength) return false;
    writeFile(data);
    return true;
  },

  async getContacts() {
    return readFile().contacts.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  },

  async createContact(contact) {
    const data = readFile();
    data.contacts.push(contact);
    writeFile(data);
    return contact;
  },

  async getBlockedDates() {
    return readFile().blockedDates;
  },

  async toggleBlockedDate(date) {
    const data = readFile();
    const exists = data.blockedDates.includes(date);
    data.blockedDates = exists ? data.blockedDates.filter((d) => d !== date) : [...data.blockedDates, date];
    writeFile(data);
    return !exists;
  },
};

// ============================================================================
// Sélection du backend
// ============================================================================

let backend: StorageBackend | null = null;

function getBackend(): StorageBackend {
  if (backend) return backend;

  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (url && key) {
    backend = supabaseBackend(
      createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
    );
  } else if (process.env.VERCEL) {
    // Sur Vercel le disque n'est pas persistant : on refuse plutôt que de perdre des rendez-vous.
    throw new Error(
      "Base de données non configurée : renseignez NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY dans Vercel."
    );
  } else {
    backend = fileBackend;
  }
  return backend;
}

export const storage: StorageBackend = {
  getAppointments: () => getBackend().getAppointments(),
  getAppointmentsByDate: (date) => getBackend().getAppointmentsByDate(date),
  createAppointment: (a) => getBackend().createAppointment(a),
  updateAppointmentStatus: (id, status, notes) => getBackend().updateAppointmentStatus(id, status, notes),
  deleteAppointment: (id) => getBackend().deleteAppointment(id),
  getContacts: () => getBackend().getContacts(),
  createContact: (c) => getBackend().createContact(c),
  getBlockedDates: () => getBackend().getBlockedDates(),
  toggleBlockedDate: (date) => getBackend().toggleBlockedDate(date),
};
