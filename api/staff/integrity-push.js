/**
 * POST /api/staff/integrity-push
 * Push one or more CRM clients into IntegrityCONNECT via the Leads Partner API.
 * Body: { ids: ["uuid", ...] } or { id: "uuid" }
 */
const { requireStaffAuth } = require("../auth-check");
const { json, serviceConfig, restSelect } = require("./_inbox-lib");
const { pushLeadToIntegrity, credentialsConfigured } = require("../../lib/integrity-connect");
const { canAccessPhi } = require("../../lib/staff-permissions");
const { readPhiByLead } = require("../../lib/phi-store");

function isUuid(s) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    String(s || "")
  );
}

function clean(v) {
  const s = String(v == null ? "" : v).trim();
  return s || "";
}

function mergePrefer(a, b) {
  const av = a == null || a === "" ? null : a;
  if (av != null) return av;
  return b == null || b === "" ? null : b;
}

async function loadUnified(cfg, id) {
  const rows = await restSelect(
    cfg,
    "unified_leads",
    `select=id,source_table,source,first_name,last_name,display_name,phone,email,language,created_at,updated_at&id=eq.${encodeURIComponent(id)}&limit=1`
  );
  return rows && rows[0] ? rows[0] : null;
}

async function loadStaffProfiles(cfg, leadId) {
  const rows = await restSelect(
    cfg,
    "staff_lead_profiles",
    `select=profile_data,updated_at&lead_id=eq.${encodeURIComponent(leadId)}&order=updated_at.desc&limit=5`
  );
  let out = {};
  (rows || []).forEach((row) => {
    const data = row && row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
    const pe =
      out.profile_ext && typeof out.profile_ext === "object" ? out.profile_ext : {};
    const nextPe =
      data.profile_ext && typeof data.profile_ext === "object" ? data.profile_ext : {};
    out = Object.assign({}, data, out);
    if (Object.keys(pe).length || Object.keys(nextPe).length) {
      out.profile_ext = Object.assign({}, nextPe, pe);
    }
  });
  return out;
}

async function loadSourceExtras(cfg, unified) {
  const src = String((unified && unified.source_table) || "");
  const id = unified && unified.id;
  if (!id || !src) return {};
  try {
    if (src === "manychat_leads") {
      const rows = await restSelect(
        cfg,
        "manychat_leads",
        `select=first_name,last_name,phone,email,age,sex,tobacco,language,tag,source&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      return rows && rows[0] ? rows[0] : {};
    }
    if (src === "contacts") {
      const rows = await restSelect(
        cfg,
        "contacts",
        `select=first_name,last_name,phone,email,language,idioma,us_state&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      const row = rows && rows[0] ? rows[0] : {};
      if (row.us_state) row.profile_ext = { state: clean(row.us_state).toUpperCase().slice(0, 2) };
      return row;
    }
    if (src === "quote_lead_submissions") {
      const rows = await restSelect(
        cfg,
        "quote_lead_submissions",
        `select=first_name,last_name,email,phone,age,gender,tobacco,lang,source,state_code,payload&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      const row = rows && rows[0] ? rows[0] : {};
      const p = row.payload && typeof row.payload === "object" ? row.payload : {};
      const st = clean(row.state_code || p.state || p.state_code || p.us_state)
        .toUpperCase()
        .slice(0, 2);
      return {
        first_name: row.first_name,
        last_name: row.last_name,
        email: row.email,
        phone: row.phone,
        age: row.age != null ? row.age : p.age,
        sex: row.gender || p.sex || p.gender,
        tobacco: row.tobacco != null ? row.tobacco : p.smoker != null ? p.smoker : p.tobacco,
        language: row.lang || p.lang,
        source: row.source,
        profile_ext: {
          state: st || undefined,
          zip: p.zip || p.postal_code || undefined,
          city: p.city || undefined,
          county: p.county || undefined,
          address_line_1: p.addressLine1 || p.address || p.address_line_1 || undefined,
          address_line_2: p.addressLine2 || p.address_line_2 || undefined,
          date_of_birth: p.dob || p.dateOfBirth || p.date_of_birth || undefined,
        },
      };
    }
  } catch (e) {
    console.error("[integrity-push] source extras", e && e.message);
  }
  return {};
}

function pickExt(...objs) {
  const out = {};
  objs.forEach((o) => {
    if (!o || typeof o !== "object") return;
    Object.keys(o).forEach((k) => {
      if (out[k] == null || out[k] === "") {
        if (o[k] != null && o[k] !== "") out[k] = o[k];
      }
    });
  });
  return out;
}

async function buildIcLeadFromCrm(cfg, leadId, { includePhi }) {
  const unified = await loadUnified(cfg, leadId);
  if (!unified) return null;

  const profile = await loadStaffProfiles(cfg, leadId);
  const source = await loadSourceExtras(cfg, unified);
  let phi = {};
  if (includePhi) {
    try {
      const packed = await readPhiByLead(cfg, leadId, String(unified.source_table || "unknown"));
      phi = (packed && packed.payload) || {};
    } catch (e) {
      console.error("[integrity-push] phi", e && e.message);
    }
  }

  const pe = pickExt(
    phi && typeof phi === "object" ? phi : {},
    source.profile_ext || {},
    profile.profile_ext || {}
  );

  const firstName = clean(
    mergePrefer(profile.first_name, mergePrefer(source.first_name, unified.first_name))
  );
  const lastName = clean(
    mergePrefer(profile.last_name, mergePrefer(source.last_name, unified.last_name))
  );
  const email = clean(mergePrefer(profile.email, mergePrefer(source.email, unified.email)));
  const phone = clean(mergePrefer(profile.phone, mergePrefer(source.phone, unified.phone)));

  let display = clean(unified.display_name);
  if ((!firstName || !lastName) && display) {
    const sp = display.indexOf(" ");
    if (!firstName && sp === -1) {
      /* keep empty first handled below */
    }
  }

  return {
    firstName: firstName || (display ? display.split(/\s+/)[0] : "") || "Unknown",
    lastName:
      lastName ||
      (display && display.includes(" ") ? display.split(/\s+/).slice(1).join(" ") : "") ||
      "",
    email,
    phone,
    age: mergePrefer(profile.age, mergePrefer(source.age, phi.age)),
    sex: mergePrefer(profile.sex, mergePrefer(source.sex, phi.sex || phi.gender)),
    smoker: mergePrefer(
      profile.tobacco,
      mergePrefer(source.tobacco, phi.tobacco != null ? phi.tobacco : phi.smoker)
    ),
    dob: pe.date_of_birth || pe.dob || pe.dateOfBirth || phi.date_of_birth || phi.dob || "",
    state: clean(pe.state || phi.state || phi.us_state).toUpperCase().slice(0, 2),
    zip: pe.zip || pe.postal_code || phi.zip || "",
    city: pe.city || phi.city || "",
    county: pe.county || phi.county || "",
    addressLine1: pe.address_line_1 || pe.address || phi.address || "",
    addressLine2: pe.address_line_2 || phi.address_line_2 || "",
    leadSource: clean(source.source || unified.source || unified.source_table) || "staff_crm",
    leadId: String(unified.id),
    lang: clean(profile.language || source.language || unified.language) || "English",
    quoteLow: profile.quote_low,
    quoteHigh: profile.quote_high,
    quoteRange:
      profile.quote_low != null && profile.quote_high != null
        ? `$${profile.quote_low}–$${profile.quote_high}`
        : "",
    submittedAt: unified.created_at || new Date().toISOString(),
  };
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method not allowed" });
  }

  const auth = await requireStaffAuth(req, res);
  if (!auth.valid) return;

  const cfg = serviceConfig();
  if (!cfg) return json(res, 500, { error: "Server missing required configuration" });

  if (!credentialsConfigured()) {
    return json(res, 503, {
      error: "Integrity Connect is not configured. Set INTEGRITY_CONNECT_CLIENT_ID and SECRET.",
      reason: "integrity_not_configured",
    });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
  } catch (e) {
    return json(res, 400, { error: "Invalid JSON" });
  }

  const rawIds = Array.isArray(body.ids) ? body.ids : body.id ? [body.id] : [];
  const ids = Array.from(
    new Set(rawIds.map((x) => String(x || "").trim()).filter((id) => isUuid(id)))
  );
  if (!ids.length) return json(res, 400, { error: "Provide id or ids (UUID)" });
  if (ids.length > 50) return json(res, 400, { error: "Maximum 50 clients per send" });

  const includePhi = canAccessPhi(auth);
  const results = [];
  let sent = 0;
  let skipped = 0;
  let failed = 0;

  for (const id of ids) {
    try {
      const lead = await buildIcLeadFromCrm(cfg, id, { includePhi });
      if (!lead) {
        results.push({ id, ok: false, skipped: true, reason: "not_found" });
        skipped += 1;
        continue;
      }
      const pushed = await pushLeadToIntegrity(lead, { force: true });
      if (pushed.skipped) {
        results.push({ id, ok: false, skipped: true, reason: pushed.reason || "skipped" });
        skipped += 1;
      } else if (pushed.ok) {
        results.push({
          id,
          ok: true,
          duplicate: !!pushed.duplicate,
          integrityLeadId: pushed.leadId || null,
        });
        sent += 1;
      } else {
        results.push({
          id,
          ok: false,
          reason: pushed.reason || `http_${pushed.status || "error"}`,
          status: pushed.status || null,
        });
        failed += 1;
      }
    } catch (e) {
      console.error("[integrity-push]", id, e);
      results.push({ id, ok: false, reason: String((e && e.message) || e) });
      failed += 1;
    }
  }

  return json(res, 200, { ok: failed === 0, sent, skipped, failed, results });
};
