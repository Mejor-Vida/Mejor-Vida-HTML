-- Track when Julie's VCF was delivered (email/SMS), for smart nurture logic. See NURTURE_CONTENT.md.

ALTER TABLE contacts
  ADD COLUMN IF NOT EXISTS vcf_sent_at timestamptz;

COMMENT ON COLUMN contacts.vcf_sent_at IS 'Set when VCF link/card is delivered via email or SMS (not WhatsApp).';

CREATE INDEX IF NOT EXISTS idx_contacts_vcf_sent ON contacts (vcf_sent_at) WHERE vcf_sent_at IS NOT NULL;
