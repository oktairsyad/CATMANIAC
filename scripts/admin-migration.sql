-- ============================================
-- Migration: Admin Role System
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Add role column to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user'
  CHECK (role IN ('user', 'admin'));

-- 2. Fix credits default to 3 for new users (free trial)
ALTER TABLE public.profiles
  ALTER COLUMN credits SET DEFAULT 3;

-- 3. Update handle_new_user to give 3 free credits + role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, credits, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    3,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Allow admins to read all profiles
--    Uses security definer function to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Drop and recreate select policy to include admin access
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id
    OR public.get_my_role() = 'admin'
  );

-- 5. (Run once) Set your account as admin — replace with your email
-- UPDATE public.profiles SET role = 'admin' WHERE email = 'your@email.com';
