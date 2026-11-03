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
    ip_address TEXT,
    UNIQUE (appointment_date, appointment_time)
);

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

-- Activation de Row Level Security (RLS)
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- Politique d'insertion publique sécurisée pour les prises de rendez-vous
CREATE POLICY "Insertion publique des rendez-vous" 
    ON public.appointments 
    FOR INSERT 
    WITH CHECK (true);

-- Politique d'insertion publique pour les formulaires de contact
CREATE POLICY "Insertion publique des messages de contact" 
    ON public.contact_messages 
    FOR INSERT 
    WITH CHECK (true);

-- Les opérations de lecture et mise à jour complètes sont réservées à la clé de service (service_role)
