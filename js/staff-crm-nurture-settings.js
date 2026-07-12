/**
 * CRM Nurture Settings — editable times, cadence, weekly email send tab.
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

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString();
    } catch (e) {
      return String(iso);
    }
  }

  function statusBadge(status) {
    var s = String(status || "draft").toLowerCase();
    var color =
      s === "sent" ? "#1e7e34" : s === "scheduled" ? "#1a56db" : s === "cancelled" ? "#888" : "#b36b00";
    return (
      '<span style="display:inline-block;padding:2px 8px;border-radius:999px;font-size:12px;font-weight:700;background:#f0f4fa;color:' +
      color +
      '">' +
      esc(s) +
      "</span>"
    );
  }

  function renderWeeklyTab(weeklyData) {
    weeklyData = weeklyData || {};
    var current = weeklyData.current || {};
    var counts = weeklyData.recipient_counts || {};
    var issues = weeklyData.issues || [];
    var stories = current.stories || [];

    var storyList = stories
      .map(function (s, i) {
        return (
          "<li><strong>" +
          esc(s.title || "Story " + (i + 1)) +
          "</strong> — " +
          esc((s.summary || "").slice(0, 120)) +
          ((s.summary || "").length > 120 ? "…" : "") +
          "</li>"
        );
      })
      .join("");

    var rows = issues
      .map(function (iss) {
        var stats = iss.send_stats || {};
        return (
          "<tr>" +
          "<td>" +
          esc(iss.subject || "(no subject)") +
          "</td>" +
          "<td>" +
          statusBadge(iss.status) +
          "</td>" +
          "<td>" +
          esc(iss.hero_source || "—") +
          "</td>" +
          "<td>" +
          esc(formatDate(iss.created_at)) +
          "</td>" +
          "<td>" +
          esc(formatDate(iss.sent_at)) +
          "</td>" +
          "<td>" +
          esc(
            stats.total
              ? stats.sent + " sent / " + stats.failed + " failed"
              : iss.status === "sent"
                ? "—"
                : "—"
          ) +
          "</td>" +
          '<td><button type="button" class="crm-btn secondary ns-we-preview-issue" data-id="' +
          esc(iss.id) +
          '" data-subject="' +
          esc(iss.subject || "") +
          '">' +
          esc(t("nurture_weekly_preview")) +
          "</button></td>" +
          "</tr>"
        );
      })
      .join("");

    return (
      '<div id="ns-panel-weekly">' +
      '<div class="crm-card" style="margin-bottom:16px">' +
      "<h2>" +
      esc(t("nurture_weekly_ready_title")) +
      "</h2>" +
      '<p class="crm-muted">' +
      esc(t("nurture_weekly_ready_sub")) +
      "</p>" +
      "<p><strong>" +
      esc(t("nurture_weekly_subject")) +
      ":</strong> " +
      esc(current.subject || "—") +
      "</p>" +
      "<p><strong>" +
      esc(t("nurture_weekly_date")) +
      ":</strong> " +
      esc(current.post_date_iso || "—") +
      "</p>" +
      "<p><strong>" +
      esc(t("nurture_weekly_recipients")) +
      ":</strong> " +
      esc(String(counts.eligible != null ? counts.eligible : "—")) +
      " " +
      esc(t("nurture_weekly_recipients_hint")) +
      "</p>" +
      '<p class="crm-muted" style="font-size:13px">' +
      esc(t("nurture_weekly_skip_hint")) +
      " — no email: " +
      esc(String(counts.skipped_no_email || 0)) +
      ", unsubscribed/DNC: " +
      esc(String(counts.skipped_stage || 0)) +
      ", rollout: " +
      esc(String(counts.skipped_rollout || 0)) +
      "</p>" +
      (storyList ? "<ul style=\"margin:12px 0 16px;padding-left:18px\">" + storyList + "</ul>" : "") +
      '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px">' +
      '<button type="button" class="crm-btn" id="ns-we-preview-current">' +
      esc(t("nurture_weekly_preview")) +
      "</button>" +
      (current.blog_url
        ? '<a class="crm-btn secondary" href="' +
          esc(current.blog_url) +
          '" target="_blank" rel="noopener">' +
          esc(t("nurture_weekly_open_blog")) +
          "</a>"
        : "") +
      '<button type="button" class="crm-btn" id="ns-we-send" style="background:#1e7e34;border-color:#1e7e34">' +
      esc(t("nurture_weekly_send")) +
      "</button>" +
      "</div>" +
      '<p id="ns-we-status" class="crm-muted" role="status"></p>' +
      '<div id="ns-we-preview-wrap" style="display:none;margin-top:12px">' +
      '<p class="crm-muted" id="ns-we-preview-label"></p>' +
      '<iframe id="ns-we-frame" title="Weekly email preview" style="width:100%;max-width:640px;min-height:720px;border:1px solid var(--crm-border);border-radius:8px;background:#fff"></iframe>' +
      "</div>" +
      "</div>" +
      '<div class="crm-card">' +
      "<h2>" +
      esc(t("nurture_weekly_history_title")) +
      "</h2>" +
      '<p class="crm-muted">' +
      esc(t("nurture_weekly_history_sub")) +
      "</p>" +
      '<div style="overflow:auto">' +
      '<table class="crm-table" style="width:100%;min-width:720px">' +
      "<thead><tr>" +
      "<th>" +
      esc(t("nurture_weekly_col_subject")) +
      "</th>" +
      "<th>" +
      esc(t("nurture_weekly_col_status")) +
      "</th>" +
      "<th>" +
      esc(t("nurture_weekly_col_source")) +
      "</th>" +
      "<th>" +
      esc(t("nurture_weekly_col_created")) +
      "</th>" +
      "<th>" +
      esc(t("nurture_weekly_col_sent")) +
      "</th>" +
      "<th>" +
      esc(t("nurture_weekly_col_stats")) +
      "</th>" +
      "<th></th>" +
      "</tr></thead><tbody>" +
      (rows ||
        '<tr><td colspan="7" class="crm-muted">' +
          esc(t("nurture_weekly_empty")) +
          "</td></tr>") +
      "</tbody></table></div></div></div>"
    );
  }

  function bindWeeklyHandlers(weeklyData) {
    var statusEl = document.getElementById("ns-we-status");
    var wrap = document.getElementById("ns-we-preview-wrap");
    var frame = document.getElementById("ns-we-frame");
    var label = document.getElementById("ns-we-preview-label");
    var current = (weeklyData && weeklyData.current) || {};

    function showPreview(html, title) {
      if (!wrap || !frame) return;
      wrap.style.display = "block";
      if (label) label.textContent = title || t("nurture_weekly_preview");
      frame.srcdoc = html || "<p>No preview</p>";
      wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    var previewBtn = document.getElementById("ns-we-preview-current");
    if (previewBtn) {
      previewBtn.addEventListener("click", function () {
        showPreview(current.preview_html, current.subject || t("nurture_weekly_preview"));
      });
    }

    document.querySelectorAll(".ns-we-preview-issue").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        var id = btn.getAttribute("data-id");
        statusEl.textContent = t("nurture_weekly_loading");
        try {
          // Reuse current preview for blog digest; for stored issues show subject note
          // Fetch full issue body via list already has no html — reload weekly emails and find
          var data = await api("/api/staff/weekly-emails", null, { method: "GET" });
          var issue = (data.issues || []).find(function (x) {
            return x.id === id;
          });
          if (!issue) throw new Error("Issue not found");
          // Build a simple preview shell from stored HTML
          var inner =
            (issue.hero_html || "") +
            (issue.body_html || "") +
            '<p class="crm-muted">Stored issue preview (greeting/signature applied at send time).</p>';
          showPreview(
            '<div style="font-family:Arial,sans-serif;padding:16px;max-width:600px">' +
              inner +
              "</div>",
            issue.subject || t("nurture_weekly_preview")
          );
          statusEl.textContent = "";
        } catch (e) {
          statusEl.textContent = e.message || t("load_error");
        }
      });
    });

    var sendBtn = document.getElementById("ns-we-send");
    if (sendBtn) {
      sendBtn.addEventListener("click", async function () {
        var n = (weeklyData.recipient_counts && weeklyData.recipient_counts.eligible) || 0;
        if (
          !window.confirm(
            t("nurture_weekly_send_confirm", { count: String(n) }) ||
              "Send this weekly email to " + n + " active clients now?"
          )
        ) {
          return;
        }
        sendBtn.disabled = true;
        statusEl.textContent = t("nurture_weekly_sending");
        try {
          var res = await api(
            "/api/staff/weekly-emails",
            { action: "send" },
            { method: "POST" }
          );
          var r = (res && res.result) || {};
          statusEl.textContent = t("nurture_weekly_sent_ok", {
            sent: String(r.sent || 0),
            failed: String(r.failed || 0),
            skipped: String(r.skipped || 0),
          });
          // refresh list
          var refreshed = await api("/api/staff/weekly-emails", null, { method: "GET" });
          var panel = document.getElementById("ns-panel-weekly");
          if (panel) {
            var parent = panel.parentNode;
            var html = renderWeeklyTab(refreshed);
            panel.outerHTML = html;
            bindWeeklyHandlers(refreshed);
            document.getElementById("ns-we-status").textContent = statusEl.textContent;
          }
        } catch (e) {
          statusEl.textContent = e.message || t("nurture_weekly_send_failed");
          sendBtn.disabled = false;
        }
      });
    }
  }

  function renderSettingsForm(cfg, rollout, previewData) {
    var ds = cfg.daily_summary || {};
    var nl = cfg.newsletter || {};
    var cs = cfg.contacted_sequence || {};
    var d0 = (cfg.new_sequence && cfg.new_sequence.day0) || {};
    var call0 = (d0.calls && d0.calls[1]) || {};

    return (
      '<div id="ns-panel-settings">' +
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
      '<div class="crm-card" style="margin-bottom:16px">' +
      "<h2>" +
      esc(t("nurture_compliance_title")) +
      "</h2>" +
      '<p class="crm-muted">' +
      esc(t("nurture_compliance_sub")) +
      "</p>" +
      '<label class="crm-field-label" style="display:flex;align-items:flex-start;gap:10px;margin-top:12px">' +
      '<input type="checkbox" id="ns-block-holidays" ' +
      (cfg.compliance && cfg.compliance.block_federal_holidays !== false ? "checked " : "") +
      "/>" +
      "<span>" +
      esc(t("nurture_block_federal_holidays")) +
      '<br><span class="crm-muted">' +
      esc(t("nurture_block_federal_holidays_hint")) +
      "</span></span></label>" +
      "</div>" +
      '<div class="crm-form-actions">' +
      '<button type="button" class="crm-btn" id="ns-save">' +
      esc(t("ov_save")) +
      "</button>" +
      '<span id="ns-status" class="crm-muted" style="margin-left:12px"></span>' +
      "</div></div>"
    );
  }

  function setTab(tab) {
    var settingsPanel = document.getElementById("ns-panel-settings");
    var weeklyPanel = document.getElementById("ns-panel-weekly");
    var tabSettings = document.getElementById("ns-tab-settings");
    var tabWeekly = document.getElementById("ns-tab-weekly");
    var isWeekly = tab === "weekly";
    if (settingsPanel) settingsPanel.style.display = isWeekly ? "none" : "";
    if (weeklyPanel) weeklyPanel.style.display = isWeekly ? "" : "none";
    if (tabSettings) tabSettings.classList.toggle("active", !isWeekly);
    if (tabWeekly) tabWeekly.classList.toggle("active", isWeekly);
    try {
      if (isWeekly) {
        if (location.hash.indexOf("weekly") < 0) {
          history.replaceState(null, "", "#/nurture-settings/weekly");
        }
      } else if (location.hash.indexOf("weekly") >= 0) {
        history.replaceState(null, "", "#/nurture-settings");
      }
    } catch (e) {
      /* ignore */
    }
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
    var weeklyData;
    try {
      data = await api("/api/staff/nurture-settings", null, { method: "GET" });
      previewData = await api("/api/staff/nurture-preview", null, { method: "GET" });
      weeklyData = await api("/api/staff/weekly-emails", null, { method: "GET" });
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

    main.innerHTML =
      '<div class="crm-page-head"><h1 class="crm-page-title">' +
      esc(t("nurture_settings_title")) +
      '</h1><p class="crm-page-sub">' +
      esc(t("nurture_settings_sub")) +
      "</p></div>" +
      '<div class="crm-tabs" style="display:flex;gap:8px;margin:0 0 16px;flex-wrap:wrap">' +
      '<button type="button" class="crm-btn secondary ns-tab active" id="ns-tab-settings">' +
      esc(t("nurture_tab_settings")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary ns-tab" id="ns-tab-weekly">' +
      esc(t("nurture_tab_weekly")) +
      "</button>" +
      "</div>" +
      renderSettingsForm(cfg, rollout, previewData) +
      renderWeeklyTab(weeklyData);

    document.getElementById("ns-tab-settings").addEventListener("click", function () {
      setTab("settings");
    });
    document.getElementById("ns-tab-weekly").addEventListener("click", function () {
      setTab("weekly");
    });

    bindWeeklyHandlers(weeklyData);

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
      next.contacted_sequence.email_interval_days =
        Number(document.getElementById("ns-email-days").value) || 30;
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
      next.compliance = next.compliance || {};
      next.compliance.block_federal_holidays = !!(
        document.getElementById("ns-block-holidays") &&
        document.getElementById("ns-block-holidays").checked
      );
      if (!next.compliance.preferred_resume_hour) next.compliance.preferred_resume_hour = 9;
      try {
        await api("/api/staff/nurture-settings", { config: next }, { method: "PATCH" });
        status.textContent = t("ov_status_saved");
        cfg = next;
      } catch (e) {
        status.textContent = e.message || t("load_error");
      }
    });

    // Open weekly tab if hash requests it
    if (String(location.hash || "").indexOf("weekly") >= 0) {
      setTab("weekly");
    } else {
      setTab("settings");
    }
  }

  window.StaffCrmNurtureSettings = { mount: mount };
})();
