function parseAllowlist(raw) {
  return String(raw || "")
    .split(",")
    .map((s) => String(s || "").trim().toLowerCase())
    .filter(Boolean);
}

function canAccessPhi(auth) {
  const email = String(auth && auth.user && auth.user.email ? auth.user.email : "").trim().toLowerCase();
  if (!email) return false;
  const allow = parseAllowlist(process.env.STAFF_PHI_ALLOWLIST);
  if (!allow.length) return false;
  return allow.includes(email);
}

module.exports = { canAccessPhi };
