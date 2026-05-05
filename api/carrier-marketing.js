/**
 * GET /api/carrier-marketing?slug=assurity|mutual-of-omaha|american-amicable
 * Returns published marketing_notes row (JSON body) for carrier detail pages / integrations.
 * Env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_SERVICE_KEY)
 */

const ALLOWED = new Set(["assurity", "mutual-of-omaha", "american-amicable"]);

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const raw = typeof req.query.slug === "string" ? req.query.slug.trim().toLowerCase() : "";
  if (!raw || !ALLOWED.has(raw)) {
    return json(res, 400, {
      error: "Missing or invalid slug",
      allowed: [...ALLOWED],
    });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) {
    return json(res, 500, { error: "Server missing Supabase credentials" });
  }

  const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/marketing_notes?slug=eq.${encodeURIComponent(
    raw
  )}&status=eq.published&select=title,body,slug,updated_at&limit=1`;

  let r;
  try {
    r = await fetch(url, {
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
      },
    });
  } catch (e) {
    return json(res, 502, { error: "Upstream fetch failed", detail: String(e && e.message) });
  }

  const text = await r.text();
  if (!r.ok) {
    return json(res, 502, { error: "Supabase error", status: r.status, detail: text.slice(0, 400) });
  }

  let rows;
  try {
    rows = JSON.parse(text);
  } catch {
    return json(res, 502, { error: "Invalid JSON from Supabase" });
  }

  const row = Array.isArray(rows) ? rows[0] : null;
  if (!row) {
    return json(res, 404, { error: "Not found", slug: raw });
  }

  let parsed = null;
  try {
    parsed = JSON.parse(row.body);
  } catch {
    parsed = { raw_body: row.body };
  }

  return json(res, 200, {
    slug: row.slug,
    title: row.title,
    updated_at: row.updated_at,
    marketing: parsed,
  });
};
