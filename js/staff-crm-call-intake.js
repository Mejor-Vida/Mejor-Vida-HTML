/**
 * CRM Call intake — review dropped call transcripts and apply fields to a client.
 */
(function () {
  "use strict";

  var items = [];
  var selectedId = "";
  var detail = null;

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

  function fmtWhen(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch (e) {
      return String(iso);
    }
  }

  function selectedItem() {
    return items.find(function (it) {
      return it.id === selectedId;
    }) || detail;
  }

  async function loadItems() {
    var data = await api("/api/staff/call-intake", null, { method: "GET" });
    items = Array.isArray(data.items) ? data.items : [];
  }

  async function loadDetail(id) {
    var data = await api("/api/staff/call-intake?id=" + encodeURIComponent(id), null, { method: "GET" });
    detail = data.item || null;
    return detail;
  }

  function fieldList(extracted) {
    var labels = [
      ["first_name", t("call_field_first")],
      ["last_name", t("call_field_last")],
      ["phone", t("call_field_phone")],
      ["email", t("call_field_email")],
      ["language", t("call_field_language")],
      ["age", t("call_field_age")],
      ["sex", t("call_field_sex")],
      ["tobacco", t("call_field_tobacco")],
      ["date_of_birth", t("call_field_dob")],
      ["state", t("call_field_state")],
      ["height", t("call_field_height")],
      ["weight", t("call_field_weight")],
      ["living_situation", t("call_field_living")],
      ["citizenship_status", t("call_field_citizenship")],
      ["coverage_amount", t("call_field_coverage")],
    ];
    var rows = labels
      .map(function (pair) {
        var val = extracted[pair[0]];
        if (val == null || val === "") return "";
        var shown = val === true ? t("call_yes") : val === false ? t("call_no") : val;
        return (
          "<tr><th>" +
          esc(pair[1]) +
          "</th><td>" +
          esc(shown) +
          "</td></tr>"
        );
      })
      .join("");
    return rows
      ? '<table class="crm-call-fields">' + rows + "</table>"
      : "<p>" + esc(t("call_no_fields")) + "</p>";
  }

  function paint(main) {
    var sel = selectedItem();
    var list = items
      .map(function (it) {
        var cls = it.id === selectedId ? "crm-call-row is-selected" : "crm-call-row";
        return (
          '<button type="button" class="' +
          cls +
          '" data-id="' +
          esc(it.id) +
          '"><strong>' +
          esc(it.match_label || it.hint_phone || t("call_untitled")) +
          "</strong><span>" +
          esc(it.status) +
          " · " +
          esc(fmtWhen(it.created_at)) +
          "</span></button>"
        );
      })
      .join("");

    var detailHtml = "<p>" + esc(t("call_pick_one")) + "</p>";
    if (sel && sel.extracted) {
      var extracted = sel.extracted || {};
      var actions = "";
      if (sel.status === "ready" || sel.status === "error") {
        actions =
          '<div class="crm-call-actions"><button type="button" class="crm-btn" id="crm-call-apply">' +
          esc(t("call_apply")) +
          '</button><button type="button" class="crm-btn secondary" id="crm-call-discard">' +
          esc(t("call_discard")) +
          "</button></div>";
      } else if (sel.status === "applied" && sel.matched_lead_id) {
        actions =
          '<p><a class="crm-btn" href="#/clients/' +
          encodeURIComponent(sel.matched_lead_id) +
          '/overview">' +
          esc(t("call_open_client")) +
          "</a></p>";
      }
      detailHtml =
        "<h2>" +
        esc(sel.match_label || t("call_untitled")) +
        "</h2>" +
        (sel.error_text ? '<p class="crm-err">' + esc(sel.error_text) + "</p>" : "") +
        fieldList(extracted) +
        (extracted.summary ? "<h3>" + esc(t("call_summary")) + "</h3><p>" + esc(extracted.summary) + "</p>" : "") +
        (sel.transcript_text
          ? "<h3>" +
            esc(t("call_transcript")) +
            '</h3><pre class="crm-call-transcript">' +
            esc(sel.transcript_text) +
            "</pre>"
          : "") +
        actions;
    }

    main.innerHTML =
      '<div class="crm-call-shell">' +
      "<h1 class=\"crm-call-title\">" +
      esc(t("call_title")) +
      "</h1>" +
      '<p class="crm-call-sub">' +
      esc(t("call_sub")) +
      ' <a href="/staff/call-drop.html">' +
      esc(t("call_open_drop")) +
      "</a></p>" +
      '<div class="crm-call-layout"><div class="crm-call-list">' +
      (list || "<p>" + esc(t("call_empty")) + "</p>") +
      '</div><div class="crm-call-detail">' +
      detailHtml +
      "</div></div></div>";

    main.querySelectorAll(".crm-call-row").forEach(function (btn) {
      btn.addEventListener("click", async function () {
        selectedId = btn.getAttribute("data-id");
        try {
          await loadDetail(selectedId);
          paint(main);
        } catch (e) {
          window.alert(e.message || t("load_error"));
        }
      });
    });
    var applyBtn = document.getElementById("crm-call-apply");
    if (applyBtn) {
      applyBtn.addEventListener("click", async function () {
        applyBtn.disabled = true;
        try {
          var data = await api("/api/staff/call-intake", { action: "apply", id: selectedId });
          detail = data.item;
          await loadItems();
          paint(main);
        } catch (e) {
          applyBtn.disabled = false;
          window.alert(e.message || t("load_error"));
        }
      });
    }
    var discardBtn = document.getElementById("crm-call-discard");
    if (discardBtn) {
      discardBtn.addEventListener("click", async function () {
        try {
          await api("/api/staff/call-intake", { action: "discard", id: selectedId });
          detail = null;
          selectedId = "";
          await loadItems();
          paint(main);
        } catch (e) {
          window.alert(e.message || t("load_error"));
        }
      });
    }
  }

  async function mount(main) {
    main.innerHTML = "<p>" + esc(t("call_loading")) + "</p>";
    try {
      await loadItems();
      if (selectedId) await loadDetail(selectedId);
      paint(main);
    } catch (e) {
      main.innerHTML =
        '<div class="crm-placeholder"><strong>' +
        esc(t("load_error")) +
        "</strong><p>" +
        esc((e && e.message) || "") +
        "</p></div>";
    }
  }

  window.StaffCrmCallIntake = { mount: mount };
})();
