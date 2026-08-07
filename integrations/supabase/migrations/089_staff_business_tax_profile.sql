-- Private business / tax profile for staff + agent paperwork only.
-- RLS enabled with NO anon/authenticated policies — service_role only (bypasses RLS).
-- Do not expose via public API routes or static site files.

CREATE TABLE IF NOT EXISTS public.staff_business_tax_profile (
  id                        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  legal_name                text NOT NULL,
  trade_name                text,
  entity_type               text,
  federal_ein               text,
  name_control              text,
  nebraska_withholding_id   text,
  patriot_customer_id       text,
  sole_member_name          text,
  sole_member_title         text,
  daytime_phone             text,
  tax_mailing_address_line1 text,
  tax_mailing_city          text,
  tax_mailing_state         text,
  tax_mailing_zip           text,
  -- Virtual / marketing address if different from tax mailing (EIN notice) address
  other_address_line1       text,
  other_address_city        text,
  other_address_state       text,
  other_address_zip         text,
  notes                     text,
  payroll_summary           jsonb NOT NULL DEFAULT '{}'::jsonb,
  filing_status             jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active                 boolean NOT NULL DEFAULT true,
  created_at                timestamptz NOT NULL DEFAULT now(),
  updated_at                timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT staff_business_tax_profile_federal_ein_key UNIQUE (federal_ein)
);

COMMENT ON TABLE public.staff_business_tax_profile IS
  'PRIVATE staff-only business tax identifiers and addresses for filling forms (941, 941N, etc.). Not for public website or anon API access.';

COMMENT ON COLUMN public.staff_business_tax_profile.payroll_summary IS
  'Structured payroll history used for form prep (quarters, wages, employees).';

COMMENT ON COLUMN public.staff_business_tax_profile.filing_status IS
  'Which federal/state returns prepared or filed (agent-maintained).';

ALTER TABLE public.staff_business_tax_profile ENABLE ROW LEVEL SECURITY;

-- Explicit deny for anon/authenticated (no SELECT/INSERT/UPDATE/DELETE policies).
-- service_role bypasses RLS and is used by server scripts / agents with SUPABASE_SERVICE_ROLE_KEY.

INSERT INTO public.staff_business_tax_profile (
  legal_name,
  trade_name,
  entity_type,
  federal_ein,
  name_control,
  nebraska_withholding_id,
  patriot_customer_id,
  sole_member_name,
  sole_member_title,
  daytime_phone,
  tax_mailing_address_line1,
  tax_mailing_city,
  tax_mailing_state,
  tax_mailing_zip,
  other_address_line1,
  other_address_city,
  other_address_state,
  other_address_zip,
  notes,
  payroll_summary,
  filing_status
)
VALUES (
  'MEJOR VIDA INSURANCE LLC',
  NULL,
  'single_member_llc',
  '39-4900521',
  'MEJO',
  '16076516',
  '806166',
  'Julie R Braunsroth',
  'Sole Member',
  '402-440-5438',
  '2640 S 12th St',
  'Lincoln',
  'NE',
  '68502',
  '1201 O St Ste 309 Unit #597',
  'Lincoln',
  'NE',
  '68508',
  'Tax mailing address from IRS CP 575 G / EIN notice. Use 2640 S 12th St on Form 941/941N — not the virtual mailbox. Family-employment FICA exemption was coded in Patriot for employee Akaysha Braunsroth (verify before claiming Form 941 line 4).',
  '{
    "employee": "Akaysha Braunsroth",
    "pay_amount": 480.00,
    "pay_frequency": "monthly",
    "first_pay_date": "2026-01-23",
    "last_pay_date": "2026-05-22",
    "inactive_date": "2026-05-25",
    "quarters": {
      "2026_Q1": {
        "wages": 1440.00,
        "pay_dates": ["2026-01-23", "2026-02-25", "2026-03-25"],
        "line1_employees_mar12": 1,
        "federal_fit_withheld": 0,
        "ne_withheld": 0,
        "form_941_line4_fica_exempt": true
      },
      "2026_Q2": {
        "wages": 960.00,
        "pay_dates": ["2026-04-24", "2026-05-22"],
        "line1_employees_jun12": 0,
        "federal_fit_withheld": 0,
        "ne_withheld": 0,
        "form_941_line4_fica_exempt": true,
        "final_return": true
      }
    },
    "no_more_employees_rest_of_2026": true
  }'::jsonb,
  '{
    "federal_941": {
      "2026_Q1": "prepared_diy",
      "2026_Q2": "prepared_diy_final",
      "mail_without_payment": "Department of the Treasury, Internal Revenue Service, Ogden, UT 84201-0005"
    },
    "nebraska_941n": {
      "2026_Q1": "prepared_diy",
      "2026_Q2": "prepared_diy_final",
      "efile_preferred": "https://revenue.nebraska.gov",
      "paper_mail": "Nebraska Department of Revenue, PO Box 98915, Lincoln, NE 68509-8915"
    },
    "upcoming": [
      "W-2 to employee and W-3 to SSA (early 2027; confirm Patriot files)",
      "Nebraska W-3N (early 2027; confirm Patriot files)",
      "Annual federal/Nebraska income tax returns (by April 2027)"
    ],
    "patriot_tax_filing_start": {
      "quarter": "2026_Q3",
      "month": "August",
      "note": "User DIY filed Q1/Q2 to avoid back-filing fee; no payroll expected rest of 2026 after final Q2"
    }
  }'::jsonb
)
ON CONFLICT (federal_ein) DO UPDATE SET
  legal_name = EXCLUDED.legal_name,
  trade_name = EXCLUDED.trade_name,
  entity_type = EXCLUDED.entity_type,
  name_control = EXCLUDED.name_control,
  nebraska_withholding_id = EXCLUDED.nebraska_withholding_id,
  patriot_customer_id = EXCLUDED.patriot_customer_id,
  sole_member_name = EXCLUDED.sole_member_name,
  sole_member_title = EXCLUDED.sole_member_title,
  daytime_phone = EXCLUDED.daytime_phone,
  tax_mailing_address_line1 = EXCLUDED.tax_mailing_address_line1,
  tax_mailing_city = EXCLUDED.tax_mailing_city,
  tax_mailing_state = EXCLUDED.tax_mailing_state,
  tax_mailing_zip = EXCLUDED.tax_mailing_zip,
  other_address_line1 = EXCLUDED.other_address_line1,
  other_address_city = EXCLUDED.other_address_city,
  other_address_state = EXCLUDED.other_address_state,
  other_address_zip = EXCLUDED.other_address_zip,
  notes = EXCLUDED.notes,
  payroll_summary = EXCLUDED.payroll_summary,
  filing_status = EXCLUDED.filing_status,
  is_active = true,
  updated_at = now();
