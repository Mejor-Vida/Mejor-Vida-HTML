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
  var reminderPollTimer = null;
  var reminderPollInFlight = false;

  var CLIENT_TABS = [
    { id: "overview", labelKey: "tab_overview" },
    { id: "comm-notes", labelKey: "tab_comm_notes" },
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
    if (parts[0] === "oos") {
      var oosTab = parts[1] || "referrals";
      var validOos = { referrals: true, agents: true, archive: true };
      return { view: "oos", oosTab: validOos[oosTab] ? oosTab : "referrals" };
    }
    if (parts[0] === "knowledge") return { view: "knowledge" };
    if (parts[0] === "ga4") return { view: "ga4" };
    if (parts[0] === "todo") {
      var todoOwner = parts[1] || "";
      if (todoOwner === "julie" || todoOwner === "justin") {
        return { view: "todo", todoOwner: todoOwner };
      }
      return { view: "todo" };
    }
    if (parts[0] === "nurture-settings") return { view: "nurtureSettings" };
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
    if (on) startReminderPoller();
    else stopReminderPoller();
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
    stopReminderPoller();
    try {
      if (sb) await sb.auth.signOut();
    } catch (e) {}
    accessToken = "";
    leadsCache = [];
    currentDetail = null;
    setAuthed(false);
  }

  async function processDueRemindersQuietly() {
    if (!accessToken || reminderPollInFlight) return null;
    reminderPollInFlight = true;
    try {
      var result = await authedApi(
        "/api/staff/reminders",
        { action: "process_due" },
        { method: "POST" }
      );
      if (result && result.sent > 0) {
        window.dispatchEvent(
          new CustomEvent("staffcrm-reminders-sent", { detail: result })
        );
      }
      return result;
    } catch (e) {
      console.warn("[StaffCrm] reminder process_due failed:", (e && e.message) || e);
      return null;
    } finally {
      reminderPollInFlight = false;
    }
  }

  function startReminderPoller() {
    stopReminderPoller();
    void processDueRemindersQuietly();
    reminderPollTimer = setInterval(processDueRemindersQuietly, 60000);
  }

  function stopReminderPoller() {
    if (reminderPollTimer) {
      clearInterval(reminderPollTimer);
      reminderPollTimer = null;
    }
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
      if (!opts.softAuth) await signOutNow();
      throw new Error("unauthorized");
    }
    var data = {};
    try {
      data = await r.json();
    } catch (e) {}
    if (!r.ok) {
      var errMsg = (data && data.error) || "Request failed";
      if (data && data.detail) errMsg += ": " + data.detail;
      throw new Error(errMsg);
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

  function sortLocale() {
    return window.StaffCrmI18n && window.StaffCrmI18n.getLang() === "es" ? "es" : "en";
  }

  /** Sort key: last name first when available, else display name. */
  function sortNameKey(lead) {
    var ln = String((lead && lead.last_name) || "").trim();
    var fn = String((lead && lead.first_name) || "").trim();
    if (ln || fn) return (ln + "\0" + fn).toLowerCase();
    return displayName(lead).toLowerCase();
  }

  function compareNameKeys(a, b) {
    return sortNameKey(a).localeCompare(sortNameKey(b), sortLocale(), { sensitivity: "base" });
  }

  function formatDateAdded(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    var lang = window.StaffCrmI18n ? window.StaffCrmI18n.getLang() : "en";
    var locale = lang === "es" ? "es-US" : "en-US";
    return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
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
          : route.view === "nurtureSettings"
            ? "nurture-settings"
            : route.view;
    document.querySelectorAll(".crm-nav-item").forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-nav") === active);
    });
    document.querySelectorAll(".crm-bottom-nav-btn[data-nav]").forEach(function (btn) {
      var nav = btn.getAttribute("data-nav");
      if (nav === "more") {
        btn.classList.remove("active");
        return;
      }
      btn.classList.toggle("active", nav === active);
    });
  }

  function isMobileNavLayout() {
    return window.matchMedia("(max-width: 900px)").matches;
  }

  function setMobileNavOpen(open) {
    document.body.classList.toggle("crm-mobile-nav-open", !!open);
    var toggle = $("crm-nav-toggle");
    var backdrop = $("crm-sidebar-backdrop");
    if (toggle) toggle.setAttribute("aria-expanded", open ? "true" : "false");
    if (backdrop) backdrop.setAttribute("aria-hidden", open ? "false" : "true");
  }

  function closeMobileNav() {
    setMobileNavOpen(false);
  }

  function openMobileNav() {
    if (!isMobileNavLayout()) return;
    setMobileNavOpen(true);
  }

  function navigateByNav(nav) {
    if (nav === "dashboard") navigate("#/dashboard");
    else if (nav === "clients") navigate("#/clients");
    else if (nav === "inbox") navigate("#/inbox");
    else if (nav === "assistant") navigate("#/assistant");
    else if (nav === "oos") navigate("#/oos");
    else if (nav === "knowledge") navigate("#/knowledge");
    else if (nav === "ga4") navigate("#/ga4");
    else if (nav === "todo") navigate("#/todo");
    else if (nav === "nurture-settings") navigate("#/nurture-settings");
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
      pipeline_stage: detail.pipeline_stage || "",
      contact_id: detail.contact_id || detail.contacts_contact_id || "",
      contacts_contact_id: detail.contacts_contact_id || detail.contact_id || "",
      call_scheduled_at: detail.call_scheduled_at || null,
      created_at: detail.created_at || null,
      updated_at: detail.updated_at || null,
    };
  }

  function fmtAppointment(iso) {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (e) {
      return String(iso);
    }
  }

  function renderStageCell(L) {
    var stages = window.StaffCrmStages;
    if (!stages || !stages.renderStagePicker) return "—";
    return stages.renderStagePicker(L.id, L.pipeline_stage, esc, t("col_stage"));
  }

  function hasValidEmail(L) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String((L && L.email) || "").trim());
  }

  function hasValidPhone(L) {
    return String((L && L.phone) || "").replace(/\D/g, "").length >= 10;
  }

  function indicatorIconSvg(kind) {
    var size = kind === "phone" ? 22 : 18;
    if (kind === "email") {
      return (
        '<svg viewBox="0 0 24 24" width="' +
        size +
        '" height="' +
        size +
        '" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5 8-5v2Z"/>' +
        "</svg>"
      );
    }
    if (kind === "phone") {
      return (
        '<svg viewBox="0 0 24 24" width="' +
        size +
        '" height="' +
        size +
        '" aria-hidden="true" focusable="false">' +
        '<path fill="currentColor" d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.25 1.01l-2.2 2.2Z"/>' +
        "</svg>"
      );
    }
    return (
      '<svg viewBox="0 0 24 24" width="' +
      size +
      '" height="' +
      size +
      '" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>' +
      "</svg>"
    );
  }

  function formatIndicatorWhen(iso) {
    if (!iso) return "";
    try {
      var d = new Date(iso);
      if (Number.isNaN(d.getTime())) return "";
      return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
    } catch (e) {
      return "";
    }
  }

  function renderIndicatorCell(kind, active, label) {
    var cls = "crm-indicator" + (active ? " is-on" : " is-off");
    if (kind === "phone") cls += " crm-indicator--phone";
    return (
      '<span class="' +
      cls +
      '" role="img" aria-label="' +
      esc(label) +
      '" title="' +
      esc(label) +
      '">' +
      indicatorIconSvg(kind) +
      "</span>"
    );
  }

  function renderEmailIndicator(L) {
    var on = hasValidEmail(L);
    return renderIndicatorCell("email", on, on ? t("indicator_email_on") : t("indicator_email_off"));
  }

  function renderPhoneIndicator(L) {
    var on = hasValidPhone(L);
    return renderIndicatorCell("phone", on, on ? t("indicator_phone_on") : t("indicator_phone_off"));
  }

  function renderReviewIndicator(L) {
    var sentAt = L && L.review_request_sent_at ? String(L.review_request_sent_at).trim() : "";
    var on = !!sentAt;
    var when = formatIndicatorWhen(sentAt);
    var label = on
      ? t("indicator_review_sent", { when: when || sentAt })
      : t("indicator_review_not_sent");
    return renderIndicatorCell("review", on, label);
  }

  function renderCalendarCell(L) {
    var scheduled = !!(L.call_scheduled_at);
    var cls = scheduled ? " crm-calendar-bell is-scheduled" : " crm-calendar-bell is-empty";
    var label = scheduled ? t("calendar_scheduled_title") : t("calendar_no_appointment");
    return (
      '<button type="button" class="' +
      cls.trim() +
      '" data-id="' +
      esc(L.id) +
      '" data-at="' +
      esc(L.call_scheduled_at || "") +
      '" aria-label="' +
      esc(label) +
      '">' +
      '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">' +
      '<path fill="currentColor" d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"/>' +
      "</svg></button>"
    );
  }

  function patchClientsListIndicators(leadId) {
    if (!leadId) return;
    var L = leadsCache.find(function (x) {
      return x.id === leadId;
    });
    if (!L) return;
    var tr = document.querySelector('#crm-clients-tbody tr[data-id="' + leadId + '"]');
    if (!tr) return;
    var emailCell = tr.querySelector(".crm-col-email");
    var phoneCell = tr.querySelector(".crm-col-phone");
    var reviewCell = tr.querySelector(".crm-col-review");
    if (emailCell) emailCell.innerHTML = renderEmailIndicator(L);
    if (phoneCell) phoneCell.innerHTML = renderPhoneIndicator(L);
    if (reviewCell) reviewCell.innerHTML = renderReviewIndicator(L);
  }

  function upsertLeadListItem(item) {
    if (!item || !item.id) return;
    var idx = leadsCache.findIndex(function (x) {
      return x.id === item.id;
    });
    if (idx >= 0) leadsCache[idx] = Object.assign({}, leadsCache[idx], item);
    else leadsCache.push(item);
    patchClientsListIndicators(item.id);
  }

  function renderCallTaskList(tasks, emptyKey) {
    if (!tasks || !tasks.length) {
      return '<p class="crm-empty-state">' + esc(t(emptyKey || "nurture_no_calls")) + "</p>";
    }
    var html = '<ul class="crm-task-list">';
    tasks.forEach(function (task) {
      var when = "";
      try {
        when = new Date(task.due_at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
      } catch (e) {
        when = String(task.due_at || "");
      }
      var leadHash =
        "#/clients/" +
        encodeURIComponent(task.lead_id) +
        "/overview";
      html +=
        '<li><a href="' +
        esc(leadHash) +
        '">' +
        esc(task.display_name || "Lead") +
        "</a> — " +
        esc(t("nurture_attempt", { n: task.attempt_number || 1 })) +
        " · " +
        esc(when) +
        "</li>";
    });
    html += "</ul>";
    return html;
  }

  async function renderDashboard(main) {
    var dash = null;
    try {
      dash = await authedApi("/api/staff/crm-dashboard", null, { method: "GET" });
    } catch (e) {
      dash = null;
    }

    var total = leadsCache.length;
    var callsToday = dash && dash.calls_today != null ? dash.calls_today : "—";
    var medicalPending = dash && dash.medical_pending != null ? dash.medical_pending : "—";
    var stageCounts = (dash && dash.stage_counts) || {};
    var daily = dash && dash.daily_summary ? dash.daily_summary : null;
    var newInSeq = (dash && dash.new_leads_in_sequence) || [];

    var stageListHtml = ["new", "contacted", "engaged", "client", "enrolled"]
      .map(function (key) {
        var labelKey = key === "enrolled" ? "stage_enrolled" : "stage_" + key;
        if (key === "engaged" || key === "client") labelKey = "ov_stage_" + key;
        var count = stageCounts[key] != null ? stageCounts[key] : "—";
        return (
          '<li><span><span class="crm-dot ' +
          esc(key === "enrolled" ? "enrolled" : key) +
          '"></span>' +
          esc(t(labelKey)) +
          '</span><strong>' +
          esc(String(count)) +
          "</strong></li>"
        );
      })
      .join("");

    var newSeqHtml = "";
    if (newInSeq.length) {
      newSeqHtml = '<ul class="crm-task-list">';
      newInSeq.forEach(function (row) {
        newSeqHtml +=
          '<li><a href="#/clients/' +
          encodeURIComponent(row.lead_id) +
          '/overview">' +
          esc(row.display_name || "Lead") +
          "</a> — " +
          esc(t("nurture_days_in", { n: row.days_in_sequence })) +
          "</li>";
      });
      newSeqHtml += "</ul>";
    } else {
      newSeqHtml = '<p class="crm-empty-state">' + esc(t("nurture_no_calls")) + "</p>";
    }

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
      '<div class="crm-stat"><div class="crm-stat-value">' +
      esc(String(medicalPending)) +
      '</div><div class="crm-stat-label">' +
      esc(t("medical_pending")) +
      '</div></div>' +
      '<div class="crm-stat"><div class="crm-stat-value">' +
      esc(String(callsToday)) +
      '</div><div class="crm-stat-label">' +
      esc(t("calls_today")) +
      "</div></div>" +
      "</div></div>" +
      '<div class="crm-card" style="margin-bottom:16px">' +
      "<h2>" +
      esc(t("nurture_daily_summary")) +
      "</h2>" +
      "<h3>" +
      esc(t("nurture_new_calls")) +
      "</h3>" +
      renderCallTaskList(daily && daily.new_call_tasks, "nurture_no_calls") +
      "<h3 style=\"margin-top:16px\">" +
      esc(t("nurture_contacted_calls")) +
      "</h3>" +
      renderCallTaskList(daily && daily.contacted_call_tasks, "nurture_no_calls") +
      "</div>" +
      '<div class="crm-card crm-funnel-dash-card" style="margin-bottom:16px">' +
      '<a href="#/ga4" class="crm-funnel-dash-link">' +
      "<div>" +
      "<strong>" +
      esc(t("funnel_dash_title")) +
      "</strong>" +
      "<span>" +
      esc(t("funnel_dash_blurb")) +
      "</span></div>" +
      '<span class="crm-funnel-dash-arrow" aria-hidden="true">→</span>' +
      "</a></div>" +
      '<div class="crm-card">' +
      "<h2>" +
      esc(t("nurture_new_in_sequence")) +
      "</h2>" +
      newSeqHtml +
      "</div></div>" +
      '<div class="crm-card">' +
      "<h2>" +
      esc(t("client_snapshot")) +
      "</h2>" +
      '<ul class="crm-stage-list">' +
      stageListHtml +
      "</ul>" +
      '<p class="crm-empty-state" style="padding-top:12px">' +
      '<a href="#/nurture-settings">' +
      esc(t("nav_nurture_settings")) +
      "</a></p>" +
      "</div></div>";
  }

  function renderClientsList(main) {
    var stageFilter = "";

    function renderStageFilterHeaderCell() {
      var stages = window.StaffCrmStages;
      if (!stages || !stages.renderStageFilterHeader) return esc(t("col_stage"));
      return stages.renderStageFilterHeader(stageFilter, esc);
    }

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
      '<button type="button" class="crm-sort-th-btn" id="crm-sort-name" aria-sort="none">' +
      esc(t("col_name")) +
      ' <span class="crm-sort-icon" aria-hidden="true">↕</span></button>' +
      '</th><th class="crm-col-indicator crm-col-email" scope="col">' +
      esc(t("col_email")) +
      '</th><th class="crm-col-indicator crm-col-phone" scope="col">' +
      esc(t("col_phone")) +
      '</th><th class="crm-col-indicator crm-col-review" scope="col">' +
      esc(t("col_review_sent")) +
      '</th><th class="crm-col-stage">' +
      renderStageFilterHeaderCell() +
      '</th><th class="crm-col-calendar">' +
      esc(t("col_calendar")) +
      '</th><th class="crm-col-date">' +
      '<button type="button" class="crm-sort-th-btn is-active" id="crm-sort-date" aria-sort="descending">' +
      esc(t("col_date_added")) +
      ' <span class="crm-sort-icon" aria-hidden="true">↓</span></button>' +
      '</th><th class="crm-col-menu"><span class="hidden">' +
      esc(t("clients_row_actions")) +
      "</span></th></tr></thead><tbody id=\"crm-clients-tbody\"></tbody></table></div>" +
      '<div id="crm-appointment-popover" class="crm-appointment-popover hidden" role="dialog" aria-modal="false"></div>' +
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
    var sortState = { column: "date", dir: "desc" };
    var apptPopoverCloser = null;

    function closeApptPopover() {
      var pop = $("crm-appointment-popover");
      if (pop) {
        pop.classList.add("hidden");
        pop.innerHTML = "";
      }
      if (apptPopoverCloser) {
        document.removeEventListener("click", apptPopoverCloser);
        apptPopoverCloser = null;
      }
    }

    function openApptPopover(btn, atIso) {
      closeApptPopover();
      var pop = $("crm-appointment-popover");
      if (!pop || !btn) return;
      var body = atIso
        ? "<strong>" +
          esc(t("calendar_scheduled_title")) +
          "</strong><p>" +
          esc(t("calendar_scheduled_at", { datetime: fmtAppointment(atIso) })) +
          "</p>"
        : "<p>" + esc(t("calendar_no_appointment")) + "</p>";
      pop.innerHTML =
        '<button type="button" class="crm-appointment-popover-close" aria-label="' +
        esc(t("close")) +
        '">&times;</button>' +
        body;
      pop.classList.remove("hidden");
      var rect = btn.getBoundingClientRect();
      pop.style.position = "fixed";
      pop.style.top = rect.bottom + 6 + "px";
      pop.style.left = Math.max(8, rect.left - 40) + "px";
      var closeBtn = pop.querySelector(".crm-appointment-popover-close");
      if (closeBtn) closeBtn.addEventListener("click", closeApptPopover);
      apptPopoverCloser = function (e) {
        if (pop.contains(e.target) || btn.contains(e.target)) return;
        closeApptPopover();
      };
      setTimeout(function () {
        document.addEventListener("click", apptPopoverCloser);
      }, 0);
    }

    function resetStageMenuPosition(menu) {
      if (!menu) return;
      menu.classList.remove("crm-stage-menu-up");
      menu.style.position = "";
      menu.style.top = "";
      menu.style.bottom = "";
      menu.style.left = "";
      menu.style.minWidth = "";
      menu.style.maxHeight = "";
    }

    function positionStageMenu(trigger, menu) {
      if (!trigger || !menu) return;
      var rect = trigger.getBoundingClientRect();
      var gap = 4;
      var minWidth = Math.max(rect.width, 180);
      var maxHeight = Math.max(120, window.innerHeight - 16);
      menu.style.position = "fixed";
      menu.style.minWidth = minWidth + "px";
      menu.style.maxHeight = maxHeight + "px";
      menu.style.zIndex = "130";
      menu.style.left = Math.max(8, Math.min(rect.left, window.innerWidth - minWidth - 8)) + "px";

      var menuHeight = menu.scrollHeight;
      var spaceBelow = window.innerHeight - rect.bottom - gap;
      var spaceAbove = rect.top - gap;
      var openUp = menuHeight > spaceBelow && spaceAbove >= spaceBelow;

      menu.classList.toggle("crm-stage-menu-up", openUp);
      if (openUp) {
        menu.style.top = "auto";
        menu.style.bottom = window.innerHeight - rect.top + gap + "px";
      } else {
        menu.style.bottom = "auto";
        menu.style.top = rect.bottom + gap + "px";
      }
    }

    function closeAllStageMenus(exceptPicker) {
      document.querySelectorAll(".crm-stage-picker .crm-stage-menu").forEach(function (menu) {
        if (exceptPicker && exceptPicker.contains(menu)) return;
        menu.classList.add("hidden");
        resetStageMenuPosition(menu);
      });
      document.querySelectorAll(".crm-stage-picker .crm-stage-trigger").forEach(function (btn) {
        if (exceptPicker && exceptPicker.contains(btn)) return;
        btn.setAttribute("aria-expanded", "false");
      });
    }

    function updateStagePickerUI(picker, stage) {
      if (!picker || !window.StaffCrmStages) return;
      var norm = window.StaffCrmStages.normalizeStage(stage);
      picker.setAttribute("data-stage", norm);
      var trigger = picker.querySelector(".crm-stage-trigger");
      var dot = picker.querySelector(".crm-stage-trigger .crm-stage-dot");
      var label = picker.querySelector(".crm-stage-label");
      if (dot) dot.style.background = window.StaffCrmStages.stageColor(norm);
      if (label) label.textContent = norm ? window.StaffCrmStages.stageLabel(norm) : t("ov_stage_select");
      picker.querySelectorAll(".crm-stage-option").forEach(function (opt) {
        opt.classList.toggle("is-selected", (opt.getAttribute("data-value") || "") === norm);
      });
    }

    async function saveStage(leadId, stage, picker) {
      var prev = picker.getAttribute("data-stage") || "";
      var status = $("crm-clients-status");
      var trigger = picker.querySelector(".crm-stage-trigger");
      if (trigger) trigger.disabled = true;
      try {
        var data = await authedApi("/api/staff/leads", { id: leadId, pipeline_stage: stage || "" }, { method: "PATCH" });
        if (data && data.item) upsertLeadListItem(data.item);
        updateStagePickerUI(picker, stage || "");
        if (status) status.textContent = t("stage_saved");
        draw();
      } catch (e) {
        updateStagePickerUI(picker, prev);
        if (status) status.textContent = (e && e.message) || t("stage_save_failed");
      } finally {
        if (trigger) trigger.disabled = false;
        closeAllStageMenus();
      }
    }

    function visibleRows() {
      var ql = q.trim().toLowerCase();
      return leadsCache.filter(function (L) {
        if (stageFilter && window.StaffCrmStages) {
          if (window.StaffCrmStages.normalizeStage(L.pipeline_stage) !== stageFilter) return false;
        }
        if (!ql) return true;
        var hay = (displayName(L) + " " + (L.email || "") + " " + (L.phone || "")).toLowerCase();
        return hay.indexOf(ql) !== -1;
      });
    }

    function sortedRows() {
      var rows = visibleRows().slice();

      function compareRows(a, b) {
        if (sortState.column === "name") {
          var cmpName = compareNameKeys(a, b);
          if (cmpName !== 0) return sortState.dir === "asc" ? cmpName : -cmpName;
          return String(a.id || "").localeCompare(String(b.id || ""));
        }
        var ta = a.created_at ? new Date(a.created_at).getTime() : 0;
        var tb = b.created_at ? new Date(b.created_at).getTime() : 0;
        var cmpDate = 0;
        if (!ta && !tb) cmpDate = 0;
        else if (!ta) cmpDate = 1;
        else if (!tb) cmpDate = -1;
        else cmpDate = ta - tb;
        if (cmpDate !== 0) return sortState.dir === "desc" ? -cmpDate : cmpDate;
        var tieName = compareNameKeys(a, b);
        if (tieName !== 0) return tieName;
        return String(a.id || "").localeCompare(String(b.id || ""));
      }

      rows.sort(compareRows);
      return rows;
    }

    function updateStageFilterUI() {
      var picker = $("crm-stage-filter-picker");
      if (!picker || !window.StaffCrmStages) return;
      var filter = stageFilter || "";
      picker.setAttribute("data-stage", filter);
      picker.classList.toggle("is-active", !!filter);
      var trigger = picker.querySelector(".crm-stage-trigger");
      var labelEl = picker.querySelector(".crm-stage-label");
      var dot = picker.querySelector(".crm-stage-trigger > .crm-stage-dot");
      if (labelEl) {
        labelEl.textContent = filter
          ? window.StaffCrmStages.stageLabel(filter)
          : t("col_stage_all");
      }
      if (filter) {
        if (!dot && trigger && labelEl) {
          dot = document.createElement("span");
          dot.className = "crm-stage-dot";
          trigger.insertBefore(dot, labelEl);
        }
        if (dot) dot.style.background = window.StaffCrmStages.stageColor(filter);
      } else if (dot) {
        dot.remove();
      }
      picker.querySelectorAll(".crm-stage-option").forEach(function (opt) {
        opt.classList.toggle("is-selected", (opt.getAttribute("data-value") || "") === filter);
      });
    }

    function updateSortHeaders() {
      var nameBtn = $("crm-sort-name");
      var dateBtn = $("crm-sort-date");
      [nameBtn, dateBtn].forEach(function (btn) {
        if (!btn) return;
        var col = btn.id === "crm-sort-name" ? "name" : "date";
        var active = sortState.column === col;
        btn.classList.toggle("is-active", active);
        var icon = btn.querySelector(".crm-sort-icon");
        if (!icon) return;
        if (!active) {
          icon.textContent = "↕";
          btn.setAttribute("aria-sort", "none");
          btn.title = col === "name" ? t("sort_name_hint") : t("sort_date_hint");
          return;
        }
        if (col === "name") {
          icon.textContent = sortState.dir === "asc" ? "↑" : "↓";
          btn.setAttribute("aria-sort", sortState.dir === "asc" ? "ascending" : "descending");
          btn.title = sortState.dir === "asc" ? t("sort_name_az") : t("sort_name_za");
        } else {
          icon.textContent = sortState.dir === "desc" ? "↓" : "↑";
          btn.setAttribute("aria-sort", sortState.dir === "desc" ? "descending" : "ascending");
          btn.title = sortState.dir === "desc" ? t("sort_date_newest") : t("sort_date_oldest");
        }
      });
    }

    function toggleSort(column) {
      if (sortState.column === column) {
        sortState.dir = sortState.dir === "asc" ? "desc" : "asc";
      } else {
        sortState.column = column;
        sortState.dir = column === "name" ? "asc" : "desc";
      }
      updateSortHeaders();
      draw();
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
        '<button type="button" data-action="reminder">' +
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
          else if (action === "reminder") navigate("#/clients/" + encodeURIComponent(id) + "/comm-notes");
        });
      });
    }

    function draw() {
      var tbody = $("crm-clients-tbody");
      var status = $("crm-clients-status");
      if (!tbody) return;
      closeRowMenu();
      closeApptPopover();
      closeAllStageMenus();
      var rows = sortedRows();
      if (!rows.length) {
        tbody.innerHTML = "";
        if (status) status.textContent = q.trim() ? t("no_matches") : t("no_clients");
        updateBulkBar();
        return;
      }
      if (status && !status.textContent) {
        status.textContent = t("showing_clients", { shown: rows.length, total: leadsCache.length });
      } else if (status) {
        if (stageFilter && window.StaffCrmStages) {
          status.textContent =
            t("stage_filtered", { stage: window.StaffCrmStages.stageLabel(stageFilter) }) +
            " · " +
            t("showing_clients", { shown: rows.length, total: leadsCache.length });
        } else {
          status.textContent = t("showing_clients", { shown: rows.length, total: leadsCache.length });
        }
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
            '</span></td><td class="crm-col-indicator crm-col-email">' +
            renderEmailIndicator(L) +
            '</td><td class="crm-col-indicator crm-col-phone">' +
            renderPhoneIndicator(L) +
            '</td><td class="crm-col-indicator crm-col-review">' +
            renderReviewIndicator(L) +
            '</td><td class="crm-col-stage">' +
            renderStageCell(L) +
            '</td><td class="crm-col-calendar">' +
            renderCalendarCell(L) +
            '</td><td class="crm-col-date">' +
            esc(formatDateAdded(L.created_at)) +
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

      tbody.querySelectorAll(".crm-stage-picker").forEach(function (picker) {
        var trigger = picker.querySelector(".crm-stage-trigger");
        var menu = picker.querySelector(".crm-stage-menu");
        if (!trigger || !menu) return;
        trigger.addEventListener("click", function (e) {
          e.stopPropagation();
          var open = !menu.classList.contains("hidden");
          closeAllStageMenus();
          closeRowMenu();
          closeApptPopover();
          if (open) {
            menu.classList.add("hidden");
            resetStageMenuPosition(menu);
            trigger.setAttribute("aria-expanded", "false");
            return;
          }
          menu.classList.remove("hidden");
          trigger.setAttribute("aria-expanded", "true");
          positionStageMenu(trigger, menu);
        });
        menu.querySelectorAll(".crm-stage-option").forEach(function (opt) {
          opt.addEventListener("click", function (e) {
            e.stopPropagation();
            var id = picker.getAttribute("data-id");
            if (!id) return;
            var value = opt.getAttribute("data-value") || "";
            if (value === (picker.getAttribute("data-stage") || "")) {
              closeAllStageMenus();
              return;
            }
            saveStage(id, value, picker);
          });
        });
      });

      tbody.querySelectorAll(".crm-calendar-bell").forEach(function (btn) {
        btn.addEventListener("click", function (e) {
          e.stopPropagation();
          openApptPopover(btn, btn.getAttribute("data-at") || "");
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

    var sortNameBtn = $("crm-sort-name");
    if (sortNameBtn) {
      sortNameBtn.addEventListener("click", function () {
        toggleSort("name");
      });
    }
    var sortDateBtn = $("crm-sort-date");
    if (sortDateBtn) {
      sortDateBtn.addEventListener("click", function () {
        toggleSort("date");
      });
    }
    updateSortHeaders();

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
        if (e.target.closest(".crm-stage-picker")) return;
        closeAllStageMenus();
      });
      window.addEventListener(
        "scroll",
        function () {
          if (clientsRowMenuCloser) clientsRowMenuCloser();
          closeAllStageMenus();
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

    (function wireStageFilterHeader() {
      var picker = $("crm-stage-filter-picker");
      if (!picker) return;
      var trigger = picker.querySelector(".crm-stage-trigger");
      var menu = picker.querySelector(".crm-stage-menu");
      if (!trigger || !menu) return;
      trigger.addEventListener("click", function (e) {
        e.stopPropagation();
        var open = !menu.classList.contains("hidden");
        closeAllStageMenus();
        closeRowMenu();
        closeApptPopover();
        if (open) {
          menu.classList.add("hidden");
          resetStageMenuPosition(menu);
          trigger.setAttribute("aria-expanded", "false");
          return;
        }
        menu.classList.remove("hidden");
        trigger.setAttribute("aria-expanded", "true");
        positionStageMenu(trigger, menu);
      });
      menu.querySelectorAll(".crm-stage-option").forEach(function (opt) {
        opt.addEventListener("click", function (e) {
          e.stopPropagation();
          var value = opt.getAttribute("data-value") || "";
          if (value === stageFilter) {
            closeAllStageMenus();
            return;
          }
          stageFilter = value;
          updateStageFilterUI();
          closeAllStageMenus();
          draw();
        });
      });
    })();

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
            : route.tab === "pipeline"
              ? '<div id="crm-pipeline-root"></div>'
              : route.tab === "comm-notes"
                ? '<div id="crm-comm-notes-root"></div>'
                : tabPlaceholder(route.tab);

    main.innerHTML =
      '<div class="crm-client-detail">' +
      '<div class="crm-client-topbar">' +
      '<button type="button" class="crm-client-back" id="crm-back-clients">' +
      esc(t("back")) +
      "</button>" +
      '<nav class="crm-tabs" aria-label="Client sections">' +
      tabsHtml +
      "</nav>" +
      '<div class="crm-client-name-right">' +
      "<h1>" +
      esc(name) +
      "</h1>" +
      (meta.length ? "<p>" + esc(meta.join(" | ")) + "</p>" : "") +
      "</div></div>" +
      '<div class="crm-tab-panel">' +
      panel +
      "</div></div>";

    $("crm-back-clients").addEventListener("click", function () {
      navigate("#/clients");
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
    if (route.tab === "pipeline" && window.StaffCrmPipeline) {
      var pipeRoot = document.getElementById("crm-pipeline-root");
      if (pipeRoot) await window.StaffCrmPipeline.mount(pipeRoot, { leadId: route.id, detail: d });
    }
    if (route.tab === "comm-notes" && window.StaffCrmCommNotes) {
      var cnRoot = document.getElementById("crm-comm-notes-root");
      if (cnRoot) await window.StaffCrmCommNotes.mount(cnRoot, { leadId: route.id, detail: d });
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
        await renderDashboard(main);
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
        if (window.StaffCrmAssistant) {
          await window.StaffCrmAssistant.mount(main);
        } else {
          main.innerHTML =
            '<div class="crm-placeholder"><strong>' +
            esc(t("load_error")) +
            "</strong><p>Staff Assistant module failed to load.</p></div>";
        }
        resetIdleTimer();
        return;
      }
      if (route.view === "oos") {
        if (window.StaffCrmOos) {
          await window.StaffCrmOos.mount(main, { tab: route.oosTab || "referrals" });
        } else {
          main.innerHTML =
            '<div class="crm-placeholder"><strong>' +
            esc(t("load_error")) +
            "</strong><p>OOS module failed to load.</p></div>";
        }
        resetIdleTimer();
        return;
      }
      if (route.view === "knowledge") {
        if (window.StaffCrmKnowledge) {
          await window.StaffCrmKnowledge.mount(main);
        } else {
          main.innerHTML =
            '<div class="crm-placeholder"><strong>' +
            esc(t("load_error")) +
            "</strong><p>Knowledge module failed to load.</p></div>";
        }
        resetIdleTimer();
        return;
      }
      if (route.view === "todo") {
        if (window.StaffCrmTodo) {
          await window.StaffCrmTodo.mount(main, { owner: route.todoOwner || "" });
        } else {
          main.innerHTML =
            '<div class="crm-placeholder"><strong>' +
            esc(t("load_error")) +
            "</strong><p>To-Do module failed to load.</p></div>";
        }
        resetIdleTimer();
        return;
      }
      if (route.view === "ga4") {
        if (window.StaffCrmFunnelDashboard) {
          await window.StaffCrmFunnelDashboard.mount(main);
        } else {
          main.innerHTML =
            '<div class="crm-placeholder"><strong>' +
            esc(t("load_error")) +
            "</strong><p>Funnel Analytics module failed to load.</p></div>";
        }
        resetIdleTimer();
        return;
      }
      if (route.view === "nurtureSettings") {
        if (window.StaffCrmNurtureSettings) {
          await window.StaffCrmNurtureSettings.mount(main);
        } else {
          main.innerHTML =
            '<div class="crm-placeholder"><strong>' +
            esc(t("load_error")) +
            "</strong><p>Nurture settings module failed to load.</p></div>";
        }
        resetIdleTimer();
        return;
      }
      await renderDashboard(main);
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
        navigateByNav(btn.getAttribute("data-nav"));
        closeMobileNav();
      });
    });
    document.querySelectorAll(".crm-bottom-nav-btn[data-nav]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var nav = btn.getAttribute("data-nav");
        if (nav === "more") {
          openMobileNav();
          return;
        }
        navigateByNav(nav);
        closeMobileNav();
      });
    });
    var navToggle = $("crm-nav-toggle");
    if (navToggle) {
      navToggle.addEventListener("click", function () {
        if (document.body.classList.contains("crm-mobile-nav-open")) closeMobileNav();
        else openMobileNav();
      });
    }
    var backdrop = $("crm-sidebar-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", closeMobileNav);
    }
    window.addEventListener(
      "resize",
      function () {
        if (!isMobileNavLayout()) closeMobileNav();
      },
      { passive: true }
    );
    $("crm-signout").addEventListener("click", signOutNow);
    window.addEventListener("hashchange", function () {
      closeMobileNav();
      renderRoute();
    });
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
    processDueReminders: processDueRemindersQuietly,
    getSupabase: function () {
      return sb;
    },
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
