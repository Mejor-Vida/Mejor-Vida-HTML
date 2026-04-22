/**
 * GET /api/staff-config
 * Runtime config for staff portal client.
 * Returns only public Supabase client values (URL + anon key).
 */

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method Not Allowed" });
  }
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseAnon = process.env.SUPABASE_ANON_KEY || "";
  if (!supabaseUrl || !supabaseAnon) {
    return json(res, 500, { error: "Missing Supabase client config" });
  }
  return json(res, 200, {
    supabaseUrl,
    supabaseAnonKey: supabaseAnon,
  });
};
