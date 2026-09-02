/**
 * Final expense calculator — inline on gastos-finales-ads-v2 landing (lf-* UI).
 * Uses MVI_FE_ESTIMATOR_DATA + MVI_FE_STATE_COSTS from the main site calculator.
 */
(function () {
  "use strict";

  var DATA = window.MVI_FE_ESTIMATOR_DATA;
  var LANG =
    String(document.documentElement.lang || "").toLowerCase().indexOf("en") === 0 ||
    document.body.getAttribute("data-lf-lang") === "en"
      ? "en"
      : "es";
  var STORAGE_KEY = "mviLandingFeCalcV1";

  var state = {
    stateCode: (DATA && DATA.defaultState) || "NE",
    ceremony: null,
    tierId: "basic",
    lineSelections: {},
    family: { monthly: 0, months: 3, other: 0 },
  };

  var stateCombobox = null;
  var popoverCounter = 0;

  function t(en, es) {
    return LANG === "en" ? en : es;
  }

  function money(n) {
    return "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function orderedStateCodes() {
    if (!DATA || !DATA.states) return ["NE"];
    var codes = Object.keys(DATA.states);
    var ordered = [];
    if (DATA.states.NE) ordered.push("NE");
    codes.sort();
    codes.forEach(function (code) {
      if (code !== "NE") ordered.push(code);
    });
    return ordered;
  }

  function stateConfig() {
    return (DATA && DATA.states && DATA.states[state.stateCode]) || (DATA && DATA.states[DATA.defaultState]);
  }

  function stateDisplayName() {
    var st = stateConfig();
    if (!st) return state.stateCode;
    return LANG === "en" ? st.nameEn + " (" + st.code + ")" : st.nameEs + " (" + st.code + ")";
  }

  function ceremonyLines() {
    if (!DATA) return [];
    return state.ceremony === "cremation" ? DATA.cremationLines : DATA.burialLines;
  }

  function tierConfig() {
    var tiers = (DATA && DATA.tiers) || [];
    for (var i = 0; i < tiers.length; i++) {
      if (tiers[i].id === state.tierId) return tiers[i];
    }
    return tiers[0] || { id: "basic", optionIndex: 0, labelEn: "Basic", labelEs: "Básico" };
  }

  function tierDisplayName() {
    var tier = tierConfig();
    return LANG === "en" ? tier.labelEn : tier.labelEs;
  }

  function burialFuneralHomeTotal(st) {
    if (!st || !st.burial) return 0;
    var sum = st.burial.funeralHome || 0;
    (DATA.burialStateKeys || []).forEach(function (key) {
      sum += st.burial[key] || 0;
    });
    return sum;
  }

  function cremationFuneralHomeTotal(st) {
    if (!st) return 0;
    if (st.funeralHome && st.funeralHome.cremation) return st.funeralHome.cremation;
    var c = st.cremation || {};
    return (c.cremationPrice || 0) + (c.memorialService || 0);
  }

  function ceremonyConfig() {
    var st = stateConfig();
    if (!st || !state.ceremony) return null;
    return {
      funeralHome:
        state.ceremony === "burial" ? burialFuneralHomeTotal(st) : cremationFuneralHomeTotal(st),
      lines: ceremonyLines(),
    };
  }

  function stateLineAmount(line) {
    var st = stateConfig();
    if (!st || line.type !== "stateAmount" || !line.stateKey) return 0;
    var bucket = state.ceremony === "burial" ? st.burial : st.cremation;
    if (!bucket) return 0;
    return bucket[line.stateKey] || 0;
  }

  function tierAmountOptions(amounts) {
    var notDesired = DATA.notDesiredOption || { labelEn: "Not Desired", labelEs: "No deseado", amount: 0 };
    return amounts.map(function (amt) {
      return {
        labelEn: "$" + amt.toLocaleString("en-US"),
        labelEs: "$" + amt.toLocaleString("en-US"),
        amount: amt,
      };
    }).concat([notDesired]);
  }

  function lineOptions(line) {
    if (line.type === "cemeteryTier") return tierAmountOptions(DATA.cemeteryTierAmounts || [1500, 2500, 3500]);
    if (line.type === "openingTier") return tierAmountOptions(DATA.openingTierAmounts || [1500, 2500, 3500]);
    return line.options || [];
  }

  function lineAmount(line) {
    if (line.type === "fixed") return line.amount || 0;
    if (line.type === "stateAmount") return stateLineAmount(line);
    if (line.type === "select" || line.type === "cemeteryTier" || line.type === "openingTier") {
      var opts = lineOptions(line);
      var idx = state.lineSelections[line.id];
      if (idx == null) idx = tierConfig().optionIndex;
      return (opts[idx] && opts[idx].amount) || 0;
    }
    return 0;
  }

  function defaultLineSelections(type, optionIndex) {
    var lines = type === "cremation" ? DATA.cremationLines : DATA.burialLines;
    var idx = optionIndex != null ? optionIndex : tierConfig().optionIndex;
    var tierIds = (DATA.tierLineIds && DATA.tierLineIds[type]) || [];
    var sel = {};
    lines.forEach(function (line) {
      if (
        (line.type === "select" || line.type === "cemeteryTier" || line.type === "openingTier") &&
        tierIds.indexOf(line.id) >= 0
      ) {
        sel[line.id] = idx;
      }
    });
    return sel;
  }

  function applyTier(optionIndex) {
    var next = defaultLineSelections(state.ceremony, optionIndex);
    Object.keys(next).forEach(function (id) {
      state.lineSelections[id] = next[id];
    });
  }

  function funeralSubtotal() {
    var cfg = ceremonyConfig();
    if (!cfg) return 0;
    var sum = cfg.funeralHome || 0;
    cfg.lines.forEach(function (line) {
      sum += lineAmount(line);
    });
    return sum;
  }

  function familySubtotal() {
    var m = Math.max(0, parseFloat(state.family.monthly) || 0);
    var mo = parseInt(state.family.months, 10) || 1;
    var o = Math.max(0, parseFloat(state.family.other) || 0);
    return m * mo + o;
  }

  function grandTotal() {
    return funeralSubtotal() + familySubtotal();
  }

  function lineInfo(id) {
    return (DATA.lineInfo && DATA.lineInfo[id]) || null;
  }

  function scaledBurialFuneralHomeBreakdown(total) {
    var tmpl = DATA.lineInfo && DATA.lineInfo.funeralHomeBurialBreakdown;
    if (!tmpl || !tmpl.length) return [];
    var baseSum = tmpl.reduce(function (s, row) {
      return s + row.amount;
    }, 0);
    if (!baseSum) return [];
    var rows = [];
    var running = 0;
    tmpl.forEach(function (row, i) {
      var amt;
      if (i === tmpl.length - 1) amt = total - running;
      else {
        amt = Math.round((row.amount * total) / baseSum);
        running += amt;
      }
      rows.push({
        label: LANG === "en" ? row.labelEn : row.labelEs,
        amount: amt,
      });
    });
    return rows;
  }

  function nextPopoverId(prefix) {
    popoverCounter += 1;
    return prefix + "-" + popoverCounter;
  }

  function infoPopoverHtmlForLine(lineId) {
    var info = lineInfo(lineId);
    if (!info || !info.infoEn) return "";
    var text = LANG === "en" ? info.infoEn : info.infoEs;
    return '<p class="lf-info-tip-lead">' + esc(text) + "</p>";
  }

  function infoPopoverHtmlFuneralHome(total) {
    if (state.ceremony === "burial") {
      var rows = scaledBurialFuneralHomeBreakdown(total);
      if (!rows.length) return infoPopoverHtmlForLine("funeralHomeCremation");
      var html = '<ul class="lf-calc-info-breakdown">';
      rows.forEach(function (row) {
        html +=
          "<li><span>" +
          esc(row.label) +
          '</span><span class="lf-calc-info-breakdown-amt">' +
          money(row.amount) +
          "</span></li>";
      });
      html += "</ul>";
      return html;
    }
    return infoPopoverHtmlForLine("funeralHomeCremation");
  }

  function renderInfoPopover(innerHtml, popoverId) {
    return (
      '<span class="lf-info-wrap">' +
      '<button type="button" class="lf-info-btn" aria-label="' +
      esc(t("More information", "Más información")) +
      '" aria-expanded="false" aria-controls="' +
      popoverId +
      '">i</button>' +
      '<div class="lf-info-popover" id="' +
      popoverId +
      '" role="tooltip" hidden>' +
      innerHtml +
      "</div></span>"
    );
  }

  function saveProgress() {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          stateCode: state.stateCode,
          ceremony: state.ceremony,
          tierId: state.tierId,
          lineSelections: state.lineSelections,
          family: state.family,
        })
      );
    } catch (e) {}
  }

  function loadProgress() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      var j = JSON.parse(raw);
      if (!j) return;
      if (j.stateCode && DATA.states[j.stateCode]) state.stateCode = j.stateCode;
      if (j.ceremony) state.ceremony = j.ceremony;
      if (j.tierId) state.tierId = j.tierId;
      if (j.lineSelections) state.lineSelections = j.lineSelections;
      if (j.family) state.family = j.family;
    } catch (e) {}
  }

  function clearProgress() {
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    state.stateCode = (DATA && DATA.defaultState) || "NE";
    state.ceremony = null;
    state.tierId = "basic";
    state.lineSelections = {};
    state.family = { monthly: 0, months: 3, other: 0 };
  }

  function getStateListItems() {
    return orderedStateCodes().map(function (code) {
      var st = DATA.states[code];
      return {
        name: LANG === "en" ? st.nameEn : st.nameEs,
        code: code,
      };
    });
  }

  function stateNameFromCode(code) {
    var items = getStateListItems();
    for (var i = 0; i < items.length; i++) {
      if (items[i].code === code) return items[i].name;
    }
    return "";
  }

  function initStateCombobox() {
    var mount = document.getElementById("lf-calc-state-mount");
    if (!mount || !window.MVILandingSearchCombobox) return;
    if (stateCombobox) {
      stateCombobox.setValue(stateNameFromCode(state.stateCode));
      return;
    }
    stateCombobox = window.MVILandingSearchCombobox.create(mount, {
      items: getStateListItems(),
      value: stateNameFromCode(state.stateCode),
      placeholder: t("Select your state", "Selecciona tu estado"),
      label: t("State", "Estado"),
      inputId: "lf-calc-state-input",
      listboxId: "lf-calc-state-listbox",
      showCode: true,
      onChange: function (name) {
        var code = null;
        var items = getStateListItems();
        for (var i = 0; i < items.length; i++) {
          if (items[i].name === name) {
            code = items[i].code;
            break;
          }
        }
        if (code && DATA.states[code]) {
          state.stateCode = code;
          saveProgress();
          if (window.MVILandingFlow && window.MVILandingFlow.updateNextButton) {
            window.MVILandingFlow.updateNextButton();
          }
        }
      },
    });
  }

  function renderTierGuide() {
    if (state.ceremony === "cremation") {
      return (
        '<ul class="lf-calc-tier-examples">' +
        "<li><strong>" +
        t("Basic", "Básico") +
        ":</strong> " +
        t("Simple urn and modest flowers.", "Urna sencilla y flores modestas.") +
        "</li>" +
        "<li><strong>" +
        t("Standard", "Estándar") +
        ":</strong> " +
        t("Mid-range urn and a moderate memorial.", "Urna de rango medio y reunión conmemorativa moderada.") +
        ' <em class="lf-calc-tier-most">' +
        t("(what many families pick)", "(lo que muchas familias eligen)") +
        "</em></li>" +
        "<li><strong>" +
        t("Premium", "Premium") +
        ":</strong> " +
        t("Higher-end urn and larger flower arrangements.", "Urna de mayor calidad y arreglos florales más grandes.") +
        "</li></ul>"
      );
    }
    return (
      '<ul class="lf-calc-tier-examples">' +
      "<li><strong>" +
      t("Basic", "Básico") +
      ":</strong> " +
      t("Modest casket, concrete vault, and simpler flowers.", "Ataúd económico, bóveda de concreto y flores sencillas.") +
      "</li>" +
      "<li><strong>" +
      t("Standard", "Estándar") +
      ":</strong> " +
      t("Mid-range casket and typical family gathering.", "Ataúd de rango medio y reunión familiar habitual.") +
      ' <em class="lf-calc-tier-most">' +
      t("(what many families pick)", "(lo que muchas familias eligen)") +
      "</em></li>" +
      "<li><strong>" +
      t("Premium", "Premium") +
      ":</strong> " +
      t("Higher-end casket, nicer cemetery property, and catering for more guests.", "Ataúd de mayor nivel, mejor lote en cementerio y catering para más invitados.") +
      "</li></ul>"
    );
  }

  function renderFuneralLinesHtml() {
    var cfg = ceremonyConfig();
    if (!cfg) return "";
    popoverCounter = 0;
    var rows = "";
    if (cfg.funeralHome) {
      var fhPopId = nextPopoverId("lf-calc-fh");
      rows +=
        "<tr><th scope=\"row\">" +
        t("Funeral home expenses", "Gastos de funeraria") +
        " " +
        renderInfoPopover(infoPopoverHtmlFuneralHome(cfg.funeralHome), fhPopId) +
        '</th><td class="lf-calc-amt">' +
        money(cfg.funeralHome) +
        "</td></tr>";
    }
    cfg.lines.forEach(function (line) {
      var label = LANG === "en" ? line.labelEn : line.labelEs;
      var popId = nextPopoverId("lf-calc-pop");
      var popHtml = infoPopoverHtmlForLine(line.id);
      rows += "<tr><th scope=\"row\">" + esc(label) + (popHtml ? " " + renderInfoPopover(popHtml, popId) : "") + "</th><td>";
      if (line.type === "fixed" || line.type === "stateAmount") {
        rows += '<span class="lf-calc-amt">' + money(lineAmount(line)) + "</span>";
      } else {
        var idx = state.lineSelections[line.id];
        if (idx == null) idx = tierConfig().optionIndex;
        var opts = lineOptions(line);
        rows += '<select class="lf-calc-line-select" data-line-id="' + line.id + '">';
        opts.forEach(function (opt, oi) {
          var ol = LANG === "en" ? opt.labelEn : opt.labelEs;
          rows += '<option value="' + oi + '"' + (oi === idx ? " selected" : "") + ">" + esc(ol) + "</option>";
        });
        rows += "</select>";
      }
      rows += "</td></tr>";
    });
    rows +=
      '<tr class="lf-calc-subtotal-row"><th scope="row">' +
      t("Subtotal", "Subtotal") +
      '</th><td class="lf-calc-amt" id="lf-calc-funeral-subtotal">' +
      money(funeralSubtotal()) +
      "</td></tr>";
    return rows;
  }

  function renderSummaryChips() {
    var typeLabel =
      state.ceremony === "cremation" ? t("Cremation", "Cremación") : t("Burial", "Entierro");
    return (
      '<div class="lf-calc-summary-chips">' +
      "<span><strong>" +
      t("State", "Estado") +
      ":</strong> " +
      esc(state.stateCode) +
      "</span>" +
      "<span><strong>" +
      t("Type", "Tipo") +
      ":</strong> " +
      esc(typeLabel) +
      "</span></div>"
    );
  }

  function refreshFuneralTable() {
    var tbody = document.getElementById("lf-calc-funeral-lines");
    if (!tbody) return;
    tbody.innerHTML = renderFuneralLinesHtml();
    bindLineSelects();
    bindInfoPopovers();
  }

  function updateSubtotalsDom() {
    var fs = document.getElementById("lf-calc-funeral-subtotal");
    var fam = document.getElementById("lf-calc-family-subtotal");
    var tf = document.getElementById("lf-calc-total-funeral");
    var ff = document.getElementById("lf-calc-total-family");
    var tg = document.getElementById("lf-calc-total-grand");
    if (fs) fs.textContent = money(funeralSubtotal());
    if (fam) fam.textContent = money(familySubtotal());
    if (tf) tf.textContent = money(funeralSubtotal());
    if (ff) ff.textContent = money(familySubtotal());
    if (tg) tg.textContent = money(grandTotal());
  }

  function closeAllInfoPopovers() {
    document.querySelectorAll(".lf-step--calc .lf-info-popover").forEach(function (pop) {
      pop.hidden = true;
    });
    document.querySelectorAll(".lf-step--calc .lf-info-btn").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
    });
  }

  function bindInfoPopovers() {
    document.querySelectorAll(".lf-step--calc .lf-info-btn").forEach(function (btn) {
      if (btn.getAttribute("data-lf-calc-bound") === "1") return;
      btn.setAttribute("data-lf-calc-bound", "1");
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var popId = btn.getAttribute("aria-controls");
        var pop = popId ? document.getElementById(popId) : null;
        if (!pop) return;
        var wasOpen = !pop.hidden;
        closeAllInfoPopovers();
        if (!wasOpen) {
          pop.hidden = false;
          btn.setAttribute("aria-expanded", "true");
        }
      });
    });
  }

  function bindLineSelects() {
    document.querySelectorAll(".lf-calc-line-select").forEach(function (sel) {
      if (sel.getAttribute("data-lf-calc-bound") === "1") return;
      sel.setAttribute("data-lf-calc-bound", "1");
      sel.addEventListener("change", function () {
        state.lineSelections[sel.getAttribute("data-line-id")] = parseInt(sel.value, 10);
        updateSubtotalsDom();
        saveProgress();
      });
    });
  }

  function bindFamilyInputs() {
    var monthly = document.getElementById("lf-calc-family-monthly");
    var months = document.getElementById("lf-calc-family-months");
    var other = document.getElementById("lf-calc-family-other");
    function sync() {
      state.family.monthly = monthly ? monthly.value : 0;
      state.family.months = months ? parseInt(months.value, 10) : 3;
      state.family.other = other ? other.value : 0;
      updateSubtotalsDom();
      saveProgress();
    }
    if (monthly && monthly.getAttribute("data-lf-calc-bound") !== "1") {
      monthly.setAttribute("data-lf-calc-bound", "1");
      monthly.addEventListener("input", sync);
    }
    if (months && months.getAttribute("data-lf-calc-bound") !== "1") {
      months.setAttribute("data-lf-calc-bound", "1");
      months.addEventListener("change", sync);
    }
    if (other && other.getAttribute("data-lf-calc-bound") !== "1") {
      other.setAttribute("data-lf-calc-bound", "1");
      other.addEventListener("input", sync);
    }
  }

  function bindTierSelect() {
    var tierSel = document.getElementById("lf-calc-tier-select");
    if (!tierSel || tierSel.getAttribute("data-lf-calc-bound") === "1") return;
    tierSel.setAttribute("data-lf-calc-bound", "1");
    tierSel.addEventListener("change", function () {
      state.tierId = tierSel.value;
      applyTier(tierConfig().optionIndex);
      refreshFuneralTable();
      saveProgress();
    });
  }

  function renderTierOptions() {
    return (DATA.tiers || [])
      .map(function (tier) {
        var label = LANG === "en" ? tier.labelEn : tier.labelEs;
        return (
          '<option value="' +
          tier.id +
          '"' +
          (tier.id === state.tierId ? " selected" : "") +
          ">" +
          esc(label) +
          "</option>"
        );
      })
      .join("");
  }

  function refreshCeremonyStep() {
    var step = document.querySelector('.lf-step[data-step="22"]');
    if (!step) return;
    step.querySelectorAll(".lf-option-btn").forEach(function (btn) {
      var on = btn.getAttribute("data-value") === state.ceremony;
      btn.classList.toggle("is-selected", on);
      btn.setAttribute("aria-checked", on ? "true" : "false");
    });
  }

  function refreshFuneralStep() {
    var chips = document.getElementById("lf-calc-funeral-chips");
    if (chips) chips.innerHTML = renderSummaryChips();
    var tierSel = document.getElementById("lf-calc-tier-select");
    if (tierSel) tierSel.innerHTML = renderTierOptions();
    var guideMount = document.getElementById("lf-calc-tier-guide");
    if (guideMount) guideMount.innerHTML = renderTierGuide();
    refreshFuneralTable();
    bindTierSelect();
  }

  function refreshFamilyStep() {
    var monthly = document.getElementById("lf-calc-family-monthly");
    var months = document.getElementById("lf-calc-family-months");
    var other = document.getElementById("lf-calc-family-other");
    if (monthly) monthly.value = state.family.monthly || 0;
    if (months) months.value = String(state.family.months || 3);
    if (other) other.value = state.family.other || 0;
    bindFamilyInputs();
    updateSubtotalsDom();
  }

  function refreshResultsStep() {
    var chips = document.getElementById("lf-calc-results-chips");
    if (chips) {
      chips.innerHTML =
        renderSummaryChips() +
        '<span><strong>' +
        t("Tier", "Nivel") +
        ":</strong> " +
        esc(tierDisplayName()) +
        "</span>";
    }
    updateSubtotalsDom();
  }

  function onEnterStep(stepNum) {
    if (stepNum === 21) initStateCombobox();
    if (stepNum === 22) refreshCeremonyStep();
    if (stepNum === 23) {
      if (!Object.keys(state.lineSelections).length && state.ceremony) {
        state.lineSelections = defaultLineSelections(state.ceremony);
      }
      refreshFuneralStep();
    }
    if (stepNum === 24) refreshFamilyStep();
    if (stepNum === 25) refreshResultsStep();
  }

  function canProceed(stepNum) {
    if (stepNum === 21) return !!state.stateCode && !!DATA.states[state.stateCode];
    if (stepNum === 22) return !!state.ceremony;
    return true;
  }

  function setCeremony(value) {
    state.ceremony = value;
    state.lineSelections = defaultLineSelections(value);
    saveProgress();
    refreshCeremonyStep();
    if (window.MVILandingFlow && window.MVILandingFlow.updateNextButton) {
      window.MVILandingFlow.updateNextButton();
    }
  }

  function getPrefillStateCode() {
    return state.stateCode;
  }

  function init() {
    if (!DATA) return;
    loadProgress();

    document.querySelectorAll('.lf-step[data-step="22"] .lf-option-btn').forEach(function (btn) {
      if (btn.getAttribute("data-lf-calc-bound") === "1") return;
      btn.setAttribute("data-lf-calc-bound", "1");
      btn.addEventListener("click", function () {
        setCeremony(btn.getAttribute("data-value"));
        if (window.MVILandingFlow && window.MVILandingFlow.tryAutoAdvanceCalc) {
          window.MVILandingFlow.tryAutoAdvanceCalc();
        }
      });
    });

    var quoteBtn = document.getElementById("lf-calc-start-quote");
    if (quoteBtn && quoteBtn.getAttribute("data-lf-calc-bound") !== "1") {
      quoteBtn.setAttribute("data-lf-calc-bound", "1");
      quoteBtn.addEventListener("click", function () {
        if (window.MVILandingFlow && window.MVILandingFlow.startQuoteFromCalculator) {
          window.MVILandingFlow.startQuoteFromCalculator(getPrefillStateCode());
        }
      });
    }

    var restartBtn = document.getElementById("lf-calc-start-over");
    if (restartBtn && restartBtn.getAttribute("data-lf-calc-bound") !== "1") {
      restartBtn.setAttribute("data-lf-calc-bound", "1");
      restartBtn.addEventListener("click", function () {
        clearProgress();
        if (window.MVILandingFlow && window.MVILandingFlow.showCalculatorStep) {
          window.MVILandingFlow.showCalculatorStep(21);
        }
      });
    }

    if (!document.body.getAttribute("data-lf-calc-info-bound")) {
      document.body.setAttribute("data-lf-calc-info-bound", "1");
      document.addEventListener("click", function (e) {
        if (!e.target.closest(".lf-step--calc .lf-info-wrap")) closeAllInfoPopovers();
      });
    }
  }

  window.MVILandingCalculator = {
    init: init,
    onEnterStep: onEnterStep,
    canProceed: canProceed,
    clearProgress: clearProgress,
    getPrefillStateCode: getPrefillStateCode,
    CALC_TOTAL_STEPS: 5,
    FIRST_STEP: 21,
    LAST_STEP: 25,
  };
})();
