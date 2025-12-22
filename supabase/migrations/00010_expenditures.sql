-- Create expenditure_sources table for tracking subscription and consumption costs
-- This is an admin-only feature

CREATE TABLE IF NOT EXISTS public.expenditure_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  base_cost numeric(10, 2) NOT NULL DEFAULT 0.00,
  billing_cycle text NOT NULL DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  billing_day_of_month integer NOT NULL DEFAULT 1 CHECK (billing_day_of_month >= 1 AND billing_day_of_month <= 28),
  consumption_cost numeric(10, 2) NOT NULL DEFAULT 0.00,
  details_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE(user_id, name)
);

-- Create index for faster lookups by user
CREATE INDEX IF NOT EXISTS expenditure_sources_user_id_idx ON public.expenditure_sources(user_id);

-- Enable RLS
ALTER TABLE public.expenditure_sources ENABLE ROW LEVEL SECURITY;

-- Admin-only policies: Only admins can access this table
CREATE POLICY "Admins can view own expenditure sources" ON public.expenditure_sources
  FOR SELECT USING (public.is_admin() AND auth.uid() = user_id);

CREATE POLICY "Admins can insert own expenditure sources" ON public.expenditure_sources
  FOR INSERT WITH CHECK (public.is_admin() AND auth.uid() = user_id);

CREATE POLICY "Admins can update own expenditure sources" ON public.expenditure_sources
  FOR UPDATE USING (public.is_admin() AND auth.uid() = user_id)
  WITH CHECK (public.is_admin() AND auth.uid() = user_id);

CREATE POLICY "Admins can delete own expenditure sources" ON public.expenditure_sources
  FOR DELETE USING (public.is_admin() AND auth.uid() = user_id);

-- Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_expenditure_sources_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_expenditure_sources_updated
  BEFORE UPDATE ON public.expenditure_sources
  FOR EACH ROW EXECUTE FUNCTION public.handle_expenditure_sources_updated_at();
