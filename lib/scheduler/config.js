/**
 * Host availability — env fallbacks; prefer loadSchedulerSettings() in API routes.
 */
const { defaultSchedulerConfig } = require("./defaults");

function getSchedulerConfig(override) {
  const base = defaultSchedulerConfig();
  const cfg = override && typeof override === "object" ? { ...base, ...override } : base;
  return {
    ...cfg,
    googleConfigured: !!String(
      process.env.GOOGLE_CALENDAR_REFRESH_TOKEN || process.env.GMAIL_REFRESH_TOKEN || ""
    ).trim(),
  };
}

module.exports = { getSchedulerConfig, DEFAULT: defaultSchedulerConfig() };
