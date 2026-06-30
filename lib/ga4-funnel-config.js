/**
 * GA4 funnel stage definitions for website vs landing page analytics.
 * Matches events fired in js/mvi-ga4-funnel.js and gastos-finales-ads-v2/js/landing-flow.js
 */

const LANDING_PATH_PATTERNS = [
  "gastos-finales-ads",
  "landing-gastos-finales",
  "landing-final-expense",
];

const WEBSITE_FUNNEL = [
  {
    id: "page_view",
    label: "Page View",
    eventName: "page_view",
    description: "Any page load on the main website (homepage, blog, carriers, etc.)",
  },
  {
    id: "quote_cta_clicked",
    label: "Quote CTA Clicked",
    eventName: "quote_cta_clicked",
    description: "User clicked a link to the quote wizard from header, hero, footer, or page body",
  },
  {
    id: "form_steps_completed",
    label: "Form Steps Completed",
    eventName: "form_steps_completed",
    paramFilter: { form_source: "nebraska_quote_wizard" },
    description: "User completed all quote wizard steps on quote.html",
  },
  {
    id: "quote_submitted",
    label: "Quote Submitted",
    eventName: "quote_submitted",
    paramFilter: { form_source: "nebraska_quote_wizard" },
    description: "Quote form submitted with Nebraska wizard data",
  },
  {
    id: "qualify_lead",
    label: "Qualified Lead",
    eventName: "qualify_lead",
    paramFilter: { form_source: "nebraska_quote_wizard" },
    description: "Lead qualified after quote submission (Google Ads conversion)",
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
];

const LANDING_FUNNEL = [
  {
    id: "page_view",
    label: "Landing Page View",
    eventName: "page_view",
    description: "Page load on paid landing pages (gastos-finales-ads, v2, legacy)",
  },
  {
    id: "objective_selected",
    label: "Objective Selected",
    eventName: "objective_selected",
    description: "User chose quote, calculator, or schedule on landing objective picker",
  },
  {
    id: "quote_cta_clicked",
    label: "Quote CTA Clicked",
    eventName: "quote_cta_clicked",
    description: "User clicked to start the quote flow from landing",
  },
  {
    id: "form_steps_completed",
    label: "Form Steps Completed",
    eventName: "form_steps_completed",
    paramFilter: { form_source: "landing_quote" },
    description: "User completed all landing quote wizard steps",
  },
  {
    id: "quote_submitted",
    label: "Quote Submitted",
    eventName: "quote_submitted",
    paramFilter: { form_source: "landing_quote" },
    description: "Landing quote form submitted",
  },
  {
    id: "qualify_lead",
    label: "Qualified Lead",
    eventName: "qualify_lead",
    paramFilter: { form_source: "landing_quote" },
    description: "Lead qualified after landing quote submission",
  },
  {
    id: "schedule_modal_opened",
    label: "Schedule Modal Opened",
    eventName: "schedule_modal_opened",
    description: "User opened the schedule-a-call modal on landing results",
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
    description: "Final conversion event paired with appointment booking",
  },
];

/** Landing wizard step breakdown (step_viewed events) */
const LANDING_STEP_STAGES = [
  { id: "objective_picker", label: "Objective Picker", stepName: "objective_picker" },
  { id: "state", label: "State", stepName: "state" },
  { id: "sex", label: "Sex", stepName: "sex" },
  { id: "date_of_birth", label: "Date of Birth", stepName: "date_of_birth" },
  { id: "tobacco", label: "Tobacco", stepName: "tobacco" },
  { id: "name", label: "Name", stepName: "name" },
  { id: "email", label: "Email", stepName: "email" },
  { id: "phone", label: "Phone", stepName: "phone" },
  { id: "results", label: "Results", stepName: "results" },
];

function isLandingPath(pagePath) {
  const p = String(pagePath || "").toLowerCase();
  return LANDING_PATH_PATTERNS.some((pat) => p.includes(pat));
}

function getFunnelConfig(funnelKey) {
  if (funnelKey === "landing") return LANDING_FUNNEL;
  return WEBSITE_FUNNEL;
}

function allEventNames() {
  const names = new Set();
  [...WEBSITE_FUNNEL, ...LANDING_FUNNEL].forEach((s) => names.add(s.eventName));
  names.add("step_viewed");
  names.add("step_completed");
  return [...names];
}

module.exports = {
  LANDING_PATH_PATTERNS,
  WEBSITE_FUNNEL,
  LANDING_FUNNEL,
  LANDING_STEP_STAGES,
  isLandingPath,
  getFunnelConfig,
  allEventNames,
};
