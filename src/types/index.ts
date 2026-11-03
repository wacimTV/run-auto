export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed";

export type PreferredContactMethod = "phone" | "sms" | "email";

export interface VehicleInfo {
  make: string; // Ex: Renault, Peugeot, BMW, etc.
  model: string; // Ex: Clio IV, 308, Série 3, etc.
  year?: string; // Année facultative
  fuel?: string; // Essence, Diesel, Hybride, Électrique
  licensePlate?: string; // Immatriculation facultative
}

export interface ClientInfo {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferredContact: PreferredContactMethod;
}

export interface Appointment {
  id: string;
  createdAt: string;
  serviceId: string;
  serviceName: string;
  isCustomRequest: boolean;
  problemDescription?: string;
  vehicle: VehicleInfo;
  client: ClientInfo;
  date: string; // Format YYYY-MM-DD
  time: string; // Format HH:mm (ex: "09:00", "14:00")
  status: AppointmentStatus;
  internalNotes?: string;
  ipAddress?: string;
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  status: "new" | "read" | "replied";
  ipAddress?: string;
}

export interface SlotAvailability {
  time: string;
  isAvailable: boolean;
  reason?: string;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  isOpen: boolean;
  dayName: string;
  slots: SlotAvailability[];
}

export interface AdminUser {
  username: string;
  role: "admin";
}
