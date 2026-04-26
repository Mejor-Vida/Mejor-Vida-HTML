const { createCipheriv, createDecipheriv, createHash, randomBytes } = require("crypto");

function getPhiKey() {
  const secret = String(process.env.PHI_ENCRYPTION_KEY || "").trim();
  if (!secret) throw new Error("PHI_ENCRYPTION_KEY missing");
  return createHash("sha256").update(secret).digest();
}

function encryptJson(payload) {
  const key = getPhiKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload || {}), "utf8");
  const enc = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${enc.toString("base64")}`;
}

function decryptJson(blob) {
  if (!blob) return {};
  const key = getPhiKey();
  const parts = String(blob).split(".");
  if (parts.length !== 3) throw new Error("Invalid PHI payload format");
  const iv = Buffer.from(parts[0], "base64");
  const tag = Buffer.from(parts[1], "base64");
  const data = Buffer.from(parts[2], "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  const out = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(out.toString("utf8"));
}

async function loadPhiRow(cfg, leadId, leadSourceTable) {
  const q =
    "select=id,lead_id,lead_source_table,encrypted_payload,phi_version,created_at,updated_at,updated_by" +
    `&lead_id=eq.${encodeURIComponent(leadId)}` +
    `&lead_source_table=eq.${encodeURIComponent(leadSourceTable)}` +
    "&limit=1";
  const r = await fetch(`${cfg.supabaseUrl}/rest/v1/lead_underwriting_phi?${q}`, {
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
    },
  });
  const text = await r.text();
  if (!r.ok) throw new Error(`phi select ${r.status}: ${text.slice(0, 240)}`);
  const rows = JSON.parse(text || "[]");
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function writePhiByLead(cfg, leadId, leadSourceTable, payload, updatedBy) {
  const existing = await loadPhiRow(cfg, leadId, leadSourceTable);
  const now = new Date().toISOString();
  const row = {
    lead_id: leadId,
    lead_source_table: leadSourceTable,
    encrypted_payload: encryptJson(payload || {}),
    phi_version: 1,
    updated_at: now,
    updated_by: updatedBy || null,
  };
  if (!existing) {
    const r = await fetch(`${cfg.supabaseUrl}/rest/v1/lead_underwriting_phi`, {
      method: "POST",
      headers: {
        apikey: cfg.serviceKey,
        Authorization: `Bearer ${cfg.serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify([Object.assign({ created_at: now }, row)]),
    });
    const text = await r.text();
    if (!r.ok) throw new Error(`phi insert ${r.status}: ${text.slice(0, 240)}`);
    const rows = JSON.parse(text || "[]");
    return Array.isArray(rows) && rows[0] ? rows[0] : null;
  }
  const r = await fetch(
    `${cfg.supabaseUrl}/rest/v1/lead_underwriting_phi?id=eq.${encodeURIComponent(existing.id)}`,
    {
      method: "PATCH",
      headers: {
        apikey: cfg.serviceKey,
        Authorization: `Bearer ${cfg.serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify(row),
    }
  );
  const text = await r.text();
  if (!r.ok) throw new Error(`phi patch ${r.status}: ${text.slice(0, 240)}`);
  const rows = JSON.parse(text || "[]");
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

async function readPhiByLead(cfg, leadId, leadSourceTable) {
  const row = await loadPhiRow(cfg, leadId, leadSourceTable);
  if (!row) return { row: null, payload: {} };
  let payload = {};
  try {
    payload = decryptJson(row.encrypted_payload);
  } catch (e) {
    payload = {};
  }
  return { row, payload };
}

module.exports = { encryptJson, decryptJson, readPhiByLead, writePhiByLead };
