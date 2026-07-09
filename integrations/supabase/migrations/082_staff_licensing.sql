-- Staff CRM — producer & agency licensing tracker (internal use only).

CREATE TABLE IF NOT EXISTS public.staff_state_licenses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  state_code        text NOT NULL,
  license_number    text,
  license_type      text NOT NULL DEFAULT 'non_resident'
                    CHECK (license_type IN ('resident', 'non_resident', 'temporary', 'other')),
  status            text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'pending', 'expired', 'inactive', 'suspended')),
  lines_of_authority  text[] NOT NULL DEFAULT '{}',
  effective_date    date,
  expiration_date   date,
  renewal_due_date  date,
  verify_url        text,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),
  UNIQUE (state_code, license_type)
);

CREATE INDEX IF NOT EXISTS idx_staff_state_licenses_exp
  ON public.staff_state_licenses (expiration_date)
  WHERE expiration_date IS NOT NULL;

COMMENT ON TABLE public.staff_state_licenses IS
  'Producer licenses by state — resident and non-resident. Staff CRM Licensing section.';

CREATE TABLE IF NOT EXISTS public.staff_agency_license (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name       text NOT NULL,
  license_number    text,
  state_code        text NOT NULL DEFAULT 'NE',
  status            text NOT NULL DEFAULT 'active'
                    CHECK (status IN ('active', 'pending', 'expired', 'inactive')),
  effective_date    date,
  expiration_date   date,
  renewal_due_date  date,
  registered_agent  text,
  business_address  text,
  verify_url        text,
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.staff_agency_license IS
  'Agency / entity license record (Mejor Vida Insurance LLC).';

CREATE TABLE IF NOT EXISTS public.staff_license_training (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title             text NOT NULL,
  category          text NOT NULL DEFAULT 'ce'
                    CHECK (category IN ('ce', 'product', 'aml', 'compliance', 'other')),
  provider          text,
  state_code        text,
  due_date          date,
  completed_date    date,
  hours_required    numeric(6, 2),
  hours_completed   numeric(6, 2),
  status            text NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'completed', 'overdue', 'waived')),
  notes             text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_staff_license_training_due
  ON public.staff_license_training (due_date)
  WHERE due_date IS NOT NULL AND status IN ('pending', 'overdue');

COMMENT ON TABLE public.staff_license_training IS
  'CE, AML, product training, and other licensing compliance deadlines.';

CREATE TABLE IF NOT EXISTS public.staff_license_documents (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_type       text NOT NULL CHECK (parent_type IN ('state', 'agency', 'training')),
  parent_id         uuid NOT NULL,
  filename          text NOT NULL,
  content_type      text NOT NULL DEFAULT 'application/pdf',
  storage_path      text NOT NULL,
  file_size_bytes   integer,
  notes             text,
  uploaded_at       timestamptz NOT NULL DEFAULT now(),
  uploaded_by       text
);

CREATE INDEX IF NOT EXISTS idx_staff_license_documents_parent
  ON public.staff_license_documents (parent_type, parent_id);

COMMENT ON TABLE public.staff_license_documents IS
  'License PDF/image copies — files in private Supabase Storage bucket staff-licensing-docs.';

ALTER TABLE public.staff_state_licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_agency_license ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_license_training ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_license_documents ENABLE ROW LEVEL SECURITY;

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'staff-licensing-docs',
  'staff-licensing-docs',
  false,
  10485760,
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Seed Nebraska resident license (public NPN only — edit dates in CRM).
INSERT INTO public.staff_state_licenses (
  state_code,
  license_number,
  license_type,
  status,
  lines_of_authority,
  verify_url,
  notes
)
VALUES (
  'NE',
  '21695431',
  'resident',
  'active',
  ARRAY['Life', 'Accident & Health'],
  'https://sbs.naic.org/solar-external-lookup/',
  'Nebraska resident producer license (NPN). Add effective/expiration dates from NIPR.'
)
ON CONFLICT (state_code, license_type) DO NOTHING;

INSERT INTO public.staff_agency_license (
  entity_name,
  state_code,
  status,
  business_address,
  notes
)
SELECT
  'Mejor Vida Insurance LLC',
  'NE',
  'active',
  '1201 O St Ste 309 Unit #597, Lincoln, NE 68508',
  'Agency license — add license number and renewal dates when available.'
WHERE NOT EXISTS (SELECT 1 FROM public.staff_agency_license LIMIT 1);
