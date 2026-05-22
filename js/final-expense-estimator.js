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

  function ceremonyConfig() {
    var st = stateConfig();
    if (!st || !ceremony) return null;
    return {
      funeralHome: st.funeralHome[ceremony] || 0,
      lines: ceremonyLines(),
    };
  }

  function defaultLineSelections(type, optionIndex) {
    var lines = type === "cremation" ? DATA.cremationLines : DATA.burialLines;
    var idx = optionIndex != null ? optionIndex : tierConfig().optionIndex;
    var sel = {};
    lines.forEach(function (line) {
      if (line.type === "select") sel[line.id] = idx;
    });
    return sel;
  }

  function applyTier(optionIndex) {
    lineSelections = defaultLineSelections(ceremony, optionIndex);
  }

  function funeralSubtotal() {
    var cfg = ceremonyConfig();
    if (!cfg) return 0;
    var sum = cfg.funeralHome || 0;
    cfg.lines.forEach(function (line) {
      if (line.type === "fixed") sum += line.amount;
      else if (line.type === "select") {
        var idx = lineSelections[line.id];
        if (idx == null) idx = tierConfig().optionIndex;
        var opt = line.options[idx];
        if (opt) sum += opt.amount;
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
      document.getElementById("fe-estimator-intro-section") ||
      document.getElementById("fe-estimator-app-wrap");
    if (!target) return;
    var headerOffset = window.matchMedia("(min-width: 992px)").matches ? 148 : 96;
    var top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  }

  function goToStep(n) {
    step = n;
    saveProgress();
    render();
    requestAnimationFrame(function () {
      requestAnimationFrame(scrollStepIntoView);
    });
  }

  function renderIntroContextHtml() {
    if (step === 2) {
      return (
        "<h1>" +
        escapeHtml(t("Ceremony type", "Tipo de ceremonia")) +
        "</h1>" +
        "<p>" +
        t(
          "Burial and cremation plans use different line items—caskets, vaults, and cemetery costs versus urns and memorial gatherings. Choose the option that best matches what you and your family are planning for. You can change it later and your estimate will update.",
          "Los planes de entierro y cremación usan partidas distintas—ataúd, bóveda y cementerio frente a urna y reunión conmemorativa. Elija la opción que mejor refleje lo que usted y su familia planean. Puede cambiarla después y la estimación se actualizará."
        ) +
        "</p>"
      );
    }
    if (step === 3) {
      var introLead;
      if (ceremony === "cremation") {
        introLead = t(
          "Build your cremation estimate from typical service and merchandise costs in your state. Use Basic, Standard, or Premium as a starting preset, then adjust any line—or mark items as not desired.",
          "Arme su estimación de cremación con costos habituales de servicios y mercancía en su estado. Use Básico, Estándar o Premium como punto de partida y luego ajuste cada rubro, o marque lo que no desea incluir."
        );
      } else if (ceremony === "burial") {
        introLead = t(
          "Build your burial estimate from typical service and merchandise costs in your state. Use Basic, Standard, or Premium as a starting preset, then adjust any line—or mark items as not desired.",
          "Arme su estimación de entierro con costos habituales de servicios y mercancía en su estado. Use Básico, Estándar o Premium como punto de partida y luego ajuste cada rubro, o marque lo que no desea incluir."
        );
      } else {
        introLead = t(
          "Build your funeral or cremation estimate from typical service and merchandise costs in your state. Use Basic, Standard, or Premium as a starting preset, then adjust any line—or mark items as not desired.",
          "Arme su estimación funeraria o de cremación con costos habituales de servicios y mercancía en su estado. Use Básico, Estándar o Premium como punto de partida y luego ajuste cada rubro, o marque lo que no desea incluir."
        );
      }
      return (
        "<h1>" +
        escapeHtml(t("Estimate funeral expenses", "Estimar gastos funerarios")) +
        "</h1>" +
        "<p>" +
        introLead +
        "</p>" +
        "<p>" +
        "<p>" +
        t(
          "Click the information icon next to a line for a short explanation. Amounts are regional planning averages, not a price from a funeral home.",
          "Haga clic en el icono de información junto a cada partida para una breve explicación. Los montos son promedios de planificación regional, no un precio de funeraria."
        ) +
        "</p>"
      );
    }
    if (step === 4) {
      return (
        "<h1>" +
        escapeHtml(t("Estimate family expenses", "Estimar gastos familiares")) +
        "</h1>" +
        "<p>" +
        t(
          "Family expenses are everyday costs that often continue after a death—rent or mortgage, utilities, car payments, credit card balances, medical bills, and similar obligations. Many families plan for at least <strong>90 days</strong> of household costs so loved ones have breathing room while handling arrangements and paperwork.",
          "Los gastos familiares son costos del día a día que muchas veces siguen después de un fallecimiento—renta o hipoteca, servicios, pagos del auto, tarjetas de crédito, facturas médicas y obligaciones similares. Muchas familias planean al menos <strong>90 días</strong> de gastos del hogar para que sus seres queridos tengan margen mientras atienden trámites y arreglos."
        ) +
        "</p>" +
        "<p>" +
        t(
          "Think about which bills would still need to be paid while your family adjusts. You can also add other one-time needs, such as travel or childcare, in the line below.",
          "Piense en qué facturas seguirían pagándose mientras su familia se adapta. También puede sumar otras necesidades puntuales, como viajes o cuidado de niños, en la partida de abajo."
        ) +
        "</p>"
      );
    }
    if (step === 5) {
      return (
        "<h1>" +
        escapeHtml(t("Total final expense estimate", "Estimación total de gastos finales")) +
        "</h1>" +
        "<p>" +
        t(
          "Below is your combined picture: funeral or cremation costs plus the family expense cushion you entered. Use this total as a starting point when you talk with Julie about final expense insurance—many policies are designed to help with both the funeral bill and several months of household bills.",
          "Abajo verá el panorama combinado: gastos funerarios o de cremación más el colchón de gastos familiares que indicó. Use este total como punto de partida al hablar con Julie sobre seguro de gastos finales—muchas pólizas ayudan tanto con la factura funeraria como con varios meses de gastos del hogar."
        ) +
        "</p>" +
        '<p class="text-muted mb-0">' +
        t(
          "This is for educational planning only—not a funeral home quote or insurance offer.",
          "Solo para planificación educativa—no es cotización de funeraria ni oferta de seguro."
        ) +
        "</p>"
      );
    }
    return "";
  }

  function updateIntroPanel() {
    if (!introWelcome || !introContext) return;
    if (step === 1) {
      introWelcome.hidden = false;
      introContext.hidden = true;
      introContext.innerHTML = "";
      if (introSection) introSection.classList.remove("fe-intro-has-context");
      return;
    }
    introWelcome.hidden = true;
    introContext.hidden = false;
    introContext.innerHTML = renderIntroContextHtml();
    if (introSection) introSection.classList.add("fe-intro-has-context");
  }

  function renderProgressBar() {
    var labels = [
      t("Select Your State", "Seleccione su estado"),
      t("Ceremony Type", "Tipo de ceremonia"),
      t("Estimate Funeral Expenses", "Estimar gastos funerarios"),
      t("Estimate Family Expenses", "Estimar gastos familiares"),
      t("Total Estimate", "Estimación total"),
    ];
    var html =
      '<nav class="fe-progress-segments" aria-label="' +
      escapeHtml(t("Estimator progress", "Progreso de la calculadora")) +
      '">';
    labels.forEach(function (label, i) {
      var n = i + 1;
      var cls = "fe-progress-segment";
      if (n < step) cls += " is-done";
      else if (n === step) cls += " is-current";
      else cls += " is-pending";
      html +=
        '<div class="' +
        cls +
        '" data-step="' +
        n +
        '"' +
        (n === step ? ' aria-current="step"' : "") +
        ">" +
        '<span class="fe-progress-segment-label">' +
        escapeHtml(label) +
        "</span></div>";
    });
    html += "</nav>";
    return '<div class="fe-progress-wrap">' + html + "</div>";
  }

  function renderStateOptions() {
    var html = "";
    Object.keys(DATA.states).forEach(function (code) {
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
      '<div class="fe-step-panel is-active" data-step="1">' +
      '<div class="fe-step-form">' +
      "<p class=\"fe-step-lead\">" +
      t(
        "When you select your state, you will see average funeral and cremation planning amounts for that state. Funeral home costs vary by state; merchandise tiers are the same nationwide.",
        "Al seleccionar su estado, verá montos de referencia para funerales y cremación en ese estado. Los honorarios de la funeraria varían por estado; los niveles de mercancía son los mismos en todo el país."
      ) +
      "</p>" +
      '<label class="form-label fw-semibold fe-step-label" for="fe-state-select">' +
      t("State", "Estado") +
      "</label>" +
      '<select class="form-select fe-step-control" id="fe-state-select" aria-label="' +
      t("State", "Estado") +
      '">' +
      renderStateOptions() +
      "</select>" +
      '<p class="fe-step-note">' +
      t(
        "Mejor Vida primarily serves Nebraska. California and Texas are included for comparison.",
        "Mejor Vida atiende principalmente Nebraska. California y Texas están incluidos para comparación."
      ) +
      "</p>" +
      '<div class="fe-step-actions">' +
      '<button type="button" class="fe-btn-primary" id="fe-btn-next-1">' +
      t("Next", "Siguiente") +
      "</button>" +
      "</div></div></div>"
    );
  }

  function renderStep2() {
    return (
      '<div class="fe-step-panel is-active" data-step="2">' +
      '<div class="fe-summary-chips mb-2">' +
      "<span><strong>" +
      t("State", "Estado") +
      ":</strong> " +
      stateDisplayName() +
      ' | <a href="#" class="fe-jump" data-goto="1">' +
      t("Change", "Cambiar") +
      "</a></span>" +
      "</div>" +
      '<div class="fe-step-form">' +
      "<p class=\"fe-step-lead\">" +
      t(
        "Build a custom funeral expense estimate. Select which type of ceremony you prefer.",
        "Arme una estimación personalizada. Seleccione el tipo de ceremonia que prefiere."
      ) +
      "</p>" +
      '<p class="fe-step-label fw-bold">' +
      t("Select A Type", "Seleccione un tipo") +
      "</p>" +
      '<div class="fe-ceremony-grid" role="group" aria-label="' +
      t("Ceremony type", "Tipo de ceremonia") +
      '">' +
      '<button type="button" class="fe-ceremony-option' +
      (ceremony === "burial" ? " is-selected" : "") +
      '" data-ceremony="burial">' +
      t("Burial", "Entierro") +
      "</button>" +
      '<button type="button" class="fe-ceremony-option' +
      (ceremony === "cremation" ? " is-selected" : "") +
      '" data-ceremony="cremation">' +
      t("Cremation", "Cremación") +
      "</button>" +
      "</div>" +
      '<div class="fe-step-actions">' +
      '<button type="button" class="fe-btn-primary" id="fe-btn-next-2" ' +
      (ceremony ? "" : "disabled") +
      ">" +
      t("Next", "Siguiente") +
      "</button>" +
      '<button type="button" class="fe-btn-link" id="fe-btn-start-over">' +
      t("Start Over", "Empezar de nuevo") +
      "</button>" +
      "</div></div></div>"
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
        "<p class=\"fe-tier-examples-intro\">" +
        t(
          "This sets starting prices for the urn, flowers, reception, and similar items. You can change any line below.",
          "Esto define precios iniciales para la urna, flores, recepción y partidas similares. Puede cambiar cualquier rubro abajo."
        ) +
        "</p>" +
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
        "</ul>" +
        "<p class=\"fe-tier-examples-note\">" +
        t(
          "Most families choose Standard for planning. Pick Premium if you want a larger memorial, upgraded urn, or have already talked with family about a fuller service.",
          "La mayoría elige Estándar para planificar. Elija Premium si desea un memorial más grande, una urna mejor o ya habló con su familia sobre un servicio más completo."
        ) +
        "</p></div>"
      );
    }
    return (
      '<div class="fe-tier-examples">' +
      "<p class=\"fe-tier-examples-intro\">" +
      t(
        "This sets starting prices for the casket, vault, cemetery, flowers, and similar items. You can change any line below.",
        "Esto define precios iniciales para el ataúd, bóveda, cementerio, flores y partidas similares. Puede cambiar cualquier rubro abajo."
      ) +
      "</p>" +
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
      "</ul>" +
      "<p class=\"fe-tier-examples-note\">" +
      t(
        "Most families choose Standard for planning. Pick Premium if you want a traditional full-service funeral, upgraded merchandise, or have already shared wishes for a larger ceremony with family.",
        "La mayoría elige Estándar para planificar. Elija Premium si desea un funeral más tradicional y completo, mercancía de mayor nivel o ya compartió con su familia el deseo de una ceremonia más amplia."
      ) +
      "</p></div>"
    );
  }

  function renderFuneralLines() {
    var cfg = ceremonyConfig();
    if (!cfg) return "";
    var rows = "";
    var fhPopId = nextPopoverId("fe-pop-fh");
    rows +=
      "<tr><td>" +
      t("Funeral Home Expenses", "Gastos de funeraria") +
      " " +
      renderInfoPopover(infoPopoverHtmlFuneralHome(cfg.funeralHome), fhPopId) +
      '</td><td><span class="fe-fixed-amount">' +
      money(cfg.funeralHome) +
      "</span></td></tr>";

    cfg.lines.forEach(function (line) {
      var label = lang === "en" ? line.labelEn : line.labelEs;
      var popId = nextPopoverId("fe-pop");
      var popHtml = infoPopoverHtmlForLine(line.id);
      rows += "<tr><td>" + label + (popHtml ? " " + renderInfoPopover(popHtml, popId) : "") + "</td><td>";
      if (line.type === "fixed") {
        rows += '<span class="fe-fixed-amount">' + money(line.amount) + "</span>";
      } else {
        var idx = lineSelections[line.id];
        if (idx == null) idx = tierConfig().optionIndex;
        rows += '<select class="form-select form-select fe-line-select" data-line-id="' + line.id + '">';
        line.options.forEach(function (opt, oi) {
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
      '<div class="fe-step-panel is-active" data-step="3">' +
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
      '<label class="form-label fw-semibold small mb-1" for="fe-tier-select">' +
      t("Planning tier", "Nivel de planificación") +
      "</label>" +
      '<select class="form-select" id="fe-tier-select" style="max-width:14rem;">' +
      renderTierOptions() +
      "</select>" +
      renderTierGuide() +
      "</div>" +
      "<p class=\"fe-help-text text-body-secondary mb-2\">" +
      t(
        "Please complete the items you would like to include in your funeral expense estimate. Click the information icon next to any line for a short description of that expense.",
        "Complete los rubros que desea incluir en su estimación. Haga clic en el icono de información junto a cada partida para ver una breve descripción."
      ) +
      "</p>" +
      "<p class=\"fe-help-text text-body-secondary mb-2\">" +
      t(
        "Adjust merchandise and services to fit your needs. Amounts are planning averages for your selected state, not a final price.",
        "Ajuste mercancía y servicios según sus necesidades. Los montos son promedios de planificación para su estado, no un precio final."
      ) +
      "</p>" +
      '<table class="fe-line-table"><tbody id="fe-funeral-lines">' +
      renderFuneralLines() +
      "</tbody></table>" +
      '<div class="fe-step-nav">' +
      '<button type="button" class="fe-btn-primary" id="fe-btn-next-3">' +
      t("Next", "Siguiente") +
      "</button>" +
      '<button type="button" class="fe-btn-link" id="fe-btn-back-3">' +
      t("Go Back", "Regresar") +
      "</button>" +
      "</div></div>"
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
      '<div class="fe-step-panel is-active" data-step="4">' +
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
      '<div class="fe-step-nav">' +
      '<button type="button" class="fe-btn-primary" id="fe-btn-next-4">' +
      t("Next", "Siguiente") +
      "</button>" +
      '<button type="button" class="fe-btn-link" id="fe-btn-back-4">' +
      t("Go Back", "Regresar") +
      "</button>" +
      "</div></div>"
    );
  }

  function renderStep5() {
    return (
      '<div class="fe-step-panel is-active" data-step="5">' +
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
        "Según sus selecciones, aquí está su estimación total de gastos finales. Esta herramienta es para planificación — Julie puede ayudarle a elegir cobertura de seguro según sus metas."
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
      '<a href="quote.html" class="fe-btn-primary mt-3 d-inline-block text-center text-decoration-none">' +
      t("Get a free insurance quote", "Obtener cotización de seguro gratis") +
      "</a>" +
      '<button type="button" class="fe-btn-link" id="fe-btn-start-over-5">' +
      t("Start Over", "Empezar de nuevo") +
      "</button>" +
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
      "</div>";
    bindEvents();
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

  function bindEvents() {
    var stateSel = document.getElementById("fe-state-select");
    if (stateSel) {
      stateSel.addEventListener("change", function () {
        stateCode = stateSel.value;
        saveProgress();
      });
    }

    var next1 = document.getElementById("fe-btn-next-1");
    if (next1) next1.addEventListener("click", function () { goToStep(2); });

    root.querySelectorAll(".fe-ceremony-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        ceremony = btn.getAttribute("data-ceremony");
        lineSelections = defaultLineSelections(ceremony);
        root.querySelectorAll(".fe-ceremony-option").forEach(function (b) {
          b.classList.toggle("is-selected", b === btn);
        });
        var n2 = document.getElementById("fe-btn-next-2");
        if (n2) n2.disabled = !ceremony;
        saveProgress();
      });
    });

    var next2 = document.getElementById("fe-btn-next-2");
    if (next2) {
      next2.addEventListener("click", function () {
        if (!ceremony) return;
        if (!Object.keys(lineSelections).length) {
          lineSelections = defaultLineSelections(ceremony);
        }
        goToStep(3);
      });
    }

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

    var next3 = document.getElementById("fe-btn-next-3");
    if (next3) next3.addEventListener("click", function () { goToStep(4); });
    var back3 = document.getElementById("fe-btn-back-3");
    if (back3) back3.addEventListener("click", function () { goToStep(2); });

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

    var next4 = document.getElementById("fe-btn-next-4");
    if (next4) next4.addEventListener("click", function () { goToStep(5); });
    var back4 = document.getElementById("fe-btn-back-4");
    if (back4) back4.addEventListener("click", function () { goToStep(3); });

    root.querySelectorAll(".fe-jump").forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        goToStep(parseInt(a.getAttribute("data-goto"), 10));
      });
    });

    root.querySelectorAll("#fe-btn-start-over, #fe-btn-start-over-5").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (
          confirm(
            t("Start over and clear your saved estimate?", "¿Empezar de nuevo y borrar su estimación guardada?")
          )
        ) {
          clearProgress();
        }
      });
    });

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
    render();
  });

  render();
})();
