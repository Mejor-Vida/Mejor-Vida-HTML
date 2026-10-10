/**
 * WhatsApp CTWA conversation start times — local wall-clock hour buckets for ad scheduling.
 */
const { restSelect, restInsert, restPatch } = require("../api/staff/_inbox-lib");
const { phoneLast10Digits } = require("./hubspot-phone-variants");
const { ianaTimezoneForLead, normalizeUsStateAbbr } = require("./us-state-timezone");
const { phoneAreaStateAbbr, funnelStateFromContact } = require("./crm-quality-leads");

const HOUR_LABELS = [
  "12 AM",
  "1 AM",
  "2 AM",
  "3 AM",
  "4 AM",
  "5 AM",
  "6 AM",
  "7 AM",
  "8 AM",
  "9 AM",
  "10 AM",
  "11 AM",
  "12 PM",
  "1 PM",
  "2 PM",
  "3 PM",
  "4 PM",
  "5 PM",
  "6 PM",
  "7 PM",
  "8 PM",
  "9 PM",
  "10 PM",
  "11 PM",
];

function emptyHourBuckets() {
  return HOUR_LABELS.map((label, hour) => ({ hour, label, count: 0 }));
}

function digitsOnly(v) {
  return String(v || "").replace(/\D/g, "");
}

function phoneLast10(phone, waId) {
  const fromPhone = phoneLast10Digits(phone);
  if (fromPhone && fromPhone.length >= 10) return fromPhone.slice(-10);
  const d = digitsOnly(waId);
  return d.length >= 10 ? d.slice(-10) : "";
}

function stateFromManychatTag(tag) {
  const m = /^Lead_([A-Za-z]{2})$/i.exec(String(tag || "").trim());
  return m ? normalizeUsStateAbbr(m[1]) : "";
}

function inferState({ usState, phone, tag }) {
  return (
    normalizeUsStateAbbr(usState) ||
    stateFromManychatTag(tag) ||
    phoneAreaStateAbbr(phone) ||
    ""
  );
}

const FALLBACK_IANA = "America/Chicago";

function localHourFromIso(iso, stateAbbr, phone) {
  const iana = ianaTimezoneForLead(stateAbbr, phone) || FALLBACK_IANA;
  if (!iso) return null;
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: iana,
      hour: "numeric",
      hour12: false,
    }).formatToParts(new Date(iso));
    const h = Number((parts.find((p) => p.type === "hour") || {}).value);
    if (!Number.isFinite(h)) return null;
    return h === 24 ? 0 : h;
  } catch (_) {
    return null;
  }
}

function conversationKey(phone10, waId) {
  const p = String(phone10 || "").trim();
  if (p.length === 10) return "p:" + p;
  const w = digitsOnly(waId);
  if (w.length >= 8) return "w:" + w;
  return "";
}

async function findExistingStart(cfg, phone10, waId) {
  if (phone10) {
    const rows = await restSelect(
      cfg,
      "whatsapp_conversation_starts",
      `select=id,started_at&phone_last_10=eq.${encodeURIComponent(phone10)}&limit=1`
    );
    if (rows && rows[0]) return rows[0];
  }
  const w = digitsOnly(waId);
  if (w) {
    const rows = await restSelect(
      cfg,
      "whatsapp_conversation_starts",
      `select=id,started_at&wa_id=eq.${encodeURIComponent(w)}&limit=1`
    );
    if (rows && rows[0]) return rows[0];
  }
  return null;
}

/**
 * Record first conversation start per phone/wa_id (earlier timestamp wins).
 */
async function recordWhatsappConversationStart(cfg, row) {
  if (!cfg || !row || !row.startedAt) return { ok: false, reason: "missing" };
  const phone10 = phoneLast10(row.phone, row.waId);
  const wa = digitsOnly(row.waId);
  if (!phone10 && !wa) return { ok: false, reason: "no_identity" };

  const state = inferState({
    usState: row.usState,
    phone: row.phone || row.waId,
    tag: row.tag,
  });
  const localHour = localHourFromIso(row.startedAt, state, row.phone || row.waId);
  if (localHour == null) return { ok: false, reason: "no_hour" };

  const payload = {
    started_at: row.startedAt,
    phone_last_10: phone10 || null,
    wa_id: wa || null,
    us_state: state || null,
    local_hour: localHour,
    meta_ad_id: row.metaAdId ? String(row.metaAdId).replace(/\D/g, "") || null : null,
    source: String(row.source || "unknown").slice(0, 40),
  };

  try {
    const existing = await findExistingStart(cfg, phone10, wa);
    if (existing) {
      if (new Date(row.startedAt).getTime() < new Date(existing.started_at).getTime()) {
        await restPatch(cfg, "whatsapp_conversation_starts", `id=eq.${encodeURIComponent(existing.id)}`, payload);
        return { ok: true, updated: true };
      }
      return { ok: true, skipped: true };
    }
    await restInsert(cfg, "whatsapp_conversation_starts", payload);
    return { ok: true, inserted: true };
  } catch (e) {
    if (/relation.*does not exist|42P01/i.test(e.message || "")) {
      return { ok: false, reason: "table_missing" };
    }
    if (/duplicate|unique|23505/i.test(e.message || "")) {
      return { ok: true, skipped: true, race: true };
    }
    throw e;
  }
}

async function loadRowsInRange(cfg, startIso, endExclusiveIso) {
  const q =
    "select=started_at,phone_last_10,wa_id,us_state,local_hour,meta_ad_id,source" +
    "&started_at=gte." +
    encodeURIComponent(startIso) +
    "&started_at=lt." +
    encodeURIComponent(endExclusiveIso) +
    "&order=started_at.asc&limit=10000";
  try {
    return await restSelect(cfg, "whatsapp_conversation_starts", q);
  } catch (e) {
    if (/relation.*does not exist|42P01/i.test(e.message || "")) return null;
    throw e;
  }
}

async function backfillConversationStarts(cfg, startIso, endExclusiveIso) {
  const merged = new Map();

  function addCandidate({ startedAt, phone, waId, usState, tag, metaAdId, source }) {
    const key = conversationKey(phoneLast10(phone, waId), waId);
    if (!key || !startedAt) return;
    const state = inferState({ usState, phone, tag });
    const localHour = localHourFromIso(startedAt, state, phone || waId);
    if (localHour == null) return;
    const prev = merged.get(key);
    if (!prev || new Date(startedAt).getTime() < new Date(prev.started_at).getTime()) {
      merged.set(key, {
        started_at: startedAt,
        phone_last_10: phoneLast10(phone, waId) || null,
        wa_id: digitsOnly(waId) || null,
        us_state: state || null,
        local_hour: localHour,
        meta_ad_id: metaAdId ? String(metaAdId).replace(/\D/g, "") || null : null,
        source,
      });
    }
  }

  let ctwa;
  try {
    ctwa = await restSelect(
      cfg,
      "whatsapp_ctwa_pending_attribution",
      "select=received_at,phone_e164,phone_last_10,wa_id,meta_ad_id" +
        "&received_at=gte." +
        encodeURIComponent(startIso) +
        "&received_at=lt." +
        encodeURIComponent(endExclusiveIso) +
        "&meta_ad_id=not.is.null&order=received_at.asc&limit=5000"
    );
  } catch (_) {
    ctwa = [];
  }
  (ctwa || []).forEach((r) => {
    addCandidate({
      startedAt: r.received_at,
      phone: r.phone_e164 || r.phone_last_10,
      waId: r.wa_id,
      metaAdId: r.meta_ad_id,
      source: "ctwa_webhook",
    });
  });

  let mc;
  try {
    mc = await restSelect(
      cfg,
      "manychat_leads",
      "select=phone,created_at,tag,manychat_subscriber_id" +
        "&created_at=gte." +
        encodeURIComponent(startIso) +
        "&created_at=lt." +
        encodeURIComponent(endExclusiveIso) +
        "&source=eq.whatsapp&order=created_at.asc&limit=5000"
    );
  } catch (_) {
    mc = [];
  }
  (mc || []).forEach((r) => {
    addCandidate({
      startedAt: r.created_at,
      phone: r.phone,
      waId: r.manychat_subscriber_id,
      tag: r.tag,
      source: "manychat_lead",
    });
  });

  let contacts;
  try {
    contacts = await restSelect(
      cfg,
      "contacts",
      "select=phone,whatsapp_id,us_state,created_at,meta_ad_id,source,manychat_subscriber_id" +
        "&created_at=gte." +
        encodeURIComponent(startIso) +
        "&created_at=lt." +
        encodeURIComponent(endExclusiveIso) +
        "&source=eq.whatsapp&order=created_at.asc&limit=5000"
    );
  } catch (_) {
    contacts = [];
  }
  (contacts || []).forEach((c) => {
    addCandidate({
      startedAt: c.created_at,
      phone: c.phone,
      waId: c.whatsapp_id || c.manychat_subscriber_id,
      usState: c.us_state,
      metaAdId: c.meta_ad_id,
      source: "contact",
    });
  });

  for (const row of merged.values()) {
    try {
      await recordWhatsappConversationStart(cfg, {
        startedAt: row.started_at,
        phone: row.phone_last_10,
        waId: row.wa_id,
        usState: row.us_state,
        metaAdId: row.meta_ad_id,
        source: row.source,
      });
    } catch (e) {
      console.error("[whatsapp-conversation-hours] backfill row", e.message || e);
    }
  }
}

function aggregateHourReport(rows) {
  const byHour = emptyHourBuckets();
  const byStateMap = new Map();

  (rows || []).forEach((r) => {
    const h = Number(r.local_hour);
    if (!Number.isFinite(h) || h < 0 || h > 23) return;
    byHour[h].count += 1;

    const st =
      normalizeUsStateAbbr(r.us_state) ||
      phoneAreaStateAbbr(r.phone_last_10) ||
      funnelStateFromContact({ us_state: r.us_state, phone: r.phone_last_10 }) ||
      "UNKNOWN";
    if (!byStateMap.has(st)) {
      byStateMap.set(st, { state: st, total: 0, byHour: emptyHourBuckets() });
    }
    const bucket = byStateMap.get(st);
    bucket.total += 1;
    bucket.byHour[h].count += 1;
  });

  const byState = [...byStateMap.values()]
    .map((s) => {
      let peakHour = 0;
      let peakCount = 0;
      s.byHour.forEach((b) => {
        if (b.count > peakCount) {
          peakCount = b.count;
          peakHour = b.hour;
        }
      });
      return {
        state: s.state,
        total: s.total,
        byHour: s.byHour,
        peakHour,
        peakLabel: HOUR_LABELS[peakHour] || "",
        peakCount,
      };
    })
    .sort((a, b) => b.total - a.total);

  let peakHour = 0;
  let peakCount = 0;
  byHour.forEach((b) => {
    if (b.count > peakCount) {
      peakCount = b.count;
      peakHour = b.hour;
    }
  });

  const total = byHour.reduce((n, b) => n + b.count, 0);
  const totalWithMetaAd = (rows || []).filter(
    (r) => String(r.meta_ad_id || "").replace(/\D/g, "").length >= 8
  ).length;
  return {
    total,
    totalWithMetaAd,
    byHour,
    byState,
    peakHour,
    peakLabel: HOUR_LABELS[peakHour] || "",
    peakCount,
  };
}

async function collectEphemeralRows(cfg, startIso, endExclusiveIso) {
  const merged = new Map();
  function push(row) {
    const key = conversationKey(row.phone_last_10, row.wa_id);
    if (!key) return;
    const prev = merged.get(key);
    if (!prev || new Date(row.started_at).getTime() < new Date(prev.started_at).getTime()) {
      merged.set(key, row);
    }
  }

  let ctwa = [];
  try {
    ctwa = await restSelect(
      cfg,
      "whatsapp_ctwa_pending_attribution",
      "select=received_at,phone_e164,phone_last_10,wa_id,meta_ad_id" +
        "&received_at=gte." +
        encodeURIComponent(startIso) +
        "&received_at=lt." +
        encodeURIComponent(endExclusiveIso) +
        "&meta_ad_id=not.is.null&order=received_at.asc&limit=5000"
    );
  } catch (_) {}
  (ctwa || []).forEach((r) => {
    const phone = r.phone_e164 || r.phone_last_10;
    const state = inferState({ phone });
    const localHour = localHourFromIso(r.received_at, state, phone);
    if (localHour == null) return;
    push({
      started_at: r.received_at,
      phone_last_10: phoneLast10(phone, r.wa_id),
      wa_id: digitsOnly(r.wa_id) || null,
      us_state: state || null,
      local_hour: localHour,
      meta_ad_id: r.meta_ad_id,
      source: "ctwa_webhook",
    });
  });

  let contacts = [];
  try {
    contacts = await restSelect(
      cfg,
      "contacts",
      "select=phone,whatsapp_id,us_state,created_at,meta_ad_id,source,manychat_subscriber_id" +
        "&created_at=gte." +
        encodeURIComponent(startIso) +
        "&created_at=lt." +
        encodeURIComponent(endExclusiveIso) +
        "&source=eq.whatsapp&order=created_at.asc&limit=5000"
    );
  } catch (_) {}
  (contacts || []).forEach((c) => {
    const state = inferState({ usState: c.us_state, phone: c.phone });
    const localHour = localHourFromIso(c.created_at, state, c.phone || c.whatsapp_id);
    if (localHour == null) return;
    push({
      started_at: c.created_at,
      phone_last_10: phoneLast10(c.phone, c.whatsapp_id || c.manychat_subscriber_id),
      wa_id: digitsOnly(c.whatsapp_id || c.manychat_subscriber_id) || null,
      us_state: state || null,
      local_hour: localHour,
      meta_ad_id: c.meta_ad_id,
      source: "contact",
    });
  });

  let mc = [];
  try {
    mc = await restSelect(
      cfg,
      "manychat_leads",
      "select=phone,created_at,tag,manychat_subscriber_id" +
        "&created_at=gte." +
        encodeURIComponent(startIso) +
        "&created_at=lt." +
        encodeURIComponent(endExclusiveIso) +
        "&source=eq.whatsapp&order=created_at.asc&limit=5000"
    );
  } catch (_) {}
  (mc || []).forEach((r) => {
    const state = inferState({ phone: r.phone, tag: r.tag });
    const localHour = localHourFromIso(r.created_at, state, r.phone);
    if (localHour == null) return;
    push({
      started_at: r.created_at,
      phone_last_10: phoneLast10(r.phone, r.manychat_subscriber_id),
      wa_id: digitsOnly(r.manychat_subscriber_id) || null,
      us_state: state || null,
      local_hour: localHour,
      meta_ad_id: null,
      source: "manychat_lead",
    });
  });

  return [...merged.values()];
}

async function loadWhatsappConversationHourReport(cfg, startIso, endExclusiveIso, opts) {
  const skipBackfill = !!(opts && opts.skipBackfill);
  if (!skipBackfill) {
    try {
      await backfillConversationStarts(cfg, startIso, endExclusiveIso);
    } catch (e) {
      console.error("[whatsapp-conversation-hours] backfill", e.message || e);
    }
  }

  let rows = await loadRowsInRange(cfg, startIso, endExclusiveIso);
  let tableMissing = false;
  if (rows === null) {
    tableMissing = true;
    rows = await collectEphemeralRows(cfg, startIso, endExclusiveIso);
  }

  return {
    configured: !tableMissing,
    tableMissing,
    ...aggregateHourReport(rows || []),
  };
}

module.exports = {
  HOUR_LABELS,
  localHourFromIso,
  recordWhatsappConversationStart,
  loadWhatsappConversationHourReport,
  backfillConversationStarts,
};
