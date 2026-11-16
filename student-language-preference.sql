-- Add student language preference to existing profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS preferred_language text NOT NULL DEFAULT 'hinglish'
CHECK (preferred_language IN ('hi', 'en', 'hinglish'));

-- Update signup trigger so the selected language is saved automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, role, preferred_language)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.phone,
    'student',
    COALESCE(NEW.raw_user_meta_data ->> 'preferred_language', 'hinglish')
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    preferred_language = EXCLUDED.preferred_language;
  RETURN NEW;
END;
$$;
