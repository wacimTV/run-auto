-- SCHÉMA OFFICIEL SUPABASE POUR LE SITE GARAGE RUN AUTO (MARSEILLE)
-- Exécutez ce script dans l'éditeur SQL de votre tableau de bord Supabase
-- Tout est idempotent et peut être relancé sans erreur.

-- ============================================================================
-- MIGRATIONS (nettoyage des anciennes contraintes)
-- ============================================================================
-- L'ancien index unique empêchait slotCapacity > 1 ; remplacé par book_appointment().
DROP INDEX IF EXISTS public.uniq_active_appointment_slot;
-- Colonne de suivi du rappel e-mail la veille (ajout idempotent sur base existante)
ALTER TABLE IF EXISTS public.appointments ADD COLUMN IF NOT EXISTS reminder_sent_at TIMESTAMP WITH TIME ZONE;

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
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_progress', 'ready', 'cancelled', 'completed')),
    internal_notes TEXT,
    reminder_sent_at TIMESTAMP WITH TIME ZONE,
    ip_address TEXT
);

-- Index pour optimiser les requêtes de disponibilité et le comptage par créneau
CREATE INDEX IF NOT EXISTS idx_appointments_date_time ON public.appointments (appointment_date, appointment_time);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON public.appointments (status);

-- Réservation atomique respectant la capacité des ponts (settings.slotCapacity)
CREATE OR REPLACE FUNCTION public.book_appointment(
    p_id TEXT,
    p_created_at TIMESTAMP WITH TIME ZONE,
    p_service_id TEXT,
    p_service_name TEXT,
    p_is_custom_request BOOLEAN,
    p_problem_description TEXT,
    p_vehicle_make TEXT,
    p_vehicle_model TEXT,
    p_vehicle_year TEXT,
    p_vehicle_fuel TEXT,
    p_vehicle_license_plate TEXT,
    p_client_first_name TEXT,
    p_client_last_name TEXT,
    p_client_phone TEXT,
    p_client_email TEXT,
    p_preferred_contact TEXT,
    p_appointment_date DATE,
    p_appointment_time TIME,
    p_status TEXT,
    p_internal_notes TEXT,
    p_ip_address TEXT,
    p_capacity INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_active_count INTEGER;
    v_lock_key BIGINT;
BEGIN
    v_lock_key := hashtext(p_appointment_date::TEXT || '|' || to_char(p_appointment_time, 'HH24:MI'))::BIGINT;
    PERFORM pg_advisory_xact_lock(v_lock_key);

    IF p_status <> 'cancelled' THEN
        SELECT COUNT(*) INTO v_active_count
        FROM public.appointments
        WHERE appointment_date = p_appointment_date
          AND appointment_time = p_appointment_time
          AND status <> 'cancelled';

        IF v_active_count >= GREATEST(1, COALESCE(p_capacity, 1)) THEN
            RAISE EXCEPTION 'SLOT_FULL' USING ERRCODE = 'P0001';
        END IF;
    END IF;

    INSERT INTO public.appointments (
        id, created_at, service_id, service_name, is_custom_request, problem_description,
        vehicle_make, vehicle_model, vehicle_year, vehicle_fuel, vehicle_license_plate,
        client_first_name, client_last_name, client_phone, client_email, preferred_contact,
        appointment_date, appointment_time, status, internal_notes, ip_address
    ) VALUES (
        p_id, p_created_at, p_service_id, p_service_name, p_is_custom_request, p_problem_description,
        p_vehicle_make, p_vehicle_model, p_vehicle_year, p_vehicle_fuel, p_vehicle_license_plate,
        p_client_first_name, p_client_last_name, p_client_phone, p_client_email, p_preferred_contact,
        p_appointment_date, p_appointment_time, p_status, p_internal_notes, p_ip_address
    );
END;
$$;

REVOKE ALL ON FUNCTION public.book_appointment(TEXT, TIMESTAMP WITH TIME ZONE, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TIME, TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.book_appointment(TEXT, TIMESTAMP WITH TIME ZONE, TEXT, TEXT, BOOLEAN, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, DATE, TIME, TEXT, TEXT, TEXT, INTEGER) TO service_role;

-- Mise à jour atomique du statut avec vérification de capacité lors d'une réactivation
CREATE OR REPLACE FUNCTION public.update_appointment_status_checked(
    p_id TEXT,
    p_status TEXT,
    p_internal_notes TEXT,
    p_capacity INTEGER DEFAULT 1
)
RETURNS SETOF public.appointments
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_apt public.appointments%ROWTYPE;
    v_active_count INTEGER;
    v_lock_key BIGINT;
BEGIN
    SELECT * INTO v_apt FROM public.appointments WHERE id = p_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN;
    END IF;

    IF v_apt.status = 'cancelled' AND p_status <> 'cancelled' THEN
        v_lock_key := hashtext(v_apt.appointment_date::TEXT || '|' || to_char(v_apt.appointment_time, 'HH24:MI'))::BIGINT;
        PERFORM pg_advisory_xact_lock(v_lock_key);

        SELECT COUNT(*) INTO v_active_count
        FROM public.appointments
        WHERE appointment_date = v_apt.appointment_date
          AND appointment_time = v_apt.appointment_time
          AND status <> 'cancelled'
          AND id <> p_id;

        IF v_active_count >= GREATEST(1, COALESCE(p_capacity, 1)) THEN
            RAISE EXCEPTION 'SLOT_FULL' USING ERRCODE = 'P0001';
        END IF;
    END IF;

    RETURN QUERY
    UPDATE public.appointments
    SET status = p_status,
        internal_notes = p_internal_notes
    WHERE id = p_id
    RETURNING *;
END;
$$;

REVOKE ALL ON FUNCTION public.update_appointment_status_checked(TEXT, TEXT, TEXT, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_appointment_status_checked(TEXT, TEXT, TEXT, INTEGER) TO service_role;

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

-- 3bis. Table de configuration dynamique de l'atelier (horaires, tarifs, forfaits, galerie, avis, réglages)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- 3ter. Identifiants administrateur chiffrés (bcrypt) et version de session
CREATE TABLE IF NOT EXISTS public.admin_credentials (
    id TEXT PRIMARY KEY DEFAULT 'main',
    password_hash TEXT NOT NULL,
    session_version INTEGER NOT NULL DEFAULT 1,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
ALTER TABLE public.admin_credentials ENABLE ROW LEVEL SECURITY;

-- Activation de Row Level Security (RLS) sans aucune politique publique :
-- seul le serveur Next.js (clé service_role, jamais exposée au navigateur) peut lire et écrire.
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_dates ENABLE ROW LEVEL SECURITY;

-- 4. Limitation des requêtes (anti-spam formulaires + anti force brute admin)
-- Les clés sont des empreintes SHA-256 : aucune IP ni e-mail stocké en clair.
CREATE TABLE IF NOT EXISTS public.rate_limits (
    key TEXT PRIMARY KEY,
    count INTEGER NOT NULL DEFAULT 0,
    window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Incrémente atomiquement le compteur et renvoie TRUE si la requête est autorisée.
CREATE OR REPLACE FUNCTION public.hit_rate_limit(p_key TEXT, p_max INTEGER, p_window_seconds INTEGER)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    INSERT INTO public.rate_limits AS r (key, count, window_start)
    VALUES (p_key, 1, NOW())
    ON CONFLICT (key) DO UPDATE SET
        count = CASE WHEN r.window_start < NOW() - make_interval(secs => p_window_seconds) THEN 1 ELSE r.count + 1 END,
        window_start = CASE WHEN r.window_start < NOW() - make_interval(secs => p_window_seconds) THEN NOW() ELSE r.window_start END
    RETURNING count INTO v_count;

    -- Nettoyage occasionnel des compteurs expirés (1 appel sur 50 environ)
    IF random() < 0.02 THEN
        DELETE FROM public.rate_limits WHERE window_start < NOW() - INTERVAL '2 days';
    END IF;

    RETURN v_count <= p_max;
END;
$$;

REVOKE ALL ON FUNCTION public.hit_rate_limit(TEXT, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hit_rate_limit(TEXT, INTEGER, INTEGER) TO service_role;

-- 5. Espace de stockage privé des photos envoyées depuis l'admin
-- (créé aussi automatiquement par le site au premier envoi de photo)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('uploads', 'uploads', false, 8388608, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
ON CONFLICT (id) DO NOTHING;
