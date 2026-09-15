/**
 * CRM Accounting — parallel books modeled on Patriot Accounting.
 */
(function () {
  "use strict";

  var PANES = ["home", "review", "ledger", "reports", "journal", "vendors", "accounts"];
  var REPORTS = ["pl", "bs", "tb", "gl"];

  var state = {
    pane: "home",
    report: "pl",
    accounts: [],
    vendors: [],
    settings: {},
    dashboard: null,
    items: [],
    reportData: null,
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
      '<select id="' +
      esc(id) +
      '"><option value="">' +
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
        '<p class="crm-acct-muted">' +
        esc(t("acct_pending_count", { n: d.pending_count || 0 })) +
        "</p>" +
        '<div class="crm-acct-actions">' +
        '<button type="button" class="crm-btn" data-acct-pane="review">' +
        esc(t("acct_go_review")) +
        "</button>" +
        '<button type="button" class="crm-btn secondary" data-acct-pane="accounts">' +
        esc(t("acct_go_opening")) +
        "</button></div>"
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
        datesBar() +
        body
    );
  }

  function journalHtml() {
    var line = function () {
      return (
        '<div class="crm-acct-journal-grid crm-acct-jline">' +
        accountSelect("j-acct", "", { placeholder: t("acct_account") }) +
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

  function render(main) {
    if (!main) return;
    if (state.pane === "review") main.innerHTML = reviewHtml();
    else if (state.pane === "reports" || state.pane === "ledger") {
      if (state.pane === "ledger") state.report = "gl";
      main.innerHTML = reportsHtml();
    } else if (state.pane === "journal") main.innerHTML = journalHtml();
    else if (state.pane === "vendors") main.innerHTML = vendorsHtml();
    else if (state.pane === "accounts") main.innerHTML = accountsHtml();
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
        reload();
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
          accountSelect("j-acct", "") +
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

  function load() {
    var view = "home";
    var q = "/api/staff/accounting?view=";
    if (state.pane === "review") view = "review";
    else if (state.pane === "vendors") view = "vendors";
    else if (state.pane === "accounts") view = "accounts";
    else if (state.pane === "reports" || state.pane === "ledger") {
      view = "report";
      if (state.pane === "ledger") state.report = "gl";
    }
    if (!state.start) state.start = monthStart();
    if (!state.end) state.end = todayIso();
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
    return api(url, null, { method: "GET" }).then(function (data) {
      state.accounts = data.accounts || [];
      state.vendors = data.vendors || [];
      state.settings = data.settings || {};
      state.dashboard = data.dashboard || null;
      state.items = data.items || [];
      state.reportData = data.report || null;
    });
  }

  async function mount(main, opts) {
    mainEl = main;
    opts = opts || {};
    state.pane = PANES.indexOf(opts.pane) >= 0 ? opts.pane : "home";
    state.report = REPORTS.indexOf(opts.report) >= 0 ? opts.report : "pl";
    if (state.pane === "ledger") state.report = "gl";
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
