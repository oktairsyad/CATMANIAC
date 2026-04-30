-- ============================================
-- Migration: Username Support
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Add username column
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username text UNIQUE;

-- 2. Update handle_new_user to save username from signup metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, username, credits, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NULLIF(TRIM(LOWER(NEW.raw_user_meta_data->>'username')), ''),
    3,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Public RPC: check if username is already taken (callable without auth)
CREATE OR REPLACE FUNCTION public.is_username_taken(p_username text)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE username = LOWER(TRIM(p_username))
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;
