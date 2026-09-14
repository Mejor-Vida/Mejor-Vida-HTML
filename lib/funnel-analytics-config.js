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
  landing: "Landing page",
  whatsapp: "WhatsApp",
};

function surfaceLabel(source, landingPage) {
  if (source === "facebook" && landingPage === "website") return "Quote page";
  if (source === "facebook" && landingPage === "landing") return "Landing page";
  if (source === "facebook" && landingPage === "whatsapp") return "WhatsApp";
  return LANDING_LABELS[landingPage] || "Website";
}

function surfaceEntryLabel(source, landingPage) {
  if (landingPage === "whatsapp") return "WhatsApp";
  if (landingPage === "landing" || landingPage === "v2" || landingPage === "v3") {
    return "Landing Page";
  }
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
  views.facebook_landing = {
    id: "facebook_landing",
    label: SOURCE_LABELS.facebook + " · " + LANDING_LABELS.landing,
    sources: ["facebook"],
    landingPage: "landing",
    entryLabel: "Landing Page",
  };
  views.facebook_whatsapp = {
    id: "facebook_whatsapp",
    label: SOURCE_LABELS.facebook + " · " + LANDING_LABELS.whatsapp,
    sources: ["facebook"],
    landingPage: "whatsapp",
    entryLabel: "WhatsApp",
  };
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
  facebook: "facebook_landing",
  facebook_v2: "facebook_v2",
  facebook_v3: "facebook_v3",
  facebook_website: "facebook_website",
  facebook_landing: "facebook_landing",
  facebook_whatsapp: "facebook_whatsapp",
  google: "google_website",
  lp_direct: "direct_v2",
  website: "organic_website",
};

/** V2 landing: objective picker, then quote / calc / schedule. */
const TOOL_BRANCHES = {
  quote: {
    id: "quote",
    label: "Get Quote",
    terminal: false,
    steps: [
      { id: "get_quote_click", label: "Get Quote Click", match: { event_type: "click", step_name: "get_quote_click" } },
      { id: "licenses_open", label: "Licenses opened", match: { event_type: "click", step_name: "licenses_open" } },
      { id: "contact_submit", label: "Contact submit", match: { event_type: "click", step_name: "contact_submit" } },
      { id: "lead_submitted", label: "Lead Submitted", match: { event_type: "conversion", step_name: "lead_submitted" } },
      { id: "state", label: "Step — State", match: { event_type: "step_complete", step_name: "state" } },
      { id: "sex", label: "Step — Sex", match: { event_type: "step_complete", step_name: "sex" } },
      { id: "date_of_birth", label: "Step — Date of Birth", match: { event_type: "step_complete", step_name: "date_of_birth" } },
      { id: "tobacco", label: "Step — Tobacco", match: { event_type: "step_complete", step_name: "tobacco" } },
      { id: "email", label: "Step — Email", match: { event_type: "step_complete", step_name: "email" } },
      { id: "quote_result", label: "Quote Result", match: { event_type: "step_view", step_name: "quote_result" } },
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

/** Facebook ads V3 (gastos-finales-ads-v3): contact form first, then quote questions. */
const CONTACT_FIRST_QUOTE_BRANCH = {
  id: "quote",
  label: "Get Quote",
  terminal: false,
  steps: [
    { id: "landing", label: "Contact form", match: { event_type: "step_view", step_name: "landing" } },
    { id: "contact_submit", label: "Contact submit", match: { event_type: "click", step_name: "contact_submit" } },
    { id: "lead_submitted", label: "Lead saved", match: { event_type: "conversion", step_name: "lead_submitted" } },
    { id: "quote_started", label: "Quote started", match: { event_type: "click", step_name: "get_quote_click" } },
    { id: "state", label: "Step — State", match: { event_type: "step_complete", step_name: "state" } },
    { id: "sex", label: "Step — Sex", match: { event_type: "step_complete", step_name: "sex" } },
    { id: "date_of_birth", label: "Step — Date of Birth", match: { event_type: "step_complete", step_name: "date_of_birth" } },
    { id: "tobacco", label: "Step — Tobacco", match: { event_type: "step_complete", step_name: "tobacco" } },
    { id: "email", label: "Step — Email", match: { event_type: "step_complete", step_name: "email" } },
    { id: "quote_result", label: "Quote result", match: { event_type: "step_view", step_name: "quote_result" } },
  ],
};

const PHONE_BRANCH = {
  id: "phone",
  label: "Help call",
  terminal: true,
  steps: [
    { id: "phone_click", label: "Phone click", match: { event_type: "click", step_name: "phone_click" } },
  ],
};

/** Click-to-WhatsApp ads — counts come from Meta + ManyChat, not website sessions. */
const WHATSAPP_AD_BRANCH = {
  id: "whatsapp",
  label: "WhatsApp ads",
  terminal: false,
  steps: [
    { id: "ad_clicks", label: "Ad clicks" },
    { id: "conversations", label: "Conversations started" },
    { id: "bot_leads", label: "ManyChat leads" },
    { id: "quoted", label: "Quote in chat" },
  ],
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
const CONTACT_FIRST_BRANCH_ORDER = ["quote", "calculator", "schedule", "whatsapp", "phone"];

const LP_QUOTE_LANDING_STEP = {
  id: "landing",
  label: "Landing Page View",
  match: { event_type: "step_view", step_name: "landing" },
};

function normalizeViewId(viewId) {
  const id = String(viewId || "facebook_landing").trim();
  return VIEW_ALIASES[id] || id;
}

function isWebsiteLandingView(viewId) {
  const v = getFunnelView(viewId);
  return v.landingPage === "website";
}

function isContactFirstLandingView(viewId) {
  const v = getFunnelView(viewId);
  return v.landingPage === "landing" || v.landingPage === "v3";
}

function getBranchesForView(viewId) {
  const id = normalizeViewId(viewId);
  const view = getFunnelView(id);
  if (view.landingPage === "whatsapp") {
    return { whatsapp: WHATSAPP_AD_BRANCH };
  }
  const branches = { ...TOOL_BRANCHES };

  if (view.landingPage === "website") {
    branches.quote = WEBSITE_QUOTE_BRANCH;
  } else if (isContactFirstLandingView(id)) {
    branches.quote = CONTACT_FIRST_QUOTE_BRANCH;
    delete branches.bio;
    branches.phone = PHONE_BRANCH;
  } else {
    branches.quote = {
      ...TOOL_BRANCHES.quote,
      steps: [LP_QUOTE_LANDING_STEP, ...TOOL_BRANCHES.quote.steps],
    };
  }
  return branches;
}

function getBranchOrder(viewId) {
  const id = normalizeViewId(viewId);
  const view = getFunnelView(id);
  if (view.landingPage === "whatsapp") return ["whatsapp"];
  if (isContactFirstLandingView(id)) return CONTACT_FIRST_BRANCH_ORDER.slice();
  return BRANCH_ORDER.slice();
}

function getFunnelView(viewId) {
  const id = normalizeViewId(viewId);
  return FUNNEL_VIEWS[id] || FUNNEL_VIEWS.facebook_landing;
}

function allFunnelViewIds() {
  return Object.keys(FUNNEL_VIEWS);
}

function funnelSourceChannels() {
  return ["facebook", "google", "direct", "organic"];
}

function landingPagesForSource(source) {
  if (source === "facebook") return ["landing", "whatsapp"];
  return ["website"];
}

function composeViewId(source, landingPage) {
  const src = String(source || "facebook").trim();
  const landing = String(landingPage || (src === "facebook" ? "landing" : "website")).trim();
  return src + "_" + landing;
}

function parseViewId(viewId) {
  const id = normalizeViewId(viewId);
  const view = getFunnelView(id);
  if (!view) return { source: "facebook", landingPage: "landing", viewId: "facebook_landing" };
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
  CONTACT_FIRST_QUOTE_BRANCH,
  PHONE_BRANCH,
  WEBSITE_QUOTE_BRANCH,
  WHATSAPP_AD_BRANCH,
  BRANCH_ORDER,
  CONTACT_FIRST_BRANCH_ORDER,
  getBranchesForView,
  getBranchOrder,
  getFunnelView,
  allFunnelViewIds,
  normalizeViewId,
  isWebsiteLandingView,
  isContactFirstLandingView,
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
