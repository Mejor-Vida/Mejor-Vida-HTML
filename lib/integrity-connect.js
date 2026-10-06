/**
 * Push a CRM lead into IntegrityCONNECT (Leads Partner API).
 * Credentials are NPN-scoped machine-to-machine client credentials.
 * The email-and-CSV notice stays; this push is best-effort beside it.
 */

const TOKEN_URL = "https://ae-api.integrity.com/ae-partner-auth-service/auth/token";
const LEADS_URL = "https://ae-api.integrity.com/ae-partner-gateway-service/partners/leads";

let cachedToken = null;
let cachedTokenExpiresAt = 0;

function pushEnabled() {
  const flag = String(process.env.INTEGRITY_CONNECT_PUSH || "").trim().toLowerCase();
  if (flag === "0" || flag === "false" || flag === "off") return false;
  return Boolean(clientId() && clientSecret());
}

function clientId() {
  return String(process.env.INTEGRITY_CONNECT_CLIENT_ID || "").trim();
}

function clientSecret() {
  return String(process.env.INTEGRITY_CONNECT_CLIENT_SECRET || "").trim();
}

function agentNpn() {
  return String(process.env.INTEGRITY_CONNECT_AGENT_NPN || "").trim();
}

function isoDateOnly(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;
  const us = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) return `${us[3]}-${us[1].padStart(2, "0")}-${us[2].padStart(2, "0")}`;
  return "";
}

function genderCode(sex) {
  const s = String(sex || "").trim().toLowerCase();
  if (s === "m" || s === "male") return "M";
  if (s === "f" || s === "female") return "F";
  return "";
}

function tobaccoFlag(smoker) {
  if (smoker === true || smoker === "true" || smoker === "yes") return true;
  if (smoker === false || smoker === "false" || smoker === "no") return false;
  return null;
}

function leadHelpers() {
  return require("./ic-lead-notify");
}

function buildCreateLeadBody(lead) {
  const { icPhone10Digits, icZip5, icLeadNotes } = leadHelpers();
  const phone = icPhone10Digits(lead.phone);
  const email = String(lead.email || "").trim();
  const record = {
    firstName: String(lead.firstName || "").trim(),
    lastName: String(lead.lastName || "").trim(),
    notes: icLeadNotes(lead).slice(0, 2000),
  };
  const npn = agentNpn();
  if (npn) record.agentNpn = npn;
  if (phone) record.phones = [{ phoneNumber: phone }];
  if (email) record.emails = [{ email }];
  record.primaryCommunication = phone ? "Phone" : "Email";

  const birthDate = isoDateOnly(lead.dob || lead.dateOfBirth);
  if (birthDate) record.birthDate = birthDate;
  const gender = genderCode(lead.sex);
  if (gender) record.gender = gender;
  const tobacco = tobaccoFlag(lead.smoker);
  if (tobacco != null) record.isTobaccoUser = tobacco;

  const postalCode = icZip5(lead.zip);
  const address1 = String(lead.addressLine1 || lead.address || "").trim();
  const city = String(lead.city || "").trim();
  const stateCode = String(lead.state || "").trim();
  const county = String(lead.county || "").trim();
  if (postalCode) {
    record.addresses = [
      {
        address1,
        address2: String(lead.addressLine2 || "").trim(),
        city,
        stateCode,
        postalCode,
        county,
      },
    ];
  }

  return { options: { forceValidation: false }, lead: record };
}

async function getAccessToken() {
  const now = Date.now();
  if (cachedToken && cachedTokenExpiresAt - 30_000 > now) return cachedToken;
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: clientId(), client_secret: clientSecret() }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json.access_token) {
    const err = new Error(`Integrity token ${res.status}`);
    err.status = res.status;
    throw err;
  }
  const expiresIn = Number(json.expires_in) || 900;
  cachedToken = json.access_token;
  cachedTokenExpiresAt = now + expiresIn * 1000;
  return cachedToken;
}

function credentialsConfigured() {
  return Boolean(clientId() && clientSecret());
}

/**
 * @param {object} lead
 * @param {{ force?: boolean }} [opts] — force=true for staff CRM button (ignores INTEGRITY_CONNECT_PUSH=0)
 */
async function pushLeadToIntegrity(lead, opts) {
  const force = !!(opts && opts.force);
  if (force) {
    if (!credentialsConfigured()) return { skipped: true, reason: "integrity_not_configured" };
  } else if (!pushEnabled()) {
    return { skipped: true, reason: "integrity_not_configured" };
  }
  const { icPhone10Digits } = leadHelpers();
  const phone = icPhone10Digits(lead && lead.phone);
  const email = String((lead && lead.email) || "").trim();
  if (!phone && !email) return { skipped: true, reason: "missing_phone_and_email" };

  const token = await getAccessToken();
  const res = await fetch(LEADS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(buildCreateLeadBody(lead)),
  });
  const text = await res.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }
  if (res.status === 409 || res.status === 422) {
    const existing = json.errors && json.errors[0] && json.errors[0].lead;
    return {
      ok: true,
      duplicate: true,
      status: res.status,
      leadId: (existing && (existing.leadId || existing.leadsId)) || json.leadsId || json.leadId || null,
    };
  }
  if (!res.ok) {
    return { ok: false, status: res.status, reason: text.slice(0, 180) };
  }
  return { ok: true, status: res.status, leadId: json.leadsId || json.leadId || null };
}

module.exports = {
  pushEnabled,
  credentialsConfigured,
  buildCreateLeadBody,
  pushLeadToIntegrity,
};
