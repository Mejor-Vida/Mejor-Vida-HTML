/**
 * Funnel branch definitions for CRM product analytics (not GA4).
 * Views = traffic source × surface. Facebook ads land on quote.html;
 * organic, direct, and Google Ads can land on any site page.
 */

const SOURCE_LABELS = {
  facebook: "Facebook",
  google: "Google Ads",
  direct: "Direct",
  organic: "Organic",
};

const LANDING_LABELS = {
  v2: "V2",
  v3: "V3",
  website: "Website",
};

function surfaceLabel(source, landingPage) {
  if (source === "facebook" && landingPage === "website") return "Quote page";
  return LANDING_LABELS[landingPage] || "Website";
}

function surfaceEntryLabel(source, landingPage) {
  if (landingPage !== "website") return "Landing Page";
  if (source === "facebook") return "Quote page";
  return "Website";
}

function buildFunnelViews() {
  const views = {};
  ["facebook", "google", "direct"].forEach((source) => {
    ["v2", "v3", "website"].forEach((landingPage) => {
      const id = source + "_" + landingPage;
      views[id] = {
        id,
        label: SOURCE_LABELS[source] + " · " + surfaceLabel(source, landingPage),
        sources: [source],
        landingPage,
        entryLabel: surfaceEntryLabel(source, landingPage),
      };
    });
  });
  views.organic_website = {
    id: "organic_website",
    label: SOURCE_LABELS.organic + " · " + LANDING_LABELS.website,
    sources: ["organic"],
    landingPage: "website",
    entryLabel: "Website",
  };
  return views;
}

const FUNNEL_VIEWS = buildFunnelViews();

/** Legacy view ids → new matrix ids */
const VIEW_ALIASES = {
  facebook: "facebook_website",
  facebook_v2: "facebook_v2",
  facebook_v3: "facebook_v3",
  facebook_website: "facebook_website",
  google: "google_website",
  lp_direct: "direct_v2",
  website: "organic_website",
};

/** Branch entry + step sequence per tool */
const TOOL_BRANCHES = {
  quote: {
    id: "quote",
    label: "Get Quote",
    terminal: false,
    steps: [
      { id: "get_quote_click", label: "Get Quote Click", match: { event_type: "click", step_name: "get_quote_click" } },
      { id: "state", label: "Step 1 — State", match: { event_type: "step_complete", step_name: "state" } },
      { id: "sex", label: "Step 2 — Sex", match: { event_type: "step_complete", step_name: "sex" } },
      { id: "date_of_birth", label: "Step 3 — Date of Birth", match: { event_type: "step_complete", step_name: "date_of_birth" } },
      { id: "tobacco", label: "Step 4 — Tobacco", match: { event_type: "step_complete", step_name: "tobacco" } },
      { id: "name", label: "Step 5 — Name", match: { event_type: "step_complete", step_name: "name" } },
      { id: "email", label: "Step 6 — Email", match: { event_type: "step_complete", step_name: "email" } },
      { id: "phone", label: "Step 7 — Phone", match: { event_type: "step_complete", step_name: "phone" } },
      { id: "quote_result", label: "Quote Result", match: { event_type: "step_view", step_name: "quote_result" } },
      { id: "lead_submitted", label: "Lead Submitted", match: { event_type: "conversion", step_name: "lead_submitted" } },
    ],
  },
  calculator: {
    id: "calculator",
    label: "FE Calculator",
    terminal: false,
    steps: [
      { id: "calculator_click", label: "Calculator Click", match: { event_type: "click", step_name: "calculator_click" } },
      { id: "calc_state", label: "Step 1 — State", match: { event_type: "step_complete", step_name: "calc_state" } },
      { id: "calc_ceremony", label: "Step 2 — Ceremony", match: { event_type: "step_complete", step_name: "calc_ceremony" } },
      { id: "calc_funeral_costs", label: "Step 3 — Funeral Costs", match: { event_type: "step_complete", step_name: "calc_funeral_costs" } },
      { id: "calc_household", label: "Step 4 — Household", match: { event_type: "step_complete", step_name: "calc_household" } },
      { id: "calc_results", label: "Results Viewed", match: { event_type: "step_view", step_name: "calc_results" } },
    ],
  },
  schedule: {
    id: "schedule",
    label: "Schedule Call",
    terminal: false,
    steps: [
      { id: "schedule_click", label: "Schedule Click", match: { event_type: "click", step_name: "schedule_click" } },
      { id: "calendar_opened", label: "Calendar Opened", match: { event_type: "step_view", step_name: "calendar_opened" } },
      { id: "date_selected", label: "Date Selected", match: { event_type: "step_view", step_name: "date_selected" } },
      { id: "time_selected", label: "Time Selected", match: { event_type: "step_view", step_name: "time_selected" } },
      { id: "booking_confirmed", label: "Booking Confirmed", match: { event_type: "conversion", step_name: "booking_confirmed" } },
    ],
  },
  bio: {
    id: "bio",
    label: "Bio Page",
    terminal: true,
    steps: [
      { id: "bio_click", label: "Bio Page Click", match: { event_type: "click", step_name: "bio_click" } },
    ],
  },
  whatsapp: {
    id: "whatsapp",
    label: "WhatsApp",
    terminal: true,
    steps: [
      { id: "whatsapp_click", label: "WhatsApp Click", match: { event_type: "click", step_name: "whatsapp_click" } },
    ],
  },
};

/** Website quote.html wizard — granular steps + legacy aggregate nodes */
const WEBSITE_QUOTE_BRANCH = {
  id: "quote",
  label: "Get Quote",
  terminal: false,
  steps: [
    { id: "quote_cta_click", label: "Quote CTA Click", match: { event_type: "click", step_name: "quote_cta_click" } },
    { id: "quote_page_view", label: "Quote Page View", match: { event_type: "step_view", step_name: "quote_page_view" } },
    { id: "form_started", label: "Form Started", match: { event_type: "step_view", step_name: "form_started" } },
    { id: "sex", label: "Step 1 — Gender", match: { event_type: "step_complete", step_name: "sex" } },
    { id: "date_of_birth", label: "Step 2 — Date of Birth", match: { event_type: "step_complete", step_name: "date_of_birth" } },
    { id: "state", label: "Step 3 — State", match: { event_type: "step_complete", step_name: "state" } },
    { id: "tobacco", label: "Step 4 — Tobacco", match: { event_type: "step_complete", step_name: "tobacco" } },
    { id: "coverage", label: "Step 5 — Coverage", match: { event_type: "step_complete", step_name: "coverage" } },
    { id: "form_steps_done", label: "Form Steps Completed", match: { event_type: "step_view", step_name: "form_steps_done" } },
    { id: "quote_submitted", label: "Quote Submitted", match: { event_type: "conversion", step_name: "quote_submitted" } },
    { id: "qualify_lead", label: "Qualified Lead", match: { event_type: "conversion", step_name: "qualify_lead" } },
  ],
};

const BRANCH_ORDER = ["quote", "calculator", "schedule", "bio", "whatsapp"];

const LP_QUOTE_LANDING_STEP = {
  id: "landing",
  label: "Landing Page View",
  match: { event_type: "step_view", step_name: "landing" },
};

function normalizeViewId(viewId) {
  const id = String(viewId || "facebook_website").trim();
  return VIEW_ALIASES[id] || id;
}

function isWebsiteLandingView(viewId) {
  const v = getFunnelView(viewId);
  return v.landingPage === "website";
}

function getBranchesForView(viewId) {
  const id = normalizeViewId(viewId);
  const view = getFunnelView(id);
  const branches = { ...TOOL_BRANCHES };

  if (view.landingPage === "website") {
    branches.quote = WEBSITE_QUOTE_BRANCH;
  } else {
    branches.quote = {
      ...TOOL_BRANCHES.quote,
      steps: [LP_QUOTE_LANDING_STEP, ...TOOL_BRANCHES.quote.steps],
    };
  }
  return branches;
}

function getBranchOrder() {
  return BRANCH_ORDER.slice();
}

function getFunnelView(viewId) {
  const id = normalizeViewId(viewId);
  return FUNNEL_VIEWS[id] || FUNNEL_VIEWS.facebook_website;
}

function allFunnelViewIds() {
  return Object.keys(FUNNEL_VIEWS);
}

function funnelSourceChannels() {
  return ["facebook", "google", "direct", "organic"];
}

function landingPagesForSource() {
  return ["website"];
}

function composeViewId(source, landingPage) {
  return String(source || "facebook").trim() + "_" + String(landingPage || "website").trim();
}

function parseViewId(viewId) {
  const id = normalizeViewId(viewId);
  const view = getFunnelView(id);
  if (!view) return { source: "facebook", landingPage: "website", viewId: "facebook_website" };
  const landingPage = view.landingPage || "website";
  const source = (view.sources && view.sources[0]) || id.split("_")[0];
  return { source, landingPage, viewId: id };
}

/** Map funnel tab ids to ad platform API view (Meta / Google). */
function resolveAdPlatformView(viewId) {
  const { source } = parseViewId(viewId);
  if (source === "facebook") return "facebook";
  if (source === "google") return "google";
  return source;
}

function viewShowsAdMetrics(viewId) {
  const { source } = parseViewId(viewId);
  return source === "facebook" || source === "google";
}

function viewShowsGsc(viewId) {
  return normalizeViewId(viewId) === "organic_website";
}

function viewShowsGoogleAdsKeywords(viewId) {
  return parseViewId(viewId).source === "google";
}

module.exports = {
  FUNNEL_VIEWS,
  VIEW_ALIASES,
  TOOL_BRANCHES,
  WEBSITE_QUOTE_BRANCH,
  BRANCH_ORDER,
  getBranchesForView,
  getBranchOrder,
  getFunnelView,
  allFunnelViewIds,
  normalizeViewId,
  isWebsiteLandingView,
  funnelSourceChannels,
  landingPagesForSource,
  composeViewId,
  parseViewId,
  resolveAdPlatformView,
  viewShowsAdMetrics,
  viewShowsGsc,
  viewShowsGoogleAdsKeywords,
  SOURCE_LABELS,
  LANDING_LABELS,
};
