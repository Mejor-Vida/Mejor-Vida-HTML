/**
 * Integrity Connect–style client lifecycle stages for staff CRM.
 */
(function () {
  "use strict";

  var CLIENT_STAGES = [
    { key: "new", color: "#27ae60" },
    { key: "contacted", color: "#e67e22" },
    { key: "engaged", color: "#5dade2" },
    { key: "client", color: "#1a5276" },
    { key: "retained", color: "#5b2c6f" },
    { key: "loyal", color: "#c9a227" },
    { key: "lost", color: "#95a5a6" },
    { key: "enrolled", color: "#2980b9" },
  ];

  var LEGACY_MAP = {
    new_lead: "new",
    new: "new",
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
    retained: "retained",
    loyal: "loyal",
    enrolled: "enrolled",
    contacted: "contacted",
    engaged: "engaged",
    client: "client",
    lost: "lost",
  };

  var VALID_KEYS = {};
  CLIENT_STAGES.forEach(function (s) {
    VALID_KEYS[s.key] = true;
  });

  function t(key) {
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key);
    return key;
  }

  function normalizeStage(raw) {
    var v = String(raw == null ? "" : raw).trim().toLowerCase();
    if (!v) return "";
    if (VALID_KEYS[v]) return v;
    if (LEGACY_MAP[v]) return LEGACY_MAP[v];
    return "";
  }

  function stageLabel(key) {
    var k = normalizeStage(key);
    if (!k) return t("ov_stage_select");
    return t("ov_stage_" + k);
  }

  function stageColor(key) {
    var k = normalizeStage(key);
    for (var i = 0; i < CLIENT_STAGES.length; i++) {
      if (CLIENT_STAGES[i].key === k) return CLIENT_STAGES[i].color;
    }
    return "#bdc3c7";
  }

  /** 1-based position in the client lifecycle pipeline (empty stage → null). */
  function stageNumber(key) {
    var k = normalizeStage(key);
    if (!k) return null;
    for (var i = 0; i < CLIENT_STAGES.length; i++) {
      if (CLIENT_STAGES[i].key === k) return i + 1;
    }
    return null;
  }

  function isValidStage(key) {
    var k = String(key == null ? "" : key).trim();
    if (!k) return true;
    return !!VALID_KEYS[k];
  }

  function buildStageOptions(selectedRaw) {
    var selected = normalizeStage(selectedRaw);
    var html =
      '<option value="">' +
      (window.StaffCrm && window.StaffCrm.esc
        ? window.StaffCrm.esc(t("ov_stage_select"))
        : t("ov_stage_select")) +
      "</option>";
    CLIENT_STAGES.forEach(function (s) {
      var label = stageLabel(s.key);
      var sel = selected === s.key ? " selected" : "";
      var esc =
        window.StaffCrm && window.StaffCrm.esc
          ? window.StaffCrm.esc
          : function (x) {
              return String(x);
            };
      html +=
        '<option value="' +
        esc(s.key) +
        '"' +
        sel +
        " data-color=\"" +
        esc(s.color) +
        '">' +
        esc(label) +
        "</option>";
    });
    return html;
  }

  function renderStagePicker(leadId, pipelineStage, esc, ariaLabel) {
    var escFn =
      esc ||
      function (x) {
        return String(x == null ? "" : x);
      };
    var norm = normalizeStage(pipelineStage);
    var label = norm ? stageLabel(norm) : t("ov_stage_select");
    var color = stageColor(norm);
    var items = CLIENT_STAGES.map(function (s) {
      var sel = norm === s.key ? " is-selected" : "";
      return (
        '<li><button type="button" class="crm-stage-option' +
        sel +
        '" data-value="' +
        escFn(s.key) +
        '">' +
        '<span class="crm-stage-dot" style="background:' +
        escFn(s.color) +
        '"></span>' +
        escFn(stageLabel(s.key)) +
        "</button></li>"
      );
    }).join("");
    return (
      '<div class="crm-stage-picker" data-id="' +
      escFn(leadId) +
      '" data-stage="' +
      escFn(norm) +
      '">' +
      '<button type="button" class="crm-stage-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="' +
      escFn(ariaLabel || t("col_stage")) +
      '">' +
      '<span class="crm-stage-dot" style="background:' +
      escFn(color) +
      '"></span>' +
      '<span class="crm-stage-label">' +
      escFn(label) +
      "</span>" +
      '<span class="crm-stage-caret" aria-hidden="true">▾</span>' +
      "</button>" +
      '<ul class="crm-stage-menu hidden" role="listbox">' +
      '<li><button type="button" class="crm-stage-option' +
      (!norm ? " is-selected" : "") +
      '" data-value="">' +
      '<span class="crm-stage-dot crm-stage-dot-empty"></span>' +
      escFn(t("ov_stage_select")) +
      "</button></li>" +
      items +
      "</ul></div>"
    );
  }

  function renderStageFilterHeader(currentFilter, escFn) {
    var escF =
      escFn ||
      function (x) {
        return String(x == null ? "" : x);
      };
    var filter = normalizeStage(currentFilter);
    var label = filter ? stageLabel(filter) : t("col_stage_all");
    var color = filter ? stageColor(filter) : "#bdc3c7";
    var items = CLIENT_STAGES.map(function (s) {
      var sel = filter === s.key ? " is-selected" : "";
      return (
        '<li><button type="button" class="crm-stage-option' +
        sel +
        '" data-value="' +
        escF(s.key) +
        '">' +
        '<span class="crm-stage-dot" style="background:' +
        escF(s.color) +
        '"></span>' +
        escF(stageLabel(s.key)) +
        "</button></li>"
      );
    }).join("");
    return (
      '<div class="crm-stage-picker crm-stage-filter-header' +
      (filter ? " is-active" : "") +
      '" id="crm-stage-filter-picker" data-stage="' +
      escF(filter) +
      '">' +
      '<button type="button" class="crm-stage-trigger crm-stage-filter-trigger" aria-haspopup="listbox" aria-expanded="false" aria-label="' +
      escF(t("col_stage_filter")) +
      '">' +
      (filter
        ? '<span class="crm-stage-dot" style="background:' + escF(color) + '"></span>'
        : "") +
      '<span class="crm-stage-label">' +
      escF(label) +
      "</span>" +
      '<span class="crm-stage-caret" aria-hidden="true">▾</span>' +
      "</button>" +
      '<ul class="crm-stage-menu hidden" role="listbox">' +
      '<li><button type="button" class="crm-stage-option' +
      (!filter ? " is-selected" : "") +
      '" data-value="">' +
      '<span class="crm-stage-dot crm-stage-dot-empty"></span>' +
      escF(t("col_stage_all")) +
      "</button></li>" +
      items +
      "</ul></div>"
    );
  }

  window.StaffCrmStages = {
    CLIENT_STAGES: CLIENT_STAGES,
    VALID_KEYS: VALID_KEYS,
    normalizeStage: normalizeStage,
    stageLabel: stageLabel,
    stageColor: stageColor,
    stageNumber: stageNumber,
    isValidStage: isValidStage,
    buildStageOptions: buildStageOptions,
    renderStagePicker: renderStagePicker,
    renderStageFilterHeader: renderStageFilterHeader,
  };
})();
