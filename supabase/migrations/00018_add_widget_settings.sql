-- Add widget_settings column to store widget visibility and order
-- Format: { widgets: [{ id: string, enabled: boolean, order: number }] }
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS widget_settings jsonb DEFAULT NULL;

-- Add a comment to describe the column
COMMENT ON COLUMN public.profiles.widget_settings IS 'JSON object storing widget visibility and order preferences. Format: { widgets: [{ id: string, enabled: boolean, order: number }] }';
