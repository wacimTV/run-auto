-- SCHÉMA OFFICIEL SUPABASE POUR LE SITE GARAGE RUN AUTO (MARSEILLE)
-- Exécutez ce script dans l'éditeur SQL de votre tableau de bord Supabase

-- 1. Table des rendez-vous
CREATE TABLE IF NOT EXISTS public.appointments (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    service_id TEXT NOT NULL,
    service_name TEXT NOT NULL,
    is_custom_request BOOLEAN DEFAULT FALSE,
    problem_description TEXT,
    vehicle_make TEXT NOT NULL,
    vehicle_model TEXT NOT NULL,
    vehicle_year TEXT,
    vehicle_fuel TEXT,
    vehicle_license_plate TEXT,
    client_first_name TEXT NOT NULL,
    client_last_name TEXT NOT NULL,
    client_phone TEXT NOT NULL,
    client_email TEXT NOT NULL,
    preferred_contact TEXT DEFAULT 'phone',
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    internal_notes TEXT,
    ip_address TEXT
);

-- Un seul rendez-vous actif par créneau (un rendez-vous annulé libère le créneau)
CREATE UNIQUE INDEX IF NOT EXISTS uniq_active_appointment_slot
    ON public.appointments (appointment_date, appointment_time)
    WHERE status <> 'cancelled';

-- Index pour optimiser les requêtes de disponibilité
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments (appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);

-- 2. Table des messages de contact
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied')),
    ip_address TEXT
);

-- 3. Table des fermetures exceptionnelles
CREATE TABLE IF NOT EXISTS public.blocked_dates (
    date DATE PRIMARY KEY,
    reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Activation de Row Level Security (RLS) sans aucune politique publique :
-- seul le serveur Next.js (clé service_role, jamais exposée au navigateur) peut lire et écrire.
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;
