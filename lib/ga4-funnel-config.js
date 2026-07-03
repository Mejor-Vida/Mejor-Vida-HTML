/**
 * GA4 analytics definitions for staff CRM.
 * Matches events in js/mvi-ga4-funnel.js and gastos-finales-ads-v2/js/landing-flow.js
 */

/** Paid landing pages tracked in GA4 (Google + Facebook ads) */
const LANDING_PATH_PATTERNS = [
  "gastos-finales-ads",
  "landing-gastos-finales",
  "landing-final-expense",
];

/** Primary Meta / Facebook ad landing paths */
const FACEBOOK_LANDING_PATH_PATTERNS = ["gastos-finales-ads"];

/** Staff CRM cache keys */
const FUNNEL_KEYS = {
  WEBSITE_EVENTS: "website_events",
  LANDING_GA4: "landing_ga4",
  LANDING_FACEBOOK: "landing_facebook",
};

/** Legacy keys (pre–3-tab layout) */
const LEGACY_FUNNEL_KEYS = ["website", "landing"];

const LANDING_PATHS = {
  quote: "quote",
  calculator: "calculator",
  schedule: "schedule",
};

/**
 * Per-path funnel stages — how far users progressed on each landing objective.
 * step_viewed stages use stepName; event stages use eventName + optional paramFilter.
 */
const LANDING_QUOTE_PATH = [
  {
    id: "quote_started",
    label: "Quote Started",
    eventName: "objective_selected",
    paramFilter: { objective: "quote" },
    description: "User chose Get a free quote on the landing objective picker",
  },
  {
    id: "state",
    label: "State",
    eventName: "step_viewed",
    stepName: "state",
    description: "State selection step viewed",
  },
  {
    id: "sex",
    label: "Sex",
    eventName: "step_viewed",
    stepName: "sex",
    description: "Sex step viewed",
  },
  {
    id: "date_of_birth",
    label: "Date of Birth",
    eventName: "step_viewed",
    stepName: "date_of_birth",
    description: "Birthdate step viewed",
  },
  {
    id: "tobacco",
    label: "Tobacco",
    eventName: "step_viewed",
    stepName: "tobacco",
    description: "Tobacco step viewed",
  },
  {
    id: "name",
    label: "Name",
    eventName: "step_viewed",
    stepName: "name",
    description: "Name step viewed",
  },
  {
    id: "email",
    label: "Email",
    eventName: "step_viewed",
    stepName: "email",
    description: "Email step viewed",
  },
  {
    id: "phone",
    label: "Phone",
    eventName: "step_viewed",
    stepName: "phone",
    description: "Phone step viewed",
  },
  {
    id: "results",
    label: "Quote Results",
    eventName: "step_viewed",
    stepName: "results",
    description: "Quote results screen viewed",
  },
  {
    id: "qualify_lead",
    label: "Qualified Lead",
    eventName: "qualify_lead",
    paramFilter: { form_source: "landing_quote" },
    description: "Landing quote submitted — Google Ads conversion",
  },
];

const LANDING_CALCULATOR_PATH = [
  {
    id: "calc_started",
    label: "Calculator Started",
    eventName: "objective_selected",
    paramFilter: { objective: "calculator" },
    description: "User chose Final expense calculator on the objective picker",
  },
  {
    id: "calc_state",
    label: "Calculator — State",
    eventName: "step_viewed",
    stepName: "calc_state",
    description: "Calculator state step viewed",
  },
  {
    id: "calc_ceremony",
    label: "Burial or Cremation",
    eventName: "step_viewed",
    stepName: "calc_ceremony",
    description: "Ceremony choice step viewed",
  },
  {
    id: "calc_funeral_costs",
    label: "Funeral Costs",
    eventName: "step_viewed",
    stepName: "calc_funeral_costs",
    description: "Funeral cost tier step viewed",
  },
  {
    id: "calc_household",
    label: "Household Expenses",
    eventName: "step_viewed",
    stepName: "calc_household",
    description: "Household expense step viewed",
  },
  {
    id: "calc_results",
    label: "Calculator Results",
    eventName: "step_viewed",
    stepName: "calc_results",
    description: "Calculator results screen viewed",
  },
];

const LANDING_SCHEDULE_PATH = [
  {
    id: "schedule_started",
    label: "Schedule Started",
    eventName: "objective_selected",
    paramFilter: { objective: "schedule" },
    description: "User chose Schedule a call on the objective picker",
  },
  {
    id: "schedule_modal_opened",
    label: "Schedule Modal Opened",
    eventName: "schedule_modal_opened",
    description: "HubSpot schedule modal opened from landing",
  },
  {
    id: "appointment_booked",
    label: "Appointment Booked",
    eventName: "appointment_booked",
    description: "HubSpot meeting booked from landing flow",
  },
  {
    id: "close_convert_lead",
    label: "Close / Convert Lead",
    eventName: "close_convert_lead",
    description: "Final conversion paired with appointment booking",
  },
];

/** Meta-aligned note stages for Facebook quote path (same GA4 events, FB traffic only) */
const FACEBOOK_META_QUOTE_NOTE =
  "Meta Pixel: PageView on load, ViewContent at state step, Lead on quote submit.";

const LANDING_PATH_CONFIG = {
  quote: LANDING_QUOTE_PATH,
  calculator: LANDING_CALCULATOR_PATH,
  schedule: LANDING_SCHEDULE_PATH,
};

/** Known website events (also fetches any other events returned by GA4 on website paths) */
const WEBSITE_EVENT_CATALOG = [
  {
    id: "page_view",
    label: "Page View",
    eventName: "page_view",
    description: "Page load on main website (homepage, blog, quote, carriers, etc.)",
  },
  {
    id: "quote_cta_clicked",
    label: "Quote CTA Clicked",
    eventName: "quote_cta_clicked",
    description: "Clicked a link to the quote wizard from header, hero, footer, or body",
  },
  {
    id: "form_steps_completed",
    label: "Form Steps Completed",
    eventName: "form_steps_completed",
    paramFilter: { form_source: "nebraska_quote_wizard" },
    description: "Completed all quote wizard steps on quote.html",
  },
  {
    id: "quote_submitted",
    label: "Quote Submitted",
    eventName: "quote_submitted",
    paramFilter: { form_source: "nebraska_quote_wizard" },
    description: "Quote form submitted on quote.html",
  },
  {
    id: "qualify_lead",
    label: "Qualified Lead",
    eventName: "qualify_lead",
    paramFilter: { form_source: "nebraska_quote_wizard" },
    description: "Lead qualified after quote submission",
  },
  {
    id: "appointment_booked",
    label: "Appointment Booked",
    eventName: "appointment_booked",
    description: "HubSpot meeting booked from quote results or schedule page",
  },
  {
    id: "close_convert_lead",
    label: "Close / Convert Lead",
    eventName: "close_convert_lead",
    description: "Final conversion event paired with appointment booking",
  },
  {
    id: "user_engagement",
    label: "User Engagement",
    eventName: "user_engagement",
    description: "GA4 automatic engagement event",
  },
  {
    id: "session_start",
    label: "Session Start",
    eventName: "session_start",
    description: "GA4 automatic session start",
  },
  {
    id: "first_visit",
    label: "First Visit",
    eventName: "first_visit",
    description: "GA4 automatic first visit",
  },
];

function isLandingPath(pagePath) {
  const p = String(pagePath || "").toLowerCase();
  return LANDING_PATH_PATTERNS.some((pat) => p.includes(pat));
}

function getLandingPathConfig(pathKey) {
  return LANDING_PATH_CONFIG[pathKey] || [];
}

function getAllLandingPathKeys() {
  return Object.keys(LANDING_PATH_CONFIG);
}

function getWebsiteEventCatalog() {
  return WEBSITE_EVENT_CATALOG;
}

function allEventNames() {
  const names = new Set();
  WEBSITE_EVENT_CATALOG.forEach((e) => names.add(e.eventName));
  Object.values(LANDING_PATH_CONFIG).forEach((path) => {
    path.forEach((s) => names.add(s.eventName));
  });
  names.add("step_viewed");
  names.add("step_completed");
  names.add("quote_cta_clicked");
  return [...names];
}

/** @deprecated use getWebsiteEventCatalog */
const WEBSITE_FUNNEL = WEBSITE_EVENT_CATALOG;

/** @deprecated use LANDING_QUOTE_PATH */
const LANDING_FUNNEL = LANDING_QUOTE_PATH;

/** @deprecated */
const LANDING_STEP_STAGES = LANDING_QUOTE_PATH.filter((s) => s.stepName).map((s) => ({
  id: s.id,
  label: s.label,
  stepName: s.stepName,
}));

function getFunnelConfig(funnelKey) {
  if (funnelKey === "landing") return LANDING_QUOTE_PATH;
  if (funnelKey === "website") return WEBSITE_EVENT_CATALOG;
  return WEBSITE_EVENT_CATALOG;
}

module.exports = {
  LANDING_PATH_PATTERNS,
  FACEBOOK_LANDING_PATH_PATTERNS,
  FUNNEL_KEYS,
  LEGACY_FUNNEL_KEYS,
  LANDING_PATHS,
  LANDING_QUOTE_PATH,
  LANDING_CALCULATOR_PATH,
  LANDING_SCHEDULE_PATH,
  LANDING_PATH_CONFIG,
  WEBSITE_EVENT_CATALOG,
  WEBSITE_FUNNEL,
  LANDING_FUNNEL,
  LANDING_STEP_STAGES,
  FACEBOOK_META_QUOTE_NOTE,
  isLandingPath,
  getLandingPathConfig,
  getAllLandingPathKeys,
  getWebsiteEventCatalog,
  getFunnelConfig,
  allEventNames,
};
