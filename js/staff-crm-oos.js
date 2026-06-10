/**
 * CRM OOS — out-of-state referrals, partner agents, and archive.
 */
(function () {
  "use strict";

  var state = {
    tab: "referrals",
    referrals: [],
    agents: [],
    archive: [],
    selectedReferralId: "",
    selectedArchiveId: "",
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

  function fmtDate(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    var lang = window.StaffCrmI18n ? window.StaffCrmI18n.getLang() : "en";
    return d.toLocaleDateString(lang === "es" ? "es-US" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function navigateTab(tab) {
    if (window.StaffCrm && window.StaffCrm.navigate) {
      window.StaffCrm.navigate("#/oos/" + tab);
    } else {
      location.hash = "#/oos/" + tab;
    }
  }

  function oosNormState(s) {
    var v = String(s || "")
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase();
    return v.length >= 2 ? v.slice(0, 2) : v;
  }

  function referralName(r) {
    return [r.first_name, r.last_name].filter(Boolean).join(" ").trim() || t("oos_no_name");
  }

  function renderSubtabs(activeTab) {
    var tabs = [
      { id: "referrals", label: t("oos_tab_referrals") },
      { id: "agents", label: t("oos_tab_agents") },
      { id: "archive", label: t("oos_tab_archive") },
    ];
    return (
      '<div class="crm-oos-subtabs" role="tablist">' +
      tabs
        .map(function (tab) {
          return (
            '<button type="button" class="crm-oos-subtab' +
            (tab.id === activeTab ? " active" : "") +
            '" role="tab" data-oos-tab="' +
            esc(tab.id) +
            '" aria-selected="' +
            (tab.id === activeTab ? "true" : "false") +
            '">' +
            esc(tab.label) +
            "</button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderReferralsPanel() {
    return (
      '<div class="crm-oos-panel" id="crm-oos-panel-referrals" role="tabpanel">' +
      '<div class="crm-oos-card">' +
      '<div class="crm-oos-head">' +
      "<div><strong>" +
      esc(t("oos_tab_referrals")) +
      "</strong>" +
      '<p class="crm-oos-note">' +
      esc(t("oos_referrals_blurb")) +
      "</p></div>" +
      '<button type="button" class="crm-btn secondary" id="crm-oos-ref-refresh">' +
      esc(t("oos_refresh")) +
      "</button></div>" +
      '<div class="crm-oos-body">' +
      '<aside class="crm-oos-list-col">' +
      '<label for="crm-oos-ref-filter">' +
      esc(t("oos_filter")) +
      "</label>" +
      '<input type="search" id="crm-oos-ref-filter" autocomplete="off" placeholder="' +
      esc(t("oos_filter_placeholder")) +
      '" />' +
      '<p class="crm-oos-list-hint" id="crm-oos-ref-list-hint">' +
      esc(t("oos_ref_list_hint")) +
      "</p>" +
      '<div id="crm-oos-ref-list" class="crm-oos-list" role="listbox"></div>' +
      "</aside>" +
      '<div class="crm-oos-main-col">' +
      '<form id="crm-oos-ref-form" class="crm-oos-form hidden" autocomplete="off" onsubmit="return false;">' +
      '<div class="crm-oos-grid">' +
      field("crm-oos-ref-first", t("oos_first_name")) +
      field("crm-oos-ref-last", t("oos_last_name")) +
      field("crm-oos-ref-state", t("oos_state"), 'maxlength="2" style="text-transform:uppercase"') +
      field("crm-oos-ref-email", t("oos_email"), 'type="email" inputmode="email"') +
      field("crm-oos-ref-phone", t("oos_phone"), 'inputmode="tel"') +
      field("crm-oos-ref-status-field", t("oos_status")) +
      "</div>" +
      '<div class="crm-oos-field crm-oos-field--full"><label for="crm-oos-ref-form-msg">' +
      esc(t("oos_original_message")) +
      '</label><textarea id="crm-oos-ref-form-msg" rows="3" readonly class="crm-oos-ro"></textarea></div>' +
      '<div class="crm-oos-field crm-oos-field--full"><label for="crm-oos-ref-context">' +
      esc(t("oos_staff_summary")) +
      '</label><textarea id="crm-oos-ref-context" rows="4" placeholder="' +
      esc(t("oos_staff_summary_ph")) +
      '"></textarea></div>' +
      '<div class="crm-oos-field crm-oos-field--full"><label for="crm-oos-ref-agent">' +
      esc(t("oos_matched_agent")) +
      '</label><div class="crm-oos-agent-row">' +
      '<select id="crm-oos-ref-agent"><option value="">' +
      esc(t("oos_select_agent")) +
      "</option></select>" +
      '<button type="button" class="crm-btn secondary" id="crm-oos-ref-match">' +
      esc(t("oos_match_state")) +
      "</button></div>" +
      '<p class="crm-oos-list-hint" id="crm-oos-ref-agent-hint"></p></div>' +
      '<div class="crm-oos-field"><label>' +
      esc(t("oos_email_lang")) +
      '</label><div class="crm-oos-lang-toggle">' +
      '<button type="button" class="active" id="crm-oos-ref-lang-en" data-lang="English">English</button>' +
      '<button type="button" id="crm-oos-ref-lang-es" data-lang="Spanish">Español</button>' +
      "</div></div>" +
      '<div class="crm-oos-field crm-oos-field--full"><label for="crm-oos-ref-ai-email">' +
      esc(t("oos_ai_email")) +
      '</label><textarea id="crm-oos-ref-ai-email" rows="12" placeholder="' +
      esc(t("oos_ai_email_ph")) +
      '"></textarea></div>' +
      '<div class="crm-oos-actions">' +
      '<button type="button" class="crm-btn secondary" id="crm-oos-ref-generate">' +
      esc(t("oos_generate")) +
      "</button>" +
      '<button type="button" class="crm-btn" id="crm-oos-ref-send">' +
      esc(t("oos_send_agent")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="crm-oos-ref-save">' +
      esc(t("oos_save")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="crm-oos-ref-archive">' +
      esc(t("oos_save_archive")) +
      "</button></div>" +
      '<div id="crm-oos-ref-foot-status" class="crm-oos-foot-status"></div>' +
      "</form>" +
      '<div id="crm-oos-ref-empty" class="crm-oos-empty">' +
      esc(t("oos_select_referral")) +
      "</div></div></div></div></div>"
    );
  }

  function renderAgentsPanel() {
    return (
      '<div class="crm-oos-panel hidden" id="crm-oos-panel-agents" role="tabpanel">' +
      '<div class="crm-oos-card">' +
      '<div class="crm-oos-head">' +
      "<div><strong>" +
      esc(t("oos_tab_agents")) +
      "</strong>" +
      '<p class="crm-oos-note">' +
      esc(t("oos_agents_blurb")) +
      "</p></div>" +
      '<div class="crm-oos-actions" style="margin:0">' +
      '<button type="button" class="crm-btn secondary" id="crm-oos-ag-refresh">' +
      esc(t("oos_refresh")) +
      "</button>" +
      '<button type="button" class="crm-btn secondary" id="crm-oos-ag-new">' +
      esc(t("oos_new_agent")) +
      "</button></div></div>" +
      '<div class="crm-oos-body">' +
      '<aside class="crm-oos-list-col">' +
      '<label for="crm-oos-ag-filter">' +
      esc(t("oos_filter")) +
      "</label>" +
      '<input type="search" id="crm-oos-ag-filter" autocomplete="off" placeholder="' +
      esc(t("oos_filter_agent_ph")) +
      '" />' +
      '<div id="crm-oos-ag-list" class="crm-oos-list" role="listbox"></div>' +
      "</aside>" +
      '<div class="crm-oos-main-col">' +
      '<form id="crm-oos-ag-form" class="crm-oos-form" autocomplete="off" onsubmit="return false;">' +
      '<input type="hidden" id="crm-oos-ag-id" value="" />' +
      '<div class="crm-oos-grid">' +
      field("crm-oos-ag-state", t("oos_state_2"), 'maxlength="2" required style="text-transform:uppercase"') +
      '<div class="crm-oos-field"><label for="crm-oos-ag-active">' +
      esc(t("oos_active")) +
      '</label><select id="crm-oos-ag-active"><option value="true">' +
      esc(t("oos_yes")) +
      '</option><option value="false">' +
      esc(t("oos_no")) +
      "</option></select></div>" +
      field("crm-oos-ag-name", t("oos_agent_name"), "required") +
      field("crm-oos-ag-company", t("oos_company")) +
      field("crm-oos-ag-email", t("oos_email"), 'type="email" required inputmode="email"') +
      field("crm-oos-ag-phone", t("oos_phone"), 'inputmode="tel"') +
      field("crm-oos-ag-address", t("oos_address"), 'class="crm-oos-field--full"') +
      "</div>" +
      '<div class="crm-oos-field crm-oos-field--full"><label for="crm-oos-ag-notes">' +
      esc(t("oos_notes")) +
      '</label><textarea id="crm-oos-ag-notes" rows="3"></textarea></div>' +
      '<div class="crm-oos-actions"><button type="button" class="crm-btn" id="crm-oos-ag-save">' +
      esc(t("oos_save_agent")) +
      "</button></div>" +
      '<div id="crm-oos-ag-status" class="crm-oos-foot-status"></div>' +
      "</form></div></div></div></div>"
    );
  }

  function renderArchivePanel() {
    return (
      '<div class="crm-oos-panel hidden" id="crm-oos-panel-archive" role="tabpanel">' +
      '<div class="crm-oos-card">' +
      '<div class="crm-oos-head">' +
      "<div><strong>" +
      esc(t("oos_tab_archive")) +
      "</strong>" +
      '<p class="crm-oos-note">' +
      esc(t("oos_archive_blurb")) +
      "</p></div>" +
      '<button type="button" class="crm-btn secondary" id="crm-oos-arch-refresh">' +
      esc(t("oos_refresh")) +
      "</button></div>" +
      '<div class="crm-oos-body">' +
      '<aside class="crm-oos-list-col">' +
      '<label for="crm-oos-arch-filter">' +
      esc(t("oos_filter")) +
      "</label>" +
      '<input type="search" id="crm-oos-arch-filter" autocomplete="off" placeholder="' +
      esc(t("oos_filter_placeholder")) +
      '" />' +
      '<p class="crm-oos-list-hint">' +
      esc(t("oos_arch_list_hint")) +
      "</p>" +
      '<div id="crm-oos-arch-list" class="crm-oos-list" role="listbox"></div>' +
      "</aside>" +
      '<div class="crm-oos-main-col">' +
      '<form id="crm-oos-arch-form" class="crm-oos-form hidden" autocomplete="off" onsubmit="return false;">' +
      '<div class="crm-oos-section-title">' +
      esc(t("oos_arch_readonly")) +
      "</div>" +
      '<div class="crm-oos-grid">' +
      field("crm-oos-arch-name", t("oos_name"), "readonly") +
      field("crm-oos-arch-state", t("oos_state"), "readonly") +
      field("crm-oos-arch-email", t("oos_email"), "readonly") +
      field("crm-oos-arch-phone", t("oos_phone"), "readonly") +
      field("crm-oos-arch-status-ro", t("oos_status"), "readonly") +
      "</div>" +
      '<div class="crm-oos-field crm-oos-field--full"><label for="crm-oos-arch-context">' +
      esc(t("oos_staff_summary")) +
      '</label><textarea id="crm-oos-arch-context" rows="2" readonly></textarea></div>' +
      '<div class="crm-oos-section-title">' +
      esc(t("oos_comp_tracking")) +
      "</div>" +
      field("crm-oos-arch-status-field", t("oos_status_workflow")) +
      '<div class="crm-oos-field crm-oos-field--full"><label for="crm-oos-arch-comp-notes">' +
      esc(t("oos_comp_notes")) +
      '</label><textarea id="crm-oos-arch-comp-notes" rows="3" placeholder="' +
      esc(t("oos_comp_notes_ph")) +
      '"></textarea></div>' +
      '<div class="crm-oos-field"><label for="crm-oos-arch-comp-at">' +
      esc(t("oos_comp_date")) +
      '</label><input type="datetime-local" id="crm-oos-arch-comp-at" style="max-width:280px" /></div>' +
      '<div class="crm-oos-actions"><button type="button" class="crm-btn" id="crm-oos-arch-save">' +
      esc(t("oos_save_archive_btn")) +
      "</button></div>" +
      '<div id="crm-oos-arch-foot-status" class="crm-oos-foot-status"></div>' +
      "</form>" +
      '<div id="crm-oos-arch-empty" class="crm-oos-empty">' +
      esc(t("oos_select_archived")) +
      "</div></div></div></div></div>"
    );
  }

  function field(id, label, extra) {
    extra = extra || "";
    var isReadonly = extra.indexOf("readonly") !== -1;
    var tag = extra.indexOf("textarea") !== -1 ? "textarea" : "input";
    var fullClass = extra.indexOf("crm-oos-field--full") !== -1 ? " crm-oos-field--full" : "";
    extra = extra.replace(/\s*crm-oos-field--full/g, "").trim();
    if (tag === "textarea") {
      return (
        '<div class="crm-oos-field' +
        fullClass +
        '"><label for="' +
        id +
        '">' +
        esc(label) +
        '</label><textarea id="' +
        id +
        '" rows="3"' +
        (isReadonly ? " readonly" : "") +
        "></textarea></div>"
      );
    }
    return (
      '<div class="crm-oos-field' +
      fullClass +
      '"><label for="' +
      id +
      '">' +
      esc(label) +
      '</label><input id="' +
      id +
      '" type="text" ' +
      extra +
      " /></div>"
    );
  }

  function renderShell(tab) {
    return (
      '<div class="crm-oos-shell">' +
      '<h1 class="crm-oos-page-title">' +
      esc(t("oos_title")) +
      "</h1>" +
      renderSubtabs(tab) +
      renderReferralsPanel() +
      renderAgentsPanel() +
      renderArchivePanel() +
      "</div>"
    );
  }

  function showTabPanels(tab) {
    ["referrals", "agents", "archive"].forEach(function (id) {
      var panel = $("crm-oos-panel-" + id);
      if (panel) panel.classList.toggle("hidden", id !== tab);
    });
  }

  async function fetchAgents() {
    var data = await api("/api/staff/oos-agents", null, { method: "GET" });
    state.agents = Array.isArray(data.agents) ? data.agents : [];
    return state.agents;
  }

  function fillAgentSelect(selectedId) {
    var sel = $("crm-oos-ref-agent");
    if (!sel) return;
    var cur = selectedId != null ? String(selectedId) : String(sel.value || "");
    sel.innerHTML =
      '<option value="">' + esc(t("oos_select_agent")) + "</option>";
    var agents = state.agents.filter(function (a) {
      return a && a.active !== false;
    });
    agents.sort(function (a, b) {
      var sa = String(a.state_code || "");
      var sb = String(b.state_code || "");
      if (sa !== sb) return sa.localeCompare(sb);
      return String(a.display_name || "").localeCompare(String(b.display_name || ""));
    });
    agents.forEach(function (a) {
      var opt = document.createElement("option");
      opt.value = a.id;
      opt.textContent =
        String(a.state_code || "") +
        " — " +
        String(a.display_name || "") +
        (a.company_name ? " (" + String(a.company_name) + ")" : "");
      sel.appendChild(opt);
    });
    if (cur && Array.prototype.some.call(sel.options, function (o) {
      return o.value === cur;
    })) {
      sel.value = cur;
    }
  }

  function getSelectedAgent() {
    var sel = $("crm-oos-ref-agent");
    if (!sel || !sel.value) return null;
    var id = sel.value;
    for (var i = 0; i < state.agents.length; i++) {
      if (state.agents[i] && String(state.agents[i].id) === id) return state.agents[i];
    }
    return null;
  }

  function getRefLang() {
    var es = $("crm-oos-ref-lang-es");
    return es && es.classList.contains("active") ? "Spanish" : "English";
  }

  function setRefLang(which) {
    var en = $("crm-oos-ref-lang-en");
    var es = $("crm-oos-ref-lang-es");
    if (en) en.classList.toggle("active", which === "English");
    if (es) es.classList.toggle("active", which === "Spanish");
  }

  async function deleteReferral(id) {
    if (!window.confirm(t("oos_delete_confirm"))) return;
    var stRef = $("crm-oos-ref-foot-status");
    var stArch = $("crm-oos-arch-foot-status");
    try {
      await api("/api/staff/oos-referrals?id=" + encodeURIComponent(id), null, { method: "DELETE" });
      if (String(state.selectedReferralId) === String(id)) state.selectedReferralId = "";
      if (String(state.selectedArchiveId) === String(id)) state.selectedArchiveId = "";
      if (stRef) stRef.textContent = t("oos_deleted");
      if (stArch) stArch.textContent = t("oos_deleted");
      if (state.tab === "referrals") await loadReferralsUi();
      if (state.tab === "archive") await loadArchiveUi();
    } catch (e) {
      var err = e.message || String(e);
      if (stRef) stRef.textContent = err;
      if (stArch) stArch.textContent = err;
    }
  }

  function renderReferralList(filterText) {
    var box = $("crm-oos-ref-list");
    if (!box) return;
    var q = String(filterText || "")
      .trim()
      .toLowerCase();
    box.innerHTML = "";
    state.referrals.forEach(function (r) {
      var name = referralName(r);
      var line = (name + " " + (r.email || "") + " " + (r.state_code || "")).toLowerCase();
      if (q && line.indexOf(q) === -1) return;
      var wrap = document.createElement("div");
      wrap.className = "crm-oos-row-wrap";
      var main = document.createElement("div");
      main.className =
        "crm-oos-list-row" + (String(r.id) === state.selectedReferralId ? " active" : "");
      main.setAttribute("role", "option");
      main.innerHTML =
        '<div class="crm-oos-list-name">' +
        esc(name) +
        '</div><div class="crm-oos-list-meta">' +
        esc(r.state_code || "—") +
        " · " +
        esc(fmtDate(r.created_at)) +
        "</div>";
      main.addEventListener("click", function () {
        state.selectedReferralId = String(r.id);
        renderReferralList($("crm-oos-ref-filter") && $("crm-oos-ref-filter").value);
        showReferralDetail(r);
      });
      var del = document.createElement("button");
      del.type = "button";
      del.className = "crm-oos-row-delete";
      del.setAttribute("aria-label", t("oos_delete"));
      del.title = t("oos_delete");
      del.innerHTML = "&#128465;";
      del.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        void deleteReferral(String(r.id));
      });
      wrap.appendChild(main);
      wrap.appendChild(del);
      box.appendChild(wrap);
    });
  }

  function showReferralDetail(r) {
    var form = $("crm-oos-ref-form");
    var empty = $("crm-oos-ref-empty");
    if (empty) empty.classList.add("hidden");
    if (form) form.classList.remove("hidden");
    $("crm-oos-ref-first").value = r.first_name || "";
    $("crm-oos-ref-last").value = r.last_name || "";
    $("crm-oos-ref-state").value = r.state_code || "";
    $("crm-oos-ref-email").value = r.email || "";
    $("crm-oos-ref-phone").value = r.phone || "";
    $("crm-oos-ref-status-field").value = r.status || "";
    $("crm-oos-ref-form-msg").value = r.message || "";
    var ctx =
      r.referral_context != null && String(r.referral_context).trim()
        ? String(r.referral_context)
        : r.message || "";
    $("crm-oos-ref-context").value = ctx;
    $("crm-oos-ref-ai-email").value = r.ai_connection_email || "";
    fillAgentSelect(r.matched_oos_agent_id || "");
    var hint = $("crm-oos-ref-agent-hint");
    if (hint) {
      var st = oosNormState(r.state_code);
      var matches = state.agents.filter(function (a) {
        return a && a.active !== false && oosNormState(a.state_code) === st;
      });
      if (!st) hint.textContent = t("oos_enter_state");
      else if (!matches.length) hint.textContent = t("oos_no_agent_state", { state: st });
      else hint.textContent = t("oos_agents_in_state", { count: matches.length, state: st });
    }
    var stFoot = $("crm-oos-ref-foot-status");
    if (stFoot) stFoot.textContent = "";
  }

  async function loadReferralsUi() {
    var st = $("crm-oos-ref-foot-status");
    try {
      await fetchAgents();
    } catch (e) {
      if (st) st.textContent = t("oos_agents_load_err", { error: e.message || e });
    }
    try {
      var data = await api("/api/staff/oos-referrals?bucket=open", null, { method: "GET" });
      state.referrals = Array.isArray(data.referrals) ? data.referrals : [];
      if (!state.selectedReferralId && state.referrals.length) {
        state.selectedReferralId = String(state.referrals[0].id);
      }
      renderReferralList($("crm-oos-ref-filter") && $("crm-oos-ref-filter").value);
      var cur = state.referrals.filter(function (x) {
        return String(x.id) === state.selectedReferralId;
      })[0];
      if (cur) showReferralDetail(cur);
      else {
        state.selectedReferralId = "";
        if ($("crm-oos-ref-form")) $("crm-oos-ref-form").classList.add("hidden");
        if ($("crm-oos-ref-empty")) $("crm-oos-ref-empty").classList.remove("hidden");
      }
    } catch (e) {
      if (st) st.textContent = t("oos_ref_load_err", { error: e.message || e });
    }
  }

  function renderArchiveList(filterText) {
    var box = $("crm-oos-arch-list");
    if (!box) return;
    var q = String(filterText || "")
      .trim()
      .toLowerCase();
    box.innerHTML = "";
    state.archive.forEach(function (r) {
      var name = referralName(r);
      var line = (name + " " + (r.email || "") + " " + (r.state_code || "")).toLowerCase();
      if (q && line.indexOf(q) === -1) return;
      var wrap = document.createElement("div");
      wrap.className = "crm-oos-row-wrap";
      var main = document.createElement("div");
      main.className =
        "crm-oos-list-row" + (String(r.id) === state.selectedArchiveId ? " active" : "");
      main.innerHTML =
        '<div class="crm-oos-list-name">' +
        esc(name) +
        '</div><div class="crm-oos-list-meta">' +
        esc(r.state_code || "—") +
        " · " +
        esc(fmtDate(r.created_at)) +
        "</div>";
      main.addEventListener("click", function () {
        state.selectedArchiveId = String(r.id);
        renderArchiveList($("crm-oos-arch-filter") && $("crm-oos-arch-filter").value);
        showArchiveDetail(r);
      });
      var del = document.createElement("button");
      del.type = "button";
      del.className = "crm-oos-row-delete";
      del.setAttribute("aria-label", t("oos_delete"));
      del.title = t("oos_delete");
      del.innerHTML = "&#128465;";
      del.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        void deleteReferral(String(r.id));
      });
      wrap.appendChild(main);
      wrap.appendChild(del);
      box.appendChild(wrap);
    });
  }

  function showArchiveDetail(r) {
    var form = $("crm-oos-arch-form");
    var empty = $("crm-oos-arch-empty");
    if (empty) empty.classList.add("hidden");
    if (form) form.classList.remove("hidden");
    $("crm-oos-arch-name").value = referralName(r);
    $("crm-oos-arch-state").value = r.state_code || "";
    $("crm-oos-arch-email").value = r.email || "";
    $("crm-oos-arch-phone").value = r.phone || "";
    $("crm-oos-arch-status-ro").value = r.status || "";
    var ctx =
      r.referral_context != null && String(r.referral_context).trim()
        ? String(r.referral_context)
        : r.message || "";
    $("crm-oos-arch-context").value = ctx;
    $("crm-oos-arch-status-field").value = r.status || "";
    $("crm-oos-arch-comp-notes").value =
      r.compensation_notes != null ? String(r.compensation_notes) : "";
    var cat = $("crm-oos-arch-comp-at");
    if (cat) {
      if (r.compensated_at) {
        try {
          var d = new Date(r.compensated_at);
          cat.value = !isNaN(d.getTime()) ? d.toISOString().slice(0, 16) : "";
        } catch (e) {
          cat.value = "";
        }
      } else cat.value = "";
    }
    var stFoot = $("crm-oos-arch-foot-status");
    if (stFoot) stFoot.textContent = "";
  }

  async function loadArchiveUi() {
    var st = $("crm-oos-arch-foot-status");
    try {
      var data = await api("/api/staff/oos-referrals?bucket=completed", null, { method: "GET" });
      state.archive = Array.isArray(data.referrals) ? data.referrals : [];
      var preserve =
        state.selectedArchiveId &&
        state.archive.some(function (x) {
          return String(x.id) === String(state.selectedArchiveId);
        });
      if (!preserve) {
        state.selectedArchiveId = state.archive.length ? String(state.archive[0].id) : "";
      }
      renderArchiveList($("crm-oos-arch-filter") && $("crm-oos-arch-filter").value);
      var cur = state.archive.filter(function (x) {
        return String(x.id) === state.selectedArchiveId;
      })[0];
      if (cur) showArchiveDetail(cur);
      else {
        state.selectedArchiveId = "";
        if ($("crm-oos-arch-form")) $("crm-oos-arch-form").classList.add("hidden");
        if ($("crm-oos-arch-empty")) $("crm-oos-arch-empty").classList.remove("hidden");
      }
    } catch (e) {
      if (st) st.textContent = t("oos_arch_load_err", { error: e.message || e });
    }
  }

  function renderAgentList(filterText) {
    var box = $("crm-oos-ag-list");
    if (!box) return;
    var q = String(filterText || "")
      .trim()
      .toLowerCase();
    box.innerHTML = "";
    state.agents.forEach(function (a) {
      var line = (
        String(a.display_name || "") +
        " " +
        String(a.state_code || "") +
        " " +
        String(a.email || "") +
        " " +
        String(a.company_name || "")
      ).toLowerCase();
      if (q && line.indexOf(q) === -1) return;
      var row = document.createElement("div");
      row.className = "crm-oos-list-row";
      row.innerHTML =
        '<div class="crm-oos-list-name">' +
        esc(a.display_name || "") +
        (a.active === false ? ' <span class="crm-oos-list-meta">(' + esc(t("oos_inactive")) + ")</span>" : "") +
        '</div><div class="crm-oos-list-meta">' +
        esc(a.state_code || "") +
        " · " +
        esc(a.email || "") +
        "</div>";
      row.addEventListener("click", function () {
        $("crm-oos-ag-id").value = a.id || "";
        $("crm-oos-ag-state").value = a.state_code || "";
        $("crm-oos-ag-name").value = a.display_name || "";
        $("crm-oos-ag-company").value = a.company_name || "";
        $("crm-oos-ag-email").value = a.email || "";
        $("crm-oos-ag-phone").value = a.phone || "";
        $("crm-oos-ag-address").value = a.business_address || "";
        $("crm-oos-ag-notes").value = a.notes || "";
        $("crm-oos-ag-active").value = a.active === false ? "false" : "true";
        var sf = $("crm-oos-ag-status");
        if (sf) sf.textContent = "";
      });
      box.appendChild(row);
    });
  }

  async function loadAgentsUi() {
    var sf = $("crm-oos-ag-status");
    try {
      await fetchAgents();
      renderAgentList($("crm-oos-ag-filter") && $("crm-oos-ag-filter").value);
      if (sf) sf.textContent = t("oos_agents_loaded", { count: state.agents.length });
    } catch (e) {
      if (sf) sf.textContent = t("oos_agents_load_err", { error: e.message || e });
    }
  }

  function referralPatchBody(statusOverride) {
    var sel = $("crm-oos-ref-agent");
    var matchId = sel && sel.value ? sel.value : null;
    return {
      first_name: $("crm-oos-ref-first").value,
      last_name: $("crm-oos-ref-last").value,
      email: $("crm-oos-ref-email").value,
      phone: $("crm-oos-ref-phone").value,
      state_code: $("crm-oos-ref-state").value,
      status:
        statusOverride != null
          ? statusOverride
          : String($("crm-oos-ref-status-field").value || "").trim(),
      referral_context: $("crm-oos-ref-context").value,
      ai_connection_email: $("crm-oos-ref-ai-email").value,
      matched_oos_agent_id: matchId,
    };
  }

  function wireHandlers(root) {
    root.querySelectorAll("[data-oos-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        navigateTab(btn.getAttribute("data-oos-tab") || "referrals");
      });
    });

    var refFilter = $("crm-oos-ref-filter", root);
    if (refFilter) {
      refFilter.addEventListener("input", function () {
        renderReferralList(refFilter.value);
      });
    }
    var archFilter = $("crm-oos-arch-filter", root);
    if (archFilter) {
      archFilter.addEventListener("input", function () {
        renderArchiveList(archFilter.value);
      });
    }
    var agFilter = $("crm-oos-ag-filter", root);
    if (agFilter) {
      agFilter.addEventListener("input", function () {
        renderAgentList(agFilter.value);
      });
    }

    var refRefresh = $("crm-oos-ref-refresh", root);
    if (refRefresh) refRefresh.addEventListener("click", function () {
      void loadReferralsUi();
    });
    var archRefresh = $("crm-oos-arch-refresh", root);
    if (archRefresh) archRefresh.addEventListener("click", function () {
      void loadArchiveUi();
    });
    var agRefresh = $("crm-oos-ag-refresh", root);
    if (agRefresh) agRefresh.addEventListener("click", function () {
      void loadAgentsUi();
    });

    var langEn = $("crm-oos-ref-lang-en", root);
    var langEs = $("crm-oos-ref-lang-es", root);
    if (langEn) langEn.addEventListener("click", function () {
      setRefLang("English");
    });
    if (langEs) langEs.addEventListener("click", function () {
      setRefLang("Spanish");
    });

    var matchBtn = $("crm-oos-ref-match", root);
    if (matchBtn) {
      matchBtn.addEventListener("click", function () {
        var st = $("crm-oos-ref-foot-status");
        var code = oosNormState($("crm-oos-ref-state").value);
        if (!code) {
          if (st) st.textContent = t("oos_set_state_first");
          return;
        }
        var pick = state.agents.filter(function (a) {
          return a && a.active !== false && oosNormState(a.state_code) === code;
        })[0];
        var sel = $("crm-oos-ref-agent");
        if (pick && sel) {
          sel.value = pick.id;
          if (st) st.textContent = t("oos_matched", { name: pick.display_name || "", state: code });
        } else if (st) st.textContent = t("oos_no_agent_state", { state: code });
      });
    }

    var genBtn = $("crm-oos-ref-generate", root);
    if (genBtn) {
      genBtn.addEventListener("click", async function () {
        var st = $("crm-oos-ref-foot-status");
        var ag = getSelectedAgent();
        if (!ag) {
          if (st) st.textContent = t("oos_select_agent_first");
          return;
        }
        var referralContext = String($("crm-oos-ref-context").value || "").trim();
        if (referralContext.length < 8) {
          if (st) st.textContent = t("oos_summary_short");
          return;
        }
        if (st) st.textContent = t("oos_generating");
        try {
          var data = await api("/api/staff/oos-intro-email", {
            leadFirstName: $("crm-oos-ref-first").value,
            leadLastName: $("crm-oos-ref-last").value,
            leadEmail: $("crm-oos-ref-email").value,
            leadPhone: $("crm-oos-ref-phone").value,
            leadState: $("crm-oos-ref-state").value,
            agentDisplayName: ag.display_name,
            agentCompany: ag.company_name,
            agentEmail: ag.email,
            referralContext: referralContext,
            language: getRefLang(),
          });
          $("crm-oos-ref-ai-email").value = data.email || "";
          if (st) st.textContent = t("oos_draft_ready");
        } catch (e) {
          if (st) st.textContent = e.message || String(e);
        }
      });
    }

    var saveBtn = $("crm-oos-ref-save", root);
    if (saveBtn) {
      saveBtn.addEventListener("click", async function () {
        var st = $("crm-oos-ref-foot-status");
        if (!state.selectedReferralId) {
          if (st) st.textContent = t("oos_select_referral_first");
          return;
        }
        try {
          await api(
            "/api/staff/oos-referrals?id=" + encodeURIComponent(state.selectedReferralId),
            referralPatchBody(),
            { method: "PATCH" }
          );
          if (st) st.textContent = t("oos_saved");
          await loadReferralsUi();
        } catch (e) {
          if (st) st.textContent = e.message || String(e);
        }
      });
    }

    var archiveBtn = $("crm-oos-ref-archive", root);
    if (archiveBtn) {
      archiveBtn.addEventListener("click", async function () {
        var st = $("crm-oos-ref-foot-status");
        if (!state.selectedReferralId) {
          if (st) st.textContent = t("oos_select_referral_first");
          return;
        }
        try {
          await api(
            "/api/staff/oos-referrals?id=" + encodeURIComponent(state.selectedReferralId),
            referralPatchBody("completed"),
            { method: "PATCH" }
          );
          state.selectedArchiveId = String(state.selectedReferralId);
          state.selectedReferralId = "";
          if (st) st.textContent = t("oos_moved_archive");
          navigateTab("archive");
        } catch (e) {
          if (st) st.textContent = e.message || String(e);
        }
      });
    }

    var sendBtn = $("crm-oos-ref-send", root);
    if (sendBtn) {
      sendBtn.addEventListener("click", async function () {
        var st = $("crm-oos-ref-foot-status");
        var ag = getSelectedAgent();
        var leadEmail = String($("crm-oos-ref-email").value || "").trim();
        var draft = String($("crm-oos-ref-ai-email").value || "").trim();
        if (!ag || !ag.email) {
          if (st) st.textContent = t("oos_agent_email_required");
          return;
        }
        if (!leadEmail) {
          if (st) st.textContent = t("oos_lead_email_required");
          return;
        }
        if (!draft) {
          if (st) st.textContent = t("oos_draft_required");
          return;
        }
        if (!state.selectedReferralId) {
          if (st) st.textContent = t("oos_select_referral_first");
          return;
        }
        var leadName =
          [$("crm-oos-ref-first").value, $("crm-oos-ref-last").value].filter(Boolean).join(" ").trim() ||
          "referral";
        var subj =
          "Introduction: " +
          leadName +
          " — " +
          (oosNormState($("crm-oos-ref-state").value) || "OOS") +
          " referral";
        if (st) st.textContent = t("oos_sending");
        try {
          var sendRes = await api("/api/staff/send-email", {
            compose: true,
            toEmail: ag.email,
            ccEmail: leadEmail,
            replyDraft: draft,
            language: getRefLang(),
            customerIssue: subj,
            subject: subj,
          });
          if (!sendRes.success) {
            if (st) st.textContent = sendRes.error || t("oos_send_failed");
            return;
          }
          if (st) st.textContent = t("oos_sent", { agent: ag.email, lead: leadEmail });
          try {
            await api(
              "/api/staff/oos-referrals?id=" + encodeURIComponent(state.selectedReferralId),
              {
                status: "intro_sent",
                ai_connection_email: draft,
                matched_oos_agent_id: ag.id,
              },
              { method: "PATCH" }
            );
          } catch (_) {}
          await loadReferralsUi();
        } catch (e) {
          if (st) st.textContent = e.message || String(e);
        }
      });
    }

    var archSave = $("crm-oos-arch-save", root);
    if (archSave) {
      archSave.addEventListener("click", async function () {
        var st = $("crm-oos-arch-foot-status");
        if (!state.selectedArchiveId) {
          if (st) st.textContent = t("oos_select_archived_first");
          return;
        }
        var catEl = $("crm-oos-arch-comp-at");
        try {
          await api(
            "/api/staff/oos-referrals?id=" + encodeURIComponent(state.selectedArchiveId),
            {
              status: String($("crm-oos-arch-status-field").value || "").trim(),
              compensation_notes: $("crm-oos-arch-comp-notes").value,
              compensated_at: catEl && catEl.value ? catEl.value : null,
            },
            { method: "PATCH" }
          );
          if (st) st.textContent = t("oos_saved");
          await loadArchiveUi();
        } catch (e) {
          if (st) st.textContent = e.message || String(e);
        }
      });
    }

    var agNew = $("crm-oos-ag-new", root);
    if (agNew) {
      agNew.addEventListener("click", function () {
        $("crm-oos-ag-id").value = "";
        $("crm-oos-ag-state").value = "";
        $("crm-oos-ag-name").value = "";
        $("crm-oos-ag-company").value = "";
        $("crm-oos-ag-email").value = "";
        $("crm-oos-ag-phone").value = "";
        $("crm-oos-ag-address").value = "";
        $("crm-oos-ag-notes").value = "";
        $("crm-oos-ag-active").value = "true";
        $("crm-oos-ag-status").textContent = t("oos_new_agent_hint");
      });
    }

    var agSave = $("crm-oos-ag-save", root);
    if (agSave) {
      agSave.addEventListener("click", async function () {
        var sf = $("crm-oos-ag-status");
        var id = String($("crm-oos-ag-id").value || "").trim();
        var body = {
          state_code: $("crm-oos-ag-state").value,
          display_name: $("crm-oos-ag-name").value,
          company_name: $("crm-oos-ag-company").value,
          email: $("crm-oos-ag-email").value,
          phone: $("crm-oos-ag-phone").value,
          business_address: $("crm-oos-ag-address").value,
          notes: $("crm-oos-ag-notes").value,
          active: $("crm-oos-ag-active").value === "true",
        };
        try {
          if (id) {
            await api("/api/staff/oos-agents?id=" + encodeURIComponent(id), body, { method: "PATCH" });
            if (sf) sf.textContent = t("oos_saved");
          } else {
            var cr = await api("/api/staff/oos-agents", body, { method: "POST" });
            if (cr.agent && cr.agent.id) $("crm-oos-ag-id").value = cr.agent.id;
            if (sf) sf.textContent = t("oos_created");
          }
          await loadAgentsUi();
          if (state.tab === "referrals") fillAgentSelect($("crm-oos-ref-agent") && $("crm-oos-ref-agent").value);
        } catch (e) {
          if (sf) sf.textContent = e.message || String(e);
        }
      });
    }
  }

  async function mount(main, opts) {
    if (!main) return;
    state.tab = (opts && opts.tab) || "referrals";
    if (state.tab !== "referrals" && state.tab !== "agents" && state.tab !== "archive") {
      state.tab = "referrals";
    }
    main.innerHTML = renderShell(state.tab);
    showTabPanels(state.tab);
    wireHandlers(main);
    if (state.tab === "agents") await loadAgentsUi();
    else if (state.tab === "archive") await loadArchiveUi();
    else await loadReferralsUi();
  }

  window.StaffCrmOos = { mount: mount };
})();
