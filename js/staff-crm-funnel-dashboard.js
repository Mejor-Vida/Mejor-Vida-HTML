/**
 * Staff CRM — Product Funnel Analytics Dashboard
 * Components: FilterBar, EntryContextPanel, FunnelVisualization, FunnelBranch, FunnelNode, DetailInspectorPanel
 */
(function () {
  "use strict";

  var state = {
    sourceChannel: "facebook",
    landingPage: "website",
    view: "facebook_website",
    licensedState: "ALL",
    periodDays: 1,
    dateFrom: "",
    dateTo: "",
    data: null,
    loading: false,
    selectedNode: null,
    detail: null,
    detailLoading: false,
    detailError: null,
    adChartMetric: null,
    adChartLoading: false,
    adChartData: null,
    adChartError: null,
    entryModalOpen: false,
    geoModalOpen: false,
    geoLoading: false,
    geoError: null,
    geoData: null,
  };

  var PERIOD_PRESETS = [1, 7, 14, 30, 90];
  var SOURCE_CHANNELS = ["facebook", "google", "direct", "organic"];
  var LICENSED_STATES = [
    { value: "ALL", labelKey: "funnel_state_all" },
    { value: "NE", labelKey: "funnel_state_ne" },
    { value: "KS", labelKey: "funnel_state_ks" },
    { value: "CO", labelKey: "funnel_state_co" },
    { value: "NV", labelKey: "funnel_state_nv" },
  ];

  function landingPagesForSource() {
    return ["website"];
  }

  function composeViewId(source, landing) {
    return String(source || "facebook") + "_" + String(landing || "website");
  }

  function syncViewFromFilters() {
    var landings = landingPagesForSource(state.sourceChannel);
    if (landings.indexOf(state.landingPage) < 0) {
      state.landingPage = landings[0];
    }
    state.view = composeViewId(state.sourceChannel, state.landingPage);
  }

  function isGoogleView() {
    return state.sourceChannel === "google";
  }

  function pad2(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function formatDateInput(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function defaultDateRange() {
    var today = formatDateInput(new Date());
    return { dateFrom: today, dateTo: today };
  }

  function addDaysFromDate(ymd, delta) {
    var parts = ymd.split("-").map(Number);
    var d = new Date(parts[0], parts[1] - 1, parts[2]);
    d.setDate(d.getDate() + delta);
    return formatDateInput(d);
  }

  function applyPeriodDays(days) {
    var n = Number(days);
    if (!n || n < 1) return;
    state.periodDays = n;
    var today = formatDateInput(new Date());
    state.dateTo = today;
    state.dateFrom = addDaysFromDate(today, -(n - 1));
  }

  function countDaysInclusive(from, to) {
    if (!from || !to || from > to) return 0;
    var n = 0;
    var cur = from;
    while (cur <= to) {
      n += 1;
      cur = addDaysFromDate(cur, 1);
    }
    return n;
  }

  function fmtShortDate(ymd) {
    if (!ymd) return "";
    var p = ymd.split("-");
    if (p.length !== 3) return ymd;
    return p[1] + "/" + p[2];
  }

  function fmtDateRangeLabel(from, to) {
    if (!from || !to) return "";
    var days = countDaysInclusive(from, to);
    return fmtShortDate(from) + " – " + fmtShortDate(to) + " · " + days + " " + t("funnel_days_label");
  }

  function syncPeriodFromDates() {
    var days = countDaysInclusive(state.dateFrom, state.dateTo);
    if (PERIOD_PRESETS.indexOf(days) >= 0 && state.dateTo === formatDateInput(new Date())) {
      state.periodDays = days;
      return;
    }
    state.periodDays = "custom";
  }

  function ensureDateRange() {
    if (!state.dateFrom || !state.dateTo) {
      var defaults = defaultDateRange();
      state.dateFrom = defaults.dateFrom;
      state.dateTo = defaults.dateTo;
    }
    if (state.dateFrom > state.dateTo) {
      var swap = state.dateFrom;
      state.dateFrom = state.dateTo;
      state.dateTo = swap;
    }
  }

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s == null ? "" : s);
  }

  function api(path, opts) {
    if (!window.StaffCrm || !window.StaffCrm.authedApi) throw new Error("StaffCrm not ready");
    return window.StaffCrm.authedApi(path, null, opts || { method: "GET" });
  }

  function fmtNum(n) {
    return (Number(n) || 0).toLocaleString();
  }

  function fmtCurrency(n) {
    var v = Number(n);
    if (!isFinite(v)) return "—";
    return v.toLocaleString(undefined, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  function fmtChartValue(metric, val) {
    if (metric === "spend") return fmtCurrency(val);
    return fmtNum(val);
  }

  function fmtPct(n) {
    var v = Number(n);
    if (v == null || isNaN(v)) return "—";
    return v.toFixed(1) + "%";
  }

  function fmtPctRate(n) {
    var v = Number(n);
    if (!isFinite(v)) return "—";
    return (v * 100).toFixed(2) + "%";
  }

  function fmtPosition(n) {
    var v = Number(n);
    if (!isFinite(v)) return "—";
    return v.toFixed(1);
  }

  function queryString(extra) {
    ensureDateRange();
    var q = [
      "view=" + encodeURIComponent(state.view),
      "date_from=" + encodeURIComponent(state.dateFrom),
      "date_to=" + encodeURIComponent(state.dateTo),
      "state=" + encodeURIComponent(state.licensedState || "ALL"),
    ];
    if (extra) Object.keys(extra).forEach(function (k) {
      q.push(encodeURIComponent(k) + "=" + encodeURIComponent(extra[k]));
    });
    return q.join("&");
  }

  function sourceScopeHtml() {
    var key = "funnel_scope_" + state.sourceChannel;
    return (
      '<p class="crm-funnel-source-scope">' + esc(t(key)) + "</p>"
    );
  }

  /* ── FilterBar ── */
  function FilterBar() {
    ensureDateRange();
    return (
      '<div class="crm-funnel-filterbar">' +
      '<div class="crm-funnel-filterbar-row">' +
      '<div class="crm-funnel-date-range">' +
      '<label class="crm-funnel-filter">' +
      "<span>" + esc(t("funnel_period")) + "</span>" +
      '<select data-funnel-period>' +
      PERIOD_PRESETS.map(function (n) {
        var label = n === 1 ? t("funnel_period_today") : t("funnel_period_days", { n: n });
        return (
          '<option value="' +
          n +
          '"' +
          (state.periodDays === n ? " selected" : "") +
          ">" +
          esc(label) +
          "</option>"
        );
      }).join("") +
      '<option value="custom"' +
      (state.periodDays === "custom" ? " selected" : "") +
      ">" +
      esc(t("funnel_period_custom")) +
      "</option></select></label>" +
      '<label class="crm-funnel-filter">' +
      "<span>" + esc(t("funnel_date_from")) + "</span>" +
      '<input type="date" data-funnel-date-from value="' +
      esc(state.dateFrom) +
      '" max="' +
      esc(state.dateTo) +
      '">' +
      "</label>" +
      '<label class="crm-funnel-filter">' +
      "<span>" + esc(t("funnel_date_to")) + "</span>" +
      '<input type="date" data-funnel-date-to value="' +
      esc(state.dateTo) +
      '" min="' +
      esc(state.dateFrom) +
      '">' +
      "</label>" +
      "</div>" +
      '<div class="crm-funnel-view-tabs crm-funnel-source-tabs">' +
      SOURCE_CHANNELS.map(function (src) {
        return (
          '<button type="button" class="crm-funnel-view-tab' +
          (state.sourceChannel === src ? " is-active" : "") +
          '" data-funnel-source="' +
          esc(src) +
          '">' +
          esc(t("funnel_src_" + src)) +
          "</button>"
        );
      }).join("") +
      "</div>" +
      '<label class="crm-funnel-filter crm-funnel-state-filter">' +
      "<span>" + esc(t("funnel_state")) + "</span>" +
      '<select data-funnel-state>' +
      LICENSED_STATES.map(function (row) {
        return (
          '<option value="' +
          esc(row.value) +
          '"' +
          (state.licensedState === row.value ? " selected" : "") +
          ">" +
          esc(t(row.labelKey)) +
          "</option>"
        );
      }).join("") +
      "</select></label>" +
      '<div class="crm-funnel-filter-actions">' +
      '<button type="button" class="crm-funnel-entry-btn" data-funnel-entry-open>' +
      esc(t("funnel_entry_context")) +
      "</button>" +
      '<button type="button" class="crm-funnel-entry-btn" data-funnel-geo-open>' +
      esc(t("funnel_geo_btn")) +
      "</button>" +
      "</div>" +
      "</div>" +
      sourceScopeHtml() +
      "</div>"
    );
  }

  function fmtVisitorSplit(row) {
    if (!row) return "";
    var parts = [];
    if (row.new) parts.push(t("funnel_visitor_new_short", { n: fmtNum(row.new) }));
    if (row.returning) parts.push(t("funnel_visitor_returning_short", { n: fmtNum(row.returning) }));
    if (row.unknown) parts.push(t("funnel_visitor_unknown_short", { n: fmtNum(row.unknown) }));
    return parts.join(" · ");
  }

  function renderSourceVisitorRows(sourceBreakdown) {
    return ["facebook", "google", "organic", "direct"]
      .map(function (src) {
        var row = (sourceBreakdown && sourceBreakdown[src]) || {};
        if (!row.total) return "";
        var split = fmtVisitorSplit(row);
        return (
          "<li class=\"crm-funnel-source-row\">" +
          "<div class=\"crm-funnel-source-row-head\">" +
          "<span>" + esc(t("funnel_src_" + src)) + "</span>" +
          "<strong>" + esc(fmtNum(row.total)) + "</strong>" +
          "</div>" +
          (split
            ? '<span class="crm-funnel-source-row-split">' + esc(split) + "</span>"
            : "") +
          "</li>"
        );
      })
      .join("");
  }

  /* ── EntryContextPanel (modal body content) ── */
  function EntryContextPanel(ctx) {
    if (!ctx) {
      return (
        '<p class="crm-funnel-empty-list">' + esc(t("funnel_no_acq_data")) + "</p>"
      );
    }
    var sb = ctx.sourceBreakdown || {};
    var sv = ctx.sourceVisitorBreakdown || {};
    var vt = ctx.visitorTotals || {};
    var gads = (state.data && state.data.googleAdsKeywords) || {};
    var kwClicksHint = t("funnel_kw_clicks_setup_hint");
    if (gads.error) kwClicksHint = gads.error;
    else if (gads.setupHint) kwClicksHint = gads.setupHint;
    var html =
      '<div class="crm-funnel-entry crm-funnel-entry--modal">' +
      '<p class="crm-funnel-entry-sub">' +
      esc(
        state.data && state.data.viewLabel
          ? t("funnel_entry_view_sessions", {
              view: state.data.viewLabel,
              n: fmtNum(ctx.totalSessions),
            })
          : t("funnel_entry_all_traffic", { n: fmtNum(ctx.totalSessions) })
      ) +
      "</p>" +
      (vt.total
        ? '<p class="crm-funnel-entry-visitors">' +
          esc(t("funnel_visitor_summary", {
            total: fmtNum(vt.total),
            newCount: fmtNum(vt.new),
            returning: fmtNum(vt.returning),
          })) +
          (vt.unknown
            ? " · " + esc(t("funnel_visitor_unknown_short", { n: fmtNum(vt.unknown) }))
            : "") +
          "</p>"
        : "") +
      '<div class="crm-funnel-source-pills">' +
      ["facebook", "google", "organic", "direct"].map(function (src) {
        var row = sv[src] || {};
        var total = row.total || (ctx.sourceCounts && ctx.sourceCounts[src]) || 0;
        if (!total) {
          return (
            '<div class="crm-funnel-source-pill crm-funnel-source-pill--empty">' +
            '<span class="crm-funnel-source-name">' + esc(t("funnel_src_" + src)) + "</span>" +
            '<strong>' + esc(fmtPct(sb[src])) + "</strong></div>"
          );
        }
        var split = fmtVisitorSplit(row);
        return (
          '<div class="crm-funnel-source-pill">' +
          '<span class="crm-funnel-source-name">' + esc(t("funnel_src_" + src)) + "</span>" +
          '<strong>' + esc(fmtNum(total)) + "</strong>" +
          (split
            ? '<span class="crm-funnel-source-visitor-split">' + esc(split) + "</span>"
            : '<span class="crm-funnel-source-visitor-split">' + esc(fmtPct(sb[src])) + "</span>") +
          "</div>"
        );
      }).join("") +
      "</div>";

    html +=
      '<div class="crm-funnel-acq-grid">' +
      renderAcqList(t("funnel_top_ads_clicks"), ctx.topAdsByClicks) +
      renderAcqList(t("funnel_top_ads_leads"), ctx.topAdsByLeads) +
      renderAcqList(t("funnel_top_kw_clicks"), ctx.topKeywordsByClicks, {
        setupHint:
          isGoogleView() && !(ctx.topKeywordsByClicks || []).length
            ? kwClicksHint
            : "",
        sourceNote:
          isGoogleView() && ctx.keywordClicksSource === "google_ads_api"
            ? t("funnel_kw_clicks_source")
            : "",
      }) +
      renderAcqList(t("funnel_top_kw_leads"), ctx.topKeywordsByLeads, {
        setupHint:
          isGoogleView() && !(ctx.topKeywordsByLeads || []).length
            ? t("funnel_kw_leads_setup_hint")
            : "",
      }) +
      "</div>";

    html += "</div>";
    return html;
  }

  function EntryContextModal() {
    if (!state.entryModalOpen) return "";
    var ctx = state.data && state.data.entryContext ? state.data.entryContext : null;
    var rangeLabel = fmtDateRangeLabel(state.dateFrom, state.dateTo);
    return (
      '<div class="crm-funnel-ad-modal-backdrop" data-funnel-entry-modal-backdrop>' +
      '<div class="crm-funnel-ad-modal crm-funnel-ad-modal--entry" role="dialog" aria-labelledby="crm-funnel-entry-modal-title">' +
      '<div class="crm-funnel-ad-modal-head">' +
      '<div><h3 id="crm-funnel-entry-modal-title">' +
      esc(t("funnel_entry_context")) +
      "</h3>" +
      (rangeLabel ? '<p class="crm-funnel-ad-modal-sub">' + esc(rangeLabel) + "</p>" : "") +
      "</div>" +
      '<button type="button" class="crm-funnel-ad-modal-close" data-funnel-entry-modal-close aria-label="' +
      esc(t("funnel_close")) +
      '">×</button></div>' +
      '<div class="crm-funnel-ad-modal-body">' +
      EntryContextPanel(ctx) +
      "</div></div></div>"
    );
  }

  function geoCoverageLabel(row, grain) {
    if (grain === "country") {
      return row.isUs ? t("funnel_geo_country_us") : t("funnel_geo_country");
    }
    return row.licensed ? t("funnel_geo_licensed") : t("funnel_geo_out_of_area");
  }

  function renderGeoSummary(data) {
    var grain = data.grain;
    var s = data.summary || {};
    if (grain === "none") return "";
    if (grain === "country") {
      return (
        '<div class="crm-funnel-geo-summary">' +
        '<div class="crm-funnel-geo-chip">' +
        esc(t("funnel_geo_summary_us", { n: fmtNum(s.usClicks || 0) })) +
        "</div>" +
        '<div class="crm-funnel-geo-chip">' +
        esc(t("funnel_geo_summary_intl", { n: fmtNum(s.internationalClicks || 0) })) +
        "</div></div>"
      );
    }
    return (
      '<div class="crm-funnel-geo-summary">' +
      '<div class="crm-funnel-geo-chip crm-funnel-geo-chip--licensed">' +
      esc(t("funnel_geo_summary_licensed", { n: fmtNum(s.licensedClicks || 0) })) +
      "</div>" +
      '<div class="crm-funnel-geo-chip">' +
      esc(t("funnel_geo_summary_other", { n: fmtNum(s.otherClicks || 0) })) +
      "</div></div>"
    );
  }

  function renderGeoTable(data) {
    var rows = data.locations || [];
    var grain = data.grain;
    if (!rows.length) {
      return '<p class="crm-funnel-ad-chart-empty">' + esc(t("funnel_geo_empty")) + "</p>";
    }
    return (
      '<table class="crm-funnel-geo-table">' +
      "<thead><tr>" +
      "<th>" + esc(t("funnel_geo_col_location")) + "</th>" +
      "<th>" + esc(t("funnel_geo_col_clicks")) + "</th>" +
      "<th>" + esc(t("funnel_geo_col_impressions")) + "</th>" +
      "<th>" + esc(t("funnel_geo_col_coverage")) + "</th>" +
      "</tr></thead><tbody>" +
      rows
        .map(function (row) {
          var cls = row.licensed
            ? " is-licensed"
            : row.isUs
              ? " is-us"
              : "";
          return (
            '<tr class="' +
            cls.trim() +
            '"><td>' +
            esc(row.name) +
            "</td><td>" +
            esc(fmtNum(row.clicks)) +
            "</td><td>" +
            esc(fmtNum(row.impressions)) +
            "</td><td><span class=\"crm-funnel-geo-badge" +
            (row.licensed ? " crm-funnel-geo-badge--licensed" : "") +
            '">' +
            esc(geoCoverageLabel(row, grain)) +
            "</span></td></tr>"
          );
        })
        .join("") +
      "</tbody></table>"
    );
  }

  function GeoClicksModal() {
    if (!state.geoModalOpen) return "";
    var data = state.geoData || {};
    var rangeLabel = fmtDateRangeLabel(state.dateFrom, state.dateTo);
    var note = data.noteKey ? t(data.noteKey) : "";
    var body;
    if (state.geoLoading) {
      body = '<p class="crm-funnel-ad-chart-empty">' + esc(t("funnel_geo_loading")) + "</p>";
    } else if (state.geoError) {
      body = '<p class="crm-funnel-error">' + esc(state.geoError) + "</p>";
    } else if (data.setupHint && !data.configured) {
      body =
        '<p class="crm-funnel-ad-metrics-note">' +
        esc(data.setupHint) +
        (data.oauthAuthUrl
          ? ' <a class="crm-funnel-gsc-connect" href="' +
            esc(data.oauthAuthUrl) +
            '" target="_blank" rel="noopener">' +
            esc(t("funnel_gsc_connect_oauth")) +
            "</a>"
          : "") +
        "</p>";
    } else if (data.grain === "none") {
      body =
        (note ? '<p class="crm-funnel-geo-note">' + esc(note) + "</p>" : "") +
        '<p class="crm-funnel-geo-filter-note">' +
        esc(t("funnel_geo_state_filter_note")) +
        "</p>";
    } else {
      body =
        (note ? '<p class="crm-funnel-geo-note">' + esc(note) + "</p>" : "") +
        '<p class="crm-funnel-geo-filter-note">' +
        esc(t("funnel_geo_state_filter_note")) +
        "</p>" +
        renderGeoSummary(data) +
        (data.error ? '<p class="crm-funnel-error">' + esc(data.error) + "</p>" : "") +
        renderGeoTable(data);
    }

    return (
      '<div class="crm-funnel-ad-modal-backdrop" data-funnel-geo-modal-backdrop>' +
      '<div class="crm-funnel-ad-modal crm-funnel-ad-modal--geo" role="dialog" aria-labelledby="crm-funnel-geo-modal-title">' +
      '<div class="crm-funnel-ad-modal-head">' +
      '<div><h3 id="crm-funnel-geo-modal-title">' +
      esc(t("funnel_geo_title")) +
      "</h3>" +
      (rangeLabel ? '<p class="crm-funnel-ad-modal-sub">' + esc(rangeLabel) + "</p>" : "") +
      "</div>" +
      '<button type="button" class="crm-funnel-ad-modal-close" data-funnel-geo-modal-close aria-label="' +
      esc(t("funnel_close")) +
      '">×</button></div>' +
      '<div class="crm-funnel-ad-modal-body">' +
      body +
      "</div></div></div>"
    );
  }

  function renderPoliciesSoldMetric(policiesSold) {
    if (!policiesSold || !policiesSold.show) return "";
    if (policiesSold.error && !policiesSold.configured) {
      return (
        '<div class="crm-funnel-ad-metric crm-funnel-ad-metric--policies">' +
        '<span class="crm-funnel-ad-metric-label">' + esc(t("funnel_policies_sold")) + "</span>" +
        '<strong class="crm-funnel-ad-metric-value">—</strong></div>'
      );
    }
    return (
      '<button type="button" class="crm-funnel-ad-metric crm-funnel-ad-metric--clickable crm-funnel-ad-metric--policies" data-funnel-ad-chart="policies_sold" title="' +
      esc(t("funnel_ad_chart_hint")) +
      '">' +
      '<span class="crm-funnel-ad-metric-label">' + esc(t("funnel_policies_sold")) + "</span>" +
      '<strong class="crm-funnel-ad-metric-value">' + esc(fmtNum(policiesSold.count)) + "</strong>" +
      "</button>"
    );
  }

  function renderPoliciesSoldRecent(policiesSold) {
    if (!policiesSold || !policiesSold.show || !(policiesSold.sales || []).length) return "";
    return (
      '<div class="crm-funnel-policies-recent">' +
      renderAcqList(
        t("funnel_policies_recent"),
        policiesSold.sales.map(function (row) {
          return { name: row.name + " · " + row.soldDate, count: 1 };
        })
      ) +
      "</div>"
    );
  }

  function AdPlatformMetrics(metrics, policiesSold) {
    var hasAds = metrics && metrics.show;
    var hasPolicies = policiesSold && policiesSold.show;
    if (!hasAds && !hasPolicies) return "";

    var platformLabel =
      metrics && metrics.platform === "google"
        ? t("funnel_ad_platform_google")
        : t("funnel_ad_platform_facebook");

    var html = '<section class="crm-funnel-ad-metrics">';

    if (hasAds) {
      html +=
        '<div class="crm-funnel-ad-metrics-head">' +
        '<h2 class="crm-funnel-section-title">' +
        esc(platformLabel) +
        "</h2>";
      if (metrics.dateFrom && metrics.dateTo) {
        html +=
          '<p class="crm-funnel-ad-metrics-range">' +
          esc(fmtDateRangeLabel(metrics.dateFrom, metrics.dateTo)) +
          "</p>";
      }
      html += "</div>";
    } else {
      html +=
        '<div class="crm-funnel-ad-metrics-head">' +
        '<h2 class="crm-funnel-section-title">' +
        esc(t("funnel_policies_title")) +
        "</h2>";
      if (policiesSold.dateFrom && policiesSold.dateTo) {
        html +=
          '<p class="crm-funnel-ad-metrics-range">' +
          esc(fmtDateRangeLabel(policiesSold.dateFrom, policiesSold.dateTo)) +
          "</p>";
      }
      html += "</div>";
    }

    if (hasPolicies && !hasAds) {
      html += '<p class="crm-funnel-policies-note">' + esc(t("funnel_policies_note")) + "</p>";
    }

    if (hasAds && metrics.error) {
      html += '<p class="crm-funnel-ad-metrics-note crm-funnel-error">' + esc(metrics.error) + "</p>";
    } else if (hasAds && !metrics.configured) {
      html +=
        '<p class="crm-funnel-ad-metrics-note">' +
        esc(metrics.setupHint || t("funnel_ad_metrics_not_configured")) +
        "</p>";
    }

    if ((hasAds && metrics.configured && !metrics.error) || hasPolicies) {
      html += '<div class="crm-funnel-ad-metrics-grid">';
      if (hasAds && metrics.configured && !metrics.error) {
        html +=
          '<button type="button" class="crm-funnel-ad-metric crm-funnel-ad-metric--clickable" data-funnel-ad-chart="impressions" title="' +
          esc(t("funnel_ad_chart_hint")) +
          '">' +
          '<span class="crm-funnel-ad-metric-label">' +
          esc(t("funnel_ad_impressions")) +
          "</span>" +
          '<strong class="crm-funnel-ad-metric-value">' +
          esc(fmtNum(metrics.impressions)) +
          "</strong></button>";
        if (metrics.clicks != null) {
          html +=
            '<button type="button" class="crm-funnel-ad-metric crm-funnel-ad-metric--clickable" data-funnel-ad-chart="clicks" title="' +
            esc(t("funnel_ad_chart_hint")) +
            '">' +
            '<span class="crm-funnel-ad-metric-label">' +
            esc(t("funnel_ad_clicks")) +
            "</span>" +
            '<strong class="crm-funnel-ad-metric-value">' +
            esc(fmtNum(metrics.clicks)) +
            "</strong></button>";
        }
        if (metrics.spend != null) {
          html +=
            '<button type="button" class="crm-funnel-ad-metric crm-funnel-ad-metric--clickable" data-funnel-ad-chart="spend" title="' +
            esc(t("funnel_ad_chart_hint")) +
            '">' +
            '<span class="crm-funnel-ad-metric-label">' +
            esc(t("funnel_ad_spend")) +
            "</span>" +
            '<strong class="crm-funnel-ad-metric-value">' +
            esc(fmtCurrency(metrics.spend)) +
            "</strong></button>";
        }
      }
      html += renderPoliciesSoldMetric(policiesSold);
      html += "</div>";
      html += renderPoliciesSoldRecent(policiesSold);
    } else if (hasPolicies && policiesSold.error && !policiesSold.configured) {
      html += '<p class="crm-funnel-ad-metrics-note crm-funnel-error">' + esc(policiesSold.error) + "</p>";
      if (policiesSold.setupHint) {
        html += '<p class="crm-funnel-setup-hint">' + esc(policiesSold.setupHint) + "</p>";
      }
    }

    html += "</section>";
    return html;
  }

  function OrganicSearchMetrics(metrics) {
    if (!metrics || !metrics.show) return "";

    var html =
      '<section class="crm-funnel-ad-metrics crm-funnel-organic-metrics">' +
      '<h2 class="crm-funnel-section-title">' + esc(t("funnel_gsc_title")) + "</h2>";

    if (metrics.dateFrom && metrics.dateTo) {
      html +=
        '<p class="crm-funnel-ad-metrics-range">' +
        esc(fmtDateRangeLabel(metrics.dateFrom, metrics.dateTo)) +
        "</p>";
    }

    if (metrics.error) {
      html += '<p class="crm-funnel-ad-metrics-note crm-funnel-error">' + esc(metrics.error) + "</p>";
      if (metrics.setupHint) {
        html += '<p class="crm-funnel-setup-hint">' + esc(metrics.setupHint) + "</p>";
      }
    } else if (!metrics.configured) {
      html +=
        '<p class="crm-funnel-ad-metrics-note">' +
        esc(metrics.setupHint || t("funnel_gsc_not_configured")) +
        (metrics.oauthAuthUrl
          ? ' <a class="crm-funnel-gsc-connect" href="' +
            esc(metrics.oauthAuthUrl) +
            '" target="_blank" rel="noopener">' +
            esc(t("funnel_gsc_connect_oauth")) +
            "</a>"
          : "") +
        "</p>";
    } else {
      html += '<div class="crm-funnel-ad-metrics-grid">';
      html +=
        '<button type="button" class="crm-funnel-ad-metric crm-funnel-ad-metric--clickable" data-funnel-ad-chart="gsc_clicks">' +
        '<span class="crm-funnel-ad-metric-label">' + esc(t("funnel_gsc_clicks")) + "</span>" +
        '<strong class="crm-funnel-ad-metric-value">' + esc(fmtNum(metrics.clicks)) + "</strong>" +
        '<span class="crm-funnel-ad-metric-hint">' + esc(t("funnel_ad_chart_hint")) + "</span></button>";
      html +=
        '<button type="button" class="crm-funnel-ad-metric crm-funnel-ad-metric--clickable" data-funnel-ad-chart="gsc_impressions">' +
        '<span class="crm-funnel-ad-metric-label">' + esc(t("funnel_gsc_impressions")) + "</span>" +
        '<strong class="crm-funnel-ad-metric-value">' + esc(fmtNum(metrics.impressions)) + "</strong>" +
        '<span class="crm-funnel-ad-metric-hint">' + esc(t("funnel_ad_chart_hint")) + "</span></button>";
      html +=
        '<div class="crm-funnel-ad-metric">' +
        '<span class="crm-funnel-ad-metric-label">' + esc(t("funnel_gsc_ctr")) + "</span>" +
        '<strong class="crm-funnel-ad-metric-value">' + esc(fmtPctRate(metrics.ctr)) + "</strong></div>";
      html +=
        '<div class="crm-funnel-ad-metric">' +
        '<span class="crm-funnel-ad-metric-label">' + esc(t("funnel_gsc_position")) + "</span>" +
        '<strong class="crm-funnel-ad-metric-value">' + esc(fmtPosition(metrics.position)) + "</strong></div>";
      html += "</div>";

      if (metrics.firstIncompleteDate && metrics.dateTo >= metrics.firstIncompleteDate) {
        html +=
          '<p class="crm-funnel-ad-metrics-note">' +
          esc(t("funnel_gsc_fresh_data_note", { date: metrics.firstIncompleteDate })) +
          "</p>";
      }

      html += '<div class="crm-funnel-acq-grid crm-funnel-gsc-grid">';
      html += renderAcqList(
        t("funnel_gsc_top_queries"),
        (metrics.topQueries || []).map(function (row) {
          return { name: row.query, count: row.clicks };
        })
      );
      html += renderAcqList(
        t("funnel_gsc_top_pages"),
        (metrics.topPages || []).map(function (row) {
          return { name: row.path || row.page, count: row.clicks };
        })
      );
      html += "</div>";
    }

    html += "</section>";
    return html;
  }

  function avgDailySpend(daily, dateFrom, dateTo) {
    var days = countDaysInclusive(dateFrom, dateTo);
    if (!days || !daily || !daily.length) return null;
    var total = 0;
    daily.forEach(function (d) {
      total += Number(d.spend) || 0;
    });
    return total / days;
  }

  function renderSpendChartSummary(daily) {
    var avg = avgDailySpend(daily, state.dateFrom, state.dateTo);
    if (avg == null) return "";
    return (
      '<p class="crm-funnel-ad-spend-summary">' +
      '<span class="crm-funnel-ad-spend-summary-label">' +
      esc(t("funnel_ad_spend_avg_daily")) +
      "</span>" +
      '<strong class="crm-funnel-ad-spend-summary-value">' +
      esc(fmtCurrency(avg)) +
      "</strong></p>"
    );
  }

  function chooseChartBucketDays(dayCount) {
    if (dayCount <= 31) return 1;
    if (dayCount <= 120) return 7;
    return 14;
  }

  function bucketDailySeries(daily, bucketDays) {
    if (!daily || !daily.length) return [];
    if (bucketDays <= 1) {
      return daily.map(function (d) {
        return {
          date: d.date,
          endDate: d.date,
          clicks: Number(d.clicks) || 0,
          impressions: Number(d.impressions) || 0,
          spend: Number(d.spend) || 0,
          label: fmtShortDate(d.date),
        };
      });
    }
    var out = [];
    for (var i = 0; i < daily.length; i += bucketDays) {
      var chunk = daily.slice(i, i + bucketDays);
      var start = chunk[0].date;
      var end = chunk[chunk.length - 1].date;
      var agg = { date: start, endDate: end, clicks: 0, impressions: 0, spend: 0 };
      chunk.forEach(function (d) {
        agg.clicks += Number(d.clicks) || 0;
        agg.impressions += Number(d.impressions) || 0;
        agg.spend += Number(d.spend) || 0;
      });
      agg.label =
        start === end
          ? fmtShortDate(start)
          : fmtShortDate(start) + "–" + fmtShortDate(end);
      out.push(agg);
    }
    return out;
  }

  function chartBucketNote(bucketDays) {
    if (bucketDays <= 1) return "";
    if (bucketDays === 7) return t("funnel_ad_chart_weekly");
    if (bucketDays === 14) return t("funnel_ad_chart_biweekly");
    return t("funnel_ad_chart_grouped").replace("{days}", String(bucketDays));
  }

  function renderAdDailyChart(metric, daily) {
    if (!daily || !daily.length) {
      return '<p class="crm-funnel-ad-chart-empty">' + esc(t("funnel_ad_no_daily")) + "</p>";
    }
    var key =
      metric === "policies_sold"
        ? "sold"
        : metric === "clicks" || metric === "gsc_clicks"
        ? "clicks"
        : metric === "spend"
          ? "spend"
          : metric === "gsc_impressions"
            ? "impressions"
            : "impressions";
    var bucketDays = chooseChartBucketDays(daily.length);
    var series = bucketDailySeries(daily, bucketDays);
    var max = 1;
    series.forEach(function (d) {
      if ((d[key] || 0) > max) max = d[key];
    });
    var fitChart = bucketDays > 1 || series.length <= 45;
    var denseDaily = bucketDays === 1 && series.length > 14;
    var bucketNote = chartBucketNote(bucketDays);
    return (
      (bucketNote
        ? '<p class="crm-funnel-ad-chart-scroll-hint">' + esc(bucketNote) + "</p>"
        : denseDaily
          ? '<p class="crm-funnel-ad-chart-scroll-hint">' + esc(t("funnel_ad_chart_scroll")) + "</p>"
          : "") +
      (fitChart
        ? '<div class="crm-funnel-ad-chart crm-funnel-ad-chart--' +
          esc(metric) +
          " crm-funnel-ad-chart--fit" +
          (denseDaily ? " crm-funnel-ad-chart--dense" : "") +
          '">'
        : '<div class="crm-funnel-ad-chart-scroll-wrap"><div class="crm-funnel-ad-chart crm-funnel-ad-chart--' +
          esc(metric) +
          (denseDaily ? " crm-funnel-ad-chart--dense" : "") +
          '">') +
      series
        .map(function (d, i) {
          var val = d[key] || 0;
          var h = Math.max(4, Math.round((val / max) * 100));
          var showLabel =
            bucketDays > 1 || !denseDaily || i % 2 === 0 || i === series.length - 1;
          var tip =
            d.endDate && d.endDate !== d.date
              ? fmtShortDate(d.date) + " – " + fmtShortDate(d.endDate) + ": " + fmtChartValue(metric, val)
              : fmtShortDate(d.date) + ": " + fmtChartValue(metric, val);
          var labelText = bucketDays > 1 ? fmtShortDate(d.date) : d.label || fmtShortDate(d.date);
          return (
            '<div class="crm-funnel-ad-bar-col" title="' +
            esc(tip) +
            '">' +
            '<span class="crm-funnel-ad-bar-value">' +
            esc(fmtChartValue(metric, val)) +
            "</span>" +
            '<div class="crm-funnel-ad-bar" style="height:' +
            h +
            '%"></div>' +
            (showLabel
              ? '<span class="crm-funnel-ad-bar-label">' + esc(labelText) + "</span>"
              : '<span class="crm-funnel-ad-bar-label crm-funnel-ad-bar-label--skip" aria-hidden="true"></span>') +
            "</div>"
          );
        })
        .join("") +
      (fitChart ? "</div>" : "</div></div>")
    );
  }

  function AdChartModal() {
    if (!state.adChartMetric) return "";
    var metric = state.adChartMetric;
    var title =
      metric === "policies_sold"
        ? t("funnel_policies_sold_daily")
        : metric === "clicks"
        ? t("funnel_ad_clicks_daily")
        : metric === "gsc_clicks"
          ? t("funnel_gsc_clicks_daily")
          : metric === "gsc_impressions"
            ? t("funnel_gsc_impressions_daily")
            : metric === "spend"
              ? t("funnel_ad_spend_daily")
              : t("funnel_ad_impressions_daily");
    var daily = (state.adChartData && state.adChartData.daily) || [];
    var rangeLabel = fmtDateRangeLabel(state.dateFrom, state.dateTo);

    return (
      '<div class="crm-funnel-ad-modal-backdrop" data-funnel-ad-modal-backdrop>' +
      '<div class="crm-funnel-ad-modal crm-funnel-ad-modal--chart" role="dialog" aria-labelledby="crm-funnel-ad-modal-title">' +
      '<div class="crm-funnel-ad-modal-head">' +
      '<div><h3 id="crm-funnel-ad-modal-title">' +
      esc(title) +
      "</h3>" +
      (rangeLabel ? '<p class="crm-funnel-ad-modal-sub">' + esc(rangeLabel) + "</p>" : "") +
      "</div>" +
      '<button type="button" class="crm-funnel-ad-modal-close" data-funnel-ad-modal-close aria-label="' +
      esc(t("funnel_close")) +
      '">×</button></div>' +
      '<div class="crm-funnel-ad-modal-body">' +
      (state.adChartLoading
        ? '<p class="crm-funnel-ad-chart-empty">' + esc(t("funnel_ad_chart_loading")) + "</p>"
        : state.adChartError
          ? '<p class="crm-funnel-error">' + esc(state.adChartError) + "</p>"
          : (metric === "spend" ? renderSpendChartSummary(daily) : "") +
            renderAdDailyChart(metric, daily)) +
      "</div></div></div>"
    );
  }

  function renderAcqList(title, items, opts) {
    items = items || [];
    opts = opts || {};
    var emptyHtml =
      '<p class="crm-funnel-empty-list">' + esc(t("funnel_no_acq_data")) + "</p>";
    if (!items.length && opts.setupHint) {
      emptyHtml += '<p class="crm-funnel-setup-hint">' + esc(opts.setupHint) + "</p>";
    }
    var sourceNoteHtml = opts.sourceNote
      ? '<p class="crm-funnel-acq-source-note">' + esc(opts.sourceNote) + "</p>"
      : "";
    return (
      '<div class="crm-funnel-acq-list">' +
      "<h3>" + esc(title) + "</h3>" +
      sourceNoteHtml +
      (items.length
        ? "<ul>" +
          items.map(function (row) {
            return (
              "<li><span>" + esc(row.name) + "</span><strong>" + esc(fmtNum(row.count)) + "</strong></li>"
            );
          }).join("") +
          "</ul>"
        : emptyHtml) +
      "</div>"
    );
  }

  /* ── FunnelNode ── */
  function FunnelNode(node, tool, isLast) {
    var health = node.health || "neutral";
    return (
      '<button type="button" class="crm-funnel-node crm-funnel-node--' +
      esc(health) +
      '" data-funnel-node="' +
      esc(tool + ":" + node.id) +
      '">' +
      '<span class="crm-funnel-node-label">' + esc(node.label) + "</span>" +
      '<strong class="crm-funnel-node-count">' + esc(fmtNum(node.count)) + "</strong>" +
      '<span class="crm-funnel-node-meta">' +
      (node.conversionRate != null && node.conversionRate !== 100
        ? esc(t("funnel_conv", { pct: fmtPct(node.conversionRate) }))
        : node.conversionRate === 100 && node.dropOff === 0
          ? esc(t("funnel_entry_count"))
          : "") +
      "</span>" +
      (node.dropOff > 0
        ? '<span class="crm-funnel-node-drop">' +
          esc(t("funnel_dropped", { n: fmtNum(node.dropOff) })) +
          "</span>"
        : "") +
      (!isLast ? '<span class="crm-funnel-node-arrow" aria-hidden="true">↓</span>' : "") +
      "</button>"
    );
  }

  /* ── FunnelBranch ── */
  function FunnelBranch(branch) {
    if (!branch) return "";
    var nodes = branch.nodes || [];
    return (
      '<article class="crm-funnel-branch' +
      (branch.terminal ? " crm-funnel-branch--terminal" : "") +
      '">' +
      '<header class="crm-funnel-branch-head">' +
      "<h3>" + esc(branch.label) + "</h3>" +
      '<span class="crm-funnel-branch-entry">' +
      esc(fmtNum(branch.entryCount || 0)) +
      " " +
      esc(t("funnel_users_label")) +
      "</span></header>" +
      '<div class="crm-funnel-branch-steps">' +
      nodes
        .map(function (node, i) {
          return FunnelNode(node, branch.id, i === nodes.length - 1);
        })
        .join("") +
      "</div></article>"
    );
  }

  /* ── FunnelVisualization ── */
  function FunnelVisualization(branches) {
    var order = ["quote", "calculator", "schedule", "bio", "whatsapp"];
    return (
      '<section class="crm-funnel-viz">' +
      '<div class="crm-funnel-viz-head">' +
      '<div class="crm-funnel-viz-head-text">' +
      '<h2 class="crm-funnel-section-title">' + esc(t("funnel_viz_title")) + "</h2>" +
      '<p class="crm-funnel-viz-sub">' + esc(t("funnel_viz_sub")) + "</p>" +
      "</div>" +
      '<button type="button" class="crm-funnel-reload" data-funnel-reload aria-label="' +
      esc(t("funnel_reload_aria")) +
      '">' +
      esc(t("funnel_reload")) +
      "</button></div>" +
      '<div class="crm-funnel-branches">' +
      order
        .map(function (key) {
          return FunnelBranch(branches[key]);
        })
        .join("") +
      "</div></section>"
    );
  }

  /* ── DetailInspectorPanel ── */
  function DetailInspectorPanel() {
    if (!state.selectedNode) return "";
    if (state.detailLoading) {
      return (
        '<aside class="crm-funnel-inspector">' +
        '<p class="crm-funnel-inspector-loading">' + esc(t("funnel_loading_detail")) + "</p></aside>"
      );
    }
    if (state.detailError) {
      return (
        '<aside class="crm-funnel-inspector">' +
        '<div class="crm-funnel-inspector-head">' +
        "<h3>" + esc(t("funnel_inspector")) + "</h3>" +
        '<button type="button" class="crm-funnel-inspector-close" data-funnel-close-detail aria-label="' +
        esc(t("funnel_close")) +
        '">×</button></div>' +
        '<p class="crm-funnel-error">' + esc(state.detailError) + "</p></aside>"
      );
    }
    var d = state.detail;
    if (!d) return "";

    function breakdownRows(obj, labels) {
      return Object.keys(labels)
        .map(function (k) {
          var n = obj[k] || 0;
          if (!n) return "";
          return (
            "<li><span>" + esc(labels[k]) + "</span><strong>" + esc(fmtNum(n)) + "</strong></li>"
          );
        })
        .join("");
    }

    var visitorSummary = d.visitorBreakdown
      ? t("funnel_users_in_step_visitors", {
          n: fmtNum(d.users),
          newCount: fmtNum(d.visitorBreakdown.new || 0),
          returning: fmtNum(d.visitorBreakdown.returning || 0),
        })
      : t("funnel_users_in_step", { n: fmtNum(d.users) });
    if (d.visitorBreakdown && d.visitorBreakdown.unknown) {
      visitorSummary +=
        " · " + t("funnel_visitor_unknown_short", { n: fmtNum(d.visitorBreakdown.unknown) });
    }

    return (
      '<aside class="crm-funnel-inspector" aria-label="' + esc(t("funnel_inspector")) + '">' +
      '<div class="crm-funnel-inspector-head">' +
      "<h3>" + esc(d.label) + "</h3>" +
      '<button type="button" class="crm-funnel-inspector-close" data-funnel-close-detail aria-label="' +
      esc(t("funnel_close")) +
      '">×</button></div>' +
      '<p class="crm-funnel-inspector-users">' +
      esc(visitorSummary) +
      "</p>" +
      '<div class="crm-funnel-inspector-grid">' +
      '<div class="crm-funnel-inspector-block crm-funnel-inspector-block--wide">' +
      "<h4>" + esc(t("funnel_by_source")) + "</h4>" +
      '<p class="crm-funnel-inspector-hint">' + esc(t("funnel_by_source_hint")) + "</p>" +
      "<ul>" +
      renderSourceVisitorRows(d.sourceBreakdown) +
      "</ul></div>" +
      '<div class="crm-funnel-inspector-block">' +
      "<h4>" + esc(t("funnel_by_device")) + "</h4><ul>" +
      breakdownRows(d.deviceBreakdown, {
        mobile: t("funnel_device_mobile"),
        tablet: t("funnel_device_tablet"),
        desktop: t("funnel_device_desktop"),
      }) +
      "</ul></div>" +
      "</div>" +
      (d.campaignBreakdown && d.campaignBreakdown.length
        ? '<div class="crm-funnel-inspector-block">' +
          "<h4>" + esc(t("funnel_by_campaign")) + "</h4><ul>" +
          d.campaignBreakdown
            .map(function (row) {
              return (
                "<li><span>" + esc(row.name) + "</span><strong>" + esc(fmtNum(row.count)) + "</strong></li>"
              );
            })
            .join("") +
          "</ul></div>"
        : "") +
      '<dl class="crm-funnel-inspector-stats">' +
      "<dt>" + esc(t("funnel_avg_time")) + "</dt>" +
      "<dd>" +
      (d.avgTimeSec != null ? esc(d.avgTimeSec + "s") : "—") +
      "</dd>" +
      "<dt>" + esc(t("funnel_drop_next")) + "</dt>" +
      "<dd>" + (d.dropOffRate != null ? esc(fmtPct(d.dropOffRate)) : "—") + "</dd>" +
      "</dl></aside>"
    );
  }

  /* ── FunnelDashboardPage ── */
  function FunnelDashboardPage() {
    if (state.loading) {
      return (
        '<div class="crm-funnel-page">' +
        '<p class="crm-funnel-loading">' + esc(t("funnel_loading")) + "</p>" +
        AdChartModal() +
        EntryContextModal() +
        GeoClicksModal() +
        "</div>"
      );
    }
    if (!state.data || !state.data.hasData) {
      return (
        '<div class="crm-funnel-page">' +
        FilterBar() +
        AdPlatformMetrics(state.data && state.data.adMetrics, state.data && state.data.policiesSold) +
        OrganicSearchMetrics(state.data && state.data.organicSearch) +
        '<div class="crm-funnel-empty">' +
        "<strong>" + esc(t("funnel_no_data_title")) + "</strong>" +
        "<p>" + esc(t("funnel_no_data_blurb")) + "</p></div>" +
        AdChartModal() +
        EntryContextModal() +
        GeoClicksModal() +
        "</div>"
      );
    }

    return (
      '<div class="crm-funnel-page">' +
      '<header class="crm-funnel-header">' +
      "<h1>" + esc(t("funnel_title")) + "</h1>" +
      "<p>" + esc(t("funnel_subtitle")) + "</p></header>" +
      FilterBar() +
      AdPlatformMetrics(state.data.adMetrics, state.data.policiesSold) +
      OrganicSearchMetrics(state.data.organicSearch) +
      '<div class="crm-funnel-main">' +
      FunnelVisualization(state.data.branches || {}) +
      DetailInspectorPanel() +
      "</div>" +
      AdChartModal() +
      EntryContextModal() +
      GeoClicksModal() +
      "</div>"
    );
  }

  function paint(main) {
    main.innerHTML = FunnelDashboardPage();
  }

  function loadData(main) {
    state.loading = true;
    paint(main);
    return api("/api/staff/funnel-analytics?" + queryString())
      .then(function (data) {
        state.data = data;
        state.loading = false;
        paint(main);
        wireEvents(main);
      })
      .catch(function () {
        state.loading = false;
        state.data = null;
        main.innerHTML =
          '<div class="crm-funnel-page"><p class="crm-funnel-error">' +
          esc(t("funnel_load_error")) +
          "</p></div>";
      });
  }

  function loadNodeDetail(main, tool, step) {
    state.detailLoading = true;
    state.selectedNode = tool + ":" + step;
    state.detailError = null;
    paint(main);
    wireEvents(main);
    return api(
      "/api/staff/funnel-analytics?" +
        queryString({ action: "node", tool: tool, step: step }),
      { method: "GET", softAuth: true }
    )
      .then(function (res) {
        state.detail = res.detail || null;
        state.detailLoading = false;
        state.detailError = null;
        paint(main);
        wireEvents(main);
      })
      .catch(function (err) {
        state.detailLoading = false;
        state.detail = null;
        state.detailError = (err && err.message) || t("funnel_load_error");
        paint(main);
        wireEvents(main);
      });
  }

  function loadAdChart(main, metric) {
    closeGeoClicks(main, { skipPaint: true });
    state.adChartMetric = metric;
    state.adChartLoading = true;
    state.adChartError = null;
    state.adChartData = null;
    paint(main);
    wireEvents(main);
    return api(
      "/api/staff/funnel-analytics?" +
        queryString({
          action:
            metric === "policies_sold"
              ? "policies_daily"
              : metric.indexOf("gsc_") === 0
                ? "gsc_daily"
                : "ad_daily",
        }),
      { method: "GET", softAuth: true }
    )
      .then(function (res) {
        state.adChartData = res;
        state.adChartLoading = false;
        state.adChartError = res.error || null;
        paint(main);
        wireEvents(main);
      })
      .catch(function (err) {
        state.adChartLoading = false;
        state.adChartError = (err && err.message) || t("funnel_load_error");
        paint(main);
        wireEvents(main);
      });
  }

  function closeAdChart(main, opts) {
    state.adChartMetric = null;
    state.adChartLoading = false;
    state.adChartData = null;
    state.adChartError = null;
    if (opts && opts.skipPaint) return;
    paint(main);
    wireEvents(main);
  }

  function openEntryModal(main) {
    closeGeoClicks(main, { skipPaint: true });
    closeAdChart(main, { skipPaint: true });
    state.entryModalOpen = true;
    paint(main);
    wireEvents(main);
  }

  function closeEntryModal(main) {
    state.entryModalOpen = false;
    paint(main);
    wireEvents(main);
  }

  function closeGeoClicks(main, opts) {
    state.geoModalOpen = false;
    state.geoLoading = false;
    state.geoError = null;
    state.geoData = null;
    if (opts && opts.skipPaint) return;
    paint(main);
    wireEvents(main);
  }

  function loadGeoClicks(main) {
    state.geoModalOpen = true;
    state.geoLoading = true;
    state.geoError = null;
    state.geoData = null;
    state.entryModalOpen = false;
    closeAdChart(main, { skipPaint: true });
    paint(main);
    wireEvents(main);
    return api(
      "/api/staff/funnel-analytics?" + queryString({ action: "geo_clicks" }),
      { method: "GET", softAuth: true }
    )
      .then(function (res) {
        state.geoData = res;
        state.geoLoading = false;
        state.geoError = res.error || null;
        paint(main);
        wireEvents(main);
      })
      .catch(function (err) {
        state.geoLoading = false;
        state.geoError = (err && err.message) || t("funnel_load_error");
        paint(main);
        wireEvents(main);
      });
  }

  function wireEvents(main) {
    if (!main) return;

    main.querySelectorAll("[data-funnel-source]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.sourceChannel = btn.getAttribute("data-funnel-source") || "facebook";
        if (state.sourceChannel === "google") {
          state.landingPage = "website";
        }
        syncViewFromFilters();
        state.selectedNode = null;
        state.detail = null;
        state.entryModalOpen = false;
        closeGeoClicks(main, { skipPaint: true });
        closeAdChart(main);
        paint(main);
        wireEvents(main);
        loadData(main);
      });
    });

    var landingSelect = main.querySelector("[data-funnel-landing]");
    if (landingSelect) {
      landingSelect.addEventListener("change", function () {
        state.landingPage = landingSelect.value || "website";
        syncViewFromFilters();
        state.selectedNode = null;
        state.detail = null;
        state.entryModalOpen = false;
        closeGeoClicks(main, { skipPaint: true });
        closeAdChart(main);
        loadData(main);
      });
    }

    var stateSelect = main.querySelector("[data-funnel-state]");
    if (stateSelect) {
      stateSelect.addEventListener("change", function () {
        state.licensedState = stateSelect.value || "ALL";
        state.selectedNode = null;
        state.detail = null;
        state.entryModalOpen = false;
        closeGeoClicks(main, { skipPaint: true });
        closeAdChart(main);
        loadData(main);
      });
    }

    var entryOpenBtn = main.querySelector("[data-funnel-entry-open]");
    if (entryOpenBtn) {
      entryOpenBtn.addEventListener("click", function (ev) {
        ev.preventDefault();
        openEntryModal(main);
      });
    }

    var entryModalClose = main.querySelector("[data-funnel-entry-modal-close]");
    if (entryModalClose) {
      entryModalClose.addEventListener("click", function (ev) {
        ev.preventDefault();
        closeEntryModal(main);
      });
    }
    var entryModalBackdrop = main.querySelector("[data-funnel-entry-modal-backdrop]");
    if (entryModalBackdrop) {
      entryModalBackdrop.addEventListener("click", function (ev) {
        if (ev.target === entryModalBackdrop) closeEntryModal(main);
      });
    }

    var geoOpenBtn = main.querySelector("[data-funnel-geo-open]");
    if (geoOpenBtn) {
      geoOpenBtn.addEventListener("click", function (ev) {
        ev.preventDefault();
        loadGeoClicks(main);
      });
    }
    var geoModalClose = main.querySelector("[data-funnel-geo-modal-close]");
    if (geoModalClose) {
      geoModalClose.addEventListener("click", function (ev) {
        ev.preventDefault();
        closeGeoClicks(main);
      });
    }
    var geoModalBackdrop = main.querySelector("[data-funnel-geo-modal-backdrop]");
    if (geoModalBackdrop) {
      geoModalBackdrop.addEventListener("click", function (ev) {
        if (ev.target === geoModalBackdrop) closeGeoClicks(main);
      });
    }

    main.querySelectorAll("[data-funnel-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.view = btn.getAttribute("data-funnel-view");
        state.selectedNode = null;
        state.detail = null;
        closeGeoClicks(main, { skipPaint: true });
        closeAdChart(main);
        loadData(main);
      });
    });

    var periodSelect = main.querySelector("[data-funnel-period]");
    if (periodSelect) {
      periodSelect.addEventListener("change", function () {
        var val = periodSelect.value;
        if (val === "custom") {
          state.periodDays = "custom";
          return;
        }
        applyPeriodDays(Number(val));
        state.selectedNode = null;
        state.detail = null;
        closeGeoClicks(main, { skipPaint: true });
        closeAdChart(main);
        loadData(main);
      });
    }

    var periodEl = main.querySelector("[data-funnel-date-from]");
    var toEl = main.querySelector("[data-funnel-date-to]");
    function onDateChange() {
      if (periodEl) state.dateFrom = periodEl.value;
      if (toEl) state.dateTo = toEl.value;
      ensureDateRange();
      syncPeriodFromDates();
      if (periodSelect && state.periodDays === "custom") {
        periodSelect.value = "custom";
      }
      state.selectedNode = null;
      state.detail = null;
      closeGeoClicks(main, { skipPaint: true });
      closeAdChart(main);
      loadData(main);
    }
    if (periodEl) periodEl.addEventListener("change", onDateChange);
    if (toEl) toEl.addEventListener("change", onDateChange);

    main.querySelectorAll("[data-funnel-node]").forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var parts = (btn.getAttribute("data-funnel-node") || "").split(":");
        if (parts.length === 2) loadNodeDetail(main, parts[0], parts[1]);
      });
    });

    var closeBtn = main.querySelector("[data-funnel-close-detail]");
    if (closeBtn) {
      closeBtn.addEventListener("click", function (ev) {
        ev.preventDefault();
        state.selectedNode = null;
        state.detail = null;
        state.detailError = null;
        paint(main);
        wireEvents(main);
      });
    }

    var reloadBtn = main.querySelector("[data-funnel-reload]");
    if (reloadBtn) {
      reloadBtn.addEventListener("click", function (ev) {
        ev.preventDefault();
        state.selectedNode = null;
        state.detail = null;
        state.detailError = null;
        closeGeoClicks(main, { skipPaint: true });
        closeAdChart(main);
        loadData(main);
      });
    }

    main.querySelectorAll("[data-funnel-ad-chart]").forEach(function (btn) {
      btn.addEventListener("click", function (ev) {
        ev.preventDefault();
        var metric = btn.getAttribute("data-funnel-ad-chart");
        if (metric) loadAdChart(main, metric);
      });
    });

    var adModalClose = main.querySelector("[data-funnel-ad-modal-close]");
    if (adModalClose) {
      adModalClose.addEventListener("click", function (ev) {
        ev.preventDefault();
        closeAdChart(main);
      });
    }
    var adModalBackdrop = main.querySelector("[data-funnel-ad-modal-backdrop]");
    if (adModalBackdrop) {
      adModalBackdrop.addEventListener("click", function (ev) {
        if (ev.target === adModalBackdrop) closeAdChart(main);
      });
    }
  }

  function mount(main) {
    applyPeriodDays(1);
    state.sourceChannel = "facebook";
    state.landingPage = "website";
    state.licensedState = "ALL";
    state.entryModalOpen = false;
    state.geoModalOpen = false;
    state.geoData = null;
    syncViewFromFilters();
    state.selectedNode = null;
    state.detail = null;
    state.detailError = null;
    return loadData(main);
  }

  window.StaffCrmFunnelDashboard = {
    mount: mount,
    FilterBar: FilterBar,
    EntryContextPanel: EntryContextPanel,
    FunnelVisualization: FunnelVisualization,
    FunnelBranch: FunnelBranch,
    FunnelNode: FunnelNode,
    DetailInspectorPanel: DetailInspectorPanel,
  };
})();
