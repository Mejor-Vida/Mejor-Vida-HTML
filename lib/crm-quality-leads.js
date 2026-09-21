/**
 * Quality leads = CRM clients with lead_state.call_scheduled_at set
 * (HubSpot booking or Julie marking the Clients-list calendar button).
 */
const { restSelect, restPatch } = require("../api/staff/_inbox-lib");
const { upsertLeadState, insertEvent } = require("./contacts-db");

const LICENSED_STATES = ["NE", "KS", "CO", "NV"];

const REGION_TO_CODE = {
  nebraska: "NE",
  kansas: "KS",
  colorado: "CO",
  nevada: "NV",
};

function ymdChicago(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date(iso));
  } catch {
    return String(iso).slice(0, 10);
  }
}

function normalizeStateCode(raw) {
  const s = String(raw || "").trim().toUpperCase();
  if (LICENSED_STATES.includes(s)) return s;
  const mapped = REGION_TO_CODE[String(raw || "").trim().toLowerCase()];
  return mapped || "";
}

function regionToStateCode(name) {
  return normalizeStateCode(name) || "";
}

/**
 * Persist or clear a scheduled call on the v2 contacts pipeline.
 */
async function markStaffScheduledCall(cfg, opts) {
  const contactId = String((opts && opts.contactId) || "").trim();
  if (!contactId) throw new Error("contact_id required to mark a scheduled call");
  const at = opts.at ? new Date(opts.at).toISOString() : null;
  if (opts.at && Number.isNaN(new Date(opts.at).getTime())) {
    throw new Error("Invalid call_scheduled_at");
  }

  const fields = { call_scheduled_at: at };
  if (at) fields.pipeline_stage = "call_scheduled";
  await upsertLeadState(cfg.supabaseUrl, cfg.serviceKey, contactId, fields);

  try {
    await insertEvent(
      cfg.supabaseUrl,
      cfg.serviceKey,
      contactId,
      at ? "call_scheduled" : "call_scheduled_cleared",
      {
        marked_by: opts.actor || null,
        source: "staff_crm",
        call_scheduled_at: at,
      },
      "staff_crm"
    );
  } catch (e) {
    console.error("[crm-quality-leads] event", e && e.message ? e.message : e);
  }

  const quoteLeadId = String((opts && opts.quoteLeadId) || "").trim();
  if (quoteLeadId) {
    try {
      await restPatch(cfg, "quote_lead_submissions", `id=eq.${encodeURIComponent(quoteLeadId)}`, {
        call_scheduled_at: at,
      });
    } catch (e) {
      console.error("[crm-quality-leads] quote_lead_submissions", e && e.message ? e.message : e);
    }
  }

  return { contactId, call_scheduled_at: at };
}

async function loadQualityLeadMetrics(cfg, startIso, endExclusiveIso, dateFrom, dateTo) {
  const q =
    "select=contact_id,call_scheduled_at,pipeline_stage" +
    "&call_scheduled_at=not.is.null" +
    "&call_scheduled_at=gte." +
    encodeURIComponent(startIso) +
    "&call_scheduled_at=lt." +
    encodeURIComponent(endExclusiveIso) +
    "&order=call_scheduled_at.desc&limit=5000";

  let rows = [];
  try {
    rows = await restSelect(cfg, "lead_state", q);
  } catch (e) {
    return {
      show: true,
      configured: false,
      count: 0,
      byState: [],
      error: e.message || String(e),
      dateFrom,
      dateTo,
    };
  }

  const list = Array.isArray(rows) ? rows : [];
  const contactIds = [...new Set(list.map((r) => r && r.contact_id).filter(Boolean))];
  const contactMap = new Map();
  if (contactIds.length) {
    const inList = contactIds.map((id) => encodeURIComponent(id)).join(",");
    try {
      const contacts = await restSelect(
        cfg,
        "contacts",
        `select=id,us_state,first_name,last_name,source&id=in.(${inList})`
      );
      (contacts || []).forEach((c) => {
        if (c && c.id) contactMap.set(String(c.id), c);
      });
    } catch (e) {
      console.error("[crm-quality-leads] contacts join", e.message || e);
    }
  }

  const byStateMap = new Map();
  LICENSED_STATES.forEach((code) => byStateMap.set(code, 0));
  byStateMap.set("UNKNOWN", 0);

  list.forEach((row) => {
    const c = contactMap.get(String(row.contact_id)) || {};
    const code = normalizeStateCode(c.us_state) || "UNKNOWN";
    byStateMap.set(code, (byStateMap.get(code) || 0) + 1);
  });

  const licensedOnly = LICENSED_STATES.map((state) => ({
    state,
    count: byStateMap.get(state) || 0,
  }));
  if ((byStateMap.get("UNKNOWN") || 0) > 0) {
    licensedOnly.push({ state: "UNKNOWN", count: byStateMap.get("UNKNOWN") });
  }

  return {
    show: true,
    configured: true,
    dateFrom,
    dateTo,
    count: list.length,
    byState: licensedOnly,
    recent: list.slice(0, 12).map((row) => {
      const c = contactMap.get(String(row.contact_id)) || {};
      const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || "Client";
      return {
        contactId: row.contact_id,
        name,
        state: normalizeStateCode(c.us_state) || "",
        scheduledAt: row.call_scheduled_at,
        scheduledYmd: ymdChicago(row.call_scheduled_at),
      };
    }),
  };
}

function mergeSpendByState(qualityByState, regionLocations) {
  const spendByCode = new Map();
  (regionLocations || []).forEach((loc) => {
    const code = regionToStateCode(loc && loc.name);
    if (!code) return;
    spendByCode.set(code, (spendByCode.get(code) || 0) + (Number(loc.spend) || 0));
  });
  return (qualityByState || []).map((row) => {
    const spend = row.state === "UNKNOWN" ? null : spendByCode.get(row.state) || 0;
    const count = Number(row.count) || 0;
    return {
      state: row.state,
      count,
      spend,
      costPerLead: spend != null && count > 0 ? spend / count : null,
    };
  });
}

function costPerLead(spend, count) {
  const s = Number(spend);
  const n = Number(count);
  if (!Number.isFinite(s) || n <= 0) return null;
  return s / n;
}

module.exports = {
  markStaffScheduledCall,
  loadQualityLeadMetrics,
  mergeSpendByState,
  costPerLead,
  normalizeStateCode,
  regionToStateCode,
  LICENSED_STATES,
};
