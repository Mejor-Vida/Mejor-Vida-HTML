/**
 * Quality leads = CRM clients with lead_state.call_scheduled_at set.
 * Cost-per-lead periods use contacts.created_at (CRM entry), not the mark date.
 */
const { restSelect, restPatch } = require("../api/staff/_inbox-lib");
const { upsertLeadState, insertEvent } = require("./contacts-db");
const { phoneLast10Digits } = require("./hubspot-phone-variants");
const {
  LICENSED_STATE_CODES,
  licensedStateFromName,
  isLicensedState,
} = require("./licensed-states");
const { normalizeUsStateAbbr, stateFromRecord } = require("./us-state-timezone");
const NPA_STATE = require("../js/us-area-code-states");

const LICENSED_STATES = LICENSED_STATE_CODES;

function ymdChicago(iso) {
  if (!iso) return "";
  try {
    return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Chicago" }).format(new Date(iso));
  } catch {
    return String(iso).slice(0, 10);
  }
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = String(ymd || "").split("-").map(Number);
  if (!y || !m || !d) return "";
  const t = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return t.toISOString().slice(0, 10);
}

function fillLeadCountSeries(dateFrom, dateTo, countByDate) {
  const daily = [];
  let cur = dateFrom;
  while (cur && dateTo && cur <= dateTo) {
    daily.push({ date: cur, leads: countByDate.get(cur) || 0 });
    cur = addDaysYmd(cur, 1);
  }
  return daily;
}

function normalizeStateCode(raw) {
  return licensedStateFromName(raw);
}

function phoneAreaStateAbbr(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  let npa = "";
  if (digits.length === 11 && digits.charAt(0) === "1") npa = digits.slice(1, 4);
  else if (digits.length >= 10) npa = digits.slice(-10, -7);
  if (!npa) return "";
  return normalizeUsStateAbbr(NPA_STATE[npa] || "");
}

/** Licensed state bucket for funnel tables (matches Meta region spend rows). */
function funnelStateFromContact(c) {
  const raw = normalizeUsStateAbbr(c && c.us_state) || phoneAreaStateAbbr(c && c.phone);
  if (!raw) return "UNKNOWN";
  const licensed = licensedStateFromName(raw) || (isLicensedState(raw) ? raw : "");
  return licensed || "UNKNOWN";
}

async function loadLeadStateUsStateMap(cfg, contactIds) {
  const map = new Map();
  const ids = [...new Set((contactIds || []).map((id) => String(id || "").trim()).filter(Boolean))];
  for (let i = 0; i < ids.length; i += 80) {
    const chunk = ids.slice(i, i + 80);
    const inList = chunk.map((id) => encodeURIComponent(id)).join(",");
    if (!inList) continue;
    try {
      const rows = await restSelect(
        cfg,
        "lead_state",
        `select=contact_id,us_state&contact_id=in.(${inList})&limit=80`
      );
      (rows || []).forEach((row) => {
        if (!row || !row.contact_id) return;
        const st = normalizeUsStateAbbr(row.us_state);
        if (st) map.set(String(row.contact_id), st);
      });
    } catch (e) {
      console.error("[crm-quality-leads] lead_state us_state", e.message || e);
    }
  }
  return map;
}

async function loadProfileStateByContactId(cfg, contactIds) {
  const map = new Map();
  const ids = [...new Set((contactIds || []).map((id) => String(id || "").trim()).filter(Boolean))];
  for (let i = 0; i < ids.length; i += 40) {
    const chunk = ids.slice(i, i + 40);
    const inList = chunk.map((id) => encodeURIComponent(id)).join(",");
    if (!inList) continue;
    try {
      const direct = await restSelect(
        cfg,
        "staff_lead_profiles",
        `select=lead_id,profile_data&lead_source_table=eq.contacts&lead_id=in.(${inList})&limit=40`
      );
      (direct || []).forEach((row) => {
        if (!row || !row.lead_id) return;
        const st = stateFromRecord(row.profile_data);
        if (st) map.set(String(row.lead_id), st);
      });
    } catch (e) {
      console.error("[crm-quality-leads] staff profile contacts", e.message || e);
    }
    const orParts = chunk.map(
      (id) => `profile_data->>contacts_contact_id.eq.${encodeURIComponent(id)}`
    );
    if (!orParts.length) continue;
    try {
      const linked = await restSelect(
        cfg,
        "staff_lead_profiles",
        `select=profile_data&or=(${orParts.join(",")})&limit=40`
      );
      (linked || []).forEach((row) => {
        const pd = row && row.profile_data && typeof row.profile_data === "object" ? row.profile_data : {};
        const cid = String(pd.contacts_contact_id || pd.contact_id || "").trim();
        const st = stateFromRecord(pd);
        if (cid && st) map.set(cid, st);
      });
    } catch (e) {
      console.error("[crm-quality-leads] staff profile link", e.message || e);
    }
  }
  return map;
}

/** Match Clients list state: profile, lead_state, then phone area code. */
async function enrichQualityLeadContactStates(cfg, contactMap) {
  if (!contactMap || !contactMap.size) return;
  const needIds = [];
  contactMap.forEach((c, id) => {
    if (!normalizeUsStateAbbr(c && c.us_state)) needIds.push(String(id));
  });
  if (!needIds.length) return;

  const fromLeadState = await loadLeadStateUsStateMap(cfg, needIds);
  const fromProfile = await loadProfileStateByContactId(cfg, needIds);

  needIds.forEach((id) => {
    const c = contactMap.get(id);
    if (!c) return;
    const st =
      normalizeUsStateAbbr(c.us_state) ||
      fromLeadState.get(id) ||
      fromProfile.get(id) ||
      phoneAreaStateAbbr(c.phone);
    if (st) c.us_state = st;
  });
}

async function ensureContactUsState(cfg, contactId, phoneHint) {
  const id = String(contactId || "").trim();
  if (!id) return;
  let row = null;
  try {
    const rows = await restSelect(
      cfg,
      "contacts",
      `select=id,us_state,phone&id=eq.${encodeURIComponent(id)}&limit=1`
    );
    row = Array.isArray(rows) ? rows[0] : null;
  } catch (e) {
    console.error("[crm-quality-leads] ensureContactUsState load", e.message || e);
    return;
  }
  if (!row) return;
  if (normalizeUsStateAbbr(row.us_state)) return;

  const temp = { us_state: "", phone: phoneHint || row.phone || "" };
  const map = new Map([[id, temp]]);
  await enrichQualityLeadContactStates(cfg, map);
  const resolved = normalizeUsStateAbbr(temp.us_state);
  if (!resolved) return;
  try {
    await restPatch(cfg, "contacts", `id=eq.${encodeURIComponent(id)}`, { us_state: resolved });
  } catch (e) {
    console.error("[crm-quality-leads] ensureContactUsState patch", e.message || e);
  }
}

function regionToStateCode(name) {
  return normalizeStateCode(name) || "";
}

function crmFunnelSurfaceFromHints(opts) {
  const table = String((opts && opts.leadSourceTable) || "").toLowerCase();
  const source = String((opts && opts.source) || "").toLowerCase();
  const blob = [
    source,
    opts && opts.utmSource,
    opts && opts.campaign,
    table,
  ]
    .map((v) => String(v || "").toLowerCase())
    .join(" ");
  if (table === "quote_lead_submissions") return "landing";
  if (
    /facebook_landing|english_landing|gastos_finales|fexquotes|quote_page|quote\.html|instant_form/.test(
      blob
    )
  ) {
    return "landing";
  }
  if (table === "manychat_leads") return "whatsapp";
  if (/\bwhatsapp\b|manychat/.test(blob)) return "whatsapp";
  const sid = String(
    (opts && (opts.whatsappId || opts.manychatSubscriberId || opts.subscriber)) || ""
  ).trim();
  if (sid && sid.length >= 6 && !/^(staff_|hubspot)/i.test(source)) return "whatsapp";
  return "other";
}

function matchesFacebookFunnelVariant(surface, variant) {
  if (!variant) return true;
  // Staff/manual CRM entries still count toward cost-per-lead on every Facebook tab.
  if (surface === "other") return true;
  if (variant === "whatsapp") return surface === "whatsapp";
  if (variant === "landing" || variant === "v3" || variant === "website") {
    return surface === "landing";
  }
  return surface === variant;
}

function normalizeLeadEmail(v) {
  const raw = String(v || "").trim().toLowerCase();
  if (!raw || raw.indexOf("@") === -1) return "";
  return raw;
}

function contactIdentityKeys(c) {
  const keys = [];
  if (!c) return keys;
  const phone = phoneLast10Digits(c.phone);
  if (phone && phone.length >= 10) keys.push("p:" + phone);
  const email = normalizeLeadEmail(c.email);
  if (email) keys.push("e:" + email);
  const sub = String(c.manychat_subscriber_id || "").trim();
  if (sub && sub.length >= 6 && !/^[0-9a-f-]{36}$/i.test(sub) && !/^\d{10,15}$/.test(sub)) {
    keys.push("s:" + sub.toLowerCase());
  }
  return keys;
}

function pgInListQuoted(values) {
  return [...new Set((values || []).map((v) => String(v || "").trim()).filter(Boolean))].map(
    (v) => `"${v.replace(/"/g, "")}"`
  );
}

function collapseDuplicateScheduledLeads(list, contactMap) {
  const rows = Array.isArray(list) ? list : [];
  if (rows.length <= 1) return rows;
  const parent = rows.map((_, i) => i);
  function find(i) {
    if (parent[i] !== i) parent[i] = find(parent[i]);
    return parent[i];
  }
  function union(a, b) {
    const pa = find(a);
    const pb = find(b);
    if (pa !== pb) parent[pb] = pa;
  }
  const byKey = new Map();
  rows.forEach((row, i) => {
    const c = contactMap.get(String(row.contact_id)) || {};
    contactIdentityKeys(c).forEach((key) => {
      if (byKey.has(key)) union(i, byKey.get(key));
      else byKey.set(key, i);
    });
  });
  const groups = new Map();
  rows.forEach((row, i) => {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(row);
  });
  const unique = [];
  groups.forEach((members) => {
    members.sort((a, b) => String(a.created_at || "").localeCompare(String(b.created_at || "")));
    unique.push(members[0]);
  });
  unique.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  return unique;
}

function isoMs(iso) {
  const t = Date.parse(iso || "");
  return Number.isFinite(t) ? t : null;
}

function leadHasEarlierSibling(row, contactMap, earlierRows) {
  const c = contactMap.get(String(row.contact_id)) || {};
  const keys = new Set(contactIdentityKeys(c));
  if (!keys.size) return false;
  const selfId = String(row.contact_id);
  const selfMs = isoMs(row.created_at);
  return (earlierRows || []).some((other) => {
    if (!other || String(other.id) === selfId) return false;
    const otherMs = isoMs(other.created_at);
    if (selfMs != null && otherMs != null && otherMs >= selfMs) return false;
    return contactIdentityKeys(other).some((key) => keys.has(key));
  });
}

async function loadEarlierIdentitySiblings(cfg, contacts, startIso) {
  const list = (contacts || []).filter(Boolean);
  if (!list.length) return [];
  const phones = [];
  const emails = [];
  const subs = [];
  list.forEach((c) => {
    const p = phoneLast10Digits(c.phone);
    if (p && p.length >= 10) phones.push(p);
    const e = normalizeLeadEmail(c.email);
    if (e) emails.push(e);
    const s = String(c.manychat_subscriber_id || "").trim();
    if (s && s.length >= 6 && !/^[0-9a-f-]{36}$/i.test(s)) subs.push(s);
  });
  const orParts = [];
  const phoneIn = pgInListQuoted(phones);
  const emailIn = pgInListQuoted(emails);
  const subIn = pgInListQuoted(subs);
  if (phoneIn.length) orParts.push(`phone_last_10.in.(${phoneIn.join(",")})`);
  if (emailIn.length) orParts.push(`email.in.(${emailIn.join(",")})`);
  if (subIn.length) {
    orParts.push(`manychat_subscriber_id.in.(${subIn.join(",")})`);
    orParts.push(`whatsapp_id.in.(${subIn.join(",")})`);
  }
  if (!orParts.length) return [];
  try {
    const rows = await restSelect(
      cfg,
      "contacts",
      `select=id,created_at,phone,email,whatsapp_id,manychat_subscriber_id&created_at=lt.${encodeURIComponent(
        startIso
      )}&or=(${orParts.join(",")})&order=created_at.asc&limit=500`
    );
    return rows || [];
  } catch (e) {
    console.error("[crm-quality-leads] identity siblings", e.message || e);
    return [];
  }
}

async function uniqueScheduledCallLeads(cfg, list, contactMap, startIso) {
  const collapsed = collapseDuplicateScheduledLeads(list, contactMap);
  const contacts = collapsed.map((row) => contactMap.get(String(row.contact_id))).filter(Boolean);
  const earlier = await loadEarlierIdentitySiblings(cfg, contacts, startIso);
  return collapsed.filter((row) => !leadHasEarlierSibling(row, contactMap, earlier));
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

  if (at) {
    try {
      await ensureContactUsState(cfg, contactId);
    } catch (e) {
      console.error("[crm-quality-leads] ensureContactUsState", e && e.message ? e.message : e);
    }
  }

  return { contactId, call_scheduled_at: at };
}

async function loadScheduledCallLeads(cfg, startIso, endExclusiveIso, facebookVariant) {
  const scheduledAtByContact = new Map();
  try {
    const scheduledRows = await restSelect(
      cfg,
      "lead_state",
      "select=contact_id,call_scheduled_at&call_scheduled_at=not.is.null&order=call_scheduled_at.desc&limit=5000"
    );
    (scheduledRows || []).forEach((row) => {
      if (!row || !row.contact_id || !row.call_scheduled_at) return;
      const cid = String(row.contact_id);
      if (!scheduledAtByContact.has(cid)) {
        scheduledAtByContact.set(cid, row.call_scheduled_at);
      }
    });
  } catch (e) {
    return {
      configured: false,
      error: e.message || String(e),
      list: [],
      contactMap: new Map(),
    };
  }

  const scheduledIds = [...scheduledAtByContact.keys()];
  const contactMap = new Map();
  for (let i = 0; i < scheduledIds.length; i += 80) {
    const chunk = scheduledIds.slice(i, i + 80);
    const inList = chunk.map((id) => encodeURIComponent(id)).join(",");
    if (!inList) continue;
    try {
      const rows = await restSelect(
        cfg,
        "contacts",
        "select=id,us_state,first_name,last_name,source,created_at,phone,email,whatsapp_id,manychat_subscriber_id,meta_ad_id" +
          "&id=in.(" +
          inList +
          ")&created_at=gte." +
          encodeURIComponent(startIso) +
          "&created_at=lt." +
          encodeURIComponent(endExclusiveIso) +
          "&limit=80"
      );
      (rows || []).forEach((c) => {
        if (c && c.id) contactMap.set(String(c.id), c);
      });
    } catch (e) {
      console.error("[crm-quality-leads] contacts for scheduled", e.message || e);
    }
  }

  await enrichQualityLeadContactStates(cfg, contactMap);
  const enteredIds = [...contactMap.keys()];

  const list = enteredIds
    .map((id) => {
      const c = contactMap.get(id) || {};
      return {
        contact_id: id,
        call_scheduled_at: scheduledAtByContact.get(id) || null,
        created_at: c.created_at || null,
        surface: crmFunnelSurfaceFromHints({
          source: c.source,
          whatsappId: c.whatsapp_id,
          manychatSubscriberId: c.manychat_subscriber_id,
        }),
      };
    })
    .filter((row) => matchesFacebookFunnelVariant(row.surface, facebookVariant));

  const unique = await uniqueScheduledCallLeads(cfg, list, contactMap, startIso);
  return { configured: true, list: unique, contactMap };
}

async function loadQualityLeadMetrics(cfg, startIso, endExclusiveIso, dateFrom, dateTo, opts) {
  const facebookVariant = (opts && opts.facebookVariant) || null;
  const loaded = await loadScheduledCallLeads(cfg, startIso, endExclusiveIso, facebookVariant);
  if (!loaded.configured) {
    return {
      show: true,
      configured: false,
      count: 0,
      byState: [],
      error: loaded.error,
      dateFrom,
      dateTo,
    };
  }
  const list = loaded.list;
  const contactMap = loaded.contactMap;

  const byStateMap = new Map();
  LICENSED_STATES.forEach((code) => byStateMap.set(code, 0));
  byStateMap.set("UNKNOWN", 0);

  list.forEach((row) => {
    const c = contactMap.get(String(row.contact_id)) || {};
    const code = funnelStateFromContact(c);
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
      const stCode = funnelStateFromContact(c);
      return {
        contactId: row.contact_id,
        name,
        state: stCode === "UNKNOWN" ? "" : stCode,
        enteredAt: row.created_at,
        enteredYmd: ymdChicago(row.created_at),
        scheduledAt: row.call_scheduled_at,
        scheduledYmd: ymdChicago(row.call_scheduled_at),
      };
    }),
  };
}

async function loadQualityLeadDailyByState(
  cfg,
  startIso,
  endExclusiveIso,
  dateFrom,
  dateTo,
  stateCode,
  opts
) {
  const facebookVariant = (opts && opts.facebookVariant) || null;
  const want = String(stateCode || "").trim().toUpperCase();
  const loaded = await loadScheduledCallLeads(cfg, startIso, endExclusiveIso, facebookVariant);
  if (!loaded.configured) {
    return {
      configured: false,
      error: loaded.error,
      daily: fillLeadCountSeries(dateFrom, dateTo, new Map()),
    };
  }
  const countByDate = new Map();
  loaded.list.forEach((row) => {
    const c = loaded.contactMap.get(String(row.contact_id)) || {};
    const code = funnelStateFromContact(c);
    if (code !== want) return;
    const day = ymdChicago(row.created_at);
    if (!day) return;
    countByDate.set(day, (countByDate.get(day) || 0) + 1);
  });
  return {
    configured: true,
    dateFrom,
    dateTo,
    state: want,
    daily: fillLeadCountSeries(dateFrom, dateTo, countByDate),
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
  loadScheduledCallLeads,
  loadQualityLeadMetrics,
  loadQualityLeadDailyByState,
  mergeSpendByState,
  costPerLead,
  attachSalesToByState,
  normalizeStateCode,
  regionToStateCode,
  crmFunnelSurfaceFromHints,
  matchesFacebookFunnelVariant,
  LICENSED_STATES,
};
