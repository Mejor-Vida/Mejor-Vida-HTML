/**
 * Stage 1: New and Contacted clients Julie calls every day.
 * They stay until they have been in the CRM for 7 days (America/Chicago),
 * or the stage is no longer New or Contacted (including Engaged).
 */
(function (root, factory) {
  var api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (root) root.CrmStage1 = api;
})(typeof window !== "undefined" ? window : globalThis, function () {
  var STAGE1_DAYS = 7;

  function chicagoYmd(date) {
    try {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/Chicago",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    } catch (e) {
      return "";
    }
  }

  function daysInCrm(createdAt, now) {
    if (!createdAt) return null;
    var start = new Date(createdAt);
    if (Number.isNaN(start.getTime())) return null;
    var from = chicagoYmd(start);
    var to = chicagoYmd(now || new Date());
    if (!from || !to) return null;
    var ms = Date.parse(to + "T12:00:00Z") - Date.parse(from + "T12:00:00Z");
    return Math.round(ms / 86400000);
  }

  function stageKey(lead) {
    return String((lead && lead.pipeline_stage) || "")
      .trim()
      .toLowerCase();
  }

  function isArchived(lead) {
    if (!lead) return false;
    if (lead.archived_at) return true;
    var status = String(lead.status || "").toLowerCase();
    return status === "archived";
  }

  function isStage1Lead(lead, now) {
    if (!lead || isArchived(lead)) return false;
    var stage = stageKey(lead);
    if (stage !== "new" && stage !== "contacted") return false;
    var days = daysInCrm(lead.created_at, now);
    return days != null && days >= 0 && days < STAGE1_DAYS;
  }

  /** Contacted after the first 7 days. New stays New and does not enter Stage 2. */
  function isStage2Lead(lead, now) {
    if (!lead || isArchived(lead)) return false;
    if (stageKey(lead) !== "contacted") return false;
    var days = daysInCrm(lead.created_at, now);
    return days != null && days >= STAGE1_DAYS;
  }

  /** Engaged clients Julie is working with, without a daily call. */
  function isEngagingLead(lead) {
    if (!lead || isArchived(lead)) return false;
    return stageKey(lead) === "engaged";
  }

  /** 1 on the day they were added, 7 on the last day they stay in Stage 1. */
  function stage1DayNumber(lead, now) {
    var days = daysInCrm(lead && lead.created_at, now);
    if (days == null || days < 0) return null;
    return days + 1;
  }

  return {
    STAGE1_DAYS: STAGE1_DAYS,
    daysInCrm: daysInCrm,
    isStage1Lead: isStage1Lead,
    isStage2Lead: isStage2Lead,
    isEngagingLead: isEngagingLead,
    stage1DayNumber: stage1DayNumber,
  };
});
