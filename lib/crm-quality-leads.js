/**
 * Quality leads = CRM clients with lead_state.call_scheduled_at set.
 * Cost-per-lead periods use contacts.created_at (CRM entry), not the mark date.
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

function crmFunnelSurfaceFromHints(opts) {
  const table = String((opts && opts.leadSourceTable) || "").toLowerCase();
  const blob = [
    opts && opts.source,
    opts && opts.utmSource,
    opts && opts.campaign,
    table,
  ]
    .map((v) => String(v || "").toLowerCase())
    .join(" ");
  if (table === "quote_lead_submissions") return "landing";
  if (/facebook_landing|english_landing|gastos_finales|fexquotes|quote_page|quote\.html/.test(blob)) {
    return "landing";
  }
  if (table === "manychat_leads") return "whatsapp";
  if (/\bwhatsapp\b|manychat/.test(blob)) return "whatsapp";
  return "landing";
}

function matchesFacebookFunnelVariant(surface, variant) {
  if (!variant) return true;
  if (variant === "whatsapp") return surface === "whatsapp";
  return surface !== "whatsapp";
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

  const exists = await restSelect(
    cfg,
    "contacts",
    `select=id&id=eq.${encodeURIComponent(contactId)}&limit=1`
  );
  if (!Array.isArray(exists) || !exists[0]) {
    throw new Error("Contact row missing — could not save scheduled call");
  }

  await upsertLeadState(cfg.supabaseUrl, cfg.serviceKey, contactId, {
    call_scheduled_at: at,
  });

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

async function loadQualityLeadMetrics(cfg, startIso, endExclusiveIso, dateFrom, dateTo, opts) {
  const facebookVariant = (opts && opts.facebookVariant) || null;
  let entered = [];
  try {
    entered = await restSelect(
      cfg,
      "contacts",
      "select=id,us_state,first_name,last_name,source,created_at" +
        "&created_at=gte." +
        encodeURIComponent(startIso) +
        "&created_at=lt." +
        encodeURIComponent(endExclusiveIso) +
        "&order=created_at.desc&limit=5000"
    );
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

  const contactMap = new Map();
  (entered || []).forEach((c) => {
    if (c && c.id) contactMap.set(String(c.id), c);
  });
  const enteredIds = [...contactMap.keys()];

  const scheduledIds = new Set();
  const scheduledAtByContact = new Map();
  for (let i = 0; i < enteredIds.length; i += 80) {
    const chunk = enteredIds.slice(i, i + 80);
    if (!chunk.length) continue;
    const inList = chunk.map((id) => encodeURIComponent(id)).join(",");
    try {
      const states = await restSelect(
        cfg,
        "lead_state",
        `select=contact_id,call_scheduled_at&contact_id=in.(${inList})&call_scheduled_at=not.is.null&limit=80`
      );
      (states || []).forEach((row) => {
        if (!row || !row.contact_id || !row.call_scheduled_at) return;
        const cid = String(row.contact_id);
        scheduledIds.add(cid);
        scheduledAtByContact.set(cid, row.call_scheduled_at);
      });
    } catch (e) {
      console.error("[crm-quality-leads] lead_state chunk", e.message || e);
    }
  }

  const list = enteredIds
    .filter((id) => scheduledIds.has(id))
    .map((id) => {
      const c = contactMap.get(id) || {};
      return {
        contact_id: id,
        call_scheduled_at: scheduledAtByContact.get(id) || null,
        created_at: c.created_at || null,
        surface: crmFunnelSurfaceFromHints({ source: c.source }),
      };
    })
    .filter((row) => matchesFacebookFunnelVariant(row.surface, facebookVariant));

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
    countedBy: "crm_entered_at",
    count: list.length,
    byState: licensedOnly,
    recent: list.slice(0, 12).map((row) => {
      const c = contactMap.get(String(row.contact_id)) || {};
      const name = [c.first_name, c.last_name].filter(Boolean).join(" ").trim() || "Client";
      return {
        contactId: row.contact_id,
        name,
        state: normalizeStateCode(c.us_state) || "",
        enteredAt: row.created_at,
        enteredYmd: ymdChicago(row.created_at),
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

function attachSalesToByState(byState, salesByState) {
  const salesMap = new Map();
  (salesByState || []).forEach((row) => {
    if (!row || !row.state) return;
    salesMap.set(String(row.state), Number(row.count) || 0);
  });
  const seen = new Set();
  const out = (byState || []).map((row) => {
    seen.add(String(row.state));
    const sales = salesMap.get(row.state) || 0;
    const spend = row.spend != null ? Number(row.spend) : null;
    return Object.assign({}, row, {
      sales,
      costPerSale: spend != null && sales > 0 ? spend / sales : null,
    });
  });
  salesMap.forEach((sales, state) => {
    if (seen.has(state) || !sales) return;
    out.push({
      state,
      count: 0,
      spend: state === "UNKNOWN" ? null : 0,
      costPerLead: null,
      sales,
      costPerSale: null,
    });
  });
  return out;
}

module.exports = {
  markStaffScheduledCall,
  loadQualityLeadMetrics,
  mergeSpendByState,
  costPerLead,
  attachSalesToByState,
  normalizeStateCode,
  regionToStateCode,
  crmFunnelSurfaceFromHints,
  matchesFacebookFunnelVariant,
  LICENSED_STATES,
};
