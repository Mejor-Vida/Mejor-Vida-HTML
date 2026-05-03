const { requireStaffAuth, json, readJsonBody, serviceConfig, restSelect, restInsert, restPatch } = require("./_inbox-lib");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(s || ""));
}

function normState(v) {
  const t = String(v || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z]/g, "");
  if (t.length < 2) return null;
  return t.slice(0, 2);
}

module.exports = async function handler(req, res) {
  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  if (req.method === "GET") {
    try {
      const rows = await restSelect(
        cfg,
        "oos_agents",
        "select=id,created_at,updated_at,state_code,display_name,company_name,email,phone,business_address,notes,active,source&order=state_code.asc,display_name.asc&limit=2000"
      );
      return json(res, 200, { agents: Array.isArray(rows) ? rows : [] });
    } catch (e) {
      const msg = String((e && e.message) || e);
      if (/42P01|relation|does not exist/i.test(msg)) {
        return json(res, 503, {
          error: "Database not migrated",
          detail: "Apply migration 042_oos_agents.sql in Supabase.",
        });
      }
      return json(res, 500, { error: "Failed to load agents" });
    }
  }

  if (req.method === "POST") {
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const state = normState(body.state_code);
    const displayName = String(body.display_name || "").trim().slice(0, 300);
    const email = String(body.email || "")
      .trim()
      .toLowerCase()
      .slice(0, 500);
    if (!state) return json(res, 400, { error: "state_code (2 letters) required" });
    if (!displayName) return json(res, 400, { error: "display_name required" });
    if (!email) return json(res, 400, { error: "email required" });
    const row = {
      state_code: state,
      display_name: displayName,
      company_name: body.company_name != null ? String(body.company_name).trim().slice(0, 300) || null : null,
      email,
      phone: body.phone != null ? String(body.phone).trim().slice(0, 40) || null : null,
      business_address:
        body.business_address != null ? String(body.business_address).trim().slice(0, 500) || null : null,
      notes: body.notes != null ? String(body.notes).trim().slice(0, 8000) || null : null,
      active: body.active === false ? false : true,
      source: body.source != null ? String(body.source).trim().slice(0, 80) || "staff" : "staff",
      updated_at: new Date().toISOString(),
    };
    try {
      const inserted = await restInsert(cfg, "oos_agents", row);
      const agent = Array.isArray(inserted) && inserted[0] ? inserted[0] : inserted;
      return json(res, 200, { agent });
    } catch (e) {
      const msg = String((e && e.message) || e);
      if (/42P01|relation|does not exist/i.test(msg)) {
        return json(res, 503, {
          error: "Database not migrated",
          detail: "Apply migration 042_oos_agents.sql in Supabase.",
        });
      }
      return json(res, 500, { error: "Failed to create agent" });
    }
  }

  if (req.method === "PATCH") {
    const id = req.query && req.query.id ? String(req.query.id).trim() : "";
    if (!isUuid(id)) {
      return json(res, 400, { error: "Valid id query parameter required" });
    }
    let body;
    try {
      body = readJsonBody(req);
    } catch (e) {
      return json(res, 400, { error: "Invalid JSON" });
    }
    const patch = { updated_at: new Date().toISOString() };
    if (body.state_code !== undefined) {
      const s = normState(body.state_code);
      if (!s) return json(res, 400, { error: "state_code must be 2 letters" });
      patch.state_code = s;
    }
    if (body.display_name !== undefined) {
      const t = String(body.display_name || "").trim().slice(0, 300);
      patch.display_name = t || null;
    }
    if (body.company_name !== undefined) {
      patch.company_name = String(body.company_name || "").trim().slice(0, 300) || null;
    }
    if (body.email !== undefined) {
      patch.email = String(body.email || "")
        .trim()
        .toLowerCase()
        .slice(0, 500);
    }
    if (body.phone !== undefined) patch.phone = String(body.phone || "").trim().slice(0, 40) || null;
    if (body.business_address !== undefined) {
      patch.business_address = String(body.business_address || "").trim().slice(0, 500) || null;
    }
    if (body.notes !== undefined) patch.notes = String(body.notes || "").trim().slice(0, 8000) || null;
    if (body.active !== undefined) patch.active = !!body.active;
    if (body.source !== undefined) patch.source = String(body.source || "").trim().slice(0, 80) || "staff";

    const keys = Object.keys(patch).filter((k) => k !== "updated_at");
    if (keys.length === 0) {
      return json(res, 400, { error: "No fields to update" });
    }
    try {
      const updated = await restPatch(cfg, "oos_agents", `id=eq.${encodeURIComponent(id)}&select=*`, patch);
      const agent = Array.isArray(updated) && updated[0] ? updated[0] : null;
      return json(res, 200, { agent });
    } catch (e) {
      return json(res, 500, { error: "Failed to update agent" });
    }
  }

  res.setHeader("Allow", "GET, POST, PATCH");
  return json(res, 405, { error: "Method Not Allowed" });
};
