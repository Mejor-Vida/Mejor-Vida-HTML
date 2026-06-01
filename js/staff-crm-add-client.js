/**
 * CRM Add New Client — IC-style full-page contact form.
 */
(function () {
  "use strict";

  var PREFIX_VALUES = ["", "mr", "mrs", "ms", "miss", "dr"];
  var SUFFIX_VALUES = ["", "jr", "sr", "ii", "iii", "iv"];
  var MARITAL_VALUES = ["unknown", "single", "married", "divorced", "widowed", "separated"];

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function api(path, body, opts) {
    var shell = window.StaffCrm;
    if (!shell || !shell.authedApi) throw new Error("StaffCrm not ready");
    return shell.authedApi(path, body, opts);
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s);
  }

  function $(id, root) {
    return (root || document).querySelector("#" + id);
  }

  function calcAgeFromDob(dob) {
    if (window.StaffCrm && window.StaffCrm.calcAge) return window.StaffCrm.calcAge(dob);
    if (!dob) return null;
    var d = new Date(dob);
    if (isNaN(d.getTime())) return null;
    var now = new Date();
    var a = now.getFullYear() - d.getFullYear();
    var m = now.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < d.getDate())) a--;
    return a;
  }

  function buildSelect(id, labelKey, values, required) {
    var opts = values
      .map(function (v) {
        var lk = labelKey + (v ? "_" + v : "_none");
        return '<option value="' + esc(v) + '">' + esc(t(lk)) + "</option>";
      })
      .join("");
    return (
      '<div class="crm-add-field"><label for="' +
      id +
      '">' +
      esc(t(labelKey + "_label")) +
      (required ? ' <span class="req">*</span>' : "") +
      '</label><select id="' +
      id +
      '">' +
      opts +
      "</select></div>"
    );
  }

  function buildStateSelect() {
    var states = window.MVS_US_STATES || [];
    var opts =
      '<option value="">' +
      esc(t("add_state_select")) +
      "</option>" +
      states
        .map(function (s) {
          return '<option value="' + esc(s.c) + '">' + esc(s.n) + "</option>";
        })
        .join("");
    return (
      '<div class="crm-add-field"><label for="crm-add-state">' +
      esc(t("add_state")) +
      '</label><select id="crm-add-state">' +
      opts +
      "</select></div>"
    );
  }

  function pageHtml() {
    return (
      '<div class="crm-add-page">' +
      '<div class="crm-add-topbar">' +
      '<div class="crm-add-topbar-left">' +
      '<button type="button" id="crm-add-back" class="crm-add-back" aria-label="' +
      esc(t("back")) +
      '">← ' +
      esc(t("back")) +
      "</button>" +
      "<h1 class=\"crm-add-title\">" +
      esc(t("add_client_title")) +
      "</h1></div>" +
      '<div class="crm-add-topbar-actions">' +
      '<button type="button" id="crm-add-cancel" class="crm-btn secondary">' +
      esc(t("conn_no")) +
      "</button>" +
      '<button type="button" id="crm-add-save" class="crm-btn" disabled>' +
      esc(t("add_client_save")) +
      "</button></div></div>" +
      '<form id="crm-add-form" autocomplete="off" onsubmit="return false;">' +
      '<section class="crm-add-card">' +
      '<h2 class="crm-add-section-title">' +
      esc(t("add_section_contact")) +
      "</h2>" +
      '<div class="crm-add-grid">' +
      field("crm-add-first", t("conn_first_name"), "text", true) +
      field("crm-add-middle", t("add_middle_initial"), "text", false, { maxLength: 4 }) +
      field("crm-add-last", t("conn_last_name"), "text", true) +
      buildSelect("crm-add-prefix", "add_prefix", PREFIX_VALUES, false) +
      buildSelect("crm-add-suffix", "add_suffix", SUFFIX_VALUES, false) +
      buildSelect("crm-add-marital", "add_marital", MARITAL_VALUES, false) +
      field("crm-add-dob", t("birthdate"), "date", false) +
      field("crm-add-age", t("med_age"), "number", false, { ro: true, min: 0, max: 130 }) +
      field("crm-add-email", t("conn_email"), "email", true, { placeholder: t("add_email_ph") }) +
      field("crm-add-phone", t("conn_phone"), "tel", false, { placeholder: "(###) ###-####" }) +
      '<div class="crm-add-field crm-add-field--full"><label>' +
      esc(t("add_primary_contact")) +
      ' <span class="req">*</span></label>' +
      '<div class="crm-add-segment" role="group" aria-label="' +
      esc(t("add_primary_contact")) +
      '">' +
      '<button type="button" id="crm-add-contact-email" class="crm-add-contact-opt">' +
      esc(t("conn_email")) +
      "</button>" +
      '<button type="button" id="crm-add-contact-phone" class="crm-add-contact-opt">' +
      esc(t("conn_phone")) +
      "</button></div></div>" +
      "</div></section>" +
      '<section class="crm-add-card">' +
      '<h2 class="crm-add-section-title">' +
      esc(t("add_section_address")) +
      "</h2>" +
      '<div class="crm-add-grid">' +
      field("crm-add-addr1", t("add_addr1"), "text", false, { full: true }) +
      field("crm-add-addr2", t("add_addr2"), "text", false, { full: true, placeholder: t("add_addr2_ph") }) +
      "</div>" +
      '<div class="crm-add-grid crm-add-grid-4" style="margin-top:16px">' +
      field("crm-add-city", t("add_city"), "text", false) +
      field("crm-add-zip", t("add_zip"), "text", false, { inputMode: "numeric" }) +
      buildStateSelect() +
      field("crm-add-county", t("add_county"), "text", false, { placeholder: t("add_county_ph") }) +
      "</div></section>" +
      '<p id="crm-add-status" class="crm-add-status" aria-live="polite"></p>' +
      "</form></div>"
    );
  }

  function field(id, label, type, required, opts) {
    opts = opts || {};
    var cls = "crm-add-field" + (opts.full ? " crm-add-field--full" : "");
    var attrs = 'id="' + id + '" type="' + type + '" autocomplete="off"';
    if (opts.ro) attrs += ' readonly class="crm-add-ro" tabindex="-1"';
    if (opts.placeholder) attrs += ' placeholder="' + esc(opts.placeholder) + '"';
    if (opts.min != null) attrs += ' min="' + opts.min + '"';
    if (opts.max != null) attrs += ' max="' + opts.max + '"';
    if (opts.maxLength) attrs += ' maxlength="' + opts.maxLength + '"';
    if (opts.inputMode) attrs += ' inputmode="' + opts.inputMode + '"';
    if (required && type === "email") attrs += " required";
    return (
      '<div class="' +
      cls +
      '"><label for="' +
      id +
      '">' +
      esc(label) +
      (required ? ' <span class="req">*</span>' : "") +
      "</label><input " +
      attrs +
      " /></div>"
    );
  }

  function readForm(root) {
    return {
      first: String(($("crm-add-first", root) && $("crm-add-first", root).value) || "").trim(),
      middle: String(($("crm-add-middle", root) && $("crm-add-middle", root).value) || "").trim(),
      last: String(($("crm-add-last", root) && $("crm-add-last", root).value) || "").trim(),
      prefix: String(($("crm-add-prefix", root) && $("crm-add-prefix", root).value) || "").trim(),
      suffix: String(($("crm-add-suffix", root) && $("crm-add-suffix", root).value) || "").trim(),
      marital: String(($("crm-add-marital", root) && $("crm-add-marital", root).value) || "").trim(),
      dob: String(($("crm-add-dob", root) && $("crm-add-dob", root).value) || "").trim(),
      email: String(($("crm-add-email", root) && $("crm-add-email", root).value) || "")
        .trim()
        .toLowerCase(),
      phone: String(($("crm-add-phone", root) && $("crm-add-phone", root).value) || "").trim(),
      addr1: String(($("crm-add-addr1", root) && $("crm-add-addr1", root).value) || "").trim(),
      addr2: String(($("crm-add-addr2", root) && $("crm-add-addr2", root).value) || "").trim(),
      city: String(($("crm-add-city", root) && $("crm-add-city", root).value) || "").trim(),
      zip: String(($("crm-add-zip", root) && $("crm-add-zip", root).value) || "").trim(),
      state: String(($("crm-add-state", root) && $("crm-add-state", root).value) || "").trim(),
      county: String(($("crm-add-county", root) && $("crm-add-county", root).value) || "").trim(),
    };
  }

  function render(main) {
    main.innerHTML = pageHtml();

    var primaryContact = "";

    function goBack() {
      if (window.StaffCrm && window.StaffCrm.navigate) window.StaffCrm.navigate("#/clients");
      else location.hash = "#/clients";
    }

    function setStatus(msg, isError) {
      var el = $("crm-add-status", main);
      if (!el) return;
      el.textContent = msg || "";
      el.classList.toggle("is-error", !!isError);
    }

    function setPrimaryContact(method) {
      primaryContact = method === "phone" ? "phone" : method === "email" ? "email" : "";
      var emailBtn = $("crm-add-contact-email", main);
      var phoneBtn = $("crm-add-contact-phone", main);
      if (emailBtn) emailBtn.classList.toggle("active", primaryContact === "email");
      if (phoneBtn) phoneBtn.classList.toggle("active", primaryContact === "phone");
      updateSaveButton();
    }

    function syncAgeFromDob() {
      var dobEl = $("crm-add-dob", main);
      var ageEl = $("crm-add-age", main);
      if (!dobEl || !ageEl) return;
      var dob = String(dobEl.value || "").trim();
      if (!dob) {
        ageEl.value = "";
        return;
      }
      var age = calcAgeFromDob(dob);
      if (age != null && age >= 0 && age <= 130) ageEl.value = String(age);
    }

    function isFormValid() {
      var f = readForm(main);
      if (!f.first || !f.last) return false;
      if (!f.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return false;
      if (!primaryContact) return false;
      if (primaryContact === "phone" && !f.phone) return false;
      return true;
    }

    function updateSaveButton() {
      var btn = $("crm-add-save", main);
      if (btn) btn.disabled = !isFormValid();
    }

    async function onSave() {
      if (!isFormValid()) {
        setStatus(t("add_client_invalid"), true);
        return;
      }
      var f = readForm(main);
      var saveBtn = $("crm-add-save", main);
      if (saveBtn) saveBtn.disabled = true;
      setStatus(t("add_client_creating"));
      try {
        var name = (f.first + " " + f.last).trim();
        if (f.middle) name = (f.first + " " + f.middle + " " + f.last).replace(/\s+/g, " ").trim();
        var created = await api("/api/staff/leads", {
          name: name,
          email: f.email,
          phone: f.phone || null,
          language: "English",
        });
        var item = created && created.item;
        if (!item || !item.id) throw new Error("no item");

        var ageOut = null;
        if (f.dob) {
          var n = calcAgeFromDob(f.dob);
          if (n != null && n >= 0 && n <= 130) ageOut = n;
        }

        await api(
          "/api/staff/leads",
          {
            id: item.id,
            first_name: f.first || null,
            last_name: f.last || null,
            email: f.email || null,
            phone: f.phone || null,
            age: ageOut,
            profile_ext: {
              middle_initial: f.middle || null,
              prefix: f.prefix || null,
              suffix: f.suffix || null,
              marital_status: f.marital || null,
              date_of_birth: f.dob || null,
              primary_contact_method: primaryContact || null,
              address_line_1: f.addr1 || null,
              address_line_2: f.addr2 || null,
              city: f.city || null,
              zip: f.zip || null,
              state: f.state || null,
              county: f.county || null,
            },
          },
          { method: "PATCH" }
        );

        if (window.StaffCrm && window.StaffCrm.refreshLeads) {
          await window.StaffCrm.refreshLeads();
        }
        if (window.StaffCrm && window.StaffCrm.navigate) {
          window.StaffCrm.navigate("#/clients/" + encodeURIComponent(item.id) + "/overview");
        } else {
          location.hash = "#/clients/" + encodeURIComponent(item.id) + "/overview";
        }
      } catch (e) {
        setStatus((e && e.message) || t("add_client_failed"), true);
        updateSaveButton();
      }
    }

    $("crm-add-back", main).addEventListener("click", goBack);
    $("crm-add-cancel", main).addEventListener("click", goBack);
    $("crm-add-save", main).addEventListener("click", function () {
      void onSave();
    });
    $("crm-add-contact-email", main).addEventListener("click", function () {
      setPrimaryContact("email");
    });
    $("crm-add-contact-phone", main).addEventListener("click", function () {
      setPrimaryContact("phone");
    });
    var dobEl = $("crm-add-dob", main);
    if (dobEl) {
      var onDob = function () {
        syncAgeFromDob();
        updateSaveButton();
      };
      dobEl.addEventListener("change", onDob);
      dobEl.addEventListener("input", onDob);
    }
    var form = $("crm-add-form", main);
    if (form) {
      form.addEventListener("input", updateSaveButton);
      form.addEventListener("change", updateSaveButton);
    }
    var marital = $("crm-add-marital", main);
    if (marital) marital.value = "unknown";
  }

  window.StaffCrmAddClient = { render: render };
})();
