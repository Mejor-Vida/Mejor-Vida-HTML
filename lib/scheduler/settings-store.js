/**
 * Load / save scheduler_settings from Supabase.
 */
const { defaultSchedulerConfig, sanitizeConfig } = require("./defaults");

function base(url) {
  return String(url || "").replace(/\/$/, "") + "/rest/v1";
}

function headers(key, prefer) {
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    Prefer: prefer || "return=representation",
  };
}

let memCache = null;
let memCacheAt = 0;
const CACHE_MS = 30_000;

async function loadSchedulerSettings(supabaseUrl, serviceKey, { noCache } = {}) {
  if (!noCache && memCache && Date.now() - memCacheAt < CACHE_MS) {
    return memCache;
  }
  const defaults = defaultSchedulerConfig();
  if (!supabaseUrl || !serviceKey) return defaults;

  const url = `${base(supabaseUrl)}/scheduler_settings?settings_key=eq.default&select=config&limit=1`;
  const r = await fetch(url, { headers: headers(serviceKey) });
  const text = await r.text();
  if (!r.ok) {
    console.error("[scheduler-settings] load", r.status, text.slice(0, 200));
    return defaults;
  }
  const rows = JSON.parse(text);
  const cfg = rows && rows[0] && rows[0].config;
  const merged = sanitizeConfig(cfg && typeof cfg === "object" ? cfg : {}, defaults);
  memCache = merged;
  memCacheAt = Date.now();
  return merged;
}

async function saveSchedulerSettings(supabaseUrl, serviceKey, patch, updatedBy) {
  const current = await loadSchedulerSettings(supabaseUrl, serviceKey, { noCache: true });
  const next = sanitizeConfig(patch, current);
  const body = {
    config: next,
    updated_at: new Date().toISOString(),
    updated_by: updatedBy ? String(updatedBy).slice(0, 200) : null,
  };
  const patchUrl = `${base(supabaseUrl)}/scheduler_settings?settings_key=eq.default`;
  const r = await fetch(patchUrl, {
    method: "PATCH",
    headers: headers(serviceKey),
    body: JSON.stringify(body),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`scheduler_settings save ${r.status}: ${t.slice(0, 200)}`);
  }
  memCache = next;
  memCacheAt = Date.now();
  return next;
}

function invalidateSchedulerSettingsCache() {
  memCache = null;
  memCacheAt = 0;
}

module.exports = {
  loadSchedulerSettings,
  saveSchedulerSettings,
  invalidateSchedulerSettingsCache,
};
