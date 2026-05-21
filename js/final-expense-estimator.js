(function () {
  var DATA = window.MVI_FE_ESTIMATOR_DATA;
  if (!DATA) return;

  var root = document.getElementById("fe-estimator-app");
  if (!root) return;

  var lang = document.documentElement.classList.contains("lang-en") ? "en" : "es";
  var step = 1;
  var ceremony = null;
  var lineSelections = {};
  var family = { monthly: 0, months: 1, other: 0 };

  function t(en, es) {
    return lang === "en" ? en : es;
  }

  function money(n) {
    return "$" + Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function ceremonyConfig() {
    return ceremony === "cremation" ? DATA.cremation : DATA.burial;
  }

  function defaultLineSelections(type) {
    var cfg = type === "cremation" ? DATA.cremation : DATA.burial;
    var sel = {};
    cfg.lines.forEach(function (line) {
      if (line.type === "select") {
        sel[line.id] = line.defaultIndex != null ? line.defaultIndex : 0;
      }
    });
    return sel;
  }

  function funeralSubtotal() {
    var cfg = ceremonyConfig();
    if (!cfg) return 0;
    var sum = cfg.funeralHome || 0;
    cfg.lines.forEach(function (line) {
      if (line.type === "fixed") sum += line.amount;
      else if (line.type === "select") {
        var idx = lineSelections[line.id];
        if (idx == null) idx = line.defaultIndex || 0;
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

  function saveProgress() {
    try {
      localStorage.setItem(
        DATA.storageKey,
        JSON.stringify({
          step: step,
          ceremony: ceremony,
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
      ceremony = j.ceremony;
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
    ceremony = null;
    lineSelections = {};
    family = { monthly: 0, months: 1, other: 0 };
    render();
  }

  function goToStep(n) {
    step = n;
    saveProgress();
    render();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderStepper() {
    var labels = [
      t("Select Your State", "Seleccione su estado"),
      t("Ceremony Type", "Tipo de ceremonia"),
      t("Estimate Funeral Expenses", "Estimar gastos funerarios"),
      t("Estimate Family Expenses", "Estimar gastos familiares"),
      t("Total Estimate", "Estimación total"),
    ];
    var html = '<div class="fe-stepper" role="list">';
    labels.forEach(function (label, i) {
      var n = i + 1;
      var cls = "fe-stepper-item";
      if (n < step) cls += " is-done";
      if (n === step) cls += " is-active";
      html +=
        '<div class="' +
        cls +
        '" role="listitem"><div class="fe-step-circle"><span class="fe-step-num">' +
        n +
        "</span></div><div>" +
        label +
        "</div></div>";
    });
    html += "</div>";
    return html;
  }

  function renderStep1() {
    return (
      '<div class="fe-step-panel is-active" data-step="1">' +
      "<p class=\"small text-body-secondary mb-3\">" +
      t(
        "Mejor Vida serves Nebraska residents. Select your state to continue with average funeral and cremation planning amounts for Nebraska.",
        "Mejor Vida atiende a residentes de Nebraska. Seleccione su estado para continuar con montos de referencia para funerales y cremación en Nebraska."
      ) +
      "</p>" +
      '<label class="form-label fw-semibold small">' +
      t("State", "Estado") +
      "</label>" +
      '<select class="form-select mb-3" id="fe-state-select" disabled aria-readonly="true">' +
      '<option value="NE" selected>Nebraska (NE)</option>' +
      "</select>" +
      '<button type="button" class="fe-btn-primary" id="fe-btn-next-1">' +
      t("Next", "Siguiente") +
      "</button>" +
      '<button type="button" class="fe-btn-secondary" id="fe-btn-returning">' +
      t("Returning Visitors", "Visitantes que regresan") +
      "</button>" +
      "</div>"
    );
  }

  function renderStep2() {
    return (
      '<div class="fe-step-panel is-active" data-step="2">' +
      "<p class=\"small text-body-secondary mb-3\">" +
      t(
        "Build a custom funeral expense estimate. First, select which type of ceremony you prefer.",
        "Arme una estimación personalizada de gastos funerarios. Primero, seleccione el tipo de ceremonia que prefiere."
      ) +
      "</p>" +
      '<p class="fw-bold mb-2" style="color:#1a365d;">' +
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
      '<button type="button" class="fe-btn-primary mt-3" id="fe-btn-next-2" ' +
      (ceremony ? "" : "disabled") +
      ">" +
      t("Next", "Siguiente") +
      "</button>" +
      '<button type="button" class="fe-btn-link" id="fe-btn-start-over">' +
      t("Start Over", "Empezar de nuevo") +
      "</button>" +
      "</div>"
    );
  }

  function renderFuneralLines() {
    var cfg = ceremonyConfig();
    var rows = "";
    rows +=
      "<tr><td>" +
      t("Funeral Home Expenses", "Gastos de funeraria") +
      ' <i class="fas fa-circle-info fe-info-icon" title="' +
      t("Basic services fee", "Honorarios de servicios básicos") +
      '"></i></td><td><span class="fe-fixed-amount">' +
      money(cfg.funeralHome) +
      "</span></td></tr>";

    cfg.lines.forEach(function (line) {
      var label = lang === "en" ? line.labelEn : line.labelEs;
      rows += "<tr><td>" + label;
      rows += ' <i class="fas fa-circle-info fe-info-icon" title="' + label + '"></i></td><td>';
      if (line.type === "fixed") {
        rows += '<span class="fe-fixed-amount">' + money(line.amount) + "</span>";
      } else {
        var idx = lineSelections[line.id];
        if (idx == null) idx = line.defaultIndex || 0;
        rows += '<select class="form-select form-select-sm fe-line-select" data-line-id="' + line.id + '">';
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
      ":</strong> NE | <a href=\"#\" class=\"fe-jump\" data-goto=\"1\">" +
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
      "<p class=\"small text-body-secondary mb-2\">" +
      t(
        "Adjust merchandise and services to fit your needs. Amounts are Nebraska planning averages, not a final price.",
        "Ajuste mercancía y servicios según sus necesidades. Los montos son promedios de planificación en Nebraska, no un precio final."
      ) +
      "</p>" +
      '<table class="fe-line-table"><tbody id="fe-funeral-lines">' +
      renderFuneralLines() +
      "</tbody></table>" +
      '<button type="button" class="fe-btn-primary mt-3" id="fe-btn-next-3">' +
      t("Next", "Siguiente") +
      "</button>" +
      '<button type="button" class="fe-btn-link" id="fe-btn-back-3">' +
      t("Go Back", "Regresar") +
      "</button>" +
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
      '<div class="fe-step-panel is-active" data-step="4">' +
      "<p class=\"small text-body-secondary mb-3\">" +
      t(
        "Family expenses can include rent, mortgage, car loans, and medical bills. Many families plan for at least 90 days of household costs.",
        "Los gastos familiares pueden incluir renta, hipoteca, préstamos del auto y facturas médicas. Muchas familias planean al menos 90 días de costos del hogar."
      ) +
      "</p>" +
      '<table class="fe-line-table"><tbody>' +
      "<tr><td>" +
      t("Monthly Expenses", "Gastos mensuales") +
      "</td><td><div class=\"fe-family-input\"><span>$</span><input type=\"number\" min=\"0\" step=\"1\" class=\"form-control form-control-sm\" id=\"fe-family-monthly\" value=\"" +
      (family.monthly || 0) +
      "\" /></div></td></tr>" +
      "<tr><td>" +
      t("Number of Months", "Número de meses") +
      "</td><td><select class=\"form-select form-select-sm\" id=\"fe-family-months\" style=\"max-width:8rem;margin-left:auto;\">" +
      monthsOpts +
      "</select></td></tr>" +
      "<tr><td>" +
      t("Other Family Expenses", "Otros gastos familiares") +
      ' <i class="fas fa-circle-info fe-info-icon"></i></td><td><div class="fe-family-input"><span>$</span><input type="number" min="0" step="1" class="form-control form-control-sm" id="fe-family-other" value="' +
      (family.other || 0) +
      "\" /></div></td></tr>" +
      '<tr class="fe-subtotal-row"><td class="text-end">' +
      t("Subtotal", "Subtotal") +
      ':</td><td id="fe-family-subtotal">' +
      money(familySubtotal()) +
      "</td></tr>" +
      "</tbody></table>" +
      '<button type="button" class="fe-btn-primary mt-3" id="fe-btn-next-4">' +
      t("Next", "Siguiente") +
      "</button>" +
      '<button type="button" class="fe-btn-link" id="fe-btn-back-4">' +
      t("Go Back", "Regresar") +
      "</button>" +
      "</div>"
    );
  }

  function renderStep5() {
    return (
      '<div class="fe-step-panel is-active" data-step="5">' +
      '<div class="fe-total-banner">' +
      t("Total Final Expenses", "Gastos finales totales") +
      "</div>" +
      "<p class=\"small text-body-secondary mb-3\">" +
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
      '<a href="quote-screen.html" class="fe-btn-primary mt-3 d-inline-block text-center text-decoration-none">' +
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
    root.innerHTML =
      renderStepper() +
      '<div id="fe-panels">' +
      renderPanels() +
      "</div>";
    bindEvents();
  }

  function updateFuneralSubtotalDom() {
    var el = document.getElementById("fe-funeral-subtotal");
    if (el) el.textContent = money(funeralSubtotal());
  }

  function updateFamilySubtotalDom() {
    var el = document.getElementById("fe-family-subtotal");
    if (el) el.textContent = money(familySubtotal());
  }

  function bindEvents() {
    var next1 = document.getElementById("fe-btn-next-1");
    if (next1) next1.addEventListener("click", function () { goToStep(2); });

    var returning = document.getElementById("fe-btn-returning");
    if (returning) {
      returning.addEventListener("click", function () {
        if (loadProgress() && ceremony) {
          goToStep(Math.min(5, step));
        } else {
          alert(
            t(
              "No saved estimate found in this browser. Complete step 1 to begin.",
              "No hay una estimación guardada en este navegador. Complete el paso 1 para comenzar."
            )
          );
        }
      });
    }

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
        goToStep(3);
      });
    }

    root.querySelectorAll(".fe-line-select").forEach(function (sel) {
      sel.addEventListener("change", function () {
        lineSelections[sel.getAttribute("data-line-id")] = parseInt(sel.value, 10);
        updateFuneralSubtotalDom();
        saveProgress();
      });
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
  }

  document.addEventListener("language-changed", function () {
    lang = document.documentElement.classList.contains("lang-en") ? "en" : "es";
    render();
  });

  render();
})();
