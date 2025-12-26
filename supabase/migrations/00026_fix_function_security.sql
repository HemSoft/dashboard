-- Migration: Fix function security issues flagged by Supabase Advisor
-- Fixes:
-- 1. Add search_path to SECURITY DEFINER functions (prevents search path injection)
-- 2. Add search_path to trigger functions for consistency
-- 3. Revoke direct execute permissions on trigger functions (they should only be called by triggers)

-- Fix handle_new_user: Already has SECURITY DEFINER, add search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (
    new.id,
    new.email,
    CASE
      WHEN new.email = 'fphemmer@gmail.com' THEN 'admin'
      ELSE 'user'
    END
  );
  RETURN new;
END;
$$;

-- Fix is_admin: Already has SECURITY DEFINER and search_path, but ensure it's set to empty
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Fix trigger functions: Add search_path and revoke public execute

-- handle_expenditure_sources_updated_at
CREATE OR REPLACE FUNCTION public.handle_expenditure_sources_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_expenditure_sources_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_expenditure_sources_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.handle_expenditure_sources_updated_at() FROM authenticated;

-- handle_github_accounts_updated_at
CREATE OR REPLACE FUNCTION public.handle_github_accounts_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_github_accounts_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_github_accounts_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.handle_github_accounts_updated_at() FROM authenticated;

-- handle_mail_account_settings_updated_at
CREATE OR REPLACE FUNCTION public.handle_mail_account_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_mail_account_settings_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_mail_account_settings_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.handle_mail_account_settings_updated_at() FROM authenticated;

-- handle_mail_oauth_tokens_updated_at
CREATE OR REPLACE FUNCTION public.handle_mail_oauth_tokens_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_mail_oauth_tokens_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_mail_oauth_tokens_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.handle_mail_oauth_tokens_updated_at() FROM authenticated;

-- handle_timers_updated_at
CREATE OR REPLACE FUNCTION public.handle_timers_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_timers_updated_at() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_timers_updated_at() FROM anon;
REVOKE ALL ON FUNCTION public.handle_timers_updated_at() FROM authenticated;

-- Revoke execute on handle_new_user (it's called by auth trigger, not users)
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM anon;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM authenticated;

-- Keep is_admin callable by authenticated users (used in RLS policies)
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
