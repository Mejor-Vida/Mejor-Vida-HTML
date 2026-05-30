/**
 * CRM Medical Profile tab — IC-style view/edit + search modals (staff APIs).
 */
(function () {
  "use strict";

  var FREQUENCY_VALUES = ["per month", "per two months", "per three months", "per six months", "per year"];
  var FREQUENCY_KEYS = [
    "freq_per_month",
    "freq_per_two_months",
    "freq_per_three_months",
    "freq_per_six_months",
    "freq_per_year",
  ];
  var DISTANCES = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];

  var mountState = null;

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function api(path) {
    var shell = window.StaffCrm;
    if (!shell || !shell.authedApi) throw new Error("StaffCrm not ready");
    return shell.authedApi(path, null, { method: "GET" });
  }

  function apiPut(path, body) {
    var shell = window.StaffCrm;
    return shell.authedApi(path, body, { method: "PUT" });
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s);
  }

  function $(id, root) {
    return (root || document).querySelector("#" + id);
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var args = arguments;
      clearTimeout(t);
      t = setTimeout(function () {
        fn.apply(null, args);
      }, ms);
    };
  }

  function calcAge(dob) {
    if (!dob) return "—";
    var d = new Date(dob);
    if (isNaN(d.getTime())) return "—";
    var t = new Date();
    var a = t.getFullYear() - d.getFullYear();
    var m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) a--;
    return String(a);
  }

  function formatHeight(ft, inch) {
    if (ft == null && inch == null) return "—";
    return String(ft != null ? ft : "—") + "' " + String(inch != null ? inch : "—") + '"';
  }

  function formatFoundCount(count, singularKey, pluralKey) {
    var tpl = count === 1 ? t(singularKey) : t(pluralKey);
    return tpl.replace("{count}", String(count));
  }

  function formatTitleCase(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/\b([a-z0-9]+)/g, function (_m, word) {
        return word.charAt(0).toUpperCase() + word.slice(1);
      });
  }

  function formatPharmacyName(name) {
    var s = String(name || "").trim();
    if (!s) return "Pharmacy";
    s = s.replace(/#\s+/g, "#");
    var lower = s.toLowerCase();
    if (/^cvs\b/.test(lower) || /\bcvs pharmacy\b/.test(lower)) {
      return s.replace(/cvs pharmacy/gi, "CVS Pharmacy").replace(/^cvs/gi, "CVS");
    }
    if (/^walgreens\b/.test(lower)) {
      return s.replace(/^walgreens/gi, "Walgreens");
    }
    if (/^shopko\b/.test(lower)) {
      return s.replace(/^shopko pharmacy/gi, "Shopko Pharmacy").replace(/^shopko/gi, "Shopko");
    }
    return formatTitleCase(s);
  }

  function sortedPharmacyEntries(pharmacies) {
    return pharmacies
      .map(function (p, idx) {
        return { pharmacy: p, idx: idx };
      })
      .sort(function (a, b) {
        var aPrimary = pharmacyIsPrimary(pharmacies, a.idx) ? 0 : 1;
        var bPrimary = pharmacyIsPrimary(pharmacies, b.idx) ? 0 : 1;
        if (aPrimary !== bPrimary) return aPrimary - bPrimary;
        return formatPharmacyName(a.pharmacy.name).localeCompare(formatPharmacyName(b.pharmacy.name));
      });
  }

  function formatPhone(phone) {
    var digits = String(phone || "").replace(/\D/g, "");
    if (digits.length === 10) {
      return digits.slice(0, 3) + "-" + digits.slice(3, 6) + "-" + digits.slice(6);
    }
    return String(phone || "").trim();
  }

  function formatStreetAddress(item) {
    return [formatTitleCase(item.address_line), formatTitleCase(item.city), item.state, item.zip]
      .filter(Boolean)
      .join(", ");
  }

  function pharmacyIsPrimary(pharmacies, idx) {
    var p = pharmacies[idx];
    if (!p) return false;
    if (p.is_primary) return true;
    return !pharmacies.some(function (x) {
      return x.is_primary;
    }) && idx === 0;
  }

  function emptyState() {
    return {
      healthInfo: {
        gender: "",
        birthdate: "",
        heightFt: null,
        heightIn: null,
        weightLbs: null,
        tobaccoUse: false,
      },
      providers: [],
      prescriptions: [],
      pharmacies: [],
      conditions: [],
    };
  }

  function modalsHtml() {
    return (
      '<div id="crm-mi-modal-provider" class="mi-modal-backdrop" role="dialog" aria-modal="true">' +
      '<div class="mi-modal"><button type="button" class="mi-modal-close" data-close="crm-mi-modal-provider">&times;</button>' +
      "<h3>" +
      esc(t("med_add_providers")) +
      "</h3>" +
      '<p class="mi-readonly">' +
      esc(t("med_search_provider")) +
      "</p>" +
      '<div class="mi-row"><label for="crm-mi-provider-zip">' +
      esc(t("med_zip_code")) +
      '</label>' +
      '<input id="crm-mi-provider-zip" type="text" inputmode="numeric" maxlength="5" placeholder="90210" />' +
      '<p id="crm-mi-provider-zip-err" class="mi-error"></p></div>' +
      '<div class="mi-row"><label for="crm-mi-provider-distance">' +
      esc(t("med_distance")) +
      '</label>' +
      '<select id="crm-mi-provider-distance"></select></div>' +
      '<div class="mi-row"><label for="crm-mi-provider-search">' +
      esc(t("med_search")) +
      '</label>' +
      '<input id="crm-mi-provider-search" type="text" placeholder="' +
      esc(t("med_provider_name_ph")) +
      '" /></div>' +
      '<p id="crm-mi-provider-count" class="crm-provider-count"></p>' +
      '<div id="crm-mi-provider-results" class="crm-provider-results"></div>' +
      '<div id="crm-mi-provider-pagination" class="crm-provider-pagination"></div>' +
      '<div class="mi-modal-actions">' +
      '<button type="button" class="mi-modal-cancel" data-close="crm-mi-modal-provider">' +
      esc(t("med_cancel")) +
      '</button>' +
      '<button type="button" id="crm-mi-provider-add" class="primary" disabled>' +
      esc(t("med_add_provider")) +
      "</button></div></div></div>" +
      '<div id="crm-mi-modal-drug" class="mi-modal-backdrop" role="dialog" aria-modal="true">' +
      '<div class="mi-modal mi-modal-drug"><button type="button" class="mi-modal-close" data-close="crm-mi-modal-drug">&times;</button>' +
      "<h3>" +
      esc(t("med_add_prescriptions")) +
      "</h3>" +
      '<div id="crm-mi-drug-step1">' +
      '<p class="mi-readonly">' +
      esc(t("med_search_prescription")) +
      "</p>" +
      '<input id="crm-mi-drug-search" type="search" autocomplete="off" placeholder="' +
      esc(t("med_search_ph")) +
      '" />' +
      '<p id="crm-mi-drug-count" class="crm-ic-count"></p>' +
      '<div id="crm-mi-drug-results" class="crm-ic-results"></div></div>' +
      '<div id="crm-mi-drug-step2" class="mi-hidden">' +
      '<div id="crm-mi-drug-selected" class="crm-ic-results crm-ic-selected-wrap"></div>' +
      '<div class="mi-row"><label for="crm-mi-drug-dosage">' +
      esc(t("med_dosage")) +
      '</label><select id="crm-mi-drug-dosage"></select></div>' +
      '<div class="mi-row"><label for="crm-mi-drug-qty">' +
      esc(t("med_quantity")) +
      '</label><input id="crm-mi-drug-qty" type="number" min="1" value="30" /></div>' +
      '<div class="mi-row"><label for="crm-mi-drug-frequency">' +
      esc(t("med_frequency")) +
      '</label><select id="crm-mi-drug-frequency"></select></div>' +
      '<div class="mi-row"><label for="crm-mi-drug-packaging">' +
      esc(t("med_packaging")) +
      '</label><select id="crm-mi-drug-packaging"></select></div></div>' +
      '<div class="mi-modal-actions">' +
      '<button type="button" class="mi-modal-cancel" data-close="crm-mi-modal-drug">' +
      esc(t("med_cancel")) +
      '</button>' +
      '<button type="button" id="crm-mi-drug-add" class="primary" disabled>' +
      esc(t("med_add_prescription")) +
      " →</button></div></div></div>" +
      '<div id="crm-mi-modal-pharmacy" class="mi-modal-backdrop" role="dialog" aria-modal="true">' +
      '<div class="mi-modal mi-modal-pharmacy"><button type="button" class="mi-modal-close" data-close="crm-mi-modal-pharmacy">&times;</button>' +
      "<h3>" +
      esc(t("med_add_pharmacy")) +
      "</h3>" +
      '<p class="mi-readonly">' +
      esc(t("med_search_pharmacy")) +
      "</p>" +
      '<div class="crm-pharm-filter-grid">' +
      '<div class="mi-row"><label for="crm-mi-pharmacy-zip">' +
      esc(t("med_zip_code")) +
      '</label><input id="crm-mi-pharmacy-zip" type="text" inputmode="numeric" maxlength="5" /></div>' +
      '<div class="mi-row"><label for="crm-mi-pharmacy-distance">' +
      esc(t("med_distance")) +
      '</label><select id="crm-mi-pharmacy-distance"></select></div></div>' +
      '<div class="mi-row"><label for="crm-mi-pharmacy-address">' +
      esc(t("med_address")) +
      '</label><input id="crm-mi-pharmacy-address" type="text" autocomplete="off" /></div>' +
      '<div class="mi-row"><label for="crm-mi-pharmacy-name">' +
      esc(t("med_pharmacy_name")) +
      '</label><input id="crm-mi-pharmacy-name" type="search" autocomplete="off" placeholder="' +
      esc(t("med_search_ph")) +
      '" /></div>' +
      '<div class="mi-toggle crm-pharm-tabs"><button type="button" id="crm-mi-pharm-tab-physical" class="active">' +
      esc(t("med_physical")) +
      '</button><button type="button" id="crm-mi-pharm-tab-online">' +
      esc(t("med_online")) +
      '</button></div>' +
      '<p id="crm-mi-pharmacy-count" class="crm-ic-count"></p>' +
      '<div id="crm-mi-pharmacy-results" class="crm-ic-results"></div>' +
      '<div id="crm-mi-pharmacy-pagination" class="crm-provider-pagination"></div>' +
      '<div class="mi-modal-actions">' +
      '<button type="button" class="mi-modal-cancel" data-close="crm-mi-modal-pharmacy">' +
      esc(t("med_cancel")) +
      '</button>' +
      '<button type="button" id="crm-mi-pharmacy-add" class="primary" disabled>' +
      esc(t("med_add_pharmacy_btn")) +
      "</button></div></div></div>" +
      '<div id="crm-mi-modal-condition" class="mi-modal-backdrop" role="dialog" aria-modal="true">' +
      '<div class="mi-modal mi-modal-condition"><button type="button" class="mi-modal-close" data-close="crm-mi-modal-condition">&times;</button>' +
      "<h3>" +
      esc(t("med_add_a_condition")) +
      "</h3>" +
      '<div class="mi-row"><label for="crm-mi-condition-search">' +
      esc(t("med_search_condition")) +
      '</label>' +
      '<input id="crm-mi-condition-search" type="search" autocomplete="off" placeholder="' +
      esc(t("med_search_ph")) +
      '" /></div>' +
      '<p id="crm-mi-condition-count" class="crm-ic-count"></p>' +
      '<div id="crm-mi-condition-results" class="crm-ic-results crm-ic-results-condition"></div>' +
      '<div class="mi-modal-actions"><button type="button" class="mi-modal-cancel" data-close="crm-mi-modal-condition">' +
      esc(t("med_cancel")) +
      '</button>' +
      '<button type="button" id="crm-mi-condition-add" class="primary" disabled>' +
      esc(t("med_add_condition_btn")) +
      " →</button></div></div></div>"
    );
  }

  function sectionsHtml(editable) {
    var addBtn = editable
      ? function (modal) {
          return (
            '<button type="button" class="mi-add-btn" data-modal="' +
            modal +
            '">' +
            esc(t("med_add_new")) +
            "</button>"
          );
        }
      : function () {
          return "";
        };
    return (
      '<div class="mi-section open">' +
      '<div class="mi-section-head"><span>' +
      esc(t("med_providers")) +
      ' <span id="crm-mi-count-providers" class="mi-count">(0)</span></span>' +
      addBtn("crm-mi-modal-provider") +
      "</div>" +
      '<div class="mi-section-body"><p id="crm-mi-empty-providers" class="mi-empty">' +
      esc(t("med_no_providers")) +
      '</p>' +
      '<div id="crm-mi-list-providers"></div></div></div>' +
      '<div class="mi-section open">' +
      '<div class="mi-section-head"><span>' +
      esc(t("med_prescriptions")) +
      ' <span id="crm-mi-count-prescriptions" class="mi-count">(0)</span></span>' +
      addBtn("crm-mi-modal-drug") +
      "</div>" +
      '<div class="mi-section-body"><p id="crm-mi-empty-prescriptions" class="mi-empty">' +
      esc(t("med_no_prescriptions")) +
      '</p>' +
      '<div id="crm-mi-list-prescriptions"></div></div></div>' +
      '<div class="mi-section open">' +
      '<div class="mi-section-head"><span>' +
      esc(t("med_pharmacy")) +
      ' <span id="crm-mi-count-pharmacies" class="mi-count">(0)</span></span>' +
      addBtn("crm-mi-modal-pharmacy") +
      "</div>" +
      '<div class="mi-section-body"><p id="crm-mi-empty-pharmacies" class="mi-empty">' +
      esc(t("med_no_pharmacy")) +
      '</p>' +
      '<div id="crm-mi-list-pharmacies"></div></div></div>' +
      '<div class="mi-section open">' +
      '<div class="mi-section-head"><span>' +
      esc(t("med_conditions")) +
      ' <span id="crm-mi-count-conditions" class="mi-count">(0)</span></span>' +
      addBtn("crm-mi-modal-condition") +
      "</div>" +
      '<div class="mi-section-body"><p id="crm-mi-empty-conditions" class="mi-empty">' +
      esc(t("med_no_conditions")) +
      '</p>' +
      '<div id="crm-mi-list-conditions"></div></div></div>'
    );
  }

  function renderViewHtml(ms) {
    var hi = ms.state.healthInfo;
    return (
      '<div class="crm-med-grid">' +
      '<div class="crm-med-card">' +
      '<div class="crm-med-card-head"><h2>' +
      esc(t("med_health_info")) +
      '</h2>' +
      '<button type="button" class="crm-med-edit-link" id="crm-med-edit-btn">' +
      esc(t("med_edit")) +
      "</button></div>" +
      '<dl class="crm-med-hi-grid">' +
      '<div class="crm-med-hi-cell"><dt>' +
      esc(t("med_gender")) +
      "</dt><dd>" +
      esc(hi.gender || "—") +
      "</dd></div>" +
      '<div class="crm-med-hi-cell"><dt>' +
      esc(t("med_birthdate")) +
      "</dt><dd>" +
      esc(hi.birthdate || "—") +
      "</dd></div>" +
      '<div class="crm-med-hi-cell"><dt>' +
      esc(t("med_age")) +
      "</dt><dd>" +
      esc(calcAge(hi.birthdate)) +
      "</dd></div>" +
      '<div class="crm-med-hi-cell"><dt>' +
      esc(t("med_height")) +
      "</dt><dd>" +
      esc(formatHeight(hi.heightFt, hi.heightIn)) +
      "</dd></div>" +
      '<div class="crm-med-hi-cell"><dt>' +
      esc(t("med_weight")) +
      "</dt><dd>" +
      esc(hi.weightLbs != null ? hi.weightLbs + " " + t("med_lbs") : "—") +
      "</dd></div>" +
      '<div class="crm-med-hi-cell"><dt>' +
      esc(t("med_tobacco")) +
      "</dt><dd>" +
      esc(hi.tobaccoUse ? t("med_yes") : t("med_no")) +
      "</dd></div></dl></div>" +
      "<div>" +
      sectionsHtml(false) +
      "</div></div>"
    );
  }

  function renderEditHtml(ms) {
    var hi = ms.state.healthInfo;
    return (
      '<div class="crm-med-grid">' +
      '<div class="crm-med-card">' +
      '<div class="crm-med-card-head"><h2>' +
      esc(t("med_edit_health")) +
      "</h2></div>" +
      '<div class="mi-row"><label>' +
      esc(t("med_gender")) +
      '</label><div class="mi-toggle">' +
      '<button type="button" class="' +
      (hi.gender === "Male" ? "active" : "") +
      '" data-gender="Male">' +
      esc(t("med_male")) +
      '</button>' +
      '<button type="button" class="' +
      (hi.gender === "Female" ? "active" : "") +
      '" data-gender="Female">' +
      esc(t("med_female")) +
      "</button></div></div>" +
      '<div class="mi-row"><label for="crm-mi-birthdate">' +
      esc(t("med_birthdate")) +
      '</label>' +
      '<input id="crm-mi-birthdate" type="date" value="' +
      esc(hi.birthdate || "") +
      '" /></div>' +
      '<div class="mi-row"><label>' +
      esc(t("med_age")) +
      '</label><span id="crm-mi-age-display" class="mi-readonly">' +
      esc(calcAge(hi.birthdate)) +
      "</span></div>" +
      '<div class="mi-row"><label>' +
      esc(t("med_height")) +
      '</label><div class="mi-inline">' +
      '<input id="crm-mi-height-ft" type="number" min="3" max="8" placeholder="' +
      esc(t("med_ft")) +
      '" value="' +
      esc(hi.heightFt != null ? hi.heightFt : "") +
      '" /><span>' +
      esc(t("med_ft")) +
      '</span>' +
      '<input id="crm-mi-height-in" type="number" min="0" max="11" placeholder="' +
      esc(t("med_in")) +
      '" value="' +
      esc(hi.heightIn != null ? hi.heightIn : "") +
      '" /><span>' +
      esc(t("med_in")) +
      "</span></div></div>" +
      '<div class="mi-row"><label for="crm-mi-weight">' +
      esc(t("med_weight_lbs")) +
      '</label>' +
      '<input id="crm-mi-weight" type="number" min="50" max="600" value="' +
      esc(hi.weightLbs != null ? hi.weightLbs : "") +
      '" /></div>' +
      '<div class="mi-row"><label>' +
      esc(t("med_tobacco_use")) +
      '</label><div class="mi-toggle">' +
      '<button type="button" class="' +
      (hi.tobaccoUse ? "active" : "") +
      '" data-tobacco="yes">' +
      esc(t("med_yes")) +
      '</button>' +
      '<button type="button" class="' +
      (!hi.tobaccoUse ? "active" : "") +
      '" data-tobacco="no">' +
      esc(t("med_no")) +
      "</button></div></div></div>" +
      "<div>" +
      sectionsHtml(true) +
      "</div></div>" +
      '<div class="crm-med-save-bar">' +
      '<button type="button" class="crm-btn ghost" id="crm-med-cancel-btn">' +
      esc(t("med_cancel")) +
      '</button>' +
      '<button type="button" class="crm-btn" id="crm-med-save-btn">' +
      esc(t("med_save")) +
      "</button></div>" +
      '<p id="crm-med-save-status" class="crm-med-status"></p>'
    );
  }

  function renderLists(ms, root) {
    function renderSimpleList(key, items, labelFn, canRemove) {
      var list = $("crm-mi-list-" + key, root);
      var empty = $("crm-mi-empty-" + key, root);
      if (!list) return;
      if (!items.length) {
        list.innerHTML = "";
        if (empty) empty.classList.remove("mi-hidden");
        return;
      }
      if (empty) empty.classList.add("mi-hidden");
      list.innerHTML = items
        .map(function (item, idx) {
          var rm = canRemove
            ? '<button type="button" class="mi-remove" data-key="' +
              key +
              '" data-idx="' +
              idx +
              '">' +
              esc(t("med_remove")) +
              "</button>"
            : "";
          return '<div class="mi-list-item"><span>' + esc(labelFn(item)) + "</span>" + rm + "</div>";
        })
        .join("");
      if (canRemove) {
        list.querySelectorAll(".mi-remove").forEach(function (btn) {
          btn.addEventListener("click", function () {
            var k = btn.getAttribute("data-key");
            var i = parseInt(btn.getAttribute("data-idx"), 10);
            ms.state[k].splice(i, 1);
            renderLists(ms, root);
          });
        });
      }
    }

    function renderProviderCards() {
      var list = $("crm-mi-list-providers", root);
      var empty = $("crm-mi-empty-providers", root);
      var items = ms.state.providers;
      if (!list) return;
      if (!items.length) {
        list.innerHTML = "";
        if (empty) empty.classList.remove("mi-hidden");
        return;
      }
      if (empty) empty.classList.add("mi-hidden");
      list.innerHTML = items
        .map(function (p, idx) {
          var addr = formatStreetAddress(p);
          var phone = p.phone ? formatPhone(p.phone) : "";
          var rm = ms.editing
            ? '<button type="button" class="crm-ic-card-action crm-ic-card-delete" data-prov-remove="' +
              idx +
              '">' +
              esc(t("med_delete")) +
              "</button>"
            : "";
          return (
            '<div class="crm-ic-entity-card">' +
            "<strong>" +
            esc(formatTitleCase(p.name || "Provider")) +
            "</strong>" +
            (p.specialty ? '<div class="crm-ic-card-meta">' + esc(p.specialty) + "</div>" : "") +
            (addr ? '<div class="crm-ic-card-meta">' + esc(addr) + "</div>" : "") +
            (phone ? '<div class="crm-ic-card-meta">' + esc(phone) + "</div>" : "") +
            (rm ? '<div class="crm-ic-card-actions">' + rm + "</div>" : "") +
            "</div>"
          );
        })
        .join("");
      list.querySelectorAll("[data-prov-remove]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var i = parseInt(btn.getAttribute("data-prov-remove"), 10);
          ms.state.providers.splice(i, 1);
          renderLists(ms, root);
        });
      });
    }

    function renderPharmacyCards() {
      var list = $("crm-mi-list-pharmacies", root);
      var empty = $("crm-mi-empty-pharmacies", root);
      var items = ms.state.pharmacies;
      if (!list) return;
      if (!items.length) {
        list.innerHTML = "";
        if (empty) empty.classList.remove("mi-hidden");
        return;
      }
      if (empty) empty.classList.add("mi-hidden");
      list.innerHTML = sortedPharmacyEntries(items)
        .map(function (entry) {
          var p = entry.pharmacy;
          var idx = entry.idx;
          var isPrimary = pharmacyIsPrimary(items, idx);
          var addr = formatStreetAddress(p);
          var phone = p.phone ? formatPhone(p.phone) : "";
          var badge = isPrimary
            ? '<span class="crm-pharm-primary-badge">' + esc(t("med_primary")) + "</span>"
            : "";
          var setPrimary =
            ms.editing && !isPrimary
              ? '<button type="button" class="crm-ic-card-action" data-pharm-primary="' +
                idx +
                '">' +
                esc(t("med_set_primary")) +
                "</button>"
              : "";
          var rm = ms.editing
            ? '<button type="button" class="crm-ic-card-action crm-ic-card-delete" data-pharm-remove="' +
              idx +
              '">' +
              esc(t("med_delete")) +
              "</button>"
            : "";
          return (
            '<div class="crm-ic-entity-card">' +
            '<div class="crm-pharm-card-head"><strong>' +
            esc(formatPharmacyName(p.name || "Pharmacy")) +
            "</strong>" +
            badge +
            "</div>" +
            (addr ? '<div class="crm-ic-card-meta">' + esc(addr) + "</div>" : "") +
            (phone ? '<div class="crm-ic-card-meta">' + esc(phone) + "</div>" : "") +
            (setPrimary || rm ? '<div class="crm-ic-card-actions">' + setPrimary + rm + "</div>" : "") +
            "</div>"
          );
        })
        .join("");
      list.querySelectorAll("[data-pharm-primary]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var i = parseInt(btn.getAttribute("data-pharm-primary"), 10);
          ms.state.pharmacies.forEach(function (p, pi) {
            p.is_primary = pi === i;
          });
          renderLists(ms, root);
        });
      });
      list.querySelectorAll("[data-pharm-remove]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var i = parseInt(btn.getAttribute("data-pharm-remove"), 10);
          var wasPrimary = pharmacyIsPrimary(ms.state.pharmacies, i);
          ms.state.pharmacies.splice(i, 1);
          if (wasPrimary && ms.state.pharmacies.length) {
            ms.state.pharmacies[0].is_primary = true;
          }
          renderLists(ms, root);
        });
      });
    }

    renderProviderCards();
    renderSimpleList("prescriptions", ms.state.prescriptions, function (p) {
      var line =
        (p.drugName || "") +
        " — " +
        (p.dosage || "") +
        ", qty " +
        (p.quantity || "") +
        ", " +
        (p.frequency || "");
      if (p.packaging) line += ", " + p.packaging;
      return line;
    }, ms.editing);
    renderPharmacyCards();
    renderSimpleList("conditions", ms.state.conditions, function (c) {
      return (c.name || "") + (c.icd10_code ? " (" + c.icd10_code + ")" : "");
    }, ms.editing);
    ["providers", "prescriptions", "pharmacies", "conditions"].forEach(function (k) {
      var cnt = $("crm-mi-count-" + k, root);
      if (cnt) cnt.textContent = "(" + ms.state[k].length + ")";
    });
  }

  function openModal(id) {
    var m = document.getElementById(id);
    if (m) m.classList.add("show");
  }
  function closeModal(id) {
    var m = document.getElementById(id);
    if (m) m.classList.remove("show");
  }

  function fillDistanceSelect(sel) {
    if (!sel) return;
    sel.innerHTML = DISTANCES.map(function (d) {
      return '<option value="' + d + '">' + d + " " + esc(t("med_miles")) + "</option>";
    }).join("");
  }

  function searchUrl(type, params) {
    var qs = "type=" + encodeURIComponent(type);
    Object.keys(params).forEach(function (k) {
      if (params[k] != null && params[k] !== "") qs += "&" + k + "=" + encodeURIComponent(String(params[k]));
    });
    return "/api/staff/medical-search?" + qs;
  }

  function wireModals(ms, root) {
    var providerDoSearch = null;
    root.querySelectorAll(".mi-section-head").forEach(function (head) {
      head.addEventListener("click", function (e) {
        if (e.target.closest(".mi-add-btn")) return;
        head.parentElement.classList.toggle("open");
      });
    });
    root.querySelectorAll(".mi-add-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var modalId = btn.getAttribute("data-modal");
        openModal(modalId);
        if (modalId === "crm-mi-modal-provider" && typeof providerDoSearch === "function") {
          setTimeout(providerDoSearch, 0);
        }
      });
    });
    root.querySelectorAll(".mi-modal-close, .mi-modal-cancel").forEach(function (btn) {
      btn.addEventListener("click", function () {
        closeModal(btn.getAttribute("data-close"));
      });
    });

    fillDistanceSelect($("crm-mi-provider-distance", root));
    fillDistanceSelect($("crm-mi-pharmacy-distance", root));

    /* Provider search — IC-style results with address selection */
    (function () {
      var zipIn = $("crm-mi-provider-zip", root);
      var searchIn = $("crm-mi-provider-search", root);
      var results = $("crm-mi-provider-results", root);
      var countEl = $("crm-mi-provider-count", root);
      var pagination = $("crm-mi-provider-pagination", root);
      var addBtn = $("crm-mi-provider-add", root);
      var err = $("crm-mi-provider-zip-err", root);
      var ctx = { items: [], page: 1, total: 0, perPage: 20, pick: null };

      function setAddEnabled() {
        if (addBtn) addBtn.disabled = !(ctx.pick && ctx.items[ctx.pick.p]);
      }

      function renderProviderCards() {
        if (!results) return;
        if (!ctx.items.length) {
          results.innerHTML = '<p class="mi-readonly">' + esc(t("med_no_providers_found")) + "</p>";
          if (countEl) countEl.textContent = "";
          if (pagination) pagination.innerHTML = "";
          setAddEnabled();
          return;
        }
        if (countEl) {
          countEl.textContent =
            ctx.total === 1
              ? t("med_providers_found", { count: ctx.total })
              : t("med_providers_found_plural", { count: ctx.total });
        }
        results.innerHTML = ctx.items
          .map(function (p, pi) {
            var locs = p.locations || [
              {
                address_line: p.address_line,
                city: p.city,
                state: p.state,
                zip: p.zip,
              },
            ];
            var primary = locs[0];
            var extra = locs.slice(1);
            var primaryAddr = [primary.address_line, primary.city, primary.state, primary.zip]
              .filter(Boolean)
              .join(", ");
            var spec = p.specialty
              ? '<div class="crm-provider-spec">' + esc(p.specialty) + "</div>"
              : "";
            var extraHtml = "";
            if (extra.length) {
              extraHtml =
                '<details class="crm-provider-more"><summary>' +
                esc(t("med_additional_locations", { count: extra.length })) +
                "</summary>" +
                extra
                  .map(function (loc, li) {
                    var addr = [loc.address_line, loc.city, loc.state, loc.zip].filter(Boolean).join(", ");
                    var checked =
                      ctx.pick && ctx.pick.p === pi && ctx.pick.l === li + 1 ? " checked" : "";
                    return (
                      '<label class="crm-provider-loc">' +
                      '<input type="radio" name="crm-provider-pick" data-p="' +
                      pi +
                      '" data-l="' +
                      (li + 1) +
                      '"' +
                      checked +
                      " /> " +
                      esc(addr) +
                      "</label>"
                    );
                  })
                  .join("") +
                "</details>";
            }
            var checked0 =
              ctx.pick && ctx.pick.p === pi && ctx.pick.l === 0 ? " checked" : "";
            return (
              '<div class="crm-provider-card">' +
              spec +
              '<div class="crm-provider-name">' +
              esc(p.name) +
              "</div>" +
              '<div class="crm-provider-npi">' +
              esc(p.npi || "") +
              "</div>" +
              '<label class="crm-provider-loc crm-provider-loc-primary">' +
              '<input type="radio" name="crm-provider-pick" data-p="' +
              pi +
              '" data-l="0"' +
              checked0 +
              " /> " +
              esc(primaryAddr) +
              "</label>" +
              extraHtml +
              "</div>"
            );
          })
          .join("");

        results.querySelectorAll('input[name="crm-provider-pick"]').forEach(function (inp) {
          inp.addEventListener("change", function () {
            ctx.pick = {
              p: parseInt(inp.getAttribute("data-p"), 10),
              l: parseInt(inp.getAttribute("data-l"), 10),
            };
            setAddEnabled();
          });
        });

        if (pagination) {
          var pages = Math.max(1, Math.ceil(ctx.total / ctx.perPage));
          if (pages <= 1) {
            pagination.innerHTML = "";
          } else {
            pagination.innerHTML =
              '<button type="button" class="crm-btn secondary" id="crm-mi-provider-prev"' +
              (ctx.page <= 1 ? " disabled" : "") +
              ">" +
              esc(t("med_prev")) +
              "</button>" +
              "<span>" +
              esc(t("med_page")) +
              " " +
              ctx.page +
              " " +
              esc(t("med_of")) +
              " " +
              pages +
              "</span>" +
              '<button type="button" class="crm-btn secondary" id="crm-mi-provider-next"' +
              (ctx.page >= pages ? " disabled" : "") +
              ">" +
              esc(t("med_next")) +
              "</button>";
            var prev = $("crm-mi-provider-prev", pagination);
            var next = $("crm-mi-provider-next", pagination);
            if (prev)
              prev.addEventListener("click", function () {
                if (ctx.page > 1) {
                  ctx.page--;
                  doSearch();
                }
              });
            if (next)
              next.addEventListener("click", function () {
                if (ctx.page < pages) {
                  ctx.page++;
                  doSearch();
                }
              });
          }
        }
        setAddEnabled();
      }

      function doSearch() {
        var zip = (zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "";
        var term = (searchIn && searchIn.value.trim()) || "";
        if (zip.length !== 5) {
          if (err) err.textContent = t("med_zip_5");
          return;
        }
        if (!term) {
          if (err) err.textContent = t("med_enter_provider");
          if (results) results.innerHTML = "";
          if (countEl) countEl.textContent = "";
          return;
        }
        if (err) err.textContent = "";
        if (results) results.innerHTML = '<p class="mi-readonly">' + esc(t("med_searching")) + "</p>";
        api(
          searchUrl("providers", {
            zipCode: zip,
            searchTerm: term,
            radius: ($("crm-mi-provider-distance", root) && $("crm-mi-provider-distance", root).value) || "25",
            page: ctx.page,
            perPage: ctx.perPage,
          })
        )
          .then(function (data) {
            ctx.items = data.items || [];
            ctx.total = data.total != null ? data.total : ctx.items.length;
            ctx.pick = null;
            renderProviderCards();
          })
          .catch(function (e) {
            console.error("provider search failed", e);
            if (results) {
              results.innerHTML =
                '<p class="mi-error">' + esc(e && e.message ? e.message : t("med_search_failed")) + "</p>";
            }
          });
      }

      providerDoSearch = doSearch;

      var debouncedSearch = debounce(doSearch, 400);
      if (searchIn) searchIn.addEventListener("input", function () {
        ctx.page = 1;
        debouncedSearch();
      });
      if (zipIn) zipIn.addEventListener("input", function () {
        ctx.page = 1;
        debouncedSearch();
      });
      var dist = $("crm-mi-provider-distance", root);
      if (dist) dist.addEventListener("change", function () {
        ctx.page = 1;
        doSearch();
      });
      if (addBtn) {
        addBtn.addEventListener("click", function () {
          if (!ctx.pick) return;
          var p = ctx.items[ctx.pick.p];
          if (!p) return;
          var locs = p.locations || [
            {
              address_line: p.address_line,
              city: p.city,
              state: p.state,
              zip: p.zip,
              phone: p.phone,
            },
          ];
          var loc = locs[ctx.pick.l] || locs[0];
          ms.state.providers.push({
            npi: p.npi,
            name: p.name,
            specialty: p.specialty,
            address_line: loc.address_line,
            city: loc.city,
            state: loc.state,
            zip: loc.zip,
            phone: loc.phone || p.phone || "",
          });
          renderLists(ms, root);
          closeModal("crm-mi-modal-provider");
        });
      }
    })();

    /* Drug modal — IC-style search + dosage step */
    (function () {
      var step1 = $("crm-mi-drug-step1", root);
      var step2 = $("crm-mi-drug-step2", root);
      var searchIn = $("crm-mi-drug-search", root);
      var results = $("crm-mi-drug-results", root);
      var countEl = $("crm-mi-drug-count", root);
      var selectedWrap = $("crm-mi-drug-selected", root);
      var dosageSel = $("crm-mi-drug-dosage", root);
      var qtyIn = $("crm-mi-drug-qty", root);
      var freqSel = $("crm-mi-drug-frequency", root);
      var packSel = $("crm-mi-drug-packaging", root);
      var addBtn = $("crm-mi-drug-add", root);
      var selected = null;
      var searchItems = [];
      var doseItems = [];

      if (freqSel) {
        freqSel.innerHTML = FREQUENCY_VALUES.map(function (f, i) {
          return (
            '<option value="' +
            esc(f) +
            '">' +
            esc(t(FREQUENCY_KEYS[i])) +
            "</option>"
          );
        }).join("");
      }

      function setAddEnabled() {
        if (!addBtn) return;
        var ok =
          selected &&
          dosageSel &&
          dosageSel.value !== "" &&
          packSel &&
          packSel.value &&
          qtyIn &&
          parseInt(qtyIn.value, 10) > 0;
        addBtn.disabled = !ok;
      }

      function renderSelectedCard() {
        if (!selectedWrap || !selected) return;
        var displayName = selected.step2_name || selected.name;
        var typeLabel = selected.drug_type ? esc(selected.drug_type) : "";
        selectedWrap.innerHTML =
          '<label class="crm-ic-option crm-ic-option-selected">' +
          '<input type="radio" name="crm-drug-pick-selected" checked disabled />' +
          '<span class="crm-ic-option-body"><strong>' +
          esc(displayName) +
          "</strong>" +
          (typeLabel ? '<span class="crm-ic-option-sub">' + typeLabel + "</span>" : "") +
          "</span></label>";
      }

      function applyDoseSelection(idx) {
        var d = doseItems[idx];
        if (!d || !packSel) return;
        var opts = d.packaging_options || [];
        packSel.innerHTML = opts
          .map(function (o, oi) {
            return (
              '<option value="' +
              oi +
              '">' +
              esc(o.label) +
              "</option>"
            );
          })
          .join("");
        if (opts[0] && qtyIn) qtyIn.value = String(d.default_quantity || opts[0].default_quantity || 1);
        if (packSel && opts.length) packSel.selectedIndex = 0;
        if (d.dosage_label) {
          selected.step2_name = ingredientFromIcLabelClient(d.dosage_label) || selected.name;
          renderSelectedCard();
        }
        setAddEnabled();
      }

      function ingredientFromIcLabelClient(icLabel) {
        var s = String(icLabel || "").trim();
        var m = s.match(/^(.+?)\s+(?:ER\s+)?(?:SOL|TAB|CAP|SUSP)\b/i);
        if (m) return m[1].trim();
        return s.split(/\s+\d/)[0].trim();
      }

      function showStep2() {
        if (step1) step1.classList.add("mi-hidden");
        if (step2) step2.classList.remove("mi-hidden");
        renderSelectedCard();
        setAddEnabled();
      }

      function reset() {
        selected = null;
        searchItems = [];
        doseItems = [];
        if (searchIn) searchIn.value = "";
        if (results) results.innerHTML = "";
        if (countEl) countEl.textContent = "";
        if (selectedWrap) selectedWrap.innerHTML = "";
        if (dosageSel) dosageSel.innerHTML = "";
        if (packSel) packSel.innerHTML = "";
        if (qtyIn) qtyIn.value = "30";
        if (step1) step1.classList.remove("mi-hidden");
        if (step2) step2.classList.add("mi-hidden");
        setAddEnabled();
      }

      root.querySelectorAll('[data-close="crm-mi-modal-drug"]').forEach(function (el) {
        el.addEventListener("click", reset);
      });

      function pickDrug(idx) {
        selected = Object.assign({}, searchItems[idx], { step2_name: searchItems[idx].name });
        if (!selected) return;
        showStep2();
        doseItems = [];
        if (dosageSel) dosageSel.innerHTML = "";
        if (packSel) packSel.innerHTML = "";
        api(searchUrl("drug-dosages", { rxcui: selected.rxcui || "", name: selected.name }))
          .then(function (dd) {
            if (!dosageSel) return;
            doseItems = dd.items || [];
            if (!doseItems.length) {
              setAddEnabled();
              return;
            }
            dosageSel.innerHTML = doseItems
              .map(function (x, i) {
                return (
                  '<option value="' +
                  i +
                  '">' +
                  esc(x.dosage_label) +
                  "</option>"
                );
              })
              .join("");
            applyDoseSelection(0);
          })
          .catch(function () {
            setAddEnabled();
          });
      }

      function renderDrugResults(items) {
        if (!results) return;
        if (!items.length) {
          results.innerHTML =
            '<div class="crm-ic-empty">' + esc(t("med_no_prescriptions_found")) + "</div>";
          return;
        }
        results.innerHTML = items
          .map(function (d, i) {
            var typeLabel = d.drug_type ? esc(d.drug_type) : "";
            return (
              '<label class="crm-ic-option">' +
              '<input type="radio" name="crm-drug-pick" value="' +
              i +
              '" />' +
              '<span class="crm-ic-option-body"><strong>' +
              esc(d.name) +
              "</strong>" +
              (typeLabel ? '<span class="crm-ic-option-sub">' + typeLabel + "</span>" : "") +
              "</span></label>"
            );
          })
          .join("");
        results.querySelectorAll('input[name="crm-drug-pick"]').forEach(function (inp) {
          inp.addEventListener("change", function () {
            pickDrug(parseInt(inp.value, 10));
          });
        });
      }

      var doSearch = debounce(function () {
        var q = (searchIn && searchIn.value.trim()) || "";
        if (q.length < 2) {
          searchItems = [];
          if (results) results.innerHTML = "";
          if (countEl) countEl.textContent = "";
          return;
        }
        if (results) results.innerHTML = '<div class="crm-ic-empty">' + esc(t("med_searching")) + "</div>";
        if (countEl) countEl.textContent = "";
        api(searchUrl("drugs", { q: q }))
          .then(function (data) {
            searchItems = data.items || [];
            var total = data.result_count != null ? data.result_count : searchItems.length;
            if (countEl) {
              countEl.textContent = formatFoundCount(
                total,
                "med_prescriptions_found",
                "med_prescriptions_found_plural"
              );
            }
            renderDrugResults(searchItems);
          })
          .catch(function () {
            if (results) results.innerHTML = '<p class="mi-error">' + esc(t("med_search_failed")) + "</p>";
            if (countEl) countEl.textContent = "";
          });
      }, 400);

      if (searchIn) searchIn.addEventListener("input", doSearch);
      if (dosageSel) {
        dosageSel.addEventListener("change", function () {
          applyDoseSelection(parseInt(dosageSel.value, 10) || 0);
        });
      }
      if (packSel) {
        packSel.addEventListener("change", function () {
          var dose = doseItems[parseInt(dosageSel && dosageSel.value, 10) || 0];
          var pkg = dose && dose.packaging_options && dose.packaging_options[parseInt(packSel.value, 10) || 0];
          if (pkg && qtyIn) qtyIn.value = String(pkg.default_quantity || dose.default_quantity || 1);
          setAddEnabled();
        });
      }
      if (qtyIn) qtyIn.addEventListener("input", setAddEnabled);

      if (addBtn) {
        addBtn.addEventListener("click", function () {
          if (addBtn.disabled || !selected || !dosageSel || !packSel) return;
          var dose = doseItems[parseInt(dosageSel.value, 10) || 0] || {};
          var pkg =
            (dose.packaging_options && dose.packaging_options[parseInt(packSel.value, 10) || 0]) || {};
          ms.state.prescriptions.push({
            drugName: selected.step2_name || selected.name,
            rxcui: dose.rxcui || selected.rxcui,
            drug_type: selected.drug_type,
            dosage: dose.dosage_label || "",
            rxnorm_name: dose.rxnorm_name || "",
            quantity: parseInt(qtyIn && qtyIn.value, 10) || 1,
            frequency: freqSel ? freqSel.value : "per month",
            packaging: pkg.label || "",
          });
          renderLists(ms, root);
          closeModal("crm-mi-modal-drug");
          reset();
        });
      }
    })();

    /* Pharmacy — IC-style filters, checkboxes, footer add */
    (function () {
      var zipIn = $("crm-mi-pharmacy-zip", root);
      var addrIn = $("crm-mi-pharmacy-address", root);
      var nameIn = $("crm-mi-pharmacy-name", root);
      var results = $("crm-mi-pharmacy-results", root);
      var countEl = $("crm-mi-pharmacy-count", root);
      var pagination = $("crm-mi-pharmacy-pagination", root);
      var addBtn = $("crm-mi-pharmacy-add", root);
      var pharmType = "physical";
      var tabP = $("crm-mi-pharm-tab-physical", root);
      var tabO = $("crm-mi-pharm-tab-online", root);
      var ctx = { items: [], total: 0, page: 1, perPage: 10, pick: null };

      function setAddEnabled() {
        if (addBtn) addBtn.disabled = ctx.pick == null;
      }

      function reset() {
        ctx = { items: [], total: 0, page: 1, perPage: 10, pick: null };
        if (zipIn) zipIn.value = "";
        if (addrIn) addrIn.value = "";
        if (nameIn) nameIn.value = "";
        if (results) results.innerHTML = "";
        if (countEl) countEl.textContent = "";
        if (pagination) pagination.innerHTML = "";
        pharmType = "physical";
        if (tabP) tabP.classList.add("active");
        if (tabO) tabO.classList.remove("active");
        setAddEnabled();
      }

      root.querySelectorAll('[data-close="crm-mi-modal-pharmacy"]').forEach(function (el) {
        el.addEventListener("click", reset);
      });

      function renderResults() {
        if (!results) return;
        if (pharmType === "physical") {
          var zip = (zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "";
          if (zip.length !== 5) {
            results.innerHTML = '<div class="crm-ic-empty">' + esc(t("med_zip_5")) + "</div>";
            if (countEl) countEl.textContent = "";
            if (pagination) pagination.innerHTML = "";
            ctx.pick = null;
            setAddEnabled();
            return;
          }
        }
        if (!ctx.items.length) {
          results.innerHTML =
            '<div class="crm-ic-empty">' + esc(t("med_no_pharmacies_found")) + "</div>";
          if (countEl) countEl.textContent = "";
          if (pagination) pagination.innerHTML = "";
          ctx.pick = null;
          setAddEnabled();
          return;
        }
        if (countEl) {
          countEl.textContent = formatFoundCount(
            ctx.total,
            "med_pharmacies_found",
            "med_pharmacies_found_plural"
          );
        }
        results.innerHTML = ctx.items
          .map(function (p, i) {
            var addr = formatStreetAddress(p);
            var checked = ctx.pick === i ? " checked" : "";
            return (
              '<label class="crm-ic-option crm-ic-check' +
              (ctx.pick === i ? " crm-ic-option-selected" : "") +
              '">' +
              '<input type="checkbox" name="crm-pharm-pick" data-idx="' +
              i +
              '"' +
              checked +
              " /> " +
              '<span class="crm-ic-option-body"><strong>' +
              esc(formatPharmacyName(p.name)) +
              "</strong><br><small>" +
              esc(addr) +
              "</small></span></label>"
            );
          })
          .join("");
        results.querySelectorAll('input[name="crm-pharm-pick"]').forEach(function (inp) {
          inp.addEventListener("change", function () {
            var idx = parseInt(inp.getAttribute("data-idx"), 10);
            if (inp.checked) {
              ctx.pick = idx;
              results.querySelectorAll('input[name="crm-pharm-pick"]').forEach(function (other) {
                if (other !== inp) other.checked = false;
              });
              results.querySelectorAll(".crm-ic-option").forEach(function (lab, li) {
                lab.classList.toggle("crm-ic-option-selected", li === idx);
              });
            } else if (ctx.pick === idx) {
              ctx.pick = null;
              inp.closest(".crm-ic-option").classList.remove("crm-ic-option-selected");
            }
            setAddEnabled();
          });
        });

        if (pagination) {
          var pages = Math.max(1, Math.ceil(ctx.total / ctx.perPage));
          if (pages <= 1) {
            pagination.innerHTML = "";
          } else {
            pagination.innerHTML =
              '<button type="button" class="crm-btn secondary" id="crm-mi-pharm-prev"' +
              (ctx.page <= 1 ? " disabled" : "") +
              ">" +
              esc(t("med_prev")) +
              "</button>" +
              "<span>" +
              esc(t("med_page")) +
              " " +
              ctx.page +
              " " +
              esc(t("med_of")) +
              " " +
              pages +
              "</span>" +
              '<button type="button" class="crm-btn secondary" id="crm-mi-pharm-next"' +
              (ctx.page >= pages ? " disabled" : "") +
              ">" +
              esc(t("med_next")) +
              "</button>";
            var prev = $("crm-mi-pharm-prev", pagination);
            var next = $("crm-mi-pharm-next", pagination);
            if (prev)
              prev.addEventListener("click", function () {
                if (ctx.page > 1) {
                  ctx.page--;
                  ctx.pick = null;
                  doSearchNow();
                }
              });
            if (next)
              next.addEventListener("click", function () {
                if (ctx.page < pages) {
                  ctx.page++;
                  ctx.pick = null;
                  doSearchNow();
                }
              });
          }
        }
        setAddEnabled();
      }

      function doSearchNow() {
        if (pharmType === "physical") {
          var zip = (zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "";
          if (zip.length !== 5) {
            ctx.items = [];
            ctx.total = 0;
            renderResults();
            return;
          }
        }
        if (results) results.innerHTML = '<div class="crm-ic-empty">' + esc(t("med_searching")) + "</div>";
        if (countEl) countEl.textContent = "";
        api(
          searchUrl("pharmacies", {
            zipCode: (zipIn && zipIn.value.replace(/\D/g, "").slice(0, 5)) || "",
            pharmacyName: (nameIn && nameIn.value) || "",
            address: (addrIn && addrIn.value) || "",
            pharmacyType: pharmType,
            radius: ($("crm-mi-pharmacy-distance", root) && $("crm-mi-pharmacy-distance", root).value) || "25",
            page: ctx.page,
            perPage: pharmType === "online" ? 4 : 10,
          })
        )
          .then(function (data) {
            ctx.items = data.items || [];
            ctx.total = data.result_count != null ? data.result_count : ctx.items.length;
            ctx.perPage = data.perPage || ctx.perPage;
            renderResults();
          })
          .catch(function () {
            ctx.items = [];
            ctx.total = 0;
            if (countEl) countEl.textContent = "";
            if (pagination) pagination.innerHTML = "";
            if (results) results.innerHTML = '<p class="mi-error">' + esc(t("med_search_failed")) + "</p>";
            ctx.pick = null;
            setAddEnabled();
          });
      }

      var doSearch = debounce(doSearchNow, 400);

      function setTab(t) {
        pharmType = t;
        ctx.page = 1;
        ctx.pick = null;
        if (tabP) tabP.classList.toggle("active", t === "physical");
        if (tabO) tabO.classList.toggle("active", t === "online");
        doSearchNow();
      }

      if (tabP)
        tabP.addEventListener("click", function () {
          setTab("physical");
        });
      if (tabO)
        tabO.addEventListener("click", function () {
          setTab("online");
        });
      if (nameIn) nameIn.addEventListener("input", function () {
        ctx.page = 1;
        ctx.pick = null;
        doSearch();
      });
      if (zipIn)
        zipIn.addEventListener("input", function () {
          ctx.page = 1;
          ctx.pick = null;
          doSearch();
        });
      if (addrIn)
        addrIn.addEventListener("input", function () {
          ctx.page = 1;
          ctx.pick = null;
          doSearch();
        });
      var distSel = $("crm-mi-pharmacy-distance", root);
      if (distSel)
        distSel.addEventListener("change", function () {
          ctx.page = 1;
          ctx.pick = null;
          doSearchNow();
        });

      if (addBtn) {
        addBtn.addEventListener("click", function () {
          if (addBtn.disabled || ctx.pick == null) return;
          var p = ctx.items[ctx.pick];
          if (!p) return;
          var entry = Object.assign({}, p, {
            pharmacy_type: pharmType,
            is_primary: ms.state.pharmacies.length === 0,
          });
          ms.state.pharmacies.push(entry);
          renderLists(ms, root);
          closeModal("crm-mi-modal-pharmacy");
          reset();
        });
      }
    })();

    /* Conditions — IC-style consumer names */
    (function () {
      var searchIn = $("crm-mi-condition-search", root);
      var results = $("crm-mi-condition-results", root);
      var countEl = $("crm-mi-condition-count", root);
      var addBtn = $("crm-mi-condition-add", root);
      var items = [];
      var pick = null;
      var resultCount = 0;

      function setAddEnabled() {
        if (addBtn) addBtn.disabled = pick == null;
      }

      function showEmptyPrompt() {
        if (results) {
          results.innerHTML = '<div class="crm-ic-empty">' + esc(t("med_search_condition_prompt")) + "</div>";
        }
        if (countEl) countEl.textContent = "";
        pick = null;
        setAddEnabled();
      }

      function renderConditionResults() {
        if (!results) return;
        if (!items.length) {
          results.innerHTML = '<div class="crm-ic-empty">' + esc(t("med_no_conditions_found")) + "</div>";
          if (countEl) countEl.textContent = "";
          pick = null;
          setAddEnabled();
          return;
        }
        if (countEl) {
          countEl.textContent = resultCount
            ? formatFoundCount(resultCount, "med_conditions_found", "med_conditions_found_plural")
            : "";
        }
        results.innerHTML = items
          .map(function (c, i) {
            var checked = pick === i ? " checked" : "";
            return (
              '<label class="crm-ic-option' +
              (pick === i ? " crm-ic-option-selected" : "") +
              '">' +
              '<input type="radio" name="crm-mi-cond-pick" data-idx="' +
              i +
              '"' +
              checked +
              " /> " +
              '<span class="crm-ic-option-body">' +
              esc(c.name) +
              "</span></label>"
            );
          })
          .join("");
        results.querySelectorAll('input[name="crm-mi-cond-pick"]').forEach(function (inp) {
          inp.addEventListener("change", function () {
            pick = parseInt(inp.getAttribute("data-idx"), 10);
            results.querySelectorAll(".crm-ic-option").forEach(function (lab, li) {
              lab.classList.toggle("crm-ic-option-selected", li === pick);
            });
            setAddEnabled();
          });
        });
        setAddEnabled();
      }

      var doSearch = debounce(function () {
        var q = (searchIn && searchIn.value.trim()) || "";
        if (q.length < 2) {
          items = [];
          showEmptyPrompt();
          return;
        }
        if (results) results.innerHTML = '<div class="crm-ic-empty">' + esc(t("med_searching")) + "</div>";
        if (countEl) countEl.textContent = "";
        pick = null;
        setAddEnabled();
        api(searchUrl("conditions", { q: q }))
          .then(function (data) {
            items = data.items || [];
            resultCount = data.result_count != null ? data.result_count : items.length;
            renderConditionResults();
          })
          .catch(function () {
            items = [];
            if (results) results.innerHTML = '<p class="mi-error">' + esc(t("med_search_failed")) + "</p>";
            if (countEl) countEl.textContent = "";
            pick = null;
            setAddEnabled();
          });
      }, 400);

      if (searchIn) searchIn.addEventListener("input", doSearch);
      root.querySelectorAll('[data-close="crm-mi-modal-condition"]').forEach(function (el) {
        el.addEventListener("click", function () {
          if (searchIn) searchIn.value = "";
          items = [];
          pick = null;
          showEmptyPrompt();
        });
      });
      showEmptyPrompt();

      if (addBtn) {
        addBtn.addEventListener("click", function () {
          if (addBtn.disabled || pick == null) return;
          var c = items[pick];
          if (
            c &&
            !ms.state.conditions.some(function (x) {
              return x.icd10_code === c.icd10_code && x.name === c.name;
            })
          ) {
            ms.state.conditions.push(c);
          }
          renderLists(ms, root);
          closeModal("crm-mi-modal-condition");
          if (searchIn) searchIn.value = "";
          items = [];
          pick = null;
          showEmptyPrompt();
        });
      }
    })();
  }

  function wireHealthEdit(ms, root) {
    root.querySelectorAll("[data-gender]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        ms.state.healthInfo.gender = btn.getAttribute("data-gender");
        root.querySelectorAll("[data-gender]").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
      });
    });
    root.querySelectorAll("[data-tobacco]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        ms.state.healthInfo.tobaccoUse = btn.getAttribute("data-tobacco") === "yes";
        root.querySelectorAll("[data-tobacco]").forEach(function (b) {
          b.classList.toggle("active", b === btn);
        });
      });
    });
    var dob = $("crm-mi-birthdate", root);
    if (dob) {
      dob.addEventListener("change", function () {
        ms.state.healthInfo.birthdate = dob.value;
        var ageEl = $("crm-mi-age-display", root);
        if (ageEl) ageEl.textContent = calcAge(dob.value);
      });
    }
    ["crm-mi-height-ft", "crm-mi-height-in", "crm-mi-weight"].forEach(function (id) {
      var el = $(id, root);
      if (!el) return;
      el.addEventListener("input", function () {
        if (id === "crm-mi-height-ft") ms.state.healthInfo.heightFt = parseInt(el.value, 10) || null;
        else if (id === "crm-mi-height-in") ms.state.healthInfo.heightIn = parseInt(el.value, 10) || null;
        else ms.state.healthInfo.weightLbs = parseInt(el.value, 10) || null;
      });
    });
  }

  function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
  }

  function paint(ms) {
    var root = ms.root;
    var inner = $("crm-med-inner", root);
    if (!inner) return;
    inner.innerHTML =
      (ms.bannerHtml || "") +
      (ms.editing ? renderEditHtml(ms) : renderViewHtml(ms)) +
      (ms.editing ? modalsHtml() : "");
    renderLists(ms, inner);
    if (ms.editing) {
      wireHealthEdit(ms, inner);
      wireModals(ms, inner);
      var cancelBtn = $("crm-med-cancel-btn", inner);
      var saveBtn = $("crm-med-save-btn", inner);
      if (cancelBtn) {
        cancelBtn.addEventListener("click", function () {
          ms.state = cloneState(ms.savedSnapshot);
          ms.editing = false;
          paint(ms);
        });
      }
      if (saveBtn) {
        saveBtn.addEventListener("click", function () {
          saveProfile(ms);
        });
      }
    } else {
      var editBtn = $("crm-med-edit-btn", inner);
      if (editBtn) {
        editBtn.addEventListener("click", function () {
          ms.savedSnapshot = cloneState(ms.state);
          ms.editing = true;
          paint(ms);
        });
      }
      inner.querySelectorAll(".mi-section-head").forEach(function (head) {
        head.addEventListener("click", function () {
          head.parentElement.classList.toggle("open");
        });
      });
    }
  }

  async function saveProfile(ms) {
    var status = $("crm-med-save-status", ms.root);
    var hi = ms.state.healthInfo;
    if (!hi.gender || !hi.birthdate) {
      if (status) {
        status.textContent = "Gender and birthdate are required.";
        status.className = "crm-med-status err";
      }
      return;
    }
    if (status) {
      status.textContent = "Saving…";
      status.className = "crm-med-status";
    }
    try {
      var data = await apiPut("/api/staff/medical-profile", {
        lead_id: ms.leadId,
        lead_source_table: ms.leadSourceTable,
        healthInfo: hi,
        providers: ms.state.providers,
        prescriptions: ms.state.prescriptions,
        pharmacies: ms.state.pharmacies,
        conditions: ms.state.conditions,
      });
      if (data.intake) {
        ms.state = {
          healthInfo: data.intake.healthInfo,
          providers: data.intake.providers || [],
          prescriptions: data.intake.prescriptions || [],
          pharmacies: data.intake.pharmacies || [],
          conditions: data.intake.conditions || [],
        };
      }
      ms.savedSnapshot = cloneState(ms.state);
      ms.hasSavedProfile = true;
      ms.editing = false;
      paint(ms);
      if (status) {
        status.textContent = t("med_saved");
        status.className = "crm-med-status ok";
      }
    } catch (e) {
      if (status) {
        status.textContent = e.message || t("med_save_failed");
        status.className = "crm-med-status err";
      }
    }
  }

  async function mount(rootEl, opts) {
    if (!rootEl) return;
    rootEl.innerHTML = '<p class="crm-empty-state">' + esc(t("med_loading")) + "</p>";
    var leadId = opts.leadId;
    var detail = opts.detail || {};
    var leadSourceTable = detail.source_table || "manychat_leads";

    try {
      var data = await api(
        "/api/staff/medical-profile?lead_id=" +
          encodeURIComponent(leadId) +
          "&lead_source_table=" +
          encodeURIComponent(leadSourceTable)
      );

      if (!data.can_access_phi) {
        rootEl.innerHTML =
          '<div class="crm-placeholder"><strong>' +
          esc(t("med_phi_restricted")) +
          "</strong><p>" +
          esc(t("med_phi_note")) +
          "</p></div>";
        return;
      }

      var intake = data.intake || emptyState();
      var ms = {
        root: rootEl,
        leadId: leadId,
        leadSourceTable: leadSourceTable,
        editing: !data.has_saved_profile,
        hasSavedProfile: !!data.has_saved_profile,
        clientSubmitted: !!(data.submissions && data.submissions.length),
        state: {
          healthInfo: Object.assign(emptyState().healthInfo, intake.healthInfo || {}),
          providers: intake.providers || [],
          prescriptions: intake.prescriptions || [],
          pharmacies: intake.pharmacies || [],
          conditions: intake.conditions || [],
        },
        savedSnapshot: null,
        bannerHtml: "",
      };

      /* Seed from lead profile if medical empty */
      if (!ms.state.healthInfo.birthdate && detail.profile_ext && detail.profile_ext.date_of_birth) {
        ms.state.healthInfo.birthdate = detail.profile_ext.date_of_birth;
      }
      if (!ms.state.healthInfo.gender && (detail.profile_ext && detail.profile_ext.gender)) {
        ms.state.healthInfo.gender = detail.profile_ext.gender;
      } else if (!ms.state.healthInfo.gender && detail.gender) {
        ms.state.healthInfo.gender = detail.gender;
      }

      ms.savedSnapshot = cloneState(ms.state);

      if (!ms.clientSubmitted) {
        ms.bannerHtml =
          '<div class="crm-med-banner">' +
          esc(t("med_banner_pending")) +
          " " +
          '<a href="#" id="crm-med-send-link">' +
          esc(t("med_banner_send")) +
          "</a> " +
          esc(t("med_banner_when_ready")) +
          "</div>";
      } else {
        var sub = data.submissions[0];
        ms.bannerHtml =
          '<div class="crm-med-banner" style="background:#eef8f0;border-color:#b8e6c8;color:#1a5c32">' +
          esc(t("med_banner_submitted")) +
          (sub && sub.submitted_at
            ? " · " + new Date(sub.submitted_at).toLocaleString()
            : "") +
          ".</div>";
      }

      rootEl.innerHTML = '<div class="crm-med-wrap"><div id="crm-med-inner"></div></div>';
      ms.root = rootEl;
      paint(ms);

      var sendLink = document.getElementById("crm-med-send-link");
      if (sendLink && window.StaffCrm) {
        sendLink.addEventListener("click", function (e) {
          e.preventDefault();
          window.StaffCrm.navigate("#/clients/" + encodeURIComponent(leadId) + "/connect");
        });
      }

      mountState = ms;
    } catch (e) {
      rootEl.innerHTML =
        '<div class="crm-placeholder"><strong>' +
        esc(t("med_load_error")) +
        "</strong><p>" +
        esc(e.message || "Error") +
        "</p></div>";
    }
  }

  window.StaffCrmMedical = { mount: mount };
})();
