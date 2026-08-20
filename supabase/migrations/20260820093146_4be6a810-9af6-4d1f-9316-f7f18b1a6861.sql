CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  state TEXT,
  rto TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid());
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE TYPE public.application_status AS ENUM ('draft','submitted','under_review','approved','rejected');

CREATE TABLE public.applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  reference_no TEXT NOT NULL UNIQUE DEFAULT ('PS-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8))),
  service TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Licence',
  applicant_name TEXT NOT NULL,
  vehicle_no TEXT,
  licence_no TEXT,
  state TEXT,
  rto TEXT,
  fee_paise INTEGER NOT NULL DEFAULT 0,
  status public.application_status NOT NULL DEFAULT 'submitted',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.applications TO authenticated;
GRANT ALL ON public.applications TO service_role;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own applications" ON public.applications FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.application_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES public.applications ON DELETE CASCADE,
  status public.application_status NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.application_events TO authenticated;
GRANT ALL ON public.application_events TO service_role;
ALTER TABLE public.application_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own application events select" ON public.application_events FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND a.user_id = auth.uid()));
CREATE POLICY "own application events insert" ON public.application_events FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM public.applications a WHERE a.id = application_id AND a.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER applications_updated_at BEFORE UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.log_application_event() RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.application_events (application_id, status, message)
    VALUES (NEW.id, NEW.status, 'Status set to ' || NEW.status);
  END IF;
  RETURN NEW;
END; $$;
CREATE TRIGGER applications_event_log AFTER INSERT OR UPDATE ON public.applications FOR EACH ROW EXECUTE FUNCTION public.log_application_event();