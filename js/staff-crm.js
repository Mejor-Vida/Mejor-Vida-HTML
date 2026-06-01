(function () {
  "use strict";

  var SUPABASE_URL = "";
  var SUPABASE_ANON_KEY = "";
  var sb = null;
  var accessToken = "";
  var IDLE_TIMEOUT_MS = 30 * 60 * 1000;
  var idleTimer = null;
  var LOCK_KEY = "mvi_staff_lock_until";
  var FAIL_KEY = "mvi_staff_fail_count";

  var leadsCache = [];
  var currentDetail = null;
  var clientsRowMenuCloser = null;
  var clientsListGlobalWired = false;

  var CLIENT_TABS = [
    { id: "overview", labelKey: "tab_overview" },
    { id: "connect", labelKey: "tab_connect" },
    { id: "pipeline", labelKey: "tab_pipeline" },
    { id: "products", labelKey: "tab_products" },
    { id: "medical", labelKey: "tab_medical" },
    { id: "coverage", labelKey: "tab_coverage" },
  ];

  function t(key, vars) {
    return window.StaffCrmI18n ? window.StaffCrmI18n.t(key, vars) : key;
  }

  function syncChrome() {
    document.title = t("page_title");
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (key) el.textContent = t(key);
    });
    var lang = window.StaffCrmI18n ? window.StaffCrmI18n.getLang() : "en";
    var logo = window.StaffCrmI18n ? window.StaffCrmI18n.logoPath(lang) : "/img/logo-english2.png";
    var headerLogo = $("crm-header-logo");
    var loginLogo = $("crm-login-logo");
    if (headerLogo) {
      headerLogo.src = logo;
      headerLogo.alt = t("logo_alt");
    }
    if (loginLogo) {
      loginLogo.src = logo;
      loginLogo.alt = t("logo_alt");
    }
    ["crm-lang-en", "crm-lang-es", "crm-login-lang-en", "crm-login-lang-es"].forEach(function (id) {
      var btn = $(id);
      if (!btn) return;
      var isEn = id.indexOf("-en") !== -1;
      btn.classList.toggle("active", (lang === "en") === isEn);
    });
  }

  function wireLangToggle() {
    function pick(lang) {
      if (window.StaffCrmI18n) window.StaffCrmI18n.setLang(lang);
    }
    ["crm-lang-en", "crm-login-lang-en"].forEach(function (id) {
      var btn = $(id);
      if (btn) btn.addEventListener("click", function () {
        pick("en");
      });
    });
    ["crm-lang-es", "crm-login-lang-es"].forEach(function (id) {
      var btn = $(id);
      if (btn) btn.addEventListener("click", function () {
        pick("es");
      });
    });
    if (window.StaffCrmI18n) {
      window.StaffCrmI18n.onLangChange(function () {
        syncChrome();
        if (accessToken) renderRoute();
      });
    }
    syncChrome();
  }

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    var d = document.createElement("div");
    d.textContent = String(s == null ? "" : s);
    return d.innerHTML;
  }

  function parseRoute() {
    var raw = (location.hash || "#/dashboard").replace(/^#/, "");
    var parts = raw.split("/").filter(Boolean);
    if (!parts.length || parts[0] === "dashboard") {
      return { view: "dashboard" };
    }
    if (parts[0] === "clients") {
      if (parts.length === 1) return { view: "clients" };
      if (parts[1] === "new") return { view: "clientNew" };
      var id = parts[1];
      var tab = parts[2] || "overview";
      var validTab = CLIENT_TABS.some(function (t) {
        return t.id === tab;
      });
      return { view: "client", id: id, tab: validTab ? tab : "overview" };
    }
    if (parts[0] === "inbox") return { view: "inbox" };
    if (parts[0] === "assistant") return { view: "assistant" };
    if (parts[0] === "oos") return { view: "oos" };
    if (parts[0] === "knowledge") return { view: "knowledge" };
    return { view: "dashboard" };
  }

  function navigate(hash) {
    if (location.hash !== hash) location.hash = hash;
    else renderRoute();
  }

  function setAuthed(on) {
    $("crm-login").classList.toggle("hidden", on);
    $("crm-app").classList.toggle("hidden", !on);
    $("crm-app").setAttribute("aria-hidden", on ? "false" : "true");
  }

  function applyLockState() {
    var until = Number(sessionStorage.getItem(LOCK_KEY) || 0);
    if (until > Date.now()) {
      var mins = Math.ceil((until - Date.now()) / 60000);
      $("crm-login-err").textContent = t("login_lock", { mins: mins });
      $("crm-login-btn").disabled = true;
      return true;
    }
    $("crm-login-btn").disabled = false;
    return false;
  }

  function markLoginFailure() {
    var n = Number(sessionStorage.getItem(FAIL_KEY) || 0) + 1;
    sessionStorage.setItem(FAIL_KEY, String(n));
    if (n >= 5) {
      sessionStorage.setItem(LOCK_KEY, String(Date.now() + 10 * 60 * 1000));
      applyLockState();
    }
  }

  function resetLoginFailures() {
    sessionStorage.removeItem(FAIL_KEY);
    sessionStorage.removeItem(LOCK_KEY);
  }

  async function signOutNow() {
    try {
      if (sb) await sb.auth.signOut();
    } catch (e) {}
    accessToken = "";
    leadsCache = [];
    currentDetail = null;
    setAuthed(false);
  }

  function resetIdleTimer() {
    if (!accessToken) return;
    if (idleTimer) clearTimeout(idleTimer);
    idleTimer = setTimeout(signOutNow, IDLE_TIMEOUT_MS);
  }

  async function authedApi(path, body, opts) {
    opts = opts || {};
    var method =
      opts.method != null ? String(opts.method).toUpperCase() : body != null ? "POST" : "GET";
    var hasJson = body != null && (method === "POST" || method === "PATCH" || method === "PUT");
    var headers = { Authorization: "Bearer " + accessToken };
    if (hasJson) headers["Content-Type"] = "application/json";
    var r = await fetch(path, {
      method: method,
      headers: headers,
      body: hasJson ? JSON.stringify(body) : undefined,
    });
    if (r.status === 401) {
      await signOutNow();
      throw new Error("unauthorized");
    }
    var data = {};
    try {
      data = await r.json();
    } catch (e) {}
    if (!r.ok) {
      throw new Error((data && data.error) || "Request failed");
    }
    return data;
  }

  function greetingName() {
    var email = "";
    try {
      if (sb) {
        sb.auth.getSession().then(function (out) {
          var u = out && out.data && out.data.session && out.data.session.user;
          if (u && u.email) {
            var el = $("crm-greeting-name");
            if (el) el.textContent = u.email.split("@")[0] || "Julie";
          }
        });
      }
    } catch (e) {}
    return "Julie";
  }

  function timeGreeting() {
    var h = new Date().getHours();
    if (h < 12) return t("good_morning");
    if (h < 17) return t("good_afternoon");
    return t("good_evening");
  }

  function displayName(lead) {
    return (
      String((lead && lead.display_name) || "").trim() ||
      [lead && lead.first_name, lead && lead.last_name].filter(Boolean).join(" ").trim() ||
      "Unknown"
    );
  }

  function initials(name) {
    var parts = String(name || "")
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    if (!parts.length) return "?";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }

  function calcAge(dob) {
    if (!dob) return null;
    var d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    var t = new Date();
    var a = t.getFullYear() - d.getFullYear();
    var m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
    return a;
  }

  function syncSidebar(route) {
    var active =
      route.view === "client" || route.view === "clientNew"
        ? "clients"
        : route.view === "dashboard"
          ? "dashboard"
          : route.view;
    document.querySelectorAll(".crm-nav-item").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-nav") === active);
    });
  }

  async function ensureLeads(force) {
    if (!force && leadsCache.length) return leadsCache;
    var data = await authedApi("/api/staff/leads", null, { method: "GET" });
    leadsCache = Array.isArray(data.items) ? data.items : [];
    return leadsCache;
  }

  async function refreshLeads() {
    return ensureLeads(true);
  }

  async function loadLeadDetail(id) {
    var data = await authedApi("/api/staff/leads?id=" + encodeURIComponent(id), null, { method: "GET" });
    currentDetail = data.detail || null;
    return currentDetail;
  }

  async function reloadLeadDetail(id) {
    var detail = await loadLeadDetail(id);
    if (detail) upsertLeadListItem(listItemFromDetail(detail));
    return detail;
  }

  function listItemFromDetail(detail) {
    if (!detail || !detail.id) return null;
    return {
      id: detail.id,
      first_name: detail.first_name || "",
      last_name: detail.last_name || "",
      display_name: detail.display_name || displayName(detail),
      phone: detail.phone || "",
      email: String(detail.email || "").trim(),
      language: detail.language || "English",
      source: detail.source || detail.source_table || "unknown",
      source_table: detail.source_table || "unknown",
      created_at: detail.created_at || null,
      updated_at: detail.updated_at || null,
    };
  }

  function upsertLeadListItem(item) {
    if (!item || !item.id) return;
    var idx = leadsCache.findIndex(function (x) {
      return x.id === item.id;
    });
    if (idx >= 0) leadsCache[idx] = Object.assign({}, leadsCache[idx], item);
    else leadsCache.push(item);
    leadsCache.sort(function (a, b) {
      return displayName(a).toLowerCase().localeCompare(displayName(b).toLowerCase());
    });
  }

  function renderDashboard(main) {
    var total = leadsCache.length;
    main.innerHTML =
      '<p class="crm-greeting">' +
      esc(timeGreeting()) +
      ', <span id="crm-greeting-name">' +
      esc(greetingName()) +
      "</span></p>" +
      '<div class="crm-grid-2">' +
      '<div>' +
      '<div class="crm-card" style="margin-bottom:16px">' +
      "<h2>" +
      esc(t("highlights")) +
      "</h2>" +
      '<div class="crm-stat-row">' +
      '<div class="crm-stat"><div class="crm-stat-value">' +
      esc(String(total)) +
      '</div><div class="crm-stat-label">' +
      esc(t("total_clients")) +
      '</div></div>' +
      '<div class="crm-stat"><div class="crm-stat-value">—</div><div class="crm-stat-label">' +
      esc(t("medical_pending")) +
      '</div></div>' +
      '<div class="crm-stat"><div class="crm-stat-value">—</div><div class="crm-stat-label">' +
      esc(t("calls_today")) +
      "</div></div>" +
      "</div></div>" +
      '<div class="crm-card">' +
      "<h2>" +
      esc(t("pipeline_snapshot")) +
      "</h2>" +
      '<div class="crm-empty-state">' +
      esc(t("application_metrics")) +
      "</div>" +
      "</div></div>" +
      '<div class="crm-card">' +
      "<h2>" +
      esc(t("client_snapshot")) +
      "</h2>" +
      '<ul class="crm-stage-list">' +
      '<li><span><span class="crm-dot new"></span>' +
      esc(t("stage_new")) +
      '</span><strong>—</strong></li>' +
      '<li><span><span class="crm-dot contacted"></span>' +
      esc(t("stage_contacted")) +
      '</span><strong>—</strong></li>' +
      '<li><span><span class="crm-dot enrolled"></span>' +
      esc(t("stage_enrolled")) +
      '</span><strong>—</strong></li>' +
      "</ul>" +
      '<p class="crm-empty-state" style="padding-top:12px">' +
      esc(t("stage_counts_note")) +
      "</p>" +
      "</div></div>";
  }

  function renderClientsList(main) {
    main.innerHTML =
      '<div class="crm-clients-head">' +
      '<div class="crm-clients-head-left">' +
      '<h1 class="crm-page-title">' +
      esc(t("clients_title")) +
      "</h1>" +
      '<button type="button" id="crm-clients-delete" class="crm-icon-btn is-danger" disabled title="' +
      esc(t("clients_delete")) +
      '" aria-label="' +
      esc(t("clients_delete")) +
      '">🗑</button>' +
      "</div>" +
      '<div class="crm-clients-head-actions">' +
      '<button type="button" id="crm-add-client-btn" class="crm-btn crm-btn-pill">' +
      '<span class="crm-btn-icon" aria-hidden="true">+</span>' +
      esc(t("add_new")) +
      "</button>" +
      "</div></div>" +
      '<div class="crm-table-wrap">' +
      '<div class="crm-clients-search-row">' +
      '<span class="crm-col-check-spacer" aria-hidden="true"></span>' +
      '<div class="crm-col-name-field">' +
      '<input type="search" id="crm-client-search" class="crm-search crm-search-name-col" placeholder="' +
      esc(t("search_placeholder")) +
      '" autocomplete="off" />' +
      "</div></div>" +
      '<table class="crm-table crm-table-clients"><thead><tr>' +
      '<th class="crm-col-check"><input type="checkbox" id="crm-clients-select-all" aria-label="' +
      esc(t("clients_select_all")) +
      '" /></th>' +
      '<th class="crm-col-name">' +
      esc(t("col_name")) +
      '</th><th class="crm-col-email">' +
      esc(t("col_email")) +
      '</th><th class="crm-col-phone">' +
      esc(t("col_phone")) +
      '</th><th class="crm-col-language">' +
      esc(t("col_language")) +
      '</th><th class="crm-col-menu"><span class="hidden">' +
      esc(t("clients_row_actions")) +
      "</span></th></tr></thead><tbody id=\"crm-clients-tbody\"></tbody></table></div>" +
      '<p id="crm-clients-status" class="crm-empty-state"></p>' +
      '<div id="crm-row-menu" class="crm-row-menu hidden" role="menu"></div>' +
      '<div id="crm-clients-delete-modal" class="crm-modal-backdrop hidden" role="dialog" aria-modal="true">' +
      '<div class="crm-modal">' +
      "<h2 id=\"crm-clients-delete-title\">" +
      esc(t("clients_delete_confirm_title")) +
      "</h2>" +
      '<p id="crm-clients-delete-body"></p>' +
      '<div class="crm-modal-actions">' +
      '<button type="button" id="crm-clients-delete-cancel" class="crm-btn secondary">' +
      esc(t("conn_no")) +
      "</button>" +
      '<button type="button" id="crm-clients-delete-confirm" class="crm-btn">' +
      esc(t("clients_delete")) +
      "</button></div></div></div>";

    var q = "";
    var selectedIds = new Set();
    var rowMenuLeadId = null;

    function visibleRows() {
      var ql = q.trim().toLowerCase();
      return leadsCache.filter(function (L) {
        if (!ql) return true;
        var hay = (displayName(L) + " " + (L.email || "") + " " + (L.phone || "")).toLowerCase();
        return hay.indexOf(ql) !== -1;
      });
    }

    function updateBulkBar() {
      var delBtn = $("crm-clients-delete");
      if (delBtn) delBtn.disabled = selectedIds.size === 0;
      var selAll = $("crm-clients-select-all");
      var rows = visibleRows();
      if (!selAll) return;
      var n = rows.filter(function (L) {
        return selectedIds.has(L.id);
      }).length;
      selAll.checked = rows.length > 0 && n === rows.length;
      selAll.indeterminate = n > 0 && n < rows.length;
    }

    function closeRowMenu() {
      var menu = $("crm-row-menu");
      if (!menu) return;
      menu.classList.add("hidden");
      menu.innerHTML = "";
      rowMenuLeadId = null;
      document.querySelectorAll(".crm-row-menu-btn[aria-expanded=true]").forEach(function (btn) {
        btn.setAttribute("aria-expanded", "false");
      });
    }

    function openRowMenu(leadId, anchorBtn) {
      closeRowMenu();
      rowMenuLeadId = leadId;
      var menu = $("crm-row-menu");
      if (!menu || !anchorBtn) return;
      menu.innerHTML =
        '<button type="button" data-action="view">' +
        esc(t("menu_view_client")) +
        "</button>" +
        '<button type="button" data-action="quote">' +
        esc(t("menu_start_quote")) +
        "</button>" +
        '<button type="button" data-action="contact">' +
        esc(t("menu_contact")) +
        "</button>" +
        '<button type="button" data-action="reminder" class="is-muted">' +
        esc(t("menu_add_reminder")) +
        "</button>";
      menu.classList.remove("hidden");
      anchorBtn.setAttribute("aria-expanded", "true");
      var rect = anchorBtn.getBoundingClientRect();
      menu.style.top = rect.bottom + 6 + "px";
      menu.style.left = Math.max(8, rect.right - 190) + "px";
      menu.querySelectorAll("button[data-action]").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var action = btn.getAttribute("data-action");
          var id = rowMenuLeadId;
          closeRowMenu();
          if (!id) return;
          if (action === "view") navigate("#/clients/" + encodeURIComponent(id) + "/overview");
          else if (action === "quote") navigate("#/clients/" + encodeURIComponent(id) + "/products");
          else if (action === "contact") navigate("#/clients/" + encodeURIComponent(id) + "/connect");
          else if (action === "reminder") {
            var status = $("crm-clients-status");
            if (status) status.textContent = t("menu_reminder_soon");
          }
        });
      });
    }

    function draw() {
      var tbody = $("crm-clients-tbody");
      var status = $("crm-clients-status");
      if (!tbody) return;
      closeRowMenu();
      var rows = visibleRows();
      if (!rows.length) {
        tbody.innerHTML = "";
        if (status) status.textContent = q.trim() ? t("no_matches") : t("no_clients");
        updateBulkBar();
        return;
      }
      if (status && !status.textContent) {
        status.textContent = t("showing_clients", { shown: rows.length, total: leadsCache.length });
      } else if (status) {
        status.textContent = t("showing_clients", { shown: rows.length, total: leadsCache.length });
      }
      tbody.innerHTML = rows
        .map(function (L) {
          var checked = selectedIds.has(L.id) ? " checked" : "";
          return (
            "<tr data-id=\"" +
            esc(L.id) +
            "\"><td class=\"crm-col-check\"><input type=\"checkbox\" class=\"crm-client-check\" data-id=\"" +
            esc(L.id) +
            "\" aria-label=\"" +
            esc(displayName(L)) +
            "\"" +
            checked +
            " /></td><td><span class=\"name-link\" role=\"link\" tabindex=\"0\">" +
            esc(displayName(L)) +
            "</span></td><td>" +
            esc(L.email || "—") +
            "</td><td>" +
            esc(L.phone || "—") +
            "</td><td>" +
            esc(L.language || "—") +
            '</td><td class="crm-col-menu"><button type="button" class="crm-row-menu-btn" data-id="' +
            esc(L.id) +
            '" aria-label="' +
            esc(t("clients_row_actions")) +
            '" aria-haspopup="true" aria-expanded="false">&#8942;</button></td></tr>'
          );
        })
        .join("");

      tbody.querySelectorAll(".name-link").forEach(function (link) {
        link.addEventListener("click", function (e) {
          e.stopPropagation();
          var tr = link.closest("tr");
          if (!tr) return;
          navigate("#/clients/" + encodeURIComponent(tr.getAttribute("data-id")) + "/overview");
        });
        link.addEventListener("keydown", function (e) {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            link.click();
          }
        });
      });

      tbody.querySelectorAll(".crm-client-check").forEach(function (box) {
        box.addEventListener("click", function (e) {
          e.stopPropagation();
        });
        box.addEventListener("change", function () {
          var id = box.getAttribute("data-id");
          if (!id) return;
          if (box.checked) selectedIds.add(id);
          else selectedIds.delete(id);
          updateBulkBar();
        });
      });

      tbody.querySelectorAll(".crm-row-menu-btn").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          var id = btn.getAttribute("data-id");
          if (!id) return;
          if (rowMenuLeadId === id && !$("crm-row-menu").classList.contains("hidden")) {
            closeRowMenu();
            return;
          }
          openRowMenu(id, btn);
        });
      });

      updateBulkBar();
    }

    function openDeleteModal() {
      if (!selectedIds.size) return;
      var mod = $("crm-clients-delete-modal");
      var body = $("crm-clients-delete-body");
      if (body) body.textContent = t("clients_delete_confirm_body", { count: selectedIds.size });
      if (mod) mod.classList.remove("hidden");
    }

    function closeDeleteModal() {
      var mod = $("crm-clients-delete-modal");
      if (mod) mod.classList.add("hidden");
    }

    async function deleteSelected() {
      closeDeleteModal();
      var ids = Array.from(selectedIds);
      if (!ids.length) return;
      var status = $("crm-clients-status");
      var delBtn = $("crm-clients-delete");
      if (status) status.textContent = t("clients_deleting");
      if (delBtn) delBtn.disabled = true;
      var ok = 0;
      var fail = 0;
      for (var i = 0; i < ids.length; i++) {
        try {
          await authedApi("/api/staff/leads?id=" + encodeURIComponent(ids[i]), null, { method: "DELETE" });
          selectedIds.delete(ids[i]);
          ok++;
        } catch (e) {
          fail++;
        }
      }
      await refreshLeads();
      draw();
      if (status) {
        status.textContent = fail
          ? t("clients_delete_failed") + (ok ? " " + t("clients_deleted", { count: ok }) : "")
          : t("clients_deleted", { count: ok });
      }
      updateBulkBar();
    }

    var search = $("crm-client-search");
    if (search) {
      search.addEventListener("input", function () {
        q = search.value || "";
        draw();
      });
    }

    var selAll = $("crm-clients-select-all");
    if (selAll) {
      selAll.addEventListener("change", function () {
        var rows = visibleRows();
        if (selAll.checked) {
          rows.forEach(function (L) {
            selectedIds.add(L.id);
          });
        } else {
          rows.forEach(function (L) {
            selectedIds.delete(L.id);
          });
        }
        draw();
      });
    }

    var delBtn = $("crm-clients-delete");
    if (delBtn) delBtn.addEventListener("click", openDeleteModal);
    var delCancel = $("crm-clients-delete-cancel");
    if (delCancel) delCancel.addEventListener("click", closeDeleteModal);
    var delConfirm = $("crm-clients-delete-confirm");
    if (delConfirm) {
      delConfirm.addEventListener("click", function () {
        void deleteSelected();
      });
    }
    var delMod = $("crm-clients-delete-modal");
    if (delMod) {
      delMod.addEventListener("click", function (e) {
        if (e.target === delMod) closeDeleteModal();
      });
    }

    clientsRowMenuCloser = closeRowMenu;
    if (!clientsListGlobalWired) {
      clientsListGlobalWired = true;
      document.addEventListener("click", function (e) {
        if (e.target.closest("#crm-row-menu") || e.target.closest(".crm-row-menu-btn")) return;
        if (clientsRowMenuCloser) clientsRowMenuCloser();
      });
      window.addEventListener(
        "scroll",
        function () {
          if (clientsRowMenuCloser) clientsRowMenuCloser();
        },
        true
      );
    }

    var addBtn = $("crm-add-client-btn");
    if (addBtn) {
      addBtn.addEventListener("click", function () {
        navigate("#/clients/new");
      });
    }

    draw();
  }

  function tabPlaceholder(tabId) {
    var labelKeys = {
      connect: "tab_connect_label",
      pipeline: "tab_pipeline_label",
      products: "tab_products_label",
      medical: "tab_medical_label",
      coverage: "tab_coverage_label",
    };
    var sourceKeys = {
      connect: "tab_connect_src",
      pipeline: "tab_pipeline_src",
      products: "tab_products_src",
      medical: "tab_medical_src",
      coverage: "tab_coverage_src",
    };
    return (
      '<div class="crm-placeholder">' +
      "<strong>" +
      esc(t(labelKeys[tabId] || tabId)) +
      "</strong>" +
      "<p>" +
      esc(t("tab_coming")) +
      "</p>" +
      '<p style="font-size:0.85rem;margin-top:8px">' +
      esc(t("tab_will_reuse")) +
      " <em>" +
      esc(t(sourceKeys[tabId] || "")) +
      "</em></p>" +
      '<p style="margin-top:16px"><a href="/staff/index.html">' +
      esc(t("tab_classic_today")) +
      "</a></p>" +
      "</div>"
    );
  }

  function renderOverviewTab() {
    return '<div id="crm-overview-root"></div>';
  }

  async function renderClientDetail(main, route) {
    var d = currentDetail;
    if (!d) {
      main.innerHTML =
        '<div class="crm-placeholder"><strong>' +
        esc(t("client_not_found")) +
        '</strong><p><button type="button" class="crm-btn secondary" id="crm-back-clients">' +
        esc(t("back_clients")) +
        "</button></p></div>";
      var b = $("crm-back-clients");
      if (b) b.addEventListener("click", function () {
        navigate("#/clients");
      });
      return;
    }

    var name = displayName(d);
    var pe = d.profile_ext || {};
    var dob = pe.date_of_birth || d.date_of_birth || "";
    var age = calcAge(dob);
    var meta = [];
    if (age != null) meta.push(t("age_prefix") + ": " + age);
    if (pe.gender || d.gender) meta.push(t("gender_prefix") + ": " + (pe.gender || d.gender));

    var tabsHtml = CLIENT_TABS.map(function (tab) {
      return (
        '<button type="button" class="crm-tab' +
        (tab.id === route.tab ? " active" : "") +
        '" data-tab="' +
        esc(tab.id) +
        '">' +
        esc(t(tab.labelKey)) +
        "</button>"
      );
    }).join("");

    var panel =
      route.tab === "overview"
        ? renderOverviewTab()
        : route.tab === "medical"
          ? '<div id="crm-medical-root"></div>'
          : route.tab === "connect"
            ? '<div id="crm-connect-root"></div>'
            : tabPlaceholder(route.tab);

    main.innerHTML =
      '<button type="button" class="crm-client-back" id="crm-back-clients">' +
      esc(t("back")) +
      "</button>" +
      '<div class="crm-client-header">' +
      '<div class="crm-avatar">' +
      esc(initials(name)) +
      "</div>" +
      '<div class="crm-client-meta"><h1>' +
      esc(name) +
      "</h1><p>" +
      esc(meta.join(" | ") || t("client_record")) +
      "</p></div>" +
      '<div class="crm-client-actions">' +
      '<button type="button" class="crm-btn" id="crm-go-products">' +
      esc(t("start_quote")) +
      '</button>' +
      '<button type="button" class="crm-btn secondary" id="crm-go-connect">' +
      esc(t("contact")) +
      "</button>" +
      "</div></div>" +
      '<nav class="crm-tabs" aria-label="Client sections">' +
      tabsHtml +
      "</nav>" +
      '<div class="crm-tab-panel">' +
      panel +
      "</div>";

    $("crm-back-clients").addEventListener("click", function () {
      navigate("#/clients");
    });
    $("crm-go-products").addEventListener("click", function () {
      navigate("#/clients/" + encodeURIComponent(route.id) + "/products");
    });
    $("crm-go-connect").addEventListener("click", function () {
      navigate("#/clients/" + encodeURIComponent(route.id) + "/connect");
    });
    main.querySelectorAll(".crm-tab").forEach(function (btn) {
      btn.addEventListener("click", function () {
        navigate("#/clients/" + encodeURIComponent(route.id) + "/" + btn.getAttribute("data-tab"));
      });
    });

    if (route.tab === "overview" && window.StaffCrmOverview) {
      var ovRoot = document.getElementById("crm-overview-root");
      if (ovRoot) await window.StaffCrmOverview.mount(ovRoot, { leadId: route.id, detail: d });
    }
    if (route.tab === "medical" && window.StaffCrmMedical) {
      var medRoot = document.getElementById("crm-medical-root");
      if (medRoot) await window.StaffCrmMedical.mount(medRoot, { leadId: route.id, detail: d });
    }
    if (route.tab === "connect" && window.StaffCrmConnect) {
      var connRoot = document.getElementById("crm-connect-root");
      if (connRoot) await window.StaffCrmConnect.mount(connRoot, { leadId: route.id, detail: d });
    }
  }

  function renderGlobalPlaceholder(main, titleKey, blurbKey) {
    main.innerHTML =
      '<h1 class="crm-page-title">' +
      esc(t(titleKey)) +
      "</h1>" +
      '<div class="crm-placeholder"><strong>' +
      esc(t("global_tool")) +
      "</strong><p>" +
      esc(t(blurbKey)) +
      '</p><p style="margin-top:16px"><a href="/staff/index.html">' +
      esc(t("classic_use")) +
      "</a></p></div>";
  }

  async function renderRoute() {
    if (!accessToken) return;
    var route = parseRoute();
    syncSidebar(route);
    var main = $("crm-main");
    if (!main) return;
    main.innerHTML = '<p class="crm-empty-state">' + esc(t("loading")) + "</p>";

    try {
      if (route.view === "dashboard") {
        await ensureLeads();
        renderDashboard(main);
        resetIdleTimer();
        return;
      }
      if (route.view === "clients") {
        await refreshLeads();
        renderClientsList(main);
        resetIdleTimer();
        return;
      }
      if (route.view === "clientNew") {
        if (window.StaffCrmAddClient) {
          window.StaffCrmAddClient.render(main);
        } else {
          main.innerHTML =
            '<div class="crm-placeholder"><strong>' +
            esc(t("load_error")) +
            "</strong></div>";
        }
        resetIdleTimer();
        return;
      }
      if (route.view === "client") {
        await ensureLeads();
        await loadLeadDetail(route.id);
        await renderClientDetail(main, route);
        resetIdleTimer();
        return;
      }
      if (route.view === "inbox") {
        renderGlobalPlaceholder(main, "inbox_title", "inbox_blurb");
        return;
      }
      if (route.view === "assistant") {
        renderGlobalPlaceholder(main, "assistant_title", "assistant_blurb");
        return;
      }
      if (route.view === "oos") {
        renderGlobalPlaceholder(main, "oos_title", "oos_blurb");
        return;
      }
      if (route.view === "knowledge") {
        renderGlobalPlaceholder(main, "knowledge_title", "knowledge_blurb");
        return;
      }
      renderDashboard(main);
    } catch (e) {
      main.innerHTML =
        '<div class="crm-placeholder"><strong>' +
        esc(t("load_error")) +
        "</strong><p>" +
        esc(e.message || "Error") +
        "</p></div>";
    }
  }

  function wireNav() {
    document.querySelectorAll(".crm-nav-item").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var nav = btn.getAttribute("data-nav");
        if (nav === "dashboard") navigate("#/dashboard");
        else if (nav === "clients") navigate("#/clients");
        else if (nav === "inbox") navigate("#/inbox");
        else if (nav === "assistant") navigate("#/assistant");
        else if (nav === "oos") navigate("#/oos");
        else if (nav === "knowledge") navigate("#/knowledge");
      });
    });
    $("crm-signout").addEventListener("click", signOutNow);
    window.addEventListener("hashchange", renderRoute);
  }

  function wireLogin() {
    $("crm-login-form").addEventListener("submit", async function (e) {
      e.preventDefault();
      if (!sb) {
        $("crm-login-err").textContent = t("login_invalid");
        return;
      }
      $("crm-login-err").textContent = "";
      if (applyLockState()) return;
      $("crm-login-btn").disabled = true;
      try {
        var out = await sb.auth.signInWithPassword({
          email: String($("crm-login-email").value || "").trim(),
          password: String($("crm-login-pass").value || ""),
        });
        if (out.error || !out.data || !out.data.session) throw new Error("invalid");
        resetLoginFailures();
        accessToken = out.data.session.access_token;
        setAuthed(true);
        if (!location.hash) location.hash = "#/dashboard";
        await renderRoute();
        resetIdleTimer();
      } catch (err) {
        markLoginFailure();
        $("crm-login-err").textContent = applyLockState()
          ? t("login_locked")
          : t("login_invalid");
      } finally {
        if (!accessToken) $("crm-login-btn").disabled = false;
      }
    });
  }

  async function init() {
    applyLockState();
    wireLangToggle();
    wireNav();
    wireLogin();
    ["mousemove", "keydown", "click", "touchstart"].forEach(function (ev) {
      window.addEventListener(ev, resetIdleTimer, { passive: true });
    });

    try {
      var confRes = await fetch("/api/staff-config");
      var conf = await confRes.json();
      if (!confRes.ok || !conf.supabaseUrl || !conf.supabaseAnonKey) throw new Error("config");
      SUPABASE_URL = conf.supabaseUrl;
      SUPABASE_ANON_KEY = conf.supabaseAnonKey;
      sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      var out = await sb.auth.getSession();
      var sess = out && out.data && out.data.session;
      if (sess && sess.access_token) {
        accessToken = sess.access_token;
        setAuthed(true);
        if (!location.hash) location.hash = "#/dashboard";
        await renderRoute();
        resetIdleTimer();
      } else {
        setAuthed(false);
      }
    } catch (e) {
      setAuthed(false);
      $("crm-login-err").textContent = t("login_config_err");
    }
  }

  window.StaffCrm = {
    authedApi: authedApi,
    esc: esc,
    navigate: navigate,
    calcAge: calcAge,
    t: t,
    reloadLeadDetail: reloadLeadDetail,
    refreshLeads: refreshLeads,
    upsertLeadListItem: upsertLeadListItem,
    getLang: function () {
      return window.StaffCrmI18n ? window.StaffCrmI18n.getLang() : "en";
    },
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
