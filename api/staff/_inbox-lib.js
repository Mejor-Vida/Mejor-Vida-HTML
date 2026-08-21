const { requireStaffAuth } = require("../auth-check");

function json(res, status, payload) {
  res.status(status).setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(payload));
}

function readJsonBody(req) {
  if (Buffer.isBuffer(req.body)) {
    return JSON.parse(req.body.toString("utf8") || "{}");
  }
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body && typeof req.body === "object" ? req.body : {};
}

function serviceConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !serviceKey) return null;
  return { supabaseUrl: supabaseUrl.replace(/\/$/, ""), serviceKey };
}

function restHeaders(serviceKey, withJsonBody) {
  return Object.assign(
    {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
    },
    withJsonBody ? { "Content-Type": "application/json", Prefer: "return=representation" } : {}
  );
}

async function restSelect(cfg, table, query) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}?${query}`, {
    headers: restHeaders(cfg.serviceKey, false),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase select ${table} ${r.status}: ${text.slice(0, 300)}`);
  return JSON.parse(text || "[]");
}

async function restPatch(cfg, table, query, payload) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "PATCH",
    headers: restHeaders(cfg.serviceKey, true),
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase patch ${table} ${r.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : [];
}

async function restInsert(cfg, table, payload) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: restHeaders(cfg.serviceKey, true),
    body: JSON.stringify(payload),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase insert ${table} ${r.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : [];
}

async function restDelete(cfg, table, query) {
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/${table}?${query}`, {
    method: "DELETE",
    headers: restHeaders(cfg.serviceKey, false),
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`Supabase delete ${table} ${r.status}: ${text.slice(0, 300)}`);
}

module.exports = {
  requireStaffAuth,
  json,
  readJsonBody,
  serviceConfig,
  restSelect,
  restPatch,
  restInsert,
  restDelete,
};
