/**
 * CRM Nurture Settings — editable times, cadence, rollout status, message preview.
 */
(function () {
  "use strict";

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s == null ? "" : s);
  }

  async function api(path, body, opts) {
    var shell = window.StaffCrm;
    if (!shell || !shell.authedApi) throw new Error("StaffCrm not ready");
    return shell.authedApi(path, body, opts);
  }

  function field(label, id, value, type) {
    type = type || "text";
    return (
      '<label class="crm-field-label" for="' +
      esc(id) +
      '">' +
      esc(label) +
      '</label><input class="crm-input" type="' +
      esc(type) +
      '" id="' +
      esc(id) +
      '" value="' +
      esc(value == null ? "" : value) +
      '" />'
    );
  }

  function renderRolloutBanner(rollout) {
    rollout = rollout || {};
    if (rollout.live) {
      return (
        '<div class="crm-card crm-nurture-rollout-live" style="margin-bottom:16px;border-color:#c0392b">' +
        "<strong>" +
        esc(t("nurture_rollout_live_title")) +
        "</strong><p>" +
        esc(t("nurture_rollout_live_body")) +
        "</p></div>"
      );
    }
    var emails = (rollout.allowlist_emails || []).map(esc).join(", ");
    var names = (rollout.allowlist_names || []).map(esc).join(", ");
    return (
      '<div class="crm-card crm-nurture-rollout-testing" style="margin-bottom:16px;border-color:#e67e22;background:#fffaf5">' +
      "<strong>" +
      esc(t("nurture_rollout_testing_title")) +
      "</strong><p>" +
      esc(t("nurture_rollout_testing_body")) +
      "</p>" +
      "<p><strong>" +
      esc(t("nurture_rollout_allowlist_emails")) +
      ":</strong> " +
      (emails || "—") +
      "</p>" +
      "<p><strong>" +
      esc(t("nurture_rollout_allowlist_names")) +
      ":</strong> " +
      (names || "—") +
      "</p></div>"
    );
  }

  function renderPreviewSection(previewData) {
    if (!previewData || !previewData.previews) return "";
    var html =
      '<div class="crm-card" style="margin-bottom:16px"><h2>' +
      esc(t("nurture_preview_title")) +
      '</h2><p class="crm-muted">' +
      esc(t("nurture_preview_sub")) +
      '</p><div id="ns-preview-root"></div></div>';

    setTimeout(function () {
      var root = document.getElementById("ns-preview-root");
      if (!root) return;
      var parts = [];
      ["english", "spanish"].forEach(function (lang) {
        parts.push("<h3>" + esc(lang === "english" ? "English" : "Español") + "</h3>");
        var emails = previewData.previews.emails && previewData.previews.emails[lang];
        if (emails) {
          Object.keys(emails).forEach(function (key) {
            var tpl = emails[key];
            if (!tpl) return;
            parts.push(
              '<details class="crm-nurture-preview-item" style="margin:12px 0"><summary><strong>Email: ' +
                esc(key) +
                "</strong> — " +
                esc(tpl.subject || "") +
                '</summary><div class="crm-nurture-preview-body" style="margin-top:8px;padding:12px;border:1px solid var(--crm-border);border-radius:8px;max-height:320px;overflow:auto;background:#fff">' +
                (tpl.html || "") +
                "</div></details>"
            );
          });
        }
        var sms = previewData.previews.sms && previewData.previews.sms[lang];
        if (sms) {
          Object.keys(sms).forEach(function (key) {
            parts.push(
              '<details class="crm-nurture-preview-item" style="margin:12px 0"><summary><strong>SMS: ' +
                esc(key) +
                '</strong></summary><pre style="white-space:pre-wrap;margin-top:8px;padding:12px;border:1px solid var(--crm-border);border-radius:8px;background:#fff">' +
                esc(sms[key] || "") +
                "</pre></details>"
            );
          });
        }
      });
      root.innerHTML = parts.join("");
    }, 0);
    return html;
  }

  async function mount(main) {
    main.innerHTML =
      '<div class="crm-page-head"><h1 class="crm-page-title">' +
      esc(t("nurture_settings_title")) +
      '</h1></div><p class="crm-empty-state">' +
      esc(t("loading")) +
      "</p>";

    var data;
    var previewData;
    try {
      data = await api("/api/staff/nurture-settings", null, { method: "GET" });
      previewData = await api("/api/staff/nurture-preview", null, { method: "GET" });
    } catch (e) {
      main.innerHTML =
        '<div class="crm-placeholder"><strong>' +
        esc(t("load_error")) +
        "</strong><p>" +
        esc(e.message || "") +
        "</p></div>";
      return;
    }

    var cfg = (data && data.config) || {};
    var rollout = (data && data.rollout) || (previewData && previewData.rollout) || {};
    var ds = cfg.daily_summary || {};
    var nl = cfg.newsletter || {};
    var cs = cfg.contacted_sequence || {};
    var d0 = (cfg.new_sequence && cfg.new_sequence.day0) || {};
    var call0 = (d0.calls && d0.calls[1]) || {};

    main.innerHTML =
      '<div class="crm-page-head"><h1 class="crm-page-title">' +
      esc(t("nurture_settings_title")) +
      '</h1><p class="crm-page-sub">' +
      esc(t("nurture_settings_sub")) +
      "</p></div>" +
      renderRolloutBanner(rollout) +
      renderPreviewSection(previewData) +
      '<div class="crm-card" style="margin-bottom:16px">' +
      "<h2>" +
      esc(t("nurture_settings_new")) +
      "</h2>" +
      field(t("nurture_day0_pm_call"), "ns-day0-pm", call0.time || "17:00") +
      "</div>" +
      '<div class="crm-card" style="margin-bottom:16px">' +
      "<h2>" +
      esc(t("nurture_settings_contacted")) +
      "</h2>" +
      field(t("nurture_email_interval"), "ns-email-days", cs.email_interval_days || 30, "number") +
      "</div>" +
      '<div class="crm-card" style="margin-bottom:16px">' +
      "<h2>" +
      esc(t("nurture_settings_schedule")) +
      "</h2>" +
      field(t("nurture_daily_hour"), "ns-daily-hour", ds.hour != null ? ds.hour : 8, "number") +
      field(
        t("nurture_daily_recipient"),
        "ns-daily-email",
        Array.isArray(ds.recipients)
          ? ds.recipients.join(", ")
          : ds.recipient || "julie@mejorvidainsurance.com, admin@mejorvidainsurance.com",
        "text"
      ) +
      field(t("nurture_newsletter_hour"), "ns-nl-hour", nl.hour != null ? nl.hour : 16, "number") +
      field(t("nurture_timezone"), "ns-tz", cfg.timezone || "America/Chicago") +
      "</div>" +
      '<div class="crm-form-actions">' +
      '<button type="button" class="crm-btn" id="ns-save">' +
      esc(t("ov_save")) +
      "</button>" +
      '<span id="ns-status" class="crm-muted" style="margin-left:12px"></span>' +
      "</div>";

    document.getElementById("ns-save").addEventListener("click", async function () {
      var status = document.getElementById("ns-status");
      status.textContent = t("ov_status_saving");
      var next = JSON.parse(JSON.stringify(cfg));
      next.timezone = document.getElementById("ns-tz").value.trim() || "America/Chicago";
      next.rollout_mode = cfg.rollout_mode || "testing";
      next.new_sequence = next.new_sequence || {};
      next.new_sequence.day0 = next.new_sequence.day0 || {};
      next.new_sequence.day0.calls = next.new_sequence.day0.calls || [
        { offset_minutes: 0, attempt: 1 },
        { time: "17:00", attempt: 2 },
      ];
      next.new_sequence.day0.calls[1].time = document.getElementById("ns-day0-pm").value.trim() || "17:00";
      next.contacted_sequence = next.contacted_sequence || {};
      next.contacted_sequence.email_interval_days = Number(document.getElementById("ns-email-days").value) || 30;
      delete next.contacted_sequence.call_interval_days;
      delete next.contacted_sequence.call_time;
      next.daily_summary = next.daily_summary || {};
      next.daily_summary.hour = Number(document.getElementById("ns-daily-hour").value);
      next.daily_summary.recipients = String(document.getElementById("ns-daily-email").value || "")
        .split(",")
        .map(function (s) {
          return s.trim();
        })
        .filter(Boolean);
      delete next.daily_summary.recipient;
      next.newsletter = next.newsletter || {};
      next.newsletter.hour = Number(document.getElementById("ns-nl-hour").value);
      try {
        await api("/api/staff/nurture-settings", { config: next }, { method: "PATCH" });
        status.textContent = t("ov_status_saved");
        cfg = next;
      } catch (e) {
        status.textContent = e.message || t("load_error");
      }
    });
  }

  window.StaffCrmNurtureSettings = { mount: mount };
})();
