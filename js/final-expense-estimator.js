(function () {
  var DATA = window.MVI_FE_ESTIMATOR_DATA;
  if (!DATA) return;

  var root = document.getElementById("fe-estimator-app");
  if (!root) return;

  var introWelcome = document.getElementById("fe-intro-welcome");
  var introContext = document.getElementById("fe-intro-context");
  var introSection = document.getElementById("fe-estimator-intro-section");

  var lang = document.documentElement.classList.contains("lang-en") ? "en" : "es";
  var step = 1;
  var stateCode = DATA.defaultState || "NE";
  var ceremony = null;
  var tierId = "basic";
  var lineSelections = {};
  var family = { monthly: 0, months: 1, other: 0 };

  function t(en, es) {
    return lang === "en" ? en : es;
  }

  function money(n) {
    return "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function lineInfo(id) {
    return (DATA.lineInfo && DATA.lineInfo[id]) || null;
  }

  function scaledBurialFuneralHomeBreakdown(total) {
    var st = stateConfig();
    var fo = st && st.funeralocity && st.funeralocity.burialBreakdown;
    var tmpl = DATA.lineInfo && DATA.lineInfo.funeralHomeBurialBreakdown;
    if (!tmpl || !tmpl.length) return [];

    // Prefer live Funeralocity component averages for the selected state.
    if (fo) {
      var foRows = [];
      tmpl.forEach(function (row) {
        var key = row.key;
        if (!key || fo[key] == null) return;
        foRows.push({
          label: lang === "en" ? row.labelEn : row.labelEs,
          amount: Math.round(fo[key] || 0),
        });
      });
      if (foRows.length) return foRows;
    }

    var baseSum = tmpl.reduce(function (s, row) {
      return s + row.amount;
    }, 0);
    if (!baseSum) return [];
    var rows = [];
    var running = 0;
    tmpl.forEach(function (row, i) {
      var amt;
      if (i === tmpl.length - 1) {
        amt = total - running;
      } else {
        amt = Math.round((row.amount * total) / baseSum);
        running += amt;
      }
      rows.push({
        label: lang === "en" ? row.labelEn : row.labelEs,
        amount: amt,
      });
    });
    return rows;
  }

  function renderInfoPopover(innerHtml, popoverId) {
    return (
      '<span class="fe-info-wrap">' +
      '<button type="button" class="fe-info-btn" aria-label="' +
      escapeHtml(t("More information", "Más información")) +
      '" aria-expanded="false" aria-controls="' +
      popoverId +
      '">' +
      '<i class="fas fa-circle-info" aria-hidden="true"></i>' +
      "</button>" +
      '<div class="fe-info-popover" id="' +
      popoverId +
      '" role="tooltip" hidden>' +
      innerHtml +
      "</div></span>"
    );
  }

  function infoPopoverHtmlForLine(lineId) {
    var info = lineInfo(lineId);
    if (!info || !info.infoEn) return "";
    var text = lang === "en" ? info.infoEn : info.infoEs;
    return '<p class="fe-info-popover-text">' + escapeHtml(text) + "</p>";
  }

  function infoPopoverHtmlFuneralHome(total) {
    if (ceremony === "burial") {
      var rows = scaledBurialFuneralHomeBreakdown(total);
      if (!rows.length) return infoPopoverHtmlForLine("funeralHomeCremation");
      var html = '<ul class="fe-info-breakdown">';
      rows.forEach(function (row) {
        html +=
          "<li><span>" +
          escapeHtml(row.label) +
          '</span><span class="fe-info-breakdown-amt">' +
          money(row.amount) +
          "</span></li>";
      });
      html += "</ul>";
      return html;
    }
    var crem = lineInfo("funeralHomeCremation");
    if (!crem) return "";
    var text = lang === "en" ? crem.infoEn : crem.infoEs;
    return '<p class="fe-info-popover-text">' + escapeHtml(text) + "</p>";
  }

  var infoPopoverCounter = 0;

  function nextPopoverId(prefix) {
    infoPopoverCounter += 1;
    return prefix + "-" + infoPopoverCounter;
  }

  function stateConfig() {
    return DATA.states[stateCode] || DATA.states[DATA.defaultState];
  }

  function ceremonyLines() {
    return ceremony === "cremation" ? DATA.cremationLines : DATA.burialLines;
  }

  function tierConfig() {
    var tiers = DATA.tiers || [];
    for (var i = 0; i < tiers.length; i++) {
      if (tiers[i].id === tierId) return tiers[i];
    }
    return tiers[0] || { id: "basic", optionIndex: 0, labelEn: "Basic", labelEs: "Básico" };
  }

  function burialFuneralHomeTotal(st) {
    if (!st || !st.burial) return 0;
    // Funeralocity traditional burial service components only.
    // Merchandise / cemetery lines are selected separately and must not be re-added here.
    if (st.burial.funeralHome) return st.burial.funeralHome;
    var sum = 0;
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
    if (!st || !ceremony) return null;
    var funeralHome =
      ceremony === "burial" ? burialFuneralHomeTotal(st) : cremationFuneralHomeTotal(st);
    return {
      funeralHome: funeralHome,
      lines: ceremonyLines(),
    };
  }

  function stateLineAmount(line) {
    var st = stateConfig();
    if (!st || line.type !== "stateAmount" || !line.stateKey) return 0;
    var bucket = ceremony === "burial" ? st.burial : st.cremation;
    if (!bucket) return 0;
    return bucket[line.stateKey] || 0;
  }

  function tierAmountOptions(amounts) {
    var notDesired = DATA.notDesiredOption || { labelEn: "Not Desired", labelEs: "No deseado", amount: 0 };
    return [
      {
        labelEn: "$" + amounts[0].toLocaleString("en-US"),
        labelEs: "$" + amounts[0].toLocaleString("en-US"),
        amount: amounts[0],
      },
      {
        labelEn: "$" + amounts[1].toLocaleString("en-US"),
        labelEs: "$" + amounts[1].toLocaleString("en-US"),
        amount: amounts[1],
      },
      {
        labelEn: "$" + amounts[2].toLocaleString("en-US"),
        labelEs: "$" + amounts[2].toLocaleString("en-US"),
        amount: amounts[2],
      },
      notDesired,
    ];
  }

  function cemeteryOptionsForState() {
    return tierAmountOptions(DATA.cemeteryTierAmounts || [1500, 2500, 3500]);
  }

  function openingOptionsForState() {
    return tierAmountOptions(DATA.openingTierAmounts || [1500, 2500, 3500]);
  }

  function lineOptions(line) {
    if (line.type === "cemeteryTier") return cemeteryOptionsForState();
    if (line.type === "openingTier") return openingOptionsForState();
    return line.options || [];
  }

  function lineAmount(line) {
    if (line.type === "fixed") return line.amount || 0;
    if (line.type === "stateAmount") return stateLineAmount(line);
    if (line.type === "select" || line.type === "cemeteryTier" || line.type === "openingTier") {
      var opts = lineOptions(line);
      var idx = lineSelections[line.id];
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
    var next = defaultLineSelections(ceremony, optionIndex);
    Object.keys(next).forEach(function (id) {
      lineSelections[id] = next[id];
    });
  }

  function funeralSubtotal() {
    var cfg = ceremonyConfig();
    if (!cfg) return 0;
    var sum = cfg.funeralHome || 0;
    cfg.lines.forEach(function (line) {
      if (line.type === "fixed") sum += line.amount;
      else if (line.type === "stateAmount") sum += stateLineAmount(line);
      else if (
        line.type === "select" ||
        line.type === "cemeteryTier" ||
        line.type === "openingTier"
      ) {
        sum += lineAmount(line);
      }
    });
    return sum;
  }

  function familySubtotal() {
    var m = Math.max(0, parseFloat(family.monthly) || 0);
    var mo = parseInt(family.months, 10) || 1;
    var o = Math.max(0, parseFloat(family.other) || 0);
    return m * mo + o;
  }

  function grandTotal() {
    return funeralSubtotal() + familySubtotal();
  }

  function stateDisplayName() {
    var st = stateConfig();
    if (!st) return stateCode;
    return lang === "en" ? st.nameEn + " (" + st.code + ")" : st.nameEs + " (" + st.code + ")";
  }

  function tierDisplayName() {
    var tier = tierConfig();
    return lang === "en" ? tier.labelEn : tier.labelEs;
  }

  function saveProgress() {
    try {
      localStorage.setItem(
        DATA.storageKey,
        JSON.stringify({
          step: step,
          stateCode: stateCode,
          ceremony: ceremony,
          tierId: tierId,
          lineSelections: lineSelections,
          family: family,
          savedAt: new Date().toISOString(),
        })
      );
    } catch (e) {}
  }

  function loadProgress() {
    try {
      var raw = localStorage.getItem(DATA.storageKey);
      if (!raw) return false;
      var j = JSON.parse(raw);
      if (!j || !j.ceremony) return false;
      step = Math.min(5, Math.max(1, j.step || 1));
      stateCode = j.stateCode && DATA.states[j.stateCode] ? j.stateCode : DATA.defaultState;
      ceremony = j.ceremony;
      tierId = j.tierId || "basic";
      lineSelections = j.lineSelections || defaultLineSelections(ceremony);
      family = j.family || { monthly: 0, months: 1, other: 0 };
      return true;
    } catch (e) {
      return false;
    }
  }

  function clearProgress() {
    try {
      localStorage.removeItem(DATA.storageKey);
    } catch (e) {}
    step = 1;
    stateCode = DATA.defaultState || "NE";
    ceremony = null;
    tierId = "basic";
    lineSelections = {};
    family = { monthly: 0, months: 1, other: 0 };
    render();
  }

  function scrollStepIntoView() {
    var target =
      document.getElementById("fe-estimator-app-wrap") ||
      document.querySelector(".mvi-quote-wizard-wrap");
    if (!target) return;
    var headerOffset = window.matchMedia("(min-width: 992px)").matches ? 148 : 96;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function fireFeAnalytics(eventName, stepName) {
    var payload = {
      step_name: stepName,
      form_source: "fe_calculator",
      state: stateCode,
      answer: stateCode,
    };
    if (typeof gtag === "function") {
      gtag("event", eventName, payload);
    } else if (window.MVIFunnelTrack && typeof window.MVIFunnelTrack.mirrorGa4 === "function") {
      window.MVIFunnelTrack.mirrorGa4(eventName, payload, { activeFlow: "calculator" });
    }
  }

  function trackFeStepCompleted(stepNum) {
    var stepMap = {
      1: "calc_state",
      2: "calc_ceremony",
      3: "calc_funeral_costs",
      4: "calc_household",
    };
    var stepName = stepMap[stepNum];
    if (!stepName) return;
    fireFeAnalytics("step_completed", stepName);
  }

  function trackFeResultsViewed() {
    fireFeAnalytics("step_viewed", "calc_results");
  }

  function goToStep(n) {
    var prev = step;
    if (n > prev && prev >= 1 && prev <= 4) {
      trackFeStepCompleted(prev);
    }
    step = n;
    if (n === 5 && prev !== 5) {
      trackFeResultsViewed();
    }
    saveProgress();
    render();
    requestAnimationFrame(function () {
      requestAnimationFrame(scrollStepIntoView);
    });
  }

  function renderIntroWelcomeHtml() {
    if (step === 1) {
      return (
        '<p class="fe-intro-hook" data-lang="es">¿Cuánto podrían costarle tus gastos finales a tu familia?</p>' +
        '<p class="fe-intro-hook-sub" data-lang="es">Descúbrelo en menos de 60 segundos.</p>' +
        '<p class="fe-intro-hook" data-lang="en">How much could your final expenses cost your family?</p>' +
        '<p class="fe-intro-hook-sub" data-lang="en">Find out in less than 60 seconds.</p>'
      );
    }
    if (step === 2) {
      return (
        '<p class="fe-intro-hook" data-lang="es">¿Qué tipo de ceremonia prefieres?</p>' +
        '<p class="fe-intro-hook-sub" data-lang="es">Esto nos ayuda a estimar costos aproximados.</p>' +
        '<p class="fe-intro-hook" data-lang="en">What type of ceremony do you prefer?</p>' +
        '<p class="fe-intro-hook-sub" data-lang="en">This helps us estimate approximate costs.</p>'
      );
    }
    if (step === 3) {
      return (
        '<p class="fe-intro-hook" data-lang="es">¿Cuánto podrían costar tus gastos funerarios?</p>' +
        '<p class="fe-intro-hook-sub" data-lang="es">Elige un nivel y ajusta las partidas abajo.</p>' +
        '<p class="fe-intro-hook" data-lang="en">How much could your funeral expenses cost?</p>' +
        '<p class="fe-intro-hook-sub" data-lang="en">Pick a tier and adjust the line items below.</p>'
      );
    }
    if (step === 4) {
      return (
        '<p class="fe-intro-hook" data-lang="es">¿Qué gastos del hogar seguirían para tu familia?</p>' +
        '<p class="fe-intro-hook-sub" data-lang="es">Muchas familias planean al menos 90 días de margen.</p>' +
        '<p class="fe-intro-hook" data-lang="en">What household costs would your family still face?</p>' +
        '<p class="fe-intro-hook-sub" data-lang="en">Many families plan for at least 90 days of breathing room.</p>'
      );
    }
    if (step === 5) {
      return (
        '<p class="fe-intro-hook" data-lang="es">Estimación total de gastos finales</p>' +
        '<p class="fe-intro-hook" data-lang="en">Total final expense estimate</p>'
      );
    }
    return "";
  }

  function updateIntroPanel() {
    if (!introWelcome || !introContext) return;
    var welcomeHtml = renderIntroWelcomeHtml();
    introWelcome.innerHTML = welcomeHtml;
    introWelcome.hidden = !welcomeHtml;
    introContext.hidden = true;
    introContext.innerHTML = "";
    if (introSection) {
      introSection.hidden = !welcomeHtml;
      introSection.classList.remove("fe-intro-has-context");
    }
  }

  function renderFeWizardNav() {
    return (
      '<div class="mvi-quote-wizard-nav fe-wizard-nav" id="fe-wizard-nav">' +
      '<button type="button" id="fe-wizard-prev" hidden>← ' +
      escapeHtml(t("Previous question", "Pregunta anterior")) +
      "</button>" +
      '<button type="button" id="fe-wizard-next">' +
      escapeHtml(t("Continue", "Continuar")) +
      " →</button>" +
      "</div>"
    );
  }

  function renderFeWizardExtras() {
    return (
      '<p class="fe-wizard-start-over text-center mb-0 mt-2" id="fe-wizard-start-over-wrap" hidden>' +
      '<button type="button" id="fe-btn-start-over">' +
      escapeHtml(t("Start Over", "Empezar de nuevo")) +
      "</button></p>"
    );
  }

  function updateFeWizardNav() {
    var prev = document.getElementById("fe-wizard-prev");
    var next = document.getElementById("fe-wizard-next");
    var startWrap = document.getElementById("fe-wizard-start-over-wrap");
    if (prev) prev.hidden = step <= 1;
    if (next) {
      next.hidden = step >= 5;
      next.disabled = step === 2 && !ceremony;
    }
    if (startWrap) startWrap.hidden = step <= 1;
    var nav = document.getElementById("fe-wizard-nav");
    if (nav) nav.style.maxWidth = step >= 3 ? "38rem" : "32rem";
  }

  function handleFeWizardNext() {
    if (step === 1) goToStep(2);
    else if (step === 2) {
      if (!ceremony) return;
      if (!Object.keys(lineSelections).length) {
        lineSelections = defaultLineSelections(ceremony);
      }
      goToStep(3);
    } else if (step === 3) goToStep(4);
    else if (step === 4) goToStep(5);
  }

  function handleFeWizardPrev() {
    if (step > 1) goToStep(step - 1);
  }

  function renderProgressBar() {
    var labels = [
      { en: "State", es: "Estado" },
      { en: "Ceremony", es: "Ceremonia" },
      { en: "Funeral", es: "Funerario" },
      { en: "Family", es: "Familiar" },
      { en: "Total", es: "Total" },
    ];
    var fillPct = Math.min(100, (step / labels.length) * 100);
    var html =
      '<div class="mvi-quote-progress-strip fe-estimator-progress" aria-label="' +
      escapeHtml(t("Estimator progress", "Progreso de la calculadora")) +
      '">';
    html +=
      '<div class="mvi-quote-summary-bar fe-estimator-step-bar" style="--fill-pct:' +
      fillPct +
      '%" role="progressbar" aria-valuenow="' +
      step +
      '" aria-valuemin="1" aria-valuemax="' +
      labels.length +
      '">';
    labels.forEach(function (row, i) {
      var n = i + 1;
      var cls = "mvi-quote-summary-seg";
      if (n <= step) cls += " is-filled";
      if (n === step) cls += " is-current";
      html +=
        '<div class="' +
        cls +
        '"' +
        (n === step ? ' aria-current="step"' : "") +
        "><span>" +
        escapeHtml(lang === "en" ? row.en : row.es) +
        "</span></div>";
    });
    html += "</div></div>";
    return html;
  }

  function orderedStateCodes() {
    var codes = Object.keys(DATA.states);
    var ordered = [];
    if (DATA.states.NE) ordered.push("NE");
    codes.sort();
    codes.forEach(function (code) {
      if (code !== "NE") ordered.push(code);
    });
    return ordered;
  }

  function renderStateOptions() {
    var html = "";
    orderedStateCodes().forEach(function (code) {
      var st = DATA.states[code];
      var label = (lang === "en" ? st.nameEn : st.nameEs) + " (" + code + ")";
      html +=
        '<option value="' +
        code +
        '"' +
        (code === stateCode ? " selected" : "") +
        ">" +
        label +
        "</option>";
    });
    return html;
  }

  function renderStep1() {
    return (
      '<div class="fe-step-panel mvi-quote-step-card is-active" data-step="1">' +
      '<p class="mvi-quote-question">' +
      t("What is your state?", "¿Cuál es tu estado?") +
      "</p>" +
      "<p class=\"fe-step-lead text-center text-body-secondary\">" +
      t(
        "You will see average burial and cremation amounts for that state. Nebraska is pre-selected; choose another state if you are planning elsewhere.",
        "Verás promedios de entierro y cremación para ese estado. Nebraska viene preseleccionado; elige otro estado si planeas fuera de Nebraska."
      ) +
      "</p>" +
      '<div id="fe-state-picker" class="mvi-dob-picker fe-state-picker mx-auto" role="group" aria-label="' +
      t("State", "Estado") +
      '"></div>' +
      "</div>"
    );
  }

  function renderStep2() {
    return (
      '<div class="fe-step-panel mvi-quote-step-card is-active" data-step="2">' +
      '<div class="fe-summary-chips mb-3">' +
      "<span><strong>" +
      t("State", "Estado") +
      ":</strong> " +
      stateDisplayName() +
      ' | <a href="#" class="fe-jump" data-goto="1">' +
      t("Change", "Cambiar") +
      "</a></span>" +
      "</div>" +
      '<div class="mvi-quote-choice-row" role="group" aria-label="' +
      t("Ceremony type", "Tipo de ceremonia") +
      '">' +
      '<button type="button" class="mvi-quote-choice-btn fe-ceremony-option' +
      (ceremony === "burial" ? " is-selected" : "") +
      '" data-ceremony="burial">' +
      t("Burial", "Entierro") +
      "</button>" +
      '<button type="button" class="mvi-quote-choice-btn fe-ceremony-option' +
      (ceremony === "cremation" ? " is-selected" : "") +
      '" data-ceremony="cremation">' +
      t("Cremation", "Cremación") +
      "</button>" +
      "</div>" +
      "</div>"
    );
  }

  function renderTierOptions() {
    return (DATA.tiers || [])
      .map(function (tier) {
        var label = lang === "en" ? tier.labelEn : tier.labelEs;
        return (
          '<option value="' +
          tier.id +
          '"' +
          (tier.id === tierId ? " selected" : "") +
          ">" +
          label +
          "</option>"
        );
      })
      .join("");
  }

  function renderTierGuide() {
    if (ceremony === "cremation") {
      return (
        '<div class="fe-tier-examples">' +
        "<ul class=\"fe-tier-examples-list\">" +
        "<li><strong>" +
        t("Basic", "Básico") +
        ":</strong> " +
        t(
          "A simple urn and modest flowers—leanest cremation merchandise total.",
          "Urna sencilla y flores modestas—el total de mercancía más económico."
        ) +
        "</li>" +
        "<li><strong>" +
        t("Standard", "Estándar") +
        ":</strong> " +
        t(
          "A mid-range urn, nicer flowers, and a moderate memorial gathering.",
          "Urna de rango medio, mejores flores y una reunión conmemorativa moderada."
        ) +
        ' <span class="fe-tier-most">' +
        t("(what many people pick)", "(lo que muchas familias eligen)") +
        "</span></li>" +
        "<li><strong>" +
        t("Premium", "Premium") +
        ":</strong> " +
        t(
          "A higher-end urn, larger flower arrangements, and a bigger reception.",
          "Urna de mayor calidad, arreglos florales más grandes y una recepción más amplia."
        ) +
        "</li>" +
        "</ul></div>"
      );
    }
    return (
      '<div class="fe-tier-examples">' +
      "<ul class=\"fe-tier-examples-list\">" +
      "<li><strong>" +
      t("Basic", "Básico") +
      ":</strong> " +
      t(
        "Modest casket, concrete vault, and simpler flowers or reception—lowest merchandise total.",
        "Ataúd económico, bóveda de concreto y flores o recepción sencillas—el total de mercancía más bajo."
      ) +
      "</li>" +
      "<li><strong>" +
      t("Standard", "Estándar") +
      ":</strong> " +
      t(
        "Mid-range casket and vault, moderate flowers, and a typical family gathering.",
        "Ataúd y bóveda de rango medio, flores moderadas y una reunión familiar habitual."
      ) +
      ' <span class="fe-tier-most">' +
      t("(what many people pick)", "(lo que muchas familias eligen)") +
      "</span></li>" +
      "<li><strong>" +
      t("Premium", "Premium") +
      ":</strong> " +
        t(
          "Higher-end casket and vault, nicer cemetery property, larger flowers, and catering for more guests.",
          "Ataúd y bóveda de mayor nivel, mejor lote en cementerio, flores más grandes y catering para más invitados."
        ) +
        "</li>" +
        "</ul></div>"
    );
  }

  function renderFuneralLines() {
    var cfg = ceremonyConfig();
    if (!cfg) return "";
    var rows = "";
    if (cfg.funeralHome) {
      var fhPopId = nextPopoverId("fe-pop-fh");
      rows +=
        "<tr><td>" +
        t("Funeral Home Expenses", "Gastos de funeraria") +
        " " +
        renderInfoPopover(infoPopoverHtmlFuneralHome(cfg.funeralHome), fhPopId) +
        '</td><td><span class="fe-fixed-amount">' +
        money(cfg.funeralHome) +
        "</span></td></tr>";
    }

    cfg.lines.forEach(function (line) {
      var label = lang === "en" ? line.labelEn : line.labelEs;
      var popId = nextPopoverId("fe-pop");
      var popHtml = infoPopoverHtmlForLine(line.id);
      rows += "<tr><td>" + label + (popHtml ? " " + renderInfoPopover(popHtml, popId) : "") + "</td><td>";
      if (line.type === "fixed" || line.type === "stateAmount") {
        var amt = line.type === "stateAmount" ? stateLineAmount(line) : line.amount;
        rows += '<span class="fe-fixed-amount">' + money(amt) + "</span>";
      } else if (
        line.type === "select" ||
        line.type === "cemeteryTier" ||
        line.type === "openingTier"
      ) {
        var idx = lineSelections[line.id];
        if (idx == null) idx = tierConfig().optionIndex;
        var opts = lineOptions(line);
        rows += '<select class="form-select form-select fe-line-select" data-line-id="' + line.id + '">';
        opts.forEach(function (opt, oi) {
          var ol = lang === "en" ? opt.labelEn : opt.labelEs;
          rows +=
            '<option value="' + oi + '"' + (oi === idx ? " selected" : "") + ">" + ol + "</option>";
        });
        rows += "</select>";
      }
      rows += "</td></tr>";
    });

    rows +=
      '<tr class="fe-subtotal-row"><td class="text-end">' +
      t("Subtotal", "Subtotal") +
      ':</td><td id="fe-funeral-subtotal">' +
      money(funeralSubtotal()) +
      "</td></tr>";
    return rows;
  }

  function renderStep3() {
    var typeLabel = ceremony === "cremation" ? t("Cremation", "Cremación") : t("Burial", "Entierro");
    return (
      '<div class="fe-step-panel mvi-quote-step-card is-active" data-step="3">' +
      '<div class="fe-summary-chips">' +
      "<span><strong>" +
      t("State", "Estado") +
      ":</strong> " +
      stateCode +
      ' | <a href="#" class="fe-jump" data-goto="1">' +
      t("Change", "Cambiar") +
      "</a></span>" +
      "<span><strong>" +
      t("Type", "Tipo") +
      ":</strong> " +
      typeLabel +
      ' | <a href="#" class="fe-jump" data-goto="2">' +
      t("Change", "Cambiar") +
      "</a></span>" +
      "</div>" +
      '<div class="fe-tier-row mb-3">' +
      '<label class="form-label fw-semibold mb-1" for="fe-tier-select">' +
      t("Planning tier", "Nivel de planificación") +
      "</label>" +
      '<select class="form-select" id="fe-tier-select" style="max-width:14rem;">' +
      renderTierOptions() +
      "</select>" +
      renderTierGuide() +
      "</div>" +
      '<table class="fe-line-table"><tbody id="fe-funeral-lines">' +
      renderFuneralLines() +
      "</tbody></table>" +
      "</div>"
    );
  }

  function renderStep4() {
    var monthsOpts = DATA.familyMonthsOptions
      .map(function (m) {
        return (
          '<option value="' +
          m +
          '"' +
          (family.months === m ? " selected" : "") +
          ">" +
          m +
          "</option>"
        );
      })
      .join("");

    return (
      '<div class="fe-step-panel mvi-quote-step-card is-active" data-step="4">' +
      '<table class="fe-line-table"><tbody>' +
      "<tr><td>" +
      t("Monthly Expenses", "Gastos mensuales") +
      " " +
      renderInfoPopover(infoPopoverHtmlForLine("familyMonthly"), nextPopoverId("fe-pop-fam")) +
      '</td><td><div class="fe-family-input"><span>$</span><input type="number" min="0" step="1" class="form-control" id="fe-family-monthly" value="' +
      (family.monthly || 0) +
      "\" /></div></td></tr>" +
      "<tr><td>" +
      t("Number of Months", "Número de meses") +
      "</td><td><select class=\"form-select\" id=\"fe-family-months\" style=\"max-width:8rem;margin-left:auto;\">" +
      monthsOpts +
      "</select></td></tr>" +
      "<tr><td>" +
      t("Other Family Expenses", "Otros gastos familiares") +
      " " +
      renderInfoPopover(infoPopoverHtmlForLine("familyOther"), nextPopoverId("fe-pop-fam")) +
      '</td><td><div class="fe-family-input"><span>$</span><input type="number" min="0" step="1" class="form-control" id="fe-family-other" value="' +
      (family.other || 0) +
      "\" /></div></td></tr>" +
      '<tr class="fe-subtotal-row"><td class="text-end">' +
      t("Subtotal", "Subtotal") +
      ':</td><td id="fe-family-subtotal">' +
      money(familySubtotal()) +
      "</td></tr>" +
      "</tbody></table>" +
      "</div>"
    );
  }

  function renderStep5() {
    return (
      '<div class="fe-step-panel mvi-quote-step-card is-active" data-step="5">' +
      '<div class="fe-summary-chips mb-2">' +
      "<span><strong>" +
      t("State", "Estado") +
      ":</strong> " +
      stateDisplayName() +
      "</span>" +
      "<span><strong>" +
      t("Ceremony", "Ceremonia") +
      ":</strong> " +
      (ceremony === "cremation" ? t("Cremation", "Cremación") : t("Burial", "Entierro")) +
      "</span>" +
      "<span><strong>" +
      t("Tier", "Nivel") +
      ":</strong> " +
      tierDisplayName() +
      "</span>" +
      "</div>" +
      '<div class="fe-total-banner">' +
      t("Total Final Expenses", "Gastos finales totales") +
      "</div>" +
      "<p class=\"fe-help-text text-body-secondary mb-3\">" +
      t(
        "Based on your selections, here is your estimated total final expenses. This is a planning tool — Julie can help you match insurance coverage to your goals.",
        "Según tus selecciones, aquí está tu estimación total de gastos finales. Esta herramienta es para planificación — Julie puede ayudarte a elegir cobertura de seguro según tus metas."
      ) +
      "</p>" +
      '<div class="fe-total-line"><span>' +
      t("Total Funeral Expenses", "Total gastos funerarios") +
      '</span><span class="fe-amount" id="fe-total-funeral">' +
      money(funeralSubtotal()) +
      "</span></div>" +
      '<div class="fe-total-line"><span>' +
      t("Total Family Expenses", "Total gastos familiares") +
      '</span><span class="fe-amount" id="fe-total-family">' +
      money(familySubtotal()) +
      "</span></div>" +
      '<div class="fe-total-line fe-grand"><span>' +
      t("Total Final Expenses", "Gastos finales totales") +
      '</span><span class="fe-amount" id="fe-total-grand">' +
      money(grandTotal()) +
      "</span></div>" +
      '<div class="fe-quote-cta-wrap mt-3">' +
      '<a href="quote.html" class="fe-quote-cta-btn">' +
      escapeHtml(t("See my free quote →", "Ver mi cotización gratis →")) +
      "</a>" +
      '<p class="fe-quote-cta-sub">' +
      escapeHtml(t("Fast • Free • No obligation", "Rápido • Gratis • Sin compromiso")) +
      "</p></div>" +
      '<p class="fe-disclaimer">' +
      t(
        "Estimates are for educational planning only and are not a contract or guaranteed price. Nebraska Department of Insurance producer license #21695431.",
        "Las estimaciones son solo para planificación educativa y no son un contrato ni precio garantizado. Licencia de productor en Nebraska #21695431."
      ) +
      "</p>" +
      "</div>"
    );
  }

  function renderPanels() {
    if (step === 1) return renderStep1();
    if (step === 2) return renderStep2();
    if (step === 3) return renderStep3();
    if (step === 4) return renderStep4();
    return renderStep5();
  }

  function render() {
    infoPopoverCounter = 0;
    updateIntroPanel();
    root.innerHTML =
      renderProgressBar() +
      '<div id="fe-panels">' +
      renderPanels() +
      "</div>" +
      renderFeWizardNav() +
      renderFeWizardExtras();
    bindEvents();
    updateFeWizardNav();
  }

  function refreshFuneralTable() {
    infoPopoverCounter = 0;
    var tbody = document.getElementById("fe-funeral-lines");
    if (tbody) tbody.innerHTML = renderFuneralLines();
    root.querySelectorAll(".fe-line-select").forEach(function (sel) {
      sel.addEventListener("change", onLineSelectChange);
    });
    bindInfoPopovers();
    updateFuneralSubtotalDom();
  }

  function closeAllInfoPopovers() {
    root.querySelectorAll(".fe-info-popover").forEach(function (pop) {
      pop.hidden = true;
    });
    root.querySelectorAll(".fe-info-btn").forEach(function (btn) {
      btn.setAttribute("aria-expanded", "false");
    });
  }

  function bindInfoPopovers() {
    root.querySelectorAll(".fe-info-btn").forEach(function (btn) {
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

  function updateFuneralSubtotalDom() {
    var el = document.getElementById("fe-funeral-subtotal");
    if (el) el.textContent = money(funeralSubtotal());
    var tf = document.getElementById("fe-total-funeral");
    var tg = document.getElementById("fe-total-grand");
    var fam = document.getElementById("fe-total-family");
    if (tf) tf.textContent = money(funeralSubtotal());
    if (fam) fam.textContent = money(familySubtotal());
    if (tg) tg.textContent = money(grandTotal());
  }

  function updateFamilySubtotalDom() {
    var el = document.getElementById("fe-family-subtotal");
    if (el) el.textContent = money(familySubtotal());
    updateFuneralSubtotalDom();
  }

  function onLineSelectChange() {
    var sel = this;
    lineSelections[sel.getAttribute("data-line-id")] = parseInt(sel.value, 10);
    updateFuneralSubtotalDom();
    saveProgress();
  }

  var feStatePickerDocBound = false;

  function closeFeStatePickerMenu() {
    var wrap = document.getElementById("fe-state-picker");
    if (!wrap) return;
    wrap.classList.remove("is-open");
    var menu = wrap.querySelector(".mvi-dob-picker-menu");
    var btn = wrap.querySelector(".mvi-dob-picker-btn");
    if (menu) menu.hidden = true;
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function initFeStatePicker() {
    var wrap = document.getElementById("fe-state-picker");
    if (!wrap || wrap.dataset.ready === "1") return;

    var options = [];
    orderedStateCodes().forEach(function (code) {
      var st = DATA.states[code];
      options.push({
        value: code,
        label: (lang === "en" ? st.nameEn : st.nameEs) + " (" + code + ")",
      });
    });

    var hidden = document.createElement("input");
    hidden.type = "hidden";
    hidden.id = "fe-state-select";
    hidden.value = stateCode;

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mvi-dob-picker-btn form-select form-select-lg";
    btn.setAttribute("aria-haspopup", "listbox");
    btn.setAttribute("aria-expanded", "false");

    var labelSpan = document.createElement("span");
    labelSpan.className = "mvi-dob-picker-label";
    btn.appendChild(labelSpan);

    var menu = document.createElement("ul");
    menu.className = "mvi-dob-picker-menu";
    menu.setAttribute("role", "listbox");
    menu.hidden = true;

    options.forEach(function (opt) {
      var li = document.createElement("li");
      li.setAttribute("role", "option");
      li.setAttribute("data-value", opt.value);
      li.textContent = opt.label;
      menu.appendChild(li);
    });

    function syncLabel() {
      var match = options.find(function (o) {
        return o.value === hidden.value;
      });
      labelSpan.textContent = match ? match.label : options[0].label;
      menu.querySelectorAll('[role="option"]').forEach(function (li) {
        var selected = li.getAttribute("data-value") === hidden.value;
        li.classList.toggle("is-selected", selected);
        li.setAttribute("aria-selected", selected ? "true" : "false");
      });
    }

    syncLabel();

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      var willOpen = menu.hidden;
      closeFeStatePickerMenu();
      if (willOpen) {
        menu.hidden = false;
        wrap.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });

    menu.addEventListener("click", function (e) {
      var li = e.target.closest('[role="option"]');
      if (!li) return;
      hidden.value = li.getAttribute("data-value") || stateCode;
      stateCode = hidden.value;
      if (window.MVIFunnelTrack && typeof window.MVIFunnelTrack.setSelectedState === "function") {
        window.MVIFunnelTrack.setSelectedState(stateCode);
      }
      syncLabel();
      closeFeStatePickerMenu();
      if (step === 3 && ceremony) refreshFuneralTable();
      saveProgress();
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);
    wrap.appendChild(hidden);
    wrap.dataset.ready = "1";

    if (!feStatePickerDocBound) {
      feStatePickerDocBound = true;
      document.addEventListener("click", closeFeStatePickerMenu);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeFeStatePickerMenu();
      });
    }
  }

  function bindEvents() {
    initFeStatePicker();

    var prevBtn = document.getElementById("fe-wizard-prev");
    var nextBtn = document.getElementById("fe-wizard-next");
    if (prevBtn) prevBtn.addEventListener("click", handleFeWizardPrev);
    if (nextBtn) nextBtn.addEventListener("click", handleFeWizardNext);

    root.querySelectorAll(".fe-ceremony-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        ceremony = btn.getAttribute("data-ceremony");
        lineSelections = defaultLineSelections(ceremony);
        root.querySelectorAll(".fe-ceremony-option").forEach(function (b) {
          b.classList.toggle("is-selected", b === btn);
        });
        updateFeWizardNav();
        saveProgress();
      });
    });

    var tierSel = document.getElementById("fe-tier-select");
    if (tierSel) {
      tierSel.addEventListener("change", function () {
        tierId = tierSel.value;
        var tier = tierConfig();
        applyTier(tier.optionIndex);
        refreshFuneralTable();
        saveProgress();
      });
    }

    root.querySelectorAll(".fe-line-select").forEach(function (sel) {
      sel.addEventListener("change", onLineSelectChange);
    });

    var monthly = document.getElementById("fe-family-monthly");
    var months = document.getElementById("fe-family-months");
    var other = document.getElementById("fe-family-other");
    function syncFamily() {
      family.monthly = monthly ? monthly.value : 0;
      family.months = months ? parseInt(months.value, 10) : 1;
      family.other = other ? other.value : 0;
      updateFamilySubtotalDom();
      saveProgress();
    }
    if (monthly) monthly.addEventListener("input", syncFamily);
    if (months) months.addEventListener("change", syncFamily);
    if (other) other.addEventListener("input", syncFamily);

    root.querySelectorAll(".fe-jump").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        goToStep(parseInt(a.getAttribute("data-goto"), 10));
      });
    });

    var startOver = document.getElementById("fe-btn-start-over");
    if (startOver) {
      startOver.addEventListener("click", function () {
        if (
          confirm(
            t("Start over and clear your saved estimate?", "¿Empezar de nuevo y borrar tu estimación guardada?")
          )
        ) {
          clearProgress();
        }
      });
    }

    bindInfoPopovers();

    if (!root._feInfoOutsideBound) {
      root._feInfoOutsideBound = true;
      document.addEventListener("click", function (e) {
        if (!root.contains(e.target)) closeAllInfoPopovers();
        else if (!e.target.closest(".fe-info-wrap")) closeAllInfoPopovers();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape") closeAllInfoPopovers();
      });
    }
  }

  document.addEventListener("language-changed", function () {
    lang = document.documentElement.classList.contains("lang-en") ? "en" : "es";
    var picker = document.getElementById("fe-state-picker");
    if (picker) picker.dataset.ready = "";
    render();
  });

  render();
})();
