/**
 * Staff CRM — Product Funnel Analytics Dashboard
 * Components: FilterBar, EntryContextPanel, FunnelVisualization, FunnelBranch, FunnelNode, DetailInspectorPanel
 */
(function () {
  "use strict";

  var state = {
    view: "facebook",
    dateFrom: "",
    dateTo: "",
    data: null,
    loading: false,
    selectedNode: null,
    detail: null,
    detailLoading: false,
    detailError: null,
  };

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

  function fmtPct(n) {
    var v = Number(n);
    if (v == null || isNaN(v)) return "—";
    return v.toFixed(1) + "%";
  }

  function queryString(extra) {
    ensureDateRange();
    var q = [
      "view=" + encodeURIComponent(state.view),
      "date_from=" + encodeURIComponent(state.dateFrom),
      "date_to=" + encodeURIComponent(state.dateTo),
    ];
    if (extra) Object.keys(extra).forEach(function (k) {
      q.push(encodeURIComponent(k) + "=" + encodeURIComponent(extra[k]));
    });
    return q.join("&");
  }

  /* ── FilterBar ── */
  function FilterBar() {
    ensureDateRange();
    return (
      '<div class="crm-funnel-filterbar">' +
      '<div class="crm-funnel-filterbar-row">' +
      '<div class="crm-funnel-date-range">' +
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
      '<div class="crm-funnel-view-tabs">' +
      ["facebook", "google", "website"].map(function (v) {
        return (
          '<button type="button" class="crm-funnel-view-tab' +
          (state.view === v ? " is-active" : "") +
          '" data-funnel-view="' +
          esc(v) +
          '">' +
          esc(t("funnel_view_" + v)) +
          "</button>"
        );
      }).join("") +
      "</div></div></div>"
    );
  }

  /* ── EntryContextPanel ── */
  function EntryContextPanel(ctx) {
    if (!ctx) return "";
    var sb = ctx.sourceBreakdown || {};
    var html =
      '<section class="crm-funnel-entry">' +
      '<h2 class="crm-funnel-section-title">' + esc(t("funnel_entry_context")) + "</h2>" +
      '<p class="crm-funnel-entry-sub">' +
      esc(t("funnel_entry_at", { entry: state.data ? state.data.entryLabel : "" })) +
      " · " +
      esc(t("funnel_sessions", { n: fmtNum(ctx.totalSessions) })) +
      "</p>" +
      '<div class="crm-funnel-source-pills">' +
      ["facebook", "google", "organic", "direct"].map(function (src) {
        return (
          '<div class="crm-funnel-source-pill">' +
          '<span class="crm-funnel-source-name">' + esc(t("funnel_src_" + src)) + "</span>" +
          '<strong>' + esc(fmtPct(sb[src])) + "</strong></div>"
        );
      }).join("") +
      "</div>";

    if (state.view === "facebook" || state.view === "google") {
      html += '<div class="crm-funnel-acq-grid">';
      if (state.view === "facebook") {
        html += renderAcqList(t("funnel_top_ads_clicks"), ctx.topAdsByClicks);
        html += renderAcqList(t("funnel_top_ads_leads"), ctx.topAdsByLeads);
      }
      if (state.view === "google") {
        html += renderAcqList(t("funnel_top_kw_clicks"), ctx.topKeywordsByClicks);
        html += renderAcqList(t("funnel_top_kw_leads"), ctx.topKeywordsByLeads);
      }
      html += "</div>";
    }

    html += "</section>";
    return html;
  }

  function renderAcqList(title, items) {
    items = items || [];
    return (
      '<div class="crm-funnel-acq-list">' +
      "<h3>" + esc(title) + "</h3>" +
      (items.length
        ? "<ul>" +
          items.map(function (row) {
            return (
              "<li><span>" + esc(row.name) + "</span><strong>" + esc(fmtNum(row.count)) + "</strong></li>"
            );
          }).join("") +
          "</ul>"
        : '<p class="crm-funnel-empty-list">' + esc(t("funnel_no_acq_data")) + "</p>") +
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
      '<h2 class="crm-funnel-section-title">' + esc(t("funnel_viz_title")) + "</h2>" +
      '<p class="crm-funnel-viz-sub">' + esc(t("funnel_viz_sub")) + "</p>" +
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

    return (
      '<aside class="crm-funnel-inspector" aria-label="' + esc(t("funnel_inspector")) + '">' +
      '<div class="crm-funnel-inspector-head">' +
      "<h3>" + esc(d.label) + "</h3>" +
      '<button type="button" class="crm-funnel-inspector-close" data-funnel-close-detail aria-label="' +
      esc(t("funnel_close")) +
      '">×</button></div>' +
      '<p class="crm-funnel-inspector-users">' +
      esc(t("funnel_users_in_step", { n: fmtNum(d.users) })) +
      "</p>" +
      '<div class="crm-funnel-inspector-grid">' +
      '<div class="crm-funnel-inspector-block">' +
      "<h4>" + esc(t("funnel_by_source")) + "</h4><ul>" +
      breakdownRows(d.sourceBreakdown, {
        facebook: t("funnel_src_facebook"),
        google: t("funnel_src_google"),
        organic: t("funnel_src_organic"),
        direct: t("funnel_src_direct"),
      }) +
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
        '<p class="crm-funnel-loading">' + esc(t("funnel_loading")) + "</p></div>"
      );
    }
    if (!state.data || !state.data.hasData) {
      return (
        '<div class="crm-funnel-page">' +
        FilterBar() +
        '<div class="crm-funnel-empty">' +
        "<strong>" + esc(t("funnel_no_data_title")) + "</strong>" +
        "<p>" + esc(t("funnel_no_data_blurb")) + "</p></div></div>"
      );
    }

    return (
      '<div class="crm-funnel-page">' +
      '<header class="crm-funnel-header">' +
      "<h1>" + esc(t("funnel_title")) + "</h1>" +
      "<p>" + esc(t("funnel_subtitle")) + "</p></header>" +
      FilterBar() +
      EntryContextPanel(state.data.entryContext) +
      '<div class="crm-funnel-main">' +
      FunnelVisualization(state.data.branches || {}) +
      DetailInspectorPanel() +
      "</div></div>"
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

  function wireEvents(main) {
    if (!main) return;

    main.querySelectorAll("[data-funnel-view]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.view = btn.getAttribute("data-funnel-view");
        state.selectedNode = null;
        state.detail = null;
        loadData(main);
      });
    });

    var periodEl = main.querySelector("[data-funnel-date-from]");
    var toEl = main.querySelector("[data-funnel-date-to]");
    function onDateChange() {
      if (periodEl) state.dateFrom = periodEl.value;
      if (toEl) state.dateTo = toEl.value;
      ensureDateRange();
      state.selectedNode = null;
      state.detail = null;
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
  }

  function mount(main) {
    var defaults = defaultDateRange();
    state.view = "facebook";
    state.dateFrom = defaults.dateFrom;
    state.dateTo = defaults.dateTo;
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
