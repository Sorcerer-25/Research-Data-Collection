-- ==============================================================================
-- Sleep Study & Data Collection Web App Database Schema
-- Supabase PostgreSQL + Row Level Security (RLS) + Triggers
-- ==============================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Participants Table
-- Stores researcher and participant user profile info linked to auth.users
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.participants (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'participant' CHECK (role IN ('participant', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for fast lookup by email and role
CREATE INDEX IF NOT EXISTS idx_participants_email ON public.participants(email);
CREATE INDEX IF NOT EXISTS idx_participants_role ON public.participants(role);

-- ------------------------------------------------------------------------------
-- 2. Study Settings Table
-- Configurable study period (start date, end date, target days e.g. 14 or 21)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.study_settings (
    id SERIAL PRIMARY KEY,
    study_name TEXT NOT NULL DEFAULT '14-Day Sleep Quality & Circadian Rhythm Study',
    study_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    study_end_date DATE NOT NULL DEFAULT (CURRENT_DATE + INTERVAL '13 days'),
    target_days INTEGER NOT NULL DEFAULT 14 CHECK (target_days > 0),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Insert default active study settings if table is empty
INSERT INTO public.study_settings (study_name, study_start_date, study_end_date, target_days, is_active)
SELECT '14-Day Sleep Quality & Circadian Rhythm Study', '2026-09-01', '2026-09-14', 14, true
WHERE NOT EXISTS (SELECT 1 FROM public.study_settings);

-- ------------------------------------------------------------------------------
-- 3. Sleep Logs Table
-- Daily sleep recordings. Duration stored as total_sleep_minutes.
-- One entry per calendar day per participant enforced by UNIQUE constraint.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sleep_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    participant_id UUID NOT NULL REFERENCES public.participants(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    bed_time TEXT NOT NULL,       -- Stored as HH:mm string (e.g. '23:30')
    wake_time TEXT NOT NULL,      -- Stored as HH:mm string (e.g. '07:15')
    total_sleep_minutes INTEGER NOT NULL CHECK (total_sleep_minutes >= 0 AND total_sleep_minutes <= 1440),
    sleep_quality INTEGER CHECK (sleep_quality >= 1 AND sleep_quality <= 5),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT unique_participant_log_date UNIQUE (participant_id, log_date)
);

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_sleep_logs_participant_id ON public.sleep_logs(participant_id);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_log_date ON public.sleep_logs(log_date);
CREATE INDEX IF NOT EXISTS idx_sleep_logs_participant_date ON public.sleep_logs(participant_id, log_date);

-- ------------------------------------------------------------------------------
-- 4. Automatic Timestamp Update Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_participants_updated_at ON public.participants;
CREATE TRIGGER tr_participants_updated_at
    BEFORE UPDATE ON public.participants
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS tr_sleep_logs_updated_at ON public.sleep_logs;
CREATE TRIGGER tr_sleep_logs_updated_at
    BEFORE UPDATE ON public.sleep_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 5. Auto-Create Participant Profile on Auth User Sign-Up Trigger
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.participants (id, full_name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'participant')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 6. Helper Function: Check If Current User is Admin
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.participants
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 7. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------
ALTER TABLE public.participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;

-- PARTICIPANTS TABLE POLICIES
DROP POLICY IF EXISTS "Participants can view own profile" ON public.participants;
CREATE POLICY "Participants can view own profile"
    ON public.participants FOR SELECT
    TO authenticated
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Participants can update own profile" ON public.participants;
CREATE POLICY "Participants can update own profile"
    ON public.participants FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Allow user creation trigger or self insert" ON public.participants;
CREATE POLICY "Allow user creation trigger or self insert"
    ON public.participants FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id OR public.is_admin());

-- STUDY SETTINGS POLICIES
DROP POLICY IF EXISTS "Authenticated users can view study settings" ON public.study_settings;
CREATE POLICY "Authenticated users can view study settings"
    ON public.study_settings FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Admins can manage study settings" ON public.study_settings;
CREATE POLICY "Admins can manage study settings"
    ON public.study_settings FOR ALL
    TO authenticated
    USING (public.is_admin());

-- SLEEP LOGS POLICIES
DROP POLICY IF EXISTS "Participants can view own sleep logs or admin can view all" ON public.sleep_logs;
CREATE POLICY "Participants can view own sleep logs or admin can view all"
    ON public.sleep_logs FOR SELECT
    TO authenticated
    USING (auth.uid() = participant_id OR public.is_admin());

DROP POLICY IF EXISTS "Participants can insert own sleep logs" ON public.sleep_logs;
CREATE POLICY "Participants can insert own sleep logs"
    ON public.sleep_logs FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = participant_id);

DROP POLICY IF EXISTS "Participants can update own sleep logs" ON public.sleep_logs;
CREATE POLICY "Participants can update own sleep logs"
    ON public.sleep_logs FOR UPDATE
    TO authenticated
    USING (auth.uid() = participant_id OR public.is_admin());

DROP POLICY IF EXISTS "Participants can delete own sleep logs" ON public.sleep_logs;
CREATE POLICY "Participants can delete own sleep logs"
    ON public.sleep_logs FOR DELETE
    TO authenticated
    USING (auth.uid() = participant_id OR public.is_admin());

-- ------------------------------------------------------------------------------
-- 8. Guide to Set Admin Role in Supabase
-- To grant a user admin role, execute:
-- UPDATE public.participants SET role = 'admin' WHERE email = 'your-admin-email@example.com';
-- ==============================================================================
