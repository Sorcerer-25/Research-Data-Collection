-- ==============================================================================
-- Migration: Add Roll Number and Batch Number to Participants
-- Run this in your Supabase SQL Editor (https://app.supabase.com -> SQL Editor)
-- ==============================================================================

-- 1. Safely add roll_number and batch_number columns if not already present
ALTER TABLE public.participants
ADD COLUMN IF NOT EXISTS roll_number TEXT,
ADD COLUMN IF NOT EXISTS batch_number TEXT;

-- 2. Create performance indexes for search and filter queries
CREATE INDEX IF NOT EXISTS idx_participants_roll_number ON public.participants(roll_number);
CREATE INDEX IF NOT EXISTS idx_participants_batch_number ON public.participants(batch_number);

-- 3. Update the handle_new_user() trigger function to extract roll_number and batch_number from auth metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.participants (id, full_name, email, role, roll_number, batch_number)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'participant'),
        NEW.raw_user_meta_data->>'roll_number',
        NEW.raw_user_meta_data->>'batch_number'
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        roll_number = COALESCE(EXCLUDED.roll_number, public.participants.roll_number),
        batch_number = COALESCE(EXCLUDED.batch_number, public.participants.batch_number),
        updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Re-bind the trigger to auth.users (if needed)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
