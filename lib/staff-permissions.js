function parseAllowlist(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => String(s || "").trim().toLowerCase())
    .filter(Boolean);
}

function normalizeEmail(email) {
  const raw = String(email || "").trim().toLowerCase();
  if (!raw || raw.indexOf("@") === -1) return raw;
  const parts = raw.split("@");
  const local = parts[0] || "";
  const domain = parts.slice(1).join("@");
  const plus = local.indexOf("+");
  const cleanLocal = plus >= 0 ? local.slice(0, plus) : local;
  return cleanLocal + "@" + domain;
}

function matchesAllowEntry(email, entry) {
  if (!entry) return false;
  const normEmail = normalizeEmail(email);
  const normEntry = String(entry || "").trim().toLowerCase();
  if (!normEmail || !normEntry) return false;
  if (normEntry === normEmail) return true;
  if (normEntry.indexOf("*@") === 0) {
    const dom = normEntry.slice(2);
    return !!dom && normEmail.endsWith("@" + dom);
  }
  return normalizeEmail(normEntry) === normEmail;
}

function canAccessPhi(auth) {
  if (auth && auth.valid) return true;
  const email = String(auth && auth.user && auth.user.email ? auth.user.email : "").trim().toLowerCase();
  if (!email) return false;
  const allow = parseAllowlist(process.env.STAFF_PHI_ALLOWLIST);
  if (!allow.length) return false;
  return allow.some((entry) => matchesAllowEntry(email, entry));
}

module.exports = { canAccessPhi };
