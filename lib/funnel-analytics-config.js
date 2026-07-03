/**
 * Funnel branch definitions for CRM product analytics (not GA4).
 */

const FUNNEL_VIEWS = {
  facebook: {
    id: "facebook",
    label: "LP Facebook",
    sources: ["facebook"],
    entryLabel: "Landing Page",
  },
  google: {
    id: "google",
    label: "LP Google ads",
    sources: ["google"],
    entryLabel: "Landing Page",
  },
  lp_direct: {
    id: "lp_direct",
    label: "LP Direct",
    sources: ["organic", "direct"],
    entryLabel: "Landing Page",
  },
  website: {
    id: "website",
    label: "Website Funnel",
    sources: ["organic", "direct"],
    entryLabel: "Website Home / Tools",
  },
};

/** Branch entry + step sequence per tool */
const TOOL_BRANCHES = {
  quote: {
    id: "quote",
    label: "Get Quote",
    terminal: false,
    steps: [
      { id: "get_quote_click", label: "Get Quote Click", match: { event_type: "click", step_name: "get_quote_click" } },
      { id: "state", label: "Step 1 — State", match: { event_type: "step_view", step_name: "state" } },
      { id: "sex", label: "Step 2 — Sex", match: { event_type: "step_view", step_name: "sex" } },
      { id: "date_of_birth", label: "Step 3 — Date of Birth", match: { event_type: "step_view", step_name: "date_of_birth" } },
      { id: "tobacco", label: "Step 4 — Tobacco", match: { event_type: "step_view", step_name: "tobacco" } },
      { id: "name", label: "Step 5 — Name", match: { event_type: "step_view", step_name: "name" } },
      { id: "email", label: "Step 6 — Email", match: { event_type: "step_view", step_name: "email" } },
      { id: "phone", label: "Step 7 — Phone", match: { event_type: "step_view", step_name: "phone" } },
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
      { id: "calc_state", label: "Step 1 — State", match: { event_type: "step_view", step_name: "calc_state" } },
      { id: "calc_ceremony", label: "Step 2 — Ceremony", match: { event_type: "step_view", step_name: "calc_ceremony" } },
      { id: "calc_funeral_costs", label: "Step 3 — Funeral Costs", match: { event_type: "step_view", step_name: "calc_funeral_costs" } },
      { id: "calc_household", label: "Step 4 — Household", match: { event_type: "step_view", step_name: "calc_household" } },
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

/** Website funnel uses shorter quote path (quote.html wizard) */
const WEBSITE_QUOTE_BRANCH = {
  id: "quote",
  label: "Get Quote",
  terminal: false,
  steps: [
    { id: "quote_cta_click", label: "Quote CTA Click", match: { event_type: "click", step_name: "quote_cta_click" } },
    { id: "form_started", label: "Form Started", match: { event_type: "step_view", step_name: "form_started" } },
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

function getBranchesForView(viewId) {
  const branches = { ...TOOL_BRANCHES };
  if (viewId === "website") {
    branches.quote = WEBSITE_QUOTE_BRANCH;
  } else if (viewId === "facebook" || viewId === "google" || viewId === "lp_direct") {
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
  return FUNNEL_VIEWS[viewId] || FUNNEL_VIEWS.facebook;
}

function allFunnelViewIds() {
  return Object.keys(FUNNEL_VIEWS);
}

module.exports = {
  FUNNEL_VIEWS,
  TOOL_BRANCHES,
  WEBSITE_QUOTE_BRANCH,
  BRANCH_ORDER,
  getBranchesForView,
  getBranchOrder,
  getFunnelView,
  allFunnelViewIds,
};
