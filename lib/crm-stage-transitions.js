/**
 * CRM stage transition log — policies sold = transition to "client".
 */
const { restSelect, restInsert, restPatch } = require("../api/staff/_inbox-lib");

const CLIENT_STAGES = new Set([
  "",
  "new",
  "contacted",
  "engaged",
  "client",
  "retained",
  "loyal",
  "lost",
  "enrolled",
]);

const LEGACY_STAGE_MAP = {
  new_lead: "new",
  attempting_contact: "contacted",
  call_scheduled: "contacted",
  connected: "engaged",
  qualified: "engaged",
  needs_analysis_complete: "client",
  quote_preparing: "client",
  quote_presented: "client",
  objection_handling: "client",
  application_started: "client",
  underwriting: "client",
  approved_pending_payment: "client",
  policy_issued: "enrolled",
  closed_won: "enrolled",
  closed_lost: "lost",
};

function normalizeCrmStage(raw) {
  const s = String(raw ?? "").trim().toLowerCase();
  if (!s) return "";
  if (CLIENT_STAGES.has(s)) return s;
  return LEGACY_STAGE_MAP[s] || "";
}

async function logStageTransition(cfg, opts) {
  if (!cfg || !opts || !opts.leadId || !opts.leadSourceTable) return null;
  const fromStage = normalizeCrmStage(opts.fromStage);
  const toStage = normalizeCrmStage(opts.toStage);
  if (!toStage || fromStage === toStage) return null;

  const rows = await restInsert(cfg, "crm_stage_transitions", [
    {
      lead_id: opts.leadId,
      lead_source_table: opts.leadSourceTable,
      from_stage: fromStage,
      to_stage: toStage,
      changed_at: opts.changedAt || new Date().toISOString(),
      changed_by: opts.changedBy || null,
    },
  ]);
  return Array.isArray(rows) && rows[0] ? rows[0] : null;
}

function ymdChicago(iso) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(iso));
}

function addDaysYmd(ymd, days) {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days, 12, 0, 0));
  return t.toISOString().slice(0, 10);
}

function buildDailySoldSeries(rows, dateFrom, dateTo) {
  const map = new Map();
  (rows || []).forEach((row) => {
    const day = ymdChicago(row.changed_at);
    if (!day) return;
    map.set(day, (map.get(day) || 0) + 1);
  });
  const daily = [];
  let cur = dateFrom;
  while (cur <= dateTo) {
    daily.push({ date: cur, sold: map.get(cur) || 0 });
    cur = addDaysYmd(cur, 1);
  }
  return daily;
}

function displayNameFromProfile(pd) {
  if (!pd || typeof pd !== "object") return "";
  const first = String(pd.first_name || pd.firstName || "").trim();
  const last = String(pd.last_name || pd.lastName || "").trim();
  const full = (first + " " + last).trim();
  if (full) return full;
  return String(pd.display_name || pd.email || pd.phone || "").trim();
}

async function syncMissingClientTransitions(cfg) {
  if (!cfg) return 0;
  let profiles = [];
  let existing = [];
  try {
    profiles = await restSelect(
      cfg,
      "staff_lead_profiles",
      "select=id,lead_id,lead_source_table,profile_data,updated_at,updated_by&limit=5000"
    );
    existing = await restSelect(
      cfg,
      "crm_stage_transitions",
      "select=lead_id,lead_source_table&to_stage=eq.client&limit=5000"
    );
  } catch (e) {
    if (/crm_stage_transitions|42P01|does not exist/i.test(String(e.message || e))) return 0;
    throw e;
  }

  const have = new Set(
    (existing || []).map((r) => String(r.lead_id) + "|" + String(r.lead_source_table))
  );
  let added = 0;

  for (const profile of profiles || []) {
    const pd =
      profile.profile_data && typeof profile.profile_data === "object" ? profile.profile_data : {};
    if (normalizeCrmStage(pd.pipeline_stage) !== "client") continue;
    const key = String(profile.lead_id) + "|" + String(profile.lead_source_table);
    if (have.has(key)) continue;

    const soldAt = String(pd.client_at || profile.updated_at || new Date().toISOString()).trim();
    await restInsert(cfg, "crm_stage_transitions", [
      {
        lead_id: profile.lead_id,
        lead_source_table: profile.lead_source_table,
        from_stage: "",
        to_stage: "client",
        changed_at: soldAt,
        changed_by: profile.updated_by || "sync",
      },
    ]);
    have.add(key);
    added += 1;

    if (!pd.client_at) {
      const nextProfile = Object.assign({}, pd, { client_at: soldAt });
      await restPatch(cfg, "staff_lead_profiles", "id=eq." + encodeURIComponent(profile.id), {
        profile_data: nextProfile,
      });
    }
  }

  return added;
}

async function fetchPoliciesSoldMetrics(cfg, startIso, endExclusiveIso, dateFrom, dateTo) {
  try {
    await syncMissingClientTransitions(cfg);
  } catch (e) {
    console.error("[crm-stage-transitions] sync missing client rows", e.message || e);
  }

  const q =
    "select=id,lead_id,lead_source_table,from_stage,to_stage,changed_at,changed_by" +
    "&to_stage=eq.client" +
    "&changed_at=gte." +
    encodeURIComponent(startIso) +
    "&changed_at=lt." +
    encodeURIComponent(endExclusiveIso) +
    "&order=changed_at.desc";
  let rows = [];
  try {
    rows = await restSelect(cfg, "crm_stage_transitions", q);
  } catch (e) {
    if (/crm_stage_transitions|42P01|does not exist/i.test(String(e.message || e))) {
      return {
        show: true,
        configured: false,
        count: null,
        sales: [],
        daily: [],
        setupHint: "Run migration 077_crm_stage_transitions.sql to enable policies sold tracking.",
        error: e.message || String(e),
      };
    }
    throw e;
  }

  const profileMap = new Map();
  if (rows.length) {
    const leadIds = [...new Set(rows.map((r) => r.lead_id).filter(Boolean))];
    if (leadIds.length) {
      const inList = leadIds.map((id) => encodeURIComponent(id)).join(",");
      const profiles = await restSelect(
        cfg,
        "staff_lead_profiles",
        "select=lead_id,lead_source_table,profile_data&lead_id=in.(" + inList + ")"
      );
      (profiles || []).forEach((p) => {
        profileMap.set(String(p.lead_id) + "|" + String(p.lead_source_table), p.profile_data || {});
      });
    }
  }

  const sales = rows.map((row) => {
    const pd = profileMap.get(String(row.lead_id) + "|" + String(row.lead_source_table)) || {};
    return {
      leadId: row.lead_id,
      leadSourceTable: row.lead_source_table,
      name: displayNameFromProfile(pd) || "Client",
      soldDate: ymdChicago(row.changed_at),
      changedAt: row.changed_at,
      fromStage: row.from_stage || "",
      changedBy: row.changed_by || "",
    };
  });

  return {
    show: true,
    configured: true,
    dateFrom,
    dateTo,
    count: sales.length,
    sales: sales.slice(0, 10),
    daily: buildDailySoldSeries(rows, dateFrom, dateTo),
  };
}

module.exports = {
  normalizeCrmStage,
  logStageTransition,
  syncMissingClientTransitions,
  fetchPoliciesSoldMetrics,
};
