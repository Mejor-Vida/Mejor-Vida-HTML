/**
 * Staff CRM — GA4 Analytics funnel view.
 */
(function () {
  "use strict";

  var state = {
    tab: "website",
    periodDays: 30,
    data: null,
    loading: false,
    detailStage: null,
    detailData: null,
    detailLoading: false,
  };

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s == null ? "" : s);
  }

  function api(path, body, opts) {
    if (!window.StaffCrm || !window.StaffCrm.authedApi) throw new Error("StaffCrm not ready");
    return window.StaffCrm.authedApi(path, body, opts);
  }

  function fmtNum(n) {
    var v = Number(n) || 0;
    return v.toLocaleString();
  }

  function fmtPct(n) {
    var v = Number(n);
    if (isNaN(v)) return "—";
    return v.toFixed(1) + "%";
  }

  function fmtDateTime(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    var lang = window.StaffCrmI18n ? window.StaffCrmI18n.getLang() : "en";
    return d.toLocaleString(lang === "es" ? "es-US" : "en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function fmtGaDate(yyyymmdd) {
    if (!yyyymmdd || yyyymmdd.length !== 8) return yyyymmdd || "—";
    var y = yyyymmdd.slice(0, 4);
    var m = yyyymmdd.slice(4, 6);
    var d = yyyymmdd.slice(6, 8);
    var dt = new Date(Number(y), Number(m) - 1, Number(d));
    if (isNaN(dt.getTime())) return yyyymmdd;
    return dt.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  function currentFunnelData() {
    if (!state.data) return { stages: [], detail: {}, synced_at: null };
    return state.tab === "landing" ? state.data.landing : state.data.website;
  }

  function maxStageCount(stages) {
    var max = 0;
    (stages || []).forEach(function (s) {
      if (s.count > max) max = s.count;
    });
    return max || 1;
  }

  function renderFunnelBar(stage, maxCount, index, total) {
    var widthPct = Math.max(8, Math.round((stage.count / maxCount) * 100));
    var convLabel =
      index === 0
        ? t("ga4_top_of_funnel")
        : t("ga4_step_conv", { pct: fmtPct(stage.stepConversion) });
    return (
      '<button type="button" class="crm-ga4-stage" data-stage-id="' +
      esc(stage.id) +
      '" style="--stage-width:' +
      widthPct +
      '%">' +
      '<div class="crm-ga4-stage-inner">' +
      '<div class="crm-ga4-stage-head">' +
      '<span class="crm-ga4-stage-num">' +
      esc(String(index + 1)) +
      "</span>" +
      '<span class="crm-ga4-stage-label">' +
      esc(stage.label) +
      "</span>" +
      '<span class="crm-ga4-stage-event">' +
      esc(stage.eventName || stage.id) +
      "</span></div>" +
      '<div class="crm-ga4-stage-metrics">' +
      '<strong class="crm-ga4-stage-count">' +
      esc(fmtNum(stage.count)) +
      "</strong>" +
      '<span class="crm-ga4-stage-users">' +
      esc(t("ga4_users", { n: fmtNum(stage.users) })) +
      "</span></div>" +
      '<div class="crm-ga4-stage-footer">' +
      '<span class="crm-ga4-conv">' +
      esc(convLabel) +
      "</span>" +
      (index > 0
        ? '<span class="crm-ga4-drop">' +
          esc(t("ga4_drop_off", { pct: fmtPct(stage.dropOff) })) +
          "</span>"
        : "") +
      (index < total - 1 ? '<span class="crm-ga4-chevron" aria-hidden="true">▼</span>' : "") +
      "</div></div></button>"
    );
  }

  function renderDailyChart(daily) {
    if (!daily || !daily.length) {
      return '<p class="crm-ga4-detail-empty">' + esc(t("ga4_no_daily")) + "</p>";
    }
    var max = 1;
    daily.forEach(function (d) {
      if (d.count > max) max = d.count;
    });
    var bars = daily
      .map(function (d) {
        var h = Math.max(4, Math.round((d.count / max) * 100));
        return (
          '<div class="crm-ga4-bar-col" title="' +
          esc(fmtGaDate(d.date) + ": " + fmtNum(d.count)) +
          '">' +
          '<div class="crm-ga4-bar" style="height:' +
          h +
          '%"></div>' +
          '<span class="crm-ga4-bar-label">' +
          esc(fmtGaDate(d.date)) +
          "</span></div>"
        );
      })
      .join("");
    return '<div class="crm-ga4-chart">' + bars + "</div>";
  }

  function renderTopPages(pages) {
    if (!pages || !pages.length) {
      return '<p class="crm-ga4-detail-empty">' + esc(t("ga4_no_pages")) + "</p>";
    }
    var rows = pages
      .map(function (p) {
        return (
          "<tr><td>" +
          esc(p.pagePath) +
          "</td><td>" +
          esc(fmtNum(p.count)) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      '<table class="crm-ga4-pages-table"><thead><tr><th>' +
      esc(t("ga4_page_path")) +
      "</th><th>" +
      esc(t("ga4_events")) +
      "</th></tr></thead><tbody>" +
      rows +
      "</tbody></table>"
    );
  }

  function renderLandingSteps(stepsData) {
    if (!stepsData || !stepsData.steps || !stepsData.steps.length) return "";
    var html =
      '<div class="crm-ga4-detail-section"><h4>' +
      esc(t("ga4_landing_steps")) +
      '</h4><ul class="crm-ga4-step-list">';
    stepsData.steps.forEach(function (step, i) {
      html +=
        "<li><span>" +
        esc(String(i + 1) + ". " + step.label) +
        '</span><strong>' +
        esc(fmtNum(step.count)) +
        "</strong>" +
        (i > 0 ? '<em>' + esc(fmtPct(step.stepConversion) + " conv") + "</em>" : "") +
        "</li>";
    });
    html += "</ul></div>";
    return html;
  }

  function renderDetailModal() {
    if (!state.detailStage) return "";
    var stage = state.detailStage;
    var detail = (state.detailData && state.detailData.detail) || {};
    var loading = state.detailLoading;

    return (
      '<div class="crm-ga4-modal-backdrop" id="crm-ga4-modal-backdrop">' +
      '<div class="crm-ga4-modal" role="dialog" aria-labelledby="crm-ga4-modal-title">' +
      '<div class="crm-ga4-modal-head">' +
      '<h3 id="crm-ga4-modal-title">' +
      esc(stage.label) +
      "</h3>" +
      '<button type="button" class="crm-ga4-modal-close" id="crm-ga4-modal-close" aria-label="' +
      esc(t("ga4_close")) +
      '">×</button></div>' +
      '<div class="crm-ga4-modal-body">' +
      (loading
        ? '<p class="crm-ga4-detail-empty">' + esc(t("loading")) + "</p>"
        : "") +
      (!loading
        ? '<p class="crm-ga4-detail-desc">' + esc(stage.description || "") + "</p>" +
          '<div class="crm-ga4-detail-stats">' +
          '<div><span>' +
          esc(t("ga4_total_events")) +
          "</span><strong>" +
          esc(fmtNum(stage.count)) +
          "</strong></div>" +
          '<div><span>' +
          esc(t("ga4_unique_users")) +
          "</span><strong>" +
          esc(fmtNum(stage.users)) +
          "</strong></div>" +
          '<div><span>' +
          esc(t("ga4_from_top")) +
          "</span><strong>" +
          esc(fmtPct(stage.conversionFromTop)) +
          "</strong></div>" +
          (stage.stepConversion != null
            ? '<div><span>' +
              esc(t("ga4_from_prev")) +
              "</span><strong>" +
              esc(fmtPct(stage.stepConversion)) +
              "</strong></div>"
            : "") +
          "</div>" +
          '<div class="crm-ga4-detail-section"><h4>' +
          esc(t("ga4_daily_trend")) +
          "</h4>" +
          renderDailyChart(detail.daily) +
          "</div>" +
          '<div class="crm-ga4-detail-section"><h4>' +
          esc(t("ga4_top_pages")) +
          "</h4>" +
          renderTopPages(detail.topPages) +
          "</div>" +
          renderLandingSteps(state.detailData && state.detailData.landingSteps)
        : "") +
      "</div></div></div>"
    );
  }

  function renderShell() {
    var funnel = currentFunnelData();
    var stages = funnel.stages || [];
    var maxCount = maxStageCount(stages);
    var syncedAt = funnel.synced_at || (state.data && state.data.website && state.data.website.synced_at);

    var funnelHtml = stages.length
      ? stages
          .map(function (stage, i) {
            return renderFunnelBar(stage, maxCount, i, stages.length);
          })
          .join("")
      : '<p class="crm-ga4-empty">' + esc(t("ga4_no_data")) + "</p>";

    var setupHint = state.data && state.data.setupHint
      ? '<div class="crm-ga4-setup-hint">' +
        esc(state.data.setupHint) +
        (state.data.oauthAuthUrl
          ? ' <a href="' +
            esc(state.data.oauthAuthUrl) +
            '" target="_blank" rel="noopener">' +
            esc(t("ga4_connect_oauth")) +
            "</a>"
          : "") +
        "</div>"
      : "";

    return (
      '<div class="crm-ga4-shell">' +
      '<div class="crm-ga4-topbar">' +
      "<div>" +
      '<h1 class="crm-ga4-title">' +
      esc(t("ga4_title")) +
      "</h1>" +
      '<p class="crm-ga4-subtitle">' +
      esc(t("ga4_subtitle")) +
      "</p></div>" +
      '<div class="crm-ga4-controls">' +
      '<label class="crm-ga4-period">' +
      esc(t("ga4_period")) +
      '<select id="crm-ga4-period">' +
      '<option value="7"' +
      (state.periodDays === 7 ? " selected" : "") +
      ">" +
      esc(t("ga4_days", { n: 7 })) +
      "</option>" +
      '<option value="30"' +
      (state.periodDays === 30 ? " selected" : "") +
      ">" +
      esc(t("ga4_days", { n: 30 })) +
      "</option>" +
      '<option value="90"' +
      (state.periodDays === 90 ? " selected" : "") +
      ">" +
      esc(t("ga4_days", { n: 90 })) +
      "</option></select></label>" +
      '<button type="button" class="crm-btn secondary" id="crm-ga4-refresh">' +
      esc(t("ga4_refresh")) +
      "</button></div></div>" +
      setupHint +
      '<div class="crm-ga4-tabs" role="tablist">' +
      '<button type="button" class="crm-ga4-tab' +
      (state.tab === "website" ? " is-active" : "") +
      '" data-ga4-tab="website" role="tab">' +
      esc(t("ga4_tab_website")) +
      "</button>" +
      '<button type="button" class="crm-ga4-tab' +
      (state.tab === "landing" ? " is-active" : "") +
      '" data-ga4-tab="landing" role="tab">' +
      esc(t("ga4_tab_landing")) +
      "</button></div>" +
      '<p class="crm-ga4-synced">' +
      esc(t("ga4_last_sync", { when: fmtDateTime(syncedAt) })) +
      "</p>" +
      '<div class="crm-ga4-funnel" id="crm-ga4-funnel">' +
      funnelHtml +
      "</div>" +
      '<p class="crm-ga4-hint">' +
      esc(t("ga4_click_stage")) +
      "</p>" +
      renderDetailModal() +
      "</div>"
    );
  }

  function paint(main) {
    main.innerHTML = renderShell();
    wireEvents(main);
  }

  async function loadData(main, refresh) {
    state.loading = true;
    if (main) paint(main);
    try {
      var qs =
        "?period=" +
        encodeURIComponent(String(state.periodDays)) +
        (refresh ? "&refresh=1" : "");
      state.data = await api("/api/staff/ga4-analytics" + qs, null, { method: "GET" });
    } catch (e) {
      var msg = (e && e.message) || t("ga4_load_error");
      state.data = {
        website: { stages: [] },
        landing: { stages: [] },
        setupHint: msg,
        oauthAuthUrl: "/api/staff/ga4-auth",
      };
      if (/invalid_grant/i.test(msg)) {
        state.data.setupHint =
          t("ga4_invalid_grant") + " " + msg;
      }
    } finally {
      state.loading = false;
      if (main) paint(main);
    }
  }

  async function openStageDetail(stageId) {
    var funnel = currentFunnelData();
    var stage = (funnel.stages || []).find(function (s) {
      return s.id === stageId;
    });
    if (!stage) return;

    state.detailStage = stage;
    state.detailData = null;
    state.detailLoading = true;
    var main = document.getElementById("crm-main");
    if (main) paint(main);

    try {
      state.detailData = await api(
        "/api/staff/ga4-analytics?action=stage&funnel=" +
          encodeURIComponent(state.tab) +
          "&stage=" +
          encodeURIComponent(stageId) +
          "&period=" +
          encodeURIComponent(String(state.periodDays)),
        null,
        { method: "GET" }
      );
    } catch (e) {
      state.detailData = { detail: {}, error: e.message };
    } finally {
      state.detailLoading = false;
      if (main) paint(main);
    }
  }

  function closeDetailModal() {
    state.detailStage = null;
    state.detailData = null;
    var main = document.getElementById("crm-main");
    if (main) paint(main);
  }

  function wireEvents(main) {
    main.querySelectorAll("[data-ga4-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.tab = btn.getAttribute("data-ga4-tab") || "website";
        closeDetailModal();
        paint(main);
      });
    });

    var periodSel = main.querySelector("#crm-ga4-period");
    if (periodSel) {
      periodSel.addEventListener("change", function () {
        state.periodDays = Number(periodSel.value) || 30;
        closeDetailModal();
        loadData(main, false);
      });
    }

    var refreshBtn = main.querySelector("#crm-ga4-refresh");
    if (refreshBtn) {
      refreshBtn.addEventListener("click", function () {
        refreshBtn.disabled = true;
        loadData(main, true).finally(function () {
          refreshBtn.disabled = false;
        });
      });
    }

    main.querySelectorAll(".crm-ga4-stage").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openStageDetail(btn.getAttribute("data-stage-id"));
      });
    });

    var backdrop = main.querySelector("#crm-ga4-modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", function (ev) {
        if (ev.target === backdrop) closeDetailModal();
      });
    }
    var closeBtn = main.querySelector("#crm-ga4-modal-close");
    if (closeBtn) closeBtn.addEventListener("click", closeDetailModal);
  }

  async function mount(main) {
    state.tab = "website";
    state.detailStage = null;
    await loadData(main, false);
  }

  window.StaffCrmGa4Analytics = { mount: mount };
})();
