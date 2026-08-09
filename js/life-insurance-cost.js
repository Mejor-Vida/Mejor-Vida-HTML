/**
 * Life insurance cost page — face-amount tabs for term, whole life, and final expense.
 * Expects window.MVI_LIC_RATES from life-insurance-cost-rates.json (inlined or fetched).
 */
(function () {
  function money(n) {
    if (n == null || n === "") return "—";
    return "$" + Number(n).toLocaleString("en-US");
  }

  function quoteCell(href, label) {
    return (
      '<a class="lic-quote-inline" href="' +
      href +
      '">' +
      label +
      "</a>"
    );
  }

  function renderTermTable(term, face, tbody, noteEl, copy, quoteHref) {
    var data = (window.MVI_LIC_RATES && window.MVI_LIC_RATES.tables) || {};
    var meta = window.MVI_LIC_RATES || {};
    var rows = ((data[String(term)] || {})[String(face)]) || [];
    var estimated =
      (meta.estimated_faces || []).indexOf(Number(face)) !== -1 ||
      (meta.estimated_faces || []).indexOf(String(face)) !== -1;
    var qLabel = (copy && copy.quoteLabel) || "Get a quote";
    var qHref = quoteHref || "quote.html";
    tbody.innerHTML = rows
      .map(function (r) {
        if (r.quote || (r.female == null && r.male == null)) {
          return (
            "<tr><td>" +
            r.age +
            '</td><td colspan="2" class="lic-quote-cell">' +
            quoteCell(qHref, qLabel) +
            "</td></tr>"
          );
        }
        return (
          "<tr><td>" +
          r.age +
          "</td><td>" +
          money(r.female) +
          "</td><td>" +
          money(r.male) +
          "</td></tr>"
        );
      })
      .join("");
    if (noteEl && meta) {
      var hasEstimatedRow = rows.some(function (r) {
        return r.estimated;
      });
      var extra =
        estimated || hasEstimatedRow
          ? copy && copy.estimatedNote
            ? " " + copy.estimatedNote
            : " $1,000,000 figures are approximate (2× the $500,000 band) where Easy Term publishes a $500,000 rate; other ages link to a quote."
          : "";
      var rangeNote =
        copy && copy.ageRangeNote
          ? " " + copy.ageRangeNote
          : " Chart ages are 20–80 (every 5 years), matching common industry rate charts. Ages without a published Easy Term rate show a quote link.";
      noteEl.textContent =
        (copy && copy.notePrefix ? copy.notePrefix : "") +
        (meta.rating || "") +
        (copy && copy.noteMid ? copy.noteMid : " · ") +
        (meta.source || "") +
        (copy && copy.noteSuffix ? copy.noteSuffix : "") +
        rangeNote +
        extra;
    }
  }

  function renderBucketTable(bucketKey, face, tbody, noteEl, copy, quoteHref) {
    var bucket = (window.MVI_LIC_RATES && window.MVI_LIC_RATES[bucketKey]) || {};
    var rows = ((bucket.tables || {})[String(face)]) || [];
    var qLabel = (copy && copy.quoteLabel) || "Get a quote";
    var notePrefix =
      (copy && copy.bucketNotePrefix && copy.bucketNotePrefix[bucketKey]) ||
      (copy && copy.notePrefix) ||
      "";
    var noteSuffix =
      (copy && copy.bucketNoteSuffix && copy.bucketNoteSuffix[bucketKey]) ||
      (copy && copy.noteSuffix) ||
      "";
    tbody.innerHTML = rows
      .map(function (r) {
        if (r.quote || (r.female == null && r.male == null)) {
          return (
            "<tr><td>" +
            r.age +
            '</td><td colspan="2" class="lic-quote-cell">' +
            quoteCell(quoteHref, qLabel) +
            "</td></tr>"
          );
        }
        return (
          "<tr><td>" +
          r.age +
          "</td><td>" +
          money(r.female) +
          "</td><td>" +
          money(r.male) +
          "</td></tr>"
        );
      })
      .join("");
    if (noteEl && bucket) {
      noteEl.textContent =
        notePrefix +
        (bucket.rating || "") +
        (copy && copy.noteMid ? copy.noteMid : " · ") +
        (bucket.source || "") +
        noteSuffix;
    }
  }

  function initBlock(block) {
    var product = block.getAttribute("data-lic-product") || "term";
    var term = block.getAttribute("data-lic-term");
    var tabs = block.querySelectorAll("[data-lic-face]");
    var tbody = block.querySelector("[data-lic-tbody]");
    var noteEl = block.querySelector("[data-lic-note]");
    var quoteHref = block.getAttribute("data-lic-quote-href") || "quote.html";
    var lang = document.documentElement.lang || "en";
    var copy =
      lang.indexOf("es") === 0
        ? {
            notePrefix: "Primas mensuales ilustrativas (redondeadas). Clasificación: ",
            noteMid: ". Fuente: ",
            noteSuffix:
              ". Las cotizaciones reales de Mejor Vida varían según salud, estado, compañía y suscripción.",
            estimatedNote: "",
            ageRangeNote:
              " Rangos de edad: temporal 10 años 20–80; 20 años 20–65; 30 años 20–55 (como los cuadros de muestra habituales).",
            bucketNotePrefix: {
              whole_life: "Primas mensuales ilustrativas (redondeadas). Clasificación: ",
              final_expense: "Primas mensuales ilustrativas (redondeadas). Banda: ",
              guaranteed: "Primas mensuales ilustrativas (redondeadas). Banda: ",
              universal_life: "Vida universal / IUL: ",
            },
            bucketNoteSuffix: {
              whole_life:
                ". Edades de muestra 20–85. Muestras educativas (~+5% vs cuadros públicos); no es cotización de compañía.",
              final_expense:
                ". Edades 45–85 (cada 5 años). Motor quote_ranges de Mejor Vida (MOO + AmAm); no es cotización vinculante.",
              guaranteed:
                ". Edades de muestra 45–85. Muestras educativas; no es cotización de compañía.",
              universal_life:
                "primas mensuales ilustrativas (preferred no fumador). El costo real de UL/IUL depende del financiamiento — Julie puede preparar una ilustración.",
            },
            quoteLabel: "Cotizar →",
          }
        : {
            notePrefix: "Illustrative monthly premiums (rounded). Rating class: ",
            noteMid: ". Source: ",
            noteSuffix:
              ". Actual Mejor Vida quotes vary by health, state, carrier, and underwriting.",
            estimatedNote: "",
            ageRangeNote:
              " Age ranges: 10-year term 20–80; 20-year 20–65; 30-year 20–55 (matching typical published sample charts).",
            bucketNotePrefix: {
              whole_life: "Illustrative monthly premiums (rounded). Rating class: ",
              final_expense: "Illustrative monthly premiums (rounded). Band: ",
              guaranteed: "Illustrative monthly premiums (rounded). Band: ",
              universal_life: "Universal / IUL: ",
            },
            bucketNoteSuffix: {
              whole_life:
                ". Sample ages 20–85. Educational samples (~+5% vs public charts); not a carrier quote.",
              final_expense:
                ". Ages 45–85 (every 5 years). Mejor Vida quote_ranges engine (MOO + AmAm); not a binding quote.",
              guaranteed:
                ". Sample ages 45–85. Educational samples; not a carrier quote.",
              universal_life:
                "illustrative monthly premiums (preferred non-tobacco). Actual UL/IUL cost depends on funding — Julie can run a carrier illustration.",
            },
            quoteLabel: "Get a quote →",
          };

    var bucketByProduct = {
      whole: "whole_life",
      fe: "final_expense",
      "final-expense": "final_expense",
      gi: "guaranteed",
      guaranteed: "guaranteed",
      ul: "universal_life",
      universal: "universal_life",
    };

    function activate(tab) {
      var face = tab.getAttribute("data-lic-face");
      tabs.forEach(function (t) {
        var on = t === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", on ? "true" : "false");
      });
      var bucket = bucketByProduct[product];
      if (bucket) {
        renderBucketTable(bucket, face, tbody, noteEl, copy, quoteHref);
      } else {
        renderTermTable(term, face, tbody, noteEl, copy, quoteHref);
      }
    }

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        activate(tab);
      });
    });

    var first = block.querySelector(".lic-face-tab.is-active") || tabs[0];
    if (first) activate(first);
  }

  function boot() {
    document.querySelectorAll("[data-lic-product]").forEach(initBlock);
    initMetaTabs();
  }

  function initMetaTabs() {
    var root = document.querySelector(".lic-meta");
    if (!root) return;
    var tabs = root.querySelectorAll("[data-lic-meta]");
    var panels = root.querySelectorAll("[data-lic-meta-panel]");
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var id = tab.getAttribute("data-lic-meta");
        tabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        panels.forEach(function (p) {
          var on = p.getAttribute("data-lic-meta-panel") === id;
          p.hidden = !on;
          p.classList.toggle("is-active", on);
        });
      });
    });
  }

  if (window.MVI_LIC_RATES) {
    boot();
    return;
  }

  var src =
    document.querySelector("script[data-lic-rates]") &&
    document.querySelector("script[data-lic-rates]").getAttribute("data-lic-rates");
  if (!src) {
    boot();
    return;
  }
  fetch(src)
    .then(function (r) {
      return r.json();
    })
    .then(function (json) {
      window.MVI_LIC_RATES = json;
      boot();
    })
    .catch(function () {
      boot();
    });
})();
