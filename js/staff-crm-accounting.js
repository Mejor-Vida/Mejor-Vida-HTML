/**
 * CRM Accounting — parallel books modeled on Patriot Accounting.
 */
(function () {
  "use strict";

  var PANES = [
    "home",
    "statements",
    "register",
    "reconcile",
    "review",
    "ledger",
    "reports",
    "tax",
    "journal",
    "vendors",
    "accounts",
  ];
  var REPORTS = ["pl", "bs", "tb", "gl"];

  var state = {
    pane: "home",
    report: "pl",
    accounts: [],
    vendors: [],
    settings: {},
    dashboard: null,
    items: [],
    statements: [],
    reportData: null,
    voids: [],
    markedLineIds: [],
    reconciliations: [],
    suggestedCents: null,
    accountId: "",
    taxYear: String(new Date().getFullYear()),
    business: null,
    start: "",
    end: "",
    loading: false,
    status: "",
    statusError: false,
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

  function $(id, root) {
    return (root || document).querySelector("#" + id);
  }

  function navigate(hash) {
    if (window.StaffCrm && window.StaffCrm.navigate) window.StaffCrm.navigate(hash);
    else location.hash = hash;
  }

  function todayIso() {
    var d = new Date();
    var mm = String(d.getMonth() + 1).padStart(2, "0");
    var dd = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + mm + "-" + dd;
  }

  function monthStart() {
    return todayIso().slice(0, 8) + "01";
  }

  function money(cents) {
    var n = (Number(cents) || 0) / 100;
    var abs = Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return n < 0 ? "-$" + abs : "$" + abs;
  }

  function moneyClass(cents) {
    return (Number(cents) || 0) < 0 ? "val is-neg" : "val";
  }

  function accountSelect(id, selected, opts) {
    opts = opts || {};
    var list = (state.accounts || []).filter(function (a) {
      if (!a.is_active) return false;
      if (opts.registers && a.subtype !== "bank" && a.subtype !== "credit_card") return false;
      return true;
    });
    var html =
      "<select" +
      (id ? ' id="' + esc(id) + '"' : "") +
      "><option value=\"\">" +
      esc(opts.placeholder || t("acct_pick_account")) +
      "</option>";
    list.forEach(function (a) {
      var sel = String(selected || "") === String(a.id) ? " selected" : "";
      html +=
        '<option value="' +
        esc(a.id) +
        '"' +
        sel +
        ">" +
        esc(a.code + " · " + a.name) +
        "</option>";
    });
    return html + "</select>";
  }

  function paneHash(pane, report) {
    if (pane === "reports") return "#/accounting/reports/" + (report || state.report || "pl");
    if (pane === "tax") return "#/accounting/tax/" + (report || state.taxYear);
    if (pane === "home") return "#/accounting";
    return "#/accounting/" + pane;
  }

  function subtabs() {
    return (
      '<nav class="crm-acct-subtabs" aria-label="' +
      esc(t("acct_title")) +
      '">' +
      PANES.map(function (p) {
        var on = state.pane === p ? " is-active" : "";
        return (
          '<button type="button" class="crm-acct-subtab' +
          on +
          '" data-acct-pane="' +
          p +
          '">' +
          esc(t("acct_tab_" + p)) +
          "</button>"
        );
      }).join("") +
      "</nav>"
    );
  }

  function datesBar(extra) {
    return (
      '<div class="crm-acct-toolbar">' +
      '<label>' +
      esc(t("acct_start")) +
      '<input type="date" id="crm-acct-start" value="' +
      esc(state.start || monthStart()) +
      '" /></label>' +
      '<label>' +
      esc(t("acct_end")) +
      '<input type="date" id="crm-acct-end" value="' +
      esc(state.end || todayIso()) +
      '" /></label>' +
      (extra || "") +
      '<button type="button" class="crm-btn" id="crm-acct-run">' +
      esc(t("acct_run")) +
      "</button></div>"
    );
  }

  function statusHtml() {
    if (!state.status) return '<div id="crm-acct-status" class="crm-acct-status"></div>';
    return (
      '<div id="crm-acct-status" class="crm-acct-status' +
      (state.statusError ? " is-error" : "") +
      '">' +
      esc(state.status) +
      "</div>"
    );
  }

  function setStatus(msg, isError) {
    state.status = msg || "";
    state.statusError = !!isError;
    var el = $("crm-acct-status");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-error", !!isError);
  }

  function shell(inner) {
    return (
      '<div class="crm-acct-shell">' +
      '<h1 class="crm-acct-page-title">' +
      esc(t("acct_title")) +
      "</h1>" +
      '<p class="crm-acct-banner">' +
      esc(t("acct_banner")) +
      "</p>" +
      subtabs() +
      inner +
      statusHtml() +
      "</div>"
    );
  }

  function card(label, cents) {
    return (
      '<div class="crm-acct-card"><span class="lbl">' +
      esc(label) +
      '</span><span class="' +
      moneyClass(cents) +
      '">' +
      esc(money(cents)) +
      "</span></div>"
    );
  }

  function homeHtml() {
    var d = state.dashboard || {};
    return shell(
      '<div class="crm-acct-cards">' +
        card(t("acct_checking"), d.checking && d.checking.balance_cents) +
        card(t("acct_savings"), d.savings && d.savings.balance_cents) +
        card(t("acct_card"), d.credit_card && d.credit_card.balance_cents) +
        card(t("acct_income_month"), d.income_cents) +
        card(t("acct_expense_month"), d.expense_cents) +
        card(t("acct_net_month"), d.net_cents) +
        "</div>" +
        statementDropHtml() +
        '<p class="crm-acct-muted">' +
        esc(t("acct_pending_count", { n: d.pending_count || 0 })) +
        "</p>" +
        '<div class="crm-acct-actions">' +
        '<button type="button" class="crm-btn" data-acct-pane="statements">' +
        esc(t("acct_tab_statements")) +
        "</button>" +
        '<button type="button" class="crm-btn secondary" data-acct-pane="register">' +
        esc(t("acct_tab_register")) +
        "</button>" +
        '<button type="button" class="crm-btn secondary" data-acct-pane="reconcile">' +
        esc(t("acct_tab_reconcile")) +
        "</button>" +
        '<button type="button" class="crm-btn secondary" data-acct-pane="tax">' +
        esc(t("acct_tab_tax")) +
        "</button>" +
        '<button type="button" class="crm-btn secondary" data-acct-pane="review">' +
        esc(t("acct_go_review")) +
        "</button>" +
        '<button type="button" class="crm-btn secondary" data-acct-pane="accounts">' +
        esc(t("acct_go_opening")) +
        "</button></div>"
    );
  }

  function statementDropHtml() {
    return (
      '<div class="crm-acct-drop" id="crm-acct-drop">' +
      "<strong>" +
      esc(t("acct_stmt_drop_title")) +
      "</strong>" +
      "<p>" +
      esc(t("acct_stmt_drop_help")) +
      "</p>" +
      '<label class="crm-btn" style="cursor:pointer">' +
      esc(t("acct_stmt_choose")) +
      '<input type="file" id="crm-acct-stmt-file" accept="application/pdf,.pdf" multiple hidden /></label>' +
      "</div>"
    );
  }

  function kindLabel(kind) {
    if (kind === "chase_card") return t("acct_stmt_kind_card");
    if (kind === "cornhusker_checking") return t("acct_stmt_kind_checking");
    return kind || "";
  }

  function statementsHtml() {
    var rows = (state.statements || [])
      .map(function (s) {
        var needs = s.needs_julie
          ? '<div class="crm-acct-muted">' + esc(String(s.needs_julie).slice(0, 240)) + "</div>"
          : "";
        var err = s.error ? '<div class="crm-acct-status is-error">' + esc(s.error) + "</div>" : "";
        return (
          "<tr><td>" +
          esc((s.created_at || "").slice(0, 10)) +
          "</td><td>" +
          esc(s.file_name || "") +
          "</td><td>" +
          esc(kindLabel(s.kind)) +
          "</td><td>" +
          esc(s.period_end || "") +
          "</td><td class=\"num\">" +
          (s.end_cents != null ? esc(money(s.end_cents)) : "") +
          "</td><td>" +
          esc(s.status || "") +
          " · " +
          esc(t("acct_stmt_posted", { n: s.posted_count || 0, skip: s.skipped_count || 0 })) +
          needs +
          err +
          "</td></tr>"
        );
      })
      .join("");
    return shell(
      statementDropHtml() +
        '<p class="crm-acct-muted">' +
        esc(t("acct_stmt_list_help")) +
        "</p>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr>' +
        "<th>" +
        esc(t("acct_date")) +
        "</th><th>" +
        esc(t("acct_stmt_file")) +
        "</th><th>" +
        esc(t("acct_stmt_kind")) +
        "</th><th>" +
        esc(t("acct_end")) +
        "</th><th class=\"num\">" +
        esc(t("acct_stmt_ending")) +
        "</th><th>" +
        esc(t("acct_stmt_result")) +
        "</th></tr></thead><tbody>" +
        (rows ||
          '<tr><td colspan="6" class="crm-acct-muted">' +
          esc(t("acct_stmt_empty")) +
          "</td></tr>") +
        "</tbody></table></div>"
    );
  }

  function defaultRegisterId() {
    if (state.accountId) return state.accountId;
    var checking = (state.accounts || []).find(function (a) {
      return a.code === "1000";
    });
    return checking ? checking.id : "";
  }

  function registerHtml() {
    var r = state.reportData || {};
    var rows = (r.rows || [])
      .map(function (ln) {
        return (
          "<tr><td>" +
          esc(ln.entry_date) +
          "</td><td>" +
          esc(ln.payee || ln.memo) +
          '</td><td class="num">' +
          esc(money(ln.delta_cents)) +
          '</td><td class="num">' +
          esc(money(ln.running_cents)) +
          "</td></tr>"
        );
      })
      .join("");
    var voids = (state.voids || [])
      .map(function (v) {
        return (
          "<tr><td>" +
          esc((v.voided_at || "").slice(0, 10)) +
          "</td><td>" +
          esc(v.entry_date || "") +
          "</td><td>" +
          esc(v.payee || v.memo || "") +
          "</td></tr>"
        );
      })
      .join("");
    return shell(
      '<p class="crm-acct-muted">' +
        esc(t("acct_register_help")) +
        "</p>" +
        datesBar(
          "<label>" +
            esc(t("acct_bank_account")) +
            accountSelect("crm-acct-reg-account", defaultRegisterId(), { registers: true }) +
            "</label>"
        ) +
        '<p class="crm-acct-muted">' +
        esc(t("acct_register_opening")) +
        " " +
        esc(money(r.opening_cents)) +
        " · " +
        esc(t("acct_register_ending")) +
        " " +
        esc(money(r.ending_cents)) +
        "</p>" +
        '<div class="crm-acct-actions"><button type="button" class="crm-btn secondary" id="crm-acct-csv-dl">' +
        esc(t("acct_export_csv")) +
        "</button></div>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_date")) +
        "</th><th>" +
        esc(t("acct_description")) +
        '</th><th class="num">' +
        esc(t("acct_amount")) +
        '</th><th class="num">' +
        esc(t("acct_register_balance")) +
        "</th></tr></thead><tbody>" +
        (rows ||
          '<tr><td colspan="4" class="crm-acct-muted">' +
          esc(t("acct_register_empty")) +
          "</td></tr>") +
        "</tbody></table></div>" +
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_void_log")) +
        "</h3>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_voided")) +
        "</th><th>" +
        esc(t("acct_date")) +
        "</th><th>" +
        esc(t("acct_description")) +
        "</th></tr></thead><tbody>" +
        (voids ||
          '<tr><td colspan="3" class="crm-acct-muted">' +
          esc(t("acct_void_empty")) +
          "</td></tr>") +
        "</tbody></table></div>"
    );
  }

  function reconcileHtml() {
    var r = state.reportData || {};
    var marked = {};
    (state.markedLineIds || []).forEach(function (id) {
      marked[String(id)] = true;
    });
    var rows = (r.rows || [])
      .map(function (ln) {
        var on = marked[String(ln.id)] ? " checked" : "";
        var dis = marked[String(ln.id)] ? " disabled" : "";
        return (
          "<tr><td><input type=\"checkbox\" class=\"crm-acct-cleared\" data-line=\"" +
          esc(ln.id) +
          '" data-delta="' +
          esc(String(ln.delta_cents || 0)) +
          '"' +
          on +
          dis +
          " /></td><td>" +
          esc(ln.entry_date) +
          "</td><td>" +
          esc(ln.payee || ln.memo) +
          '</td><td class="num">' +
          esc(money(ln.delta_cents)) +
          "</td></tr>"
        );
      })
      .join("");
    var hist = (state.reconciliations || [])
      .map(function (rec) {
        return (
          "<tr><td>" +
          esc(rec.statement_date) +
          '</td><td class="num">' +
          esc(money(rec.statement_cents)) +
          "</td></tr>"
        );
      })
      .join("");
    var stmtVal =
      state.suggestedCents != null ? (Number(state.suggestedCents) / 100).toFixed(2) : "";
    return shell(
      '<p class="crm-acct-muted">' +
        esc(t("acct_recon_help")) +
        "</p>" +
        '<div class="crm-acct-toolbar">' +
        "<label>" +
        esc(t("acct_bank_account")) +
        accountSelect("crm-acct-recon-account", defaultRegisterId(), { registers: true }) +
        "</label>" +
        "<label>" +
        esc(t("acct_stmt_date")) +
        '<input type="date" id="crm-acct-recon-date" value="' +
        esc(state.end || todayIso()) +
        '" /></label>' +
        "<label>" +
        esc(t("acct_stmt_ending")) +
        '<input type="text" inputmode="decimal" id="crm-acct-recon-amount" value="' +
        esc(stmtVal) +
        '" /></label>' +
        '<button type="button" class="crm-btn" id="crm-acct-recon-load">' +
        esc(t("acct_run")) +
        "</button></div>" +
        '<p class="crm-acct-muted" id="crm-acct-recon-math">' +
        esc(t("acct_recon_diff")) +
        " —</p>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_cleared")) +
        "</th><th>" +
        esc(t("acct_date")) +
        "</th><th>" +
        esc(t("acct_description")) +
        '</th><th class="num">' +
        esc(t("acct_amount")) +
        "</th></tr></thead><tbody>" +
        (rows ||
          '<tr><td colspan="4" class="crm-acct-muted">' +
          esc(t("acct_register_empty")) +
          "</td></tr>") +
        "</tbody></table></div>" +
        '<div class="crm-acct-actions"><button type="button" class="crm-btn" id="crm-acct-recon-save">' +
        esc(t("acct_recon_finish")) +
        "</button></div>" +
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_recon_history")) +
        "</h3>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_stmt_date")) +
        '</th><th class="num">' +
        esc(t("acct_stmt_ending")) +
        "</th></tr></thead><tbody>" +
        (hist ||
          '<tr><td colspan="2" class="crm-acct-muted">' +
          esc(t("acct_recon_none")) +
          "</td></tr>") +
        "</tbody></table></div>"
    );
  }

  function reviewHtml() {
    var rows = (state.items || [])
      .map(function (item) {
        return (
          "<tr data-import-id=\"" +
          esc(item.id) +
          "\">" +
          "<td>" +
          esc(item.txn_date) +
          "</td>" +
          "<td>" +
          esc(item.description) +
          "</td>" +
          '<td class="num">' +
          esc(money(item.amount_cents)) +
          "</td>" +
          "<td>" +
          accountSelect("cat-" + item.id, item.suggested_account_id, { placeholder: t("acct_pick_category") }) +
          "</td>" +
          '<td class="crm-acct-actions">' +
          '<button type="button" class="crm-btn" data-acct-post="' +
          esc(item.id) +
          '">' +
          esc(t("acct_post")) +
          "</button>" +
          '<button type="button" class="crm-btn secondary" data-acct-ignore="' +
          esc(item.id) +
          '">' +
          esc(t("acct_ignore")) +
          "</button></td></tr>"
        );
      })
      .join("");
    return shell(
      '<div class="crm-acct-toolbar">' +
        "<label>" +
        esc(t("acct_bank_account")) +
        accountSelect("crm-acct-import-account", "", { registers: true }) +
        "</label>" +
        '<label class="crm-btn secondary" style="cursor:pointer">' +
        esc(t("acct_choose_csv")) +
        '<input type="file" id="crm-acct-file" accept=".csv,text/csv,text/plain" hidden /></label>' +
        '<button type="button" class="crm-btn" id="crm-acct-import">' +
        esc(t("acct_import")) +
        "</button>" +
        '<button type="button" class="crm-btn secondary" id="crm-acct-post-matched">' +
        esc(t("acct_post_matched")) +
        "</button></div>" +
        "<label class=\"crm-acct-muted\">" +
        esc(t("acct_paste_csv")) +
        '<textarea id="crm-acct-csv" class="crm-acct-csv" spellcheck="false"></textarea></label>' +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr>' +
        "<th>" +
        esc(t("acct_date")) +
        "</th><th>" +
        esc(t("acct_description")) +
        "</th><th class=\"num\">" +
        esc(t("acct_amount")) +
        "</th><th>" +
        esc(t("acct_category")) +
        "</th><th></th></tr></thead><tbody>" +
        (rows ||
          '<tr><td colspan="5" class="crm-acct-muted">' +
            esc(t("acct_review_empty")) +
            "</td></tr>") +
        "</tbody></table></div>"
    );
  }

  function reportTabs() {
    return REPORTS.map(function (r) {
      var on = state.report === r ? " is-active" : "";
      return (
        '<button type="button" class="crm-acct-subtab' +
        on +
        '" data-acct-report="' +
        r +
        '">' +
        esc(t("acct_report_" + r)) +
        "</button>"
      );
    }).join("");
  }

  function reportRows(list, kind) {
    return (list || [])
      .filter(function (r) {
        return r.balance_cents || r.debit_cents || r.credit_cents;
      })
      .map(function (r) {
        var amt = kind === "tb" ? "" : '<td class="num">' + esc(money(r.balance_cents)) + "</td>";
        var tb =
          kind === "tb"
            ? '<td class="num">' +
              esc(money(r.debit_cents)) +
              '</td><td class="num">' +
              esc(money(r.credit_cents)) +
              "</td>"
            : "";
        return (
          "<tr><td>" +
          esc(r.code) +
          "</td><td>" +
          esc(r.name) +
          "</td>" +
          tb +
          amt +
          "</tr>"
        );
      })
      .join("");
  }

  function reportsHtml() {
    var r = state.reportData || {};
    var body = "";
    if (state.report === "pl") {
      body =
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_income")) +
        "</h3>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><tbody>' +
        reportRows(r.income) +
        '</tbody><tfoot><tr><td></td><td>' +
        esc(t("acct_total")) +
        '</td><td class="num">' +
        esc(money(r.income_cents)) +
        "</td></tr></tfoot></table></div>" +
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_expenses")) +
        "</h3>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><tbody>' +
        reportRows(r.expense) +
        '</tbody><tfoot><tr><td></td><td>' +
        esc(t("acct_total")) +
        '</td><td class="num">' +
        esc(money(r.expense_cents)) +
        "</td></tr><tr><td></td><td>" +
        esc(t("acct_net")) +
        '</td><td class="num">' +
        esc(money(r.net_cents)) +
        "</td></tr></tfoot></table></div>";
    } else if (state.report === "bs") {
      body =
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_assets")) +
        "</h3><div class=\"crm-acct-table-wrap\"><table class=\"crm-acct-table\"><tbody>" +
        reportRows(r.assets) +
        '</tbody><tfoot><tr><td></td><td>' +
        esc(t("acct_total")) +
        '</td><td class="num">' +
        esc(money(r.asset_cents)) +
        "</td></tr></tfoot></table></div>" +
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_liabilities")) +
        "</h3><div class=\"crm-acct-table-wrap\"><table class=\"crm-acct-table\"><tbody>" +
        reportRows(r.liabilities) +
        '</tbody><tfoot><tr><td></td><td>' +
        esc(t("acct_total")) +
        '</td><td class="num">' +
        esc(money(r.liability_cents)) +
        "</td></tr></tfoot></table></div>" +
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_equity")) +
        "</h3><div class=\"crm-acct-table-wrap\"><table class=\"crm-acct-table\"><tbody>" +
        reportRows(r.equity) +
        "<tr><td></td><td>" +
        esc(t("acct_net_ytd")) +
        '</td><td class="num">' +
        esc(money(r.net_income_cents)) +
        "</td></tr></tbody><tfoot><tr><td></td><td>" +
        esc(t("acct_total")) +
        '</td><td class="num">' +
        esc(money(r.total_liab_equity_cents)) +
        "</td></tr></tfoot></table></div>";
    } else if (state.report === "tb") {
      body =
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_code")) +
        "</th><th>" +
        esc(t("acct_account")) +
        '</th><th class="num">' +
        esc(t("acct_debit")) +
        '</th><th class="num">' +
        esc(t("acct_credit")) +
        "</th></tr></thead><tbody>" +
        reportRows(r.rows, "tb") +
        '</tbody><tfoot><tr><td></td><td>' +
        esc(t("acct_total")) +
        '</td><td class="num">' +
        esc(money(r.debit_cents)) +
        '</td><td class="num">' +
        esc(money(r.credit_cents)) +
        "</td></tr></tfoot></table></div>";
    } else if (state.report === "gl") {
      body = (r.sections || [])
        .map(function (sec) {
          var acct = sec.account || {};
          var lines = (sec.lines || [])
            .map(function (ln) {
              return (
                "<tr><td>" +
                esc(ln.entry_date) +
                "</td><td>" +
                esc(ln.payee || ln.memo) +
                '</td><td class="num">' +
                (ln.side === "debit" ? esc(money(ln.amount_cents)) : "") +
                '</td><td class="num">' +
                (ln.side === "credit" ? esc(money(ln.amount_cents)) : "") +
                "</td></tr>"
              );
            })
            .join("");
          return (
            '<div class="crm-acct-gl-head"><h3>' +
            esc((acct.code || "") + " " + (acct.name || "")) +
            "</h3><span>" +
            esc(money(sec.balance_cents)) +
            "</span></div>" +
            '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
            esc(t("acct_date")) +
            "</th><th>" +
            esc(t("acct_description")) +
            '</th><th class="num">' +
            esc(t("acct_debit")) +
            '</th><th class="num">' +
            esc(t("acct_credit")) +
            "</th></tr></thead><tbody>" +
            lines +
            "</tbody></table></div>"
          );
        })
        .join("");
    }
    return shell(
      '<div class="crm-acct-subtabs">' +
        reportTabs() +
        "</div>" +
        datesBar(
          '<button type="button" class="crm-btn secondary" id="crm-acct-csv-dl">' +
            esc(t("acct_export_csv")) +
            "</button>"
        ) +
        body
    );
  }

  function journalHtml() {
    var line = function () {
      return (
        '<div class="crm-acct-journal-grid crm-acct-jline">' +
        accountSelect("", "", { placeholder: t("acct_account") }) +
        '<input type="text" inputmode="decimal" placeholder="' +
        esc(t("acct_debit")) +
        '" class="j-debit" />' +
        '<input type="text" inputmode="decimal" placeholder="' +
        esc(t("acct_credit")) +
        '" class="j-credit" /></div>'
      );
    };
    return shell(
      '<div class="crm-acct-toolbar">' +
        "<label>" +
        esc(t("acct_date")) +
        '<input type="date" id="crm-acct-jdate" value="' +
        esc(todayIso()) +
        '" /></label>' +
        "<label>" +
        esc(t("acct_payee")) +
        '<input type="text" id="crm-acct-jpayee" /></label>' +
        "<label>" +
        esc(t("acct_memo")) +
        '<input type="text" id="crm-acct-jmemo" /></label></div>' +
        line() +
        line() +
        '<div class="crm-acct-actions">' +
        '<button type="button" class="crm-btn secondary" id="crm-acct-jadd">' +
        esc(t("acct_add_line")) +
        "</button>" +
        '<button type="button" class="crm-btn" id="crm-acct-jsave">' +
        esc(t("acct_post_journal")) +
        "</button></div>"
    );
  }

  function vendorsHtml() {
    var rows = (state.vendors || [])
      .map(function (v) {
        return (
          "<tr><td>" +
          esc(v.name) +
          "</td><td>" +
          esc(v.match_pattern) +
          "</td><td>" +
          esc((state.accounts.find(function (a) { return a.id === v.default_account_id; }) || {}).name || "") +
          "</td></tr>"
        );
      })
      .join("");
    return shell(
      '<div class="crm-acct-toolbar">' +
        "<label>" +
        esc(t("acct_vendor_name")) +
        '<input id="crm-acct-vname" /></label>' +
        "<label>" +
        esc(t("acct_vendor_match")) +
        '<input id="crm-acct-vmatch" /></label>' +
        "<label>" +
        esc(t("acct_category")) +
        accountSelect("crm-acct-vacct", "") +
        "</label>" +
        '<button type="button" class="crm-btn" id="crm-acct-vsave">' +
        esc(t("acct_save_vendor")) +
        "</button></div>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_vendor_name")) +
        "</th><th>" +
        esc(t("acct_vendor_match")) +
        "</th><th>" +
        esc(t("acct_category")) +
        "</th></tr></thead><tbody>" +
        rows +
        "</tbody></table></div>"
    );
  }

  function accountsHtml() {
    var rows = (state.accounts || [])
      .map(function (a) {
        var open =
          a.subtype === "bank" || a.subtype === "credit_card"
            ? '<input class="crm-acct-open" data-code="' +
              esc(a.code) +
              '" placeholder="0.00" />'
            : "";
        return (
          "<tr><td>" +
          esc(a.code) +
          "</td><td>" +
          esc(a.name) +
          "</td><td>" +
          esc(a.type) +
          "</td><td>" +
          open +
          "</td></tr>"
        );
      })
      .join("");
    return shell(
      "<p class=\"crm-acct-muted\">" +
        esc(t("acct_opening_help")) +
        "</p>" +
        '<div class="crm-acct-toolbar"><label>' +
        esc(t("acct_opening_date")) +
        '<input type="date" id="crm-acct-opendate" value="' +
        esc((state.settings && state.settings.opening_date) || todayIso()) +
        '" /></label>' +
        '<button type="button" class="crm-btn" id="crm-acct-opensave">' +
        esc(t("acct_save_opening")) +
        "</button></div>" +
        '<div class="crm-acct-toolbar"><label>' +
        esc(t("acct_closed_through")) +
        '<input type="date" id="crm-acct-closed" value="' +
        esc((state.settings && state.settings.closed_through) || "") +
        '" /></label>' +
        '<button type="button" class="crm-btn secondary" id="crm-acct-closesave">' +
        esc(t("acct_close_period")) +
        "</button></div>" +
        '<p class="crm-acct-muted">' +
        esc(t("acct_close_help")) +
        "</p>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_code")) +
        "</th><th>" +
        esc(t("acct_account")) +
        "</th><th>" +
        esc(t("acct_type")) +
        "</th><th>" +
        esc(t("acct_opening")) +
        "</th></tr></thead><tbody>" +
        rows +
        "</tbody></table></div>"
    );
  }

  function taxGroupLabel(group) {
    var key = "acct_tax_group_" + group;
    var label = t(key);
    return label === key ? group : label;
  }

  function taxHtml() {
    var r = state.reportData || {};
    var b = state.business || {};
    var pl = r.profit_and_loss || {};
    var bs = r.balance_sheet || {};
    var owner = r.owner || {};
    var months = r.months || {};
    var y = r.year || state.taxYear;
    var thisY = new Date().getFullYear();
    var years = [];
    for (var yr = thisY; yr >= 2026; yr--) years.push(yr);
    if (years.indexOf(Number(y)) < 0) years.unshift(Number(y));
    var yearOpts = years
      .map(function (yr) {
        return (
          '<option value="' +
          yr +
          '"' +
          (String(yr) === String(y) ? " selected" : "") +
          ">" +
          yr +
          "</option>"
        );
      })
      .join("");
    var entityKey = "acct_tax_entity_" + (b.entity_type || "");
    var entityLabel = t(entityKey);
    if (entityLabel === entityKey) entityLabel = b.entity_type || "";
    var work = (r.worksheet || [])
      .map(function (row) {
        return (
          "<tr><td>" +
          esc(taxGroupLabel(row.group)) +
          '</td><td class="num">' +
          esc(money(row.amount_cents)) +
          "</td></tr>"
        );
      })
      .join("");
    var payees = (r.payees_over_600 || [])
      .map(function (p) {
        return (
          "<tr><td>" +
          esc(p.payee) +
          '</td><td class="num">' +
          esc(money(p.amount_cents)) +
          "</td></tr>"
        );
      })
      .join("");
    var missing = (months.missing || []).join(", ");
    var stmtRows = (state.statements || [])
      .map(function (s) {
        return (
          "<tr><td>" +
          esc(s.period_end || "") +
          "</td><td>" +
          esc(kindLabel(s.kind)) +
          '</td><td class="num">' +
          (s.end_cents != null ? esc(money(s.end_cents)) : "") +
          "</td></tr>"
        );
      })
      .join("");
    var bsRows = (bs.assets || [])
      .concat(bs.liabilities || [])
      .concat(bs.equity || [])
      .filter(function (row) {
        return row.balance_cents;
      })
      .map(function (row) {
        return (
          "<tr><td>" +
          esc(row.code) +
          "</td><td>" +
          esc(row.name) +
          '</td><td class="num">' +
          esc(money(row.balance_cents)) +
          "</td></tr>"
        );
      })
      .join("");
    return shell(
      '<p class="crm-acct-muted">' +
        esc(t("acct_tax_help")) +
        "</p>" +
        '<div class="crm-acct-toolbar"><label>' +
        esc(t("acct_tax_year")) +
        '<select id="crm-acct-tax-year">' +
        yearOpts +
        "</select></label>" +
        '<button type="button" class="crm-btn" id="crm-acct-tax-run">' +
        esc(t("acct_run")) +
        "</button>" +
        '<button type="button" class="crm-btn secondary" id="crm-acct-csv-dl">' +
        esc(t("acct_tax_download")) +
        "</button></div>" +
        '<div class="crm-acct-cards">' +
        card(t("acct_income"), pl.income_cents) +
        card(t("acct_expenses"), pl.expense_cents) +
        card(t("acct_net"), pl.net_cents) +
        card(t("acct_tax_wages"), r.wages_cents) +
        "</div>" +
        '<p class="crm-acct-muted">' +
        esc(b.legal_name || "") +
        (entityLabel ? " · " + entityLabel : "") +
        " · " +
        esc(t("acct_tax_basis")) +
        (b.last_pay_date ? " · " + t("acct_tax_last_pay", { date: b.last_pay_date }) : "") +
        "</p>" +
        (b.payroll_paused
          ? '<p class="crm-acct-muted">' + esc(t("acct_tax_payroll_paused")) + "</p>"
          : "") +
        (missing
          ? '<p class="crm-acct-status is-error">' +
            esc(t("acct_tax_missing_months", { months: missing })) +
            "</p>"
          : "") +
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_tax_worksheet")) +
        "</h3>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_category")) +
        '</th><th class="num">' +
        esc(t("acct_amount")) +
        "</th></tr></thead><tbody>" +
        (work ||
          '<tr><td colspan="2" class="crm-acct-muted">' +
          esc(t("acct_tax_empty")) +
          "</td></tr>") +
        '</tbody><tfoot><tr><td>' +
        esc(t("acct_net")) +
        '</td><td class="num">' +
        esc(money(pl.net_cents)) +
        "</td></tr></tfoot></table></div>" +
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_tax_year_end")) +
        "</h3>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_code")) +
        "</th><th>" +
        esc(t("acct_account")) +
        '</th><th class="num">' +
        esc(t("acct_amount")) +
        "</th></tr></thead><tbody>" +
        (bsRows ||
          '<tr><td colspan="3" class="crm-acct-muted">' +
          esc(t("acct_tax_empty")) +
          "</td></tr>") +
        "</tbody></table></div>" +
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_tax_owner")) +
        "</h3>" +
        '<p class="crm-acct-muted">' +
        esc(t("acct_tax_owner_help")) +
        "</p>" +
        '<div class="crm-acct-cards">' +
        card(t("acct_tax_contributions"), owner.contribution_cents) +
        card(t("acct_tax_draws"), owner.draw_cents) +
        "</div>" +
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_tax_payees")) +
        "</h3>" +
        '<p class="crm-acct-muted">' +
        esc(t("acct_tax_payees_help")) +
        "</p>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_payee")) +
        '</th><th class="num">' +
        esc(t("acct_amount")) +
        "</th></tr></thead><tbody>" +
        (payees ||
          '<tr><td colspan="2" class="crm-acct-muted">' +
          esc(t("acct_tax_payees_none")) +
          "</td></tr>") +
        "</tbody></table></div>" +
        "<h3 class=\"crm-acct-section\">" +
        esc(t("acct_tax_statements")) +
        "</h3>" +
        '<div class="crm-acct-table-wrap"><table class="crm-acct-table"><thead><tr><th>' +
        esc(t("acct_end")) +
        "</th><th>" +
        esc(t("acct_stmt_kind")) +
        '</th><th class="num">' +
        esc(t("acct_stmt_ending")) +
        "</th></tr></thead><tbody>" +
        (stmtRows ||
          '<tr><td colspan="3" class="crm-acct-muted">' +
          esc(t("acct_stmt_empty")) +
          "</td></tr>") +
        "</tbody></table></div>"
    );
  }

  function render(main) {
    if (!main) return;
    if (state.pane === "statements") main.innerHTML = statementsHtml();
    else if (state.pane === "register") main.innerHTML = registerHtml();
    else if (state.pane === "reconcile") main.innerHTML = reconcileHtml();
    else if (state.pane === "review") main.innerHTML = reviewHtml();
    else if (state.pane === "reports" || state.pane === "ledger") {
      if (state.pane === "ledger") state.report = "gl";
      main.innerHTML = reportsHtml();
    } else if (state.pane === "journal") main.innerHTML = journalHtml();
    else if (state.pane === "vendors") main.innerHTML = vendorsHtml();
    else if (state.pane === "accounts") main.innerHTML = accountsHtml();
    else if (state.pane === "tax") main.innerHTML = taxHtml();
    else main.innerHTML = homeHtml();
    wire(main);
  }

  function currentCsv() {
    return ($("crm-acct-csv") && $("crm-acct-csv").value) || "";
  }

  function wire(main) {
    main.querySelectorAll("[data-acct-pane]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        navigate(paneHash(btn.getAttribute("data-acct-pane")));
      });
    });
    main.querySelectorAll("[data-acct-report]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        navigate(paneHash("reports", btn.getAttribute("data-acct-report")));
      });
    });
    var run = $("crm-acct-run");
    if (run) {
      run.addEventListener("click", function () {
        state.start = ($("crm-acct-start") && $("crm-acct-start").value) || monthStart();
        state.end = ($("crm-acct-end") && $("crm-acct-end").value) || todayIso();
        if ($("crm-acct-reg-account")) state.accountId = $("crm-acct-reg-account").value;
        reload();
      });
    }
    var taxRun = $("crm-acct-tax-run");
    if (taxRun) {
      taxRun.addEventListener("click", function () {
        var sel = $("crm-acct-tax-year");
        if (sel && sel.value) state.taxYear = sel.value;
        navigate(paneHash("tax", state.taxYear));
      });
    }
    var taxYear = $("crm-acct-tax-year");
    if (taxYear) {
      taxYear.addEventListener("change", function () {
        state.taxYear = taxYear.value;
      });
    }
    var csvBtn = $("crm-acct-csv-dl");
    if (csvBtn) {
      csvBtn.addEventListener("click", function () {
        downloadCurrentCsv();
      });
    }
    var reconLoad = $("crm-acct-recon-load");
    if (reconLoad) {
      reconLoad.addEventListener("click", function () {
        if ($("crm-acct-recon-account")) state.accountId = $("crm-acct-recon-account").value;
        state.end = ($("crm-acct-recon-date") && $("crm-acct-recon-date").value) || todayIso();
        reload();
      });
    }
    function updateReconMath() {
      var el = $("crm-acct-recon-math");
      if (!el) return;
      var amtEl = $("crm-acct-recon-amount");
      var stmt = 0;
      if (amtEl && amtEl.value) {
        stmt = Math.round(parseFloat(String(amtEl.value).replace(/[$,]/g, "")) * 100) || 0;
      }
      var cleared = 0;
      main.querySelectorAll(".crm-acct-cleared").forEach(function (box) {
        if (box.checked) cleared += Number(box.getAttribute("data-delta") || 0);
      });
      var diff = stmt - cleared;
      el.textContent =
        t("acct_recon_cleared") +
        " " +
        money(cleared) +
        " · " +
        t("acct_recon_diff") +
        " " +
        money(diff);
    }
    main.querySelectorAll(".crm-acct-cleared").forEach(function (box) {
      box.addEventListener("change", updateReconMath);
    });
    var reconAmt = $("crm-acct-recon-amount");
    if (reconAmt) reconAmt.addEventListener("input", updateReconMath);
    updateReconMath();
    var reconSave = $("crm-acct-recon-save");
    if (reconSave) {
      reconSave.addEventListener("click", function () {
        var lineIds = [];
        main.querySelectorAll(".crm-acct-cleared").forEach(function (box) {
          if (box.checked) lineIds.push(box.getAttribute("data-line"));
        });
        api("/api/staff/accounting", {
          action: "recon-complete",
          accountId: ($("crm-acct-recon-account") && $("crm-acct-recon-account").value) || state.accountId,
          statementDate: ($("crm-acct-recon-date") && $("crm-acct-recon-date").value) || state.end,
          statementAmount: ($("crm-acct-recon-amount") && $("crm-acct-recon-amount").value) || "",
          lineIds: lineIds,
        })
          .then(function () {
            setStatus(t("acct_recon_saved"));
            reload();
          })
          .catch(function (e) {
            setStatus(e.message || t("acct_save_failed"), true);
          });
      });
    }
    var closeSave = $("crm-acct-closesave");
    if (closeSave) {
      closeSave.addEventListener("click", function () {
        api("/api/staff/accounting", {
          action: "close-period",
          date: $("crm-acct-closed") && $("crm-acct-closed").value,
        })
          .then(function () {
            setStatus(t("acct_close_saved"));
            reload();
          })
          .catch(function (e) {
            setStatus(e.message || t("acct_save_failed"), true);
          });
      });
    }
    var drop = $("crm-acct-drop");
    var stmtFile = $("crm-acct-stmt-file");
    function readPdfBase64(file) {
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () {
          resolve(String(reader.result || ""));
        };
        reader.onerror = function () {
          reject(new Error(t("acct_stmt_read_failed")));
        };
        reader.readAsDataURL(file);
      });
    }
    function uploadStatementFiles(files) {
      var list = Array.prototype.slice.call(files || []).filter(function (f) {
        return f && (/\.pdf$/i.test(f.name || "") || (f.type || "") === "application/pdf");
      });
      if (!list.length) {
        setStatus(t("acct_stmt_need_pdf"), true);
        return;
      }
      var posted = 0;
      var skipped = 0;
      var i = 0;
      function next() {
        if (i >= list.length) {
          setStatus(t("acct_stmt_done", { posted: posted, skip: skipped }));
          return reload();
        }
        var f = list[i];
        setStatus(t("acct_stmt_uploading", { name: f.name, n: i + 1, of: list.length }));
        return readPdfBase64(f)
          .then(function (b64) {
            return api("/api/staff/accounting", {
              action: "statement-upload",
              fileName: f.name,
              contentBase64: b64,
            });
          })
          .then(function (data) {
            posted += Number((data && data.posted) || 0);
            skipped += Number((data && data.skipped) || 0);
            if (data && data.duplicate) skipped += 1;
            i += 1;
            return next();
          })
          .catch(function (e) {
            setStatus(e.message || t("acct_save_failed"), true);
          });
      }
      next();
    }
    if (stmtFile) {
      stmtFile.addEventListener("change", function () {
        uploadStatementFiles(stmtFile.files);
        stmtFile.value = "";
      });
    }
    if (drop) {
      ["dragenter", "dragover"].forEach(function (ev) {
        drop.addEventListener(ev, function (e) {
          e.preventDefault();
          drop.classList.add("is-over");
        });
      });
      drop.addEventListener("dragleave", function () {
        drop.classList.remove("is-over");
      });
      drop.addEventListener("drop", function (e) {
        e.preventDefault();
        drop.classList.remove("is-over");
        uploadStatementFiles(e.dataTransfer.files);
      });
    }
    var file = $("crm-acct-file");
    if (file) {
      file.addEventListener("change", function () {
        var f = file.files && file.files[0];
        if (!f) return;
        var reader = new FileReader();
        reader.onload = function () {
          if ($("crm-acct-csv")) $("crm-acct-csv").value = String(reader.result || "");
        };
        reader.readAsText(f);
      });
    }
    var imp = $("crm-acct-import");
    if (imp) {
      imp.addEventListener("click", function () {
        var accountId = $("crm-acct-import-account") && $("crm-acct-import-account").value;
        var csv = currentCsv();
        if (!accountId || !csv.trim()) {
          setStatus(t("acct_import_need"), true);
          return;
        }
        setStatus(t("acct_importing"));
        api("/api/staff/accounting", { action: "import", accountId: accountId, csv: csv }).then(function (data) {
          setStatus(t("acct_imported", { n: data.inserted || 0, skip: data.skipped || 0 }));
          reload();
        }).catch(function (e) {
          setStatus(e.message || t("acct_save_failed"), true);
        });
      });
    }
    main.querySelectorAll("[data-acct-post]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-acct-post");
        var sel = main.querySelector('tr[data-import-id="' + id + '"] select');
        var accountId = sel && sel.value;
        Promise.resolve()
          .then(function () {
            if (accountId) return api("/api/staff/accounting", { action: "classify", id: id, accountId: accountId });
          })
          .then(function () {
            return api("/api/staff/accounting", { action: "post-import", ids: [id] });
          })
          .then(function (data) {
            if (data.errors && data.errors.length) setStatus(data.errors[0].error, true);
            else setStatus(t("acct_posted_n", { n: data.posted || 0 }));
            reload();
          })
          .catch(function (e) {
            setStatus(e.message || t("acct_save_failed"), true);
          });
      });
    });
    main.querySelectorAll("[data-acct-ignore]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        api("/api/staff/accounting", { action: "ignore", id: btn.getAttribute("data-acct-ignore") })
          .then(function () {
            reload();
          })
          .catch(function (e) {
            setStatus(e.message || t("acct_save_failed"), true);
          });
      });
    });
    var postMatched = $("crm-acct-post-matched");
    if (postMatched) {
      postMatched.addEventListener("click", function () {
        var ids = [];
        (state.items || []).forEach(function (item) {
          var sel = main.querySelector('tr[data-import-id="' + item.id + '"] select');
          if (sel && sel.value) ids.push(item.id);
        });
        if (!ids.length) {
          setStatus(t("acct_none_matched"), true);
          return;
        }
        var chain = Promise.resolve();
        ids.forEach(function (id) {
          var sel = main.querySelector('tr[data-import-id="' + id + '"] select');
          chain = chain.then(function () {
            return api("/api/staff/accounting", { action: "classify", id: id, accountId: sel.value });
          });
        });
        chain
          .then(function () {
            return api("/api/staff/accounting", { action: "post-import", ids: ids });
          })
          .then(function (data) {
            setStatus(t("acct_posted_n", { n: data.posted || 0 }));
            reload();
          })
          .catch(function (e) {
            setStatus(e.message || t("acct_save_failed"), true);
          });
      });
    }
    var jadd = $("crm-acct-jadd");
    if (jadd) {
      jadd.addEventListener("click", function () {
        var wrap = document.createElement("div");
        wrap.innerHTML =
          '<div class="crm-acct-journal-grid crm-acct-jline">' +
          accountSelect("", "") +
          '<input type="text" class="j-debit" placeholder="' +
          esc(t("acct_debit")) +
          '" />' +
          '<input type="text" class="j-credit" placeholder="' +
          esc(t("acct_credit")) +
          '" /></div>';
        jadd.parentElement.parentElement.insertBefore(wrap.firstChild, jadd.parentElement);
      });
    }
    var jsave = $("crm-acct-jsave");
    if (jsave) {
      jsave.addEventListener("click", function () {
        var lines = [];
        main.querySelectorAll(".crm-acct-jline").forEach(function (row) {
          var sel = row.querySelector("select");
          var debit = row.querySelector(".j-debit");
          var credit = row.querySelector(".j-credit");
          lines.push({
            accountId: sel && sel.value,
            debit: debit && debit.value,
            credit: credit && credit.value,
          });
        });
        api("/api/staff/accounting", {
          action: "journal",
          date: $("crm-acct-jdate") && $("crm-acct-jdate").value,
          payee: $("crm-acct-jpayee") && $("crm-acct-jpayee").value,
          memo: $("crm-acct-jmemo") && $("crm-acct-jmemo").value,
          lines: lines,
        })
          .then(function () {
            setStatus(t("acct_journal_saved"));
            reload();
          })
          .catch(function (e) {
            setStatus(e.message || t("acct_save_failed"), true);
          });
      });
    }
    var vsave = $("crm-acct-vsave");
    if (vsave) {
      vsave.addEventListener("click", function () {
        api("/api/staff/accounting", {
          action: "save-vendor",
          name: $("crm-acct-vname") && $("crm-acct-vname").value,
          match_pattern: $("crm-acct-vmatch") && $("crm-acct-vmatch").value,
          accountId: $("crm-acct-vacct") && $("crm-acct-vacct").value,
        })
          .then(function () {
            reload();
          })
          .catch(function (e) {
            setStatus(e.message || t("acct_save_failed"), true);
          });
      });
    }
    var opensave = $("crm-acct-opensave");
    if (opensave) {
      opensave.addEventListener("click", function () {
        var balances = {};
        main.querySelectorAll(".crm-acct-open").forEach(function (inp) {
          if (inp.value) balances[inp.getAttribute("data-code")] = inp.value;
        });
        api("/api/staff/accounting", {
          action: "opening",
          date: $("crm-acct-opendate") && $("crm-acct-opendate").value,
          balances: balances,
        })
          .then(function () {
            setStatus(t("acct_opening_saved"));
            reload();
          })
          .catch(function (e) {
            setStatus(e.message || t("acct_save_failed"), true);
          });
      });
    }
  }

  var mainEl = null;

  function reload() {
    if (!mainEl) return Promise.resolve();
    return load().then(function () {
      render(mainEl);
    });
  }

  function downloadCurrentCsv() {
    var rows = [];
    var r = state.reportData || {};
    if (state.pane === "register") {
      rows.push(["date", "payee", "amount", "running"]);
      rows.push(["", t("acct_register_opening"), "", money(r.opening_cents)]);
      (r.rows || []).forEach(function (ln) {
        rows.push([ln.entry_date, ln.payee || ln.memo, money(ln.delta_cents), money(ln.running_cents)]);
      });
    } else if (state.pane === "tax") {
      var pl = r.profit_and_loss || {};
      rows.push(["section", "item", "amount"]);
      (r.worksheet || []).forEach(function (row) {
        rows.push(["worksheet", taxGroupLabel(row.group), money(row.amount_cents)]);
      });
      rows.push(["totals", t("acct_income"), money(pl.income_cents)]);
      rows.push(["totals", t("acct_expenses"), money(pl.expense_cents)]);
      rows.push(["totals", t("acct_net"), money(pl.net_cents)]);
      rows.push(["owner", t("acct_tax_contributions"), money((r.owner || {}).contribution_cents)]);
      rows.push(["owner", t("acct_tax_draws"), money((r.owner || {}).draw_cents)]);
      (r.payees_over_600 || []).forEach(function (p) {
        rows.push(["payee", p.payee, money(p.amount_cents)]);
      });
    } else if (state.report === "pl") {
      rows.push(["code", "name", "amount"]);
      (r.income || []).concat(r.expense || []).forEach(function (row) {
        rows.push([row.code, row.name, money(row.balance_cents)]);
      });
      rows.push(["", t("acct_net"), money(r.net_cents)]);
    } else if (state.report === "tb") {
      rows.push(["code", "name", "debit", "credit"]);
      (r.rows || []).forEach(function (row) {
        rows.push([row.code, row.name, money(row.debit_cents), money(row.credit_cents)]);
      });
    } else if (state.report === "bs") {
      rows.push(["code", "name", "amount"]);
      (r.assets || []).concat(r.liabilities || []).concat(r.equity || []).forEach(function (row) {
        rows.push([row.code, row.name, money(row.balance_cents)]);
      });
    } else if (state.report === "gl") {
      rows.push(["account", "date", "payee", "debit", "credit"]);
      (r.sections || []).forEach(function (sec) {
        var acct = sec.account || {};
        (sec.lines || []).forEach(function (ln) {
          rows.push([
            (acct.code || "") + " " + (acct.name || ""),
            ln.entry_date,
            ln.payee || ln.memo,
            ln.side === "debit" ? money(ln.amount_cents) : "",
            ln.side === "credit" ? money(ln.amount_cents) : "",
          ]);
        });
      });
    }
    if (rows.length < 2) {
      setStatus(t("acct_csv_empty"), true);
      return;
    }
    var csv = rows
      .map(function (line) {
        return line
          .map(function (c) {
            var s = String(c == null ? "" : c);
            if (/[",\n]/.test(s)) return '"' + s.replace(/"/g, '""') + '"';
            return s;
          })
          .join(",");
      })
      .join("\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download =
      "mvi-" +
      (state.pane === "register"
        ? "register"
        : state.pane === "tax"
          ? "tax-" + (state.taxYear || "")
          : state.report || "report") +
      ".csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function load() {
    var view = "home";
    var q = "/api/staff/accounting?view=";
    if (state.pane === "review") view = "review";
    else if (state.pane === "statements") view = "statements";
    else if (state.pane === "register") view = "register";
    else if (state.pane === "reconcile") view = "reconcile";
    else if (state.pane === "vendors") view = "vendors";
    else if (state.pane === "accounts") view = "accounts";
    else if (state.pane === "tax") view = "tax";
    else if (state.pane === "reports" || state.pane === "ledger") {
      view = "report";
      if (state.pane === "ledger") state.report = "gl";
    }
    if (!state.start) state.start = monthStart();
    if (!state.end) state.end = todayIso();
    if (!state.accountId) state.accountId = defaultRegisterId();
    var url = q + encodeURIComponent(view);
    if (view === "report") {
      url +=
        "&report=" +
        encodeURIComponent(state.report || "pl") +
        "&start=" +
        encodeURIComponent(state.start) +
        "&end=" +
        encodeURIComponent(state.end);
    }
    if (view === "register") {
      url +=
        "&accountId=" +
        encodeURIComponent(state.accountId || "") +
        "&start=" +
        encodeURIComponent(state.start) +
        "&end=" +
        encodeURIComponent(state.end);
    }
    if (view === "reconcile") {
      url +=
        "&accountId=" +
        encodeURIComponent(state.accountId || "") +
        "&end=" +
        encodeURIComponent(state.end);
    }
    if (view === "tax") {
      url += "&year=" + encodeURIComponent(state.taxYear || String(new Date().getFullYear()));
    }
    return api(url, null, { method: "GET" }).then(function (data) {
      state.accounts = data.accounts || [];
      state.vendors = data.vendors || [];
      state.settings = data.settings || {};
      state.dashboard = data.dashboard || null;
      state.items = data.items || [];
      state.statements = data.statements || state.statements || [];
      state.reportData = data.report || null;
      state.voids = data.voids || [];
      state.markedLineIds = data.markedLineIds || [];
      state.reconciliations = data.reconciliations || [];
      state.business = data.business || state.business || null;
      if (data.suggested_cents != null) state.suggestedCents = data.suggested_cents;
      if (data.report && data.report.year) state.taxYear = String(data.report.year);
      if (!state.accountId) state.accountId = defaultRegisterId();
    });
  }

  async function mount(main, opts) {
    mainEl = main;
    opts = opts || {};
    state.pane = PANES.indexOf(opts.pane) >= 0 ? opts.pane : "home";
    state.report = REPORTS.indexOf(opts.report) >= 0 ? opts.report : "pl";
    if (state.pane === "ledger") state.report = "gl";
    if (state.pane === "tax" && /^\d{4}$/.test(String(opts.report || ""))) state.taxYear = String(opts.report);
    main.innerHTML = '<p class="crm-empty-state">' + esc(t("loading")) + "</p>";
    try {
      await load();
      render(main);
    } catch (e) {
      main.innerHTML =
        '<div class="crm-placeholder"><strong>' +
        esc(t("load_error")) +
        "</strong><p>" +
        esc(e.message || "") +
        "</p></div>";
    }
  }

  window.StaffCrmAccounting = { mount: mount };
})();
