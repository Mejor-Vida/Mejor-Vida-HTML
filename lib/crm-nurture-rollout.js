/**
 * CRM nurture rollout — testing vs live. In testing mode only allowlisted leads
 * are enrolled, processed, or sent newsletter/SMS/email automation.
 */

const DEFAULT_TEST_ALLOWLIST_EMAILS = [
  "julie@mejorvidainsurance.com",
  "admin@mejorvidainsurance.com",
];

const DEFAULT_TEST_ALLOWLIST_NAMES = ["julie braunsroth", "justin braunsroth"];

const DEFAULT_TEST_EMAIL_LOCAL_PARTS = ["julie", "admin"];

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function emailLocalPart(email) {
  const em = normalizeEmail(email);
  const at = em.indexOf("@");
  return at > 0 ? em.slice(0, at) : em;
}

function normalizeName(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function displayNameFromHints(hints) {
  if (!hints || typeof hints !== "object") return "";
  const dn = normalizeName(hints.display_name);
  if (dn) return dn;
  return normalizeName([hints.first_name, hints.last_name].filter(Boolean).join(" "));
}

function isLiveRollout(settings, env) {
  if (env && String(env.CRM_NURTURE_ROLLOUT || "").toLowerCase() === "live") return true;
  if (env && String(env.CRM_NURTURE_ROLLOUT || "").toLowerCase() === "testing") return false;
  const mode = String((settings && settings.rollout_mode) || "testing")
    .trim()
    .toLowerCase();
  return mode === "live";
}

function isTestingRollout(settings, env) {
  return !isLiveRollout(settings, env);
}

function allowlistEmails(settings) {
  const fromSettings = settings && Array.isArray(settings.test_allowlist_emails)
    ? settings.test_allowlist_emails
    : [];
  return fromSettings.length ? fromSettings : DEFAULT_TEST_ALLOWLIST_EMAILS;
}

function allowlistNames(settings) {
  const fromSettings = settings && Array.isArray(settings.test_allowlist_names)
    ? settings.test_allowlist_names
    : [];
  return fromSettings.length ? fromSettings : DEFAULT_TEST_ALLOWLIST_NAMES;
}

function allowlistLocalParts(settings) {
  const fromSettings =
    settings && Array.isArray(settings.test_allowlist_email_local_parts)
      ? settings.test_allowlist_email_local_parts
      : [];
  return fromSettings.length ? fromSettings : DEFAULT_TEST_EMAIL_LOCAL_PARTS;
}

function isAllowlistedLead(hints, settings) {
  hints = hints || {};
  const email = normalizeEmail(hints.email);
  const emails = new Set(allowlistEmails(settings).map(normalizeEmail));
  const localParts = new Set(allowlistLocalParts(settings).map((s) => String(s).toLowerCase()));

  if (email && emails.has(email)) return true;
  if (email && localParts.has(emailLocalPart(email))) return true;

  const name = displayNameFromHints(hints);
  if (!name) return false;

  const names = allowlistNames(settings).map(normalizeName);
  if (names.some((n) => n && (name === n || name.includes(n)))) return true;

  if (/braunsroth/.test(name) && (/^julie\b/.test(name) || /^justin\b/.test(name))) return true;

  return false;
}

/** True when automation (enroll, send, newsletter) may run for this lead. */
function canAutomateLead(hints, settings, env) {
  if (isLiveRollout(settings, env)) return true;
  return isAllowlistedLead(hints, settings);
}

function rolloutSummary(settings, env) {
  const live = isLiveRollout(settings, env);
  return {
    mode: live ? "live" : "testing",
    live,
    testing: !live,
    allowlist_emails: allowlistEmails(settings),
    allowlist_names: allowlistNames(settings),
    allowlist_email_local_parts: allowlistLocalParts(settings),
    env_override: env && env.CRM_NURTURE_ROLLOUT ? String(env.CRM_NURTURE_ROLLOUT) : null,
  };
}

module.exports = {
  isLiveRollout,
  isTestingRollout,
  isAllowlistedLead,
  canAutomateLead,
  rolloutSummary,
  DEFAULT_TEST_ALLOWLIST_EMAILS,
  DEFAULT_TEST_ALLOWLIST_NAMES,
  DEFAULT_TEST_EMAIL_LOCAL_PARTS,
};
