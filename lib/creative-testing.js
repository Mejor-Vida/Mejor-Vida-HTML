/**
 * Per-ad creative testing reads for the Staff CRM.
 * Meta delivery metrics are by ad. Cost per lead and cost per sale use
 * contacts.meta_ad_id, which is saved when a WhatsApp chat starts.
 */
const {
  metaAdConfig,
  metaConfigStatus,
  fetchMetaInsightsPages,
  sumMessagingConversations,
} = require("./ad-platform-insights");
const { restSelect } = require("../api/staff/_inbox-lib");
const { costPerLead, loadScheduledCallLeads } = require("./crm-quality-leads");

const AGE_55 = new Set(["55-64", "65+"]);
const STOP_IMPRESSIONS = 2000;

function graphUrl(path, params) {
  const { token } = metaAdConfig();
  const q = new URLSearchParams(params);
  q.set("access_token", token);
  return `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || "v19.0"}/${path}?${q.toString()}`;
}

async function graphGet(path, params) {
  return fetchMetaInsightsPages(graphUrl(path, params));
}

function pct(part, whole) {
  const n = Number(part) || 0;
  const d = Number(whole) || 0;
  if (d <= 0) return null;
  return (n / d) * 100;
}

function rate(part, whole) {
  const n = Number(part) || 0;
  const d = Number(whole) || 0;
  if (d <= 0) return null;
  return n / d;
}

async function listCampaigns() {
  const status = metaConfigStatus();
  if (!status.configured) return { configured: false, setupHint: status.reason, campaigns: [] };
  const { accountId } = metaAdConfig();
  const rows = await graphGet(`${accountId}/campaigns`, {
    fields: "id,name,effective_status,objective",
    limit: "200",
  });
  const campaigns = (rows || [])
    .filter((row) => row && row.id && !/ARCHIVED|DELETED/i.test(String(row.effective_status || "")))
    .map((row) => ({
      id: String(row.id),
      name: row.name || String(row.id),
      status: row.effective_status || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { configured: true, campaigns };
}

async function listAdSets(campaignId) {
  const id = String(campaignId || "").trim();
  if (!/^\d+$/.test(id)) throw new Error("campaign_id required");
  const status = metaConfigStatus();
  if (!status.configured) return { configured: false, setupHint: status.reason, adsets: [] };
  const rows = await graphGet(`${id}/adsets`, {
    fields: "id,name,effective_status",
    limit: "200",
  });
  const adsets = (rows || [])
    .filter((row) => row && row.id && !/ARCHIVED|DELETED/i.test(String(row.effective_status || "")))
    .map((row) => ({
      id: String(row.id),
      name: row.name || String(row.id),
      status: row.effective_status || "",
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return { configured: true, adsets };
}

function indexByAd(rows, pick) {
  const map = new Map();
  (rows || []).forEach((row) => {
    const id = String(row.ad_id || "");
    if (!id) return;
    if (!map.has(id)) map.set(id, []);
    map.get(id).push(pick(row));
  });
  return map;
}

async function listAds(cfg, adsetId, dateFrom, dateTo, startIso, endExclusiveIso) {
  const id = String(adsetId || "").trim();
  if (!/^\d+$/.test(id)) throw new Error("adset_id required");
  const status = metaConfigStatus();
  if (!status.configured) return { configured: false, setupHint: status.reason, ads: [] };
  const { accountId } = metaAdConfig();
  const timeRange = JSON.stringify({ since: dateFrom, until: dateTo });
  const filtering = JSON.stringify([
    { field: "adset.id", operator: "IN", value: [id] },
  ]);

  const ads = await graphGet(`${id}/ads`, {
    fields: "id,name,effective_status,creative{thumbnail_url}",
    limit: "100",
  });

  let insightRows = [];
  let genderRows = [];
  let ageRows = [];
  try {
    insightRows = await graphGet(`${accountId}/insights`, {
      level: "ad",
      filtering,
      time_range: timeRange,
      fields: "ad_id,impressions,clicks,inline_link_clicks,spend,actions",
      limit: "200",
    });
  } catch (e) {
    insightRows = [];
  }
  try {
    genderRows = await graphGet(`${accountId}/insights`, {
      level: "ad",
      filtering,
      time_range: timeRange,
      breakdowns: "gender",
      fields: "ad_id,impressions",
      limit: "500",
    });
  } catch (e) {
    genderRows = [];
  }
  try {
    ageRows = await graphGet(`${accountId}/insights`, {
      level: "ad",
      filtering,
      time_range: timeRange,
      breakdowns: "age",
      fields: "ad_id,impressions",
      limit: "500",
    });
  } catch (e) {
    ageRows = [];
  }

  const insightById = new Map();
  (insightRows || []).forEach((row) => {
    if (row && row.ad_id) insightById.set(String(row.ad_id), row);
  });
  const genderById = indexByAd(genderRows, (row) => row);
  const ageById = indexByAd(ageRows, (row) => row);

  const decisions = await loadDecisions(cfg, (ads || []).map((row) => String(row.id)));
  const costs = await loadCostsByAd(cfg, startIso, endExclusiveIso);

  const out = (ads || [])
    .filter((row) => row && row.id && !/ARCHIVED|DELETED/i.test(String(row.effective_status || "")))
    .map((row) => {
      const adId = String(row.id);
      const insight = insightById.get(adId) || {};
      const impressions = Number(insight.impressions) || 0;
      const clicks = Number(insight.clicks) || 0;
      const linkClicks = Number(insight.inline_link_clicks) || 0;
      const spend = insight.spend != null ? Number(insight.spend) || 0 : 0;
      const gender = genderById.get(adId) || [];
      const genderImpr = gender.reduce((sum, g) => sum + (Number(g.impressions) || 0), 0);
      const femaleImpr = gender
        .filter((g) => String(g.gender || "").toLowerCase() === "female")
        .reduce((sum, g) => sum + (Number(g.impressions) || 0), 0);
      const ages = ageById.get(adId) || [];
      const ageImpr = ages.reduce((sum, g) => sum + (Number(g.impressions) || 0), 0);
      const age55Impr = ages
        .filter((g) => AGE_55.has(String(g.age || "")))
        .reduce((sum, g) => sum + (Number(g.impressions) || 0), 0);
      const leadCount = costs.leads.get(adId) || 0;
      const saleCount = costs.sales.get(adId) || 0;
      const creative = row.creative || {};
      return {
        id: adId,
        name: row.name || adId,
        status: row.effective_status || "",
        thumbnail: creative.thumbnail_url || "",
        impressions,
        ctr: rate(linkClicks, impressions),
        ctrAll: rate(clicks, impressions),
        femalePct: genderImpr > 0 ? pct(femaleImpr, genderImpr) : null,
        age55Pct: ageImpr > 0 ? pct(age55Impr, ageImpr) : null,
        conversations: sumMessagingConversations([insight]),
        spend,
        leadCount,
        costPerLead: costPerLead(spend, leadCount),
        saleCount,
        costPerSale: costPerLead(spend, saleCount),
        decision: decisions.get(adId) || null,
        turnOff: impressions >= STOP_IMPRESSIONS,
        nearStop: impressions >= 1600 && impressions < STOP_IMPRESSIONS,
      };
    })
    .sort((a, b) => b.impressions - a.impressions || a.name.localeCompare(b.name));

  return { configured: true, ads: out, costsReady: costs.ready };
}

async function loadDecisions(cfg, adIds) {
  const map = new Map();
  if (!cfg || !adIds.length) return map;
  const inList = adIds.map((id) => encodeURIComponent(id)).join(",");
  try {
    const rows = await restSelect(
      cfg,
      "staff_creative_ad_decisions",
      `select=ad_id,decision&ad_id=in.(${inList})`
    );
    (rows || []).forEach((row) => {
      if (row && row.ad_id) map.set(String(row.ad_id), row.decision);
    });
  } catch (e) {
    console.error("[creative-testing] decisions", e.message || e);
  }
  return map;
}

async function loadCostsByAd(cfg, startIso, endExclusiveIso) {
  const leads = new Map();
  const sales = new Map();
  if (!cfg) return { leads, sales, ready: false };
  try {
    const loaded = await loadScheduledCallLeads(cfg, startIso, endExclusiveIso, null);
    (loaded.list || []).forEach((row) => {
      const contact = loaded.contactMap && loaded.contactMap.get(String(row.contact_id));
      if (!contact || !contact.meta_ad_id) return;
      const adId = String(contact.meta_ad_id);
      leads.set(adId, (leads.get(adId) || 0) + 1);
    });

    const transitions = await restSelect(
      cfg,
      "crm_stage_transitions",
      "select=lead_id,lead_source_table&to_stage=eq.client" +
        "&changed_at=gte." +
        encodeURIComponent(startIso) +
        "&changed_at=lt." +
        encodeURIComponent(endExclusiveIso) +
        "&lead_source_table=eq.contacts&limit=2000"
    );
    const saleIds = [...new Set((transitions || []).map((row) => String(row.lead_id || "")).filter(Boolean))];
    if (saleIds.length) {
      const inList = saleIds.map((id) => encodeURIComponent(id)).join(",");
      const soldContacts = await restSelect(
        cfg,
        "contacts",
        `select=id,meta_ad_id&id=in.(${inList})&meta_ad_id=not.is.null`
      );
      (soldContacts || []).forEach((c) => {
        if (!c || !c.meta_ad_id) return;
        const adId = String(c.meta_ad_id);
        sales.set(adId, (sales.get(adId) || 0) + 1);
      });
    }
    return { leads, sales, ready: true };
  } catch (e) {
    console.error("[creative-testing] costs", e.message || e);
    return { leads, sales, ready: false };
  }
}

module.exports = {
  listCampaigns,
  listAdSets,
  listAds,
  STOP_IMPRESSIONS,
};
