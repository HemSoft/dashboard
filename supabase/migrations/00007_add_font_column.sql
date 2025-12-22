-- Add font column for user font preference
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS font text DEFAULT 'geist';

-- Add check constraint for valid font values
ALTER TABLE public.profiles
ADD CONSTRAINT profiles_font_check
CHECK (font IN ('geist', 'inter', 'roboto', 'nunito', 'open-sans', 'lato'));
