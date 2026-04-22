/**
 * Staff auth check (Supabase JWT validation).
 * Usage:
 *   const { requireStaffAuth } = require("./auth-check");
 *   const auth = await requireStaffAuth(req, res);
 *   if (!auth.valid) return; // 401 already sent with empty body
 */

function bearerToken(req) {
  const h = req && req.headers ? req.headers : {};
  const raw = String(h.authorization || h.Authorization || "").trim();
  if (!raw.toLowerCase().startsWith("bearer ")) return "";
  return raw.slice(7).trim();
}

async function validateSupabaseJwt(token) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceRole || !token) return { valid: false };

  const url = `${supabaseUrl.replace(/\/$/, "")}/auth/v1/user`;
  const r = await fetch(url, {
    headers: {
      apikey: serviceRole,
      Authorization: `Bearer ${token}`,
    },
  });

  if (!r.ok) return { valid: false };
  const user = await r.json();
  if (!user || !user.id) return { valid: false };
  return {
    valid: true,
    user: {
      id: String(user.id),
      email: String(user.email || "").trim().toLowerCase(),
    },
  };
}

/**
 * Validates Authorization: Bearer <jwt>.
 * On failure sends HTTP 401 with no body.
 */
async function requireStaffAuth(req, res) {
  try {
    const token = bearerToken(req);
    const auth = await validateSupabaseJwt(token);
    if (!auth.valid) {
      res.status(401).end();
      return { valid: false };
    }
    return auth;
  } catch (e) {
    res.status(401).end();
    return { valid: false };
  }
}

module.exports = { requireStaffAuth };
