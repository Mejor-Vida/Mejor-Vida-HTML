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

  function pricedRows(rows) {
    return (rows || []).filter(function (r) {
      return r && !r.quote && (r.female != null || r.male != null);
    });
  }

  function renderTermTable(term, face, tbody, noteEl, copy, quoteHref) {
    var data = (window.MVI_LIC_RATES && window.MVI_LIC_RATES.tables) || {};
    var meta = window.MVI_LIC_RATES || {};
    var rows = pricedRows(((data[String(term)] || {})[String(face)]) || []);
    var estimated =
      (meta.estimated_faces || []).indexOf(Number(face)) !== -1 ||
      (meta.estimated_faces || []).indexOf(String(face)) !== -1;
    tbody.innerHTML = rows
      .map(function (r) {
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
      if (meta.note && copy && copy.preferMetaNote) {
        noteEl.textContent = meta.note;
        return;
      }
      var hasEstimatedRow = rows.some(function (r) {
        return r.estimated;
      });
      var extra =
        estimated || hasEstimatedRow
          ? copy && copy.estimatedNote
            ? " " + copy.estimatedNote
            : ""
          : "";
      var rangeNote =
        copy && copy.ageRangeNote
          ? " " + copy.ageRangeNote
          : " Ages shown every 5 years where Integrity Connect returned a published rate.";
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

  function renderCompareTable(face, tbody, noteEl, copy, quoteHref) {
    var cmp = window.MVI_LIC_COMPARE || {};
    var rows = (cmp.tables && cmp.tables[String(face)]) || [];
    var qLabel = (copy && copy.quoteLabel) || "Get a quote";
    var qHref = quoteHref || "term-quote.html";
    var femaleLabel = (copy && copy.femaleProfile) || "Female, age ";
    var maleLabel = (copy && copy.maleProfile) || "Male, age ";
    function cell(val) {
      if (val == null || val === "") {
        return quoteCell(qHref, qLabel);
      }
      return money(val);
    }
    tbody.innerHTML = rows
      .map(function (r) {
        return (
          "<tr><td>" +
          femaleLabel +
          r.age +
          "</td><td>" +
          cell(r.term_female) +
          "</td><td>" +
          cell(r.whole_female) +
          "</td></tr>" +
          "<tr><td>" +
          maleLabel +
          r.age +
          "</td><td>" +
          cell(r.term_male) +
          "</td><td>" +
          cell(r.whole_male) +
          "</td></tr>"
        );
      })
      .join("");
    if (noteEl) {
      noteEl.textContent =
        (copy && copy.compareNote) ||
        cmp.note ||
        "Illustrative non-tobacco monthly premiums for education only — not a binding quote.";
    }
  }

  function renderBucketTable(bucketKey, face, tbody, noteEl, copy, quoteHref) {
    var meta = window.MVI_LIC_RATES || {};
    var bucket = (meta && meta[bucketKey]) || {};
    var rows = pricedRows(((bucket.tables || {})[String(face)]) || []);
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
      var dedicatedNote = bucket.note || meta.note;
      if (copy && copy.preferMetaNote && dedicatedNote) {
        noteEl.textContent = dedicatedNote;
        return;
      }
      noteEl.textContent =
        notePrefix +
        (bucket.rating || "") +
        noteSuffix;
    }
  }

  function initBlock(block) {
    var product = block.getAttribute("data-lic-product") || "term";
    var term = block.getAttribute("data-lic-term");
    var quoteHref = block.getAttribute("data-lic-quote-href") || "quote.html";
    var lang = document.documentElement.lang || "en";
    var isEs = lang.indexOf("es") === 0;
    var dedicatedTerm = !!document.body.classList.contains("lic-page--term");
    var dedicatedChildren = !!document.body.classList.contains(
      "lic-page--children"
    );
    var dedicatedAmount = !!document.body.classList.contains("lic-page--amount");
    var dedicatedBurial = !!document.body.classList.contains("lic-page--burial");
    var dedicatedSeniorsHub = !!document.body.classList.contains(
      "lic-page--seniors-hub"
    );
    var copy = isEs
      ? {
          notePrefix: "Primas mensuales ilustrativas (redondeadas). Clasificación: ",
          noteMid: ". Fuente: ",
          noteSuffix:
            ". Las cotizaciones reales de Mejor Vida varían según salud, estado, compañía y suscripción.",
          estimatedNote: "",
          ageRangeNote: dedicatedSeniorsHub
            ? " Edades 50 y más. Temporal: plazo de 10 años, $100,000 y $250,000."
            : dedicatedTerm
            ? " Edades cada 5 años según las tarifas que Integrity Connect devolvió para ese plazo y monto."
            : " Rangos de edad: temporal 10 años 20–80; 20 años 20–65; 30 años 20–55 (como los cuadros de muestra habituales).",
          preferMetaNote: dedicatedTerm || dedicatedChildren || dedicatedAmount,
          bucketNotePrefix: {
            whole_life: "Primas mensuales ilustrativas (redondeadas). Clasificación: ",
            whole_life_traditional: "Primas mensuales ilustrativas (redondeadas). Clasificación: ",
            final_expense: "Primas mensuales ilustrativas (redondeadas). Banda: ",
            guaranteed: "Primas mensuales ilustrativas (redondeadas). Banda: ",
            universal_life: "Vida universal / IUL: ",
            children_si_wl:
              "Primas mensuales ilustrativas (redondeadas). Clasificación: ",
          },
          bucketNoteSuffix: {
            whole_life: dedicatedSeniorsHub
              ? ". Edades 50–85 (cada 5 años). Primas ilustrativas de vida entera simplificada; no es cotización vinculante."
              : ". Edades 45–85 (cada 5 años). Primas ilustrativas de vida entera simplificada; no es cotización vinculante.",
            whole_life_traditional:
              ". Edades 40–85 (cada 5 años). Muestra educativa preferred / no fumador; montos más altos se ilustran caso por caso.",
            final_expense: dedicatedBurial || dedicatedSeniorsHub
              ? ". Edades 50 y más (compañías designadas, no fumador). Primas ilustrativas; no es cotización vinculante."
              : ". Edades 45–85 (cada 5 años). Primas ilustrativas; no es cotización vinculante.",
            guaranteed: dedicatedSeniorsHub
              ? ". Edades 50 y más. Primas ilustrativas de compañías designadas; no es cotización vinculante."
              : ". Edades 45–85. Primas ilustrativas de compañías designadas; no es cotización vinculante.",
            universal_life:
              "primas mensuales ilustrativas (preferred no fumador). El costo real de UL/IUL depende del financiamiento y de la ilustración de la compañía.",
            children_si_wl:
              ". Bandas 0–17. Muestras educativas de compañías designadas; no es cotización vinculante.",
          },
          quoteLabel: "Cotizar →",
          femaleProfile: "Mujer, edad ",
          maleProfile: "Hombre, edad ",
          compareNote:
            "Primas mensuales ilustrativas (no fumador). Columna temporal: plazo de 10 años desde tablas de compañías designadas. Columna vida entera: Protect+ Preferred Plus (no fumador) de compañía designada cuando hay edad disponible; si no, la muestra educativa de vida entera tradicional. Solo con fines educativos — no es cotización vinculante.",
        }
      : {
          notePrefix: "Illustrative monthly premiums (rounded). Rating class: ",
          noteMid: ". Source: ",
          noteSuffix:
            ". Actual Mejor Vida quotes vary by health, state, carrier, and underwriting.",
          estimatedNote: "",
          ageRangeNote: dedicatedSeniorsHub
            ? " Ages 50 and up. Term: 10-year, $100,000 and $250,000."
            : dedicatedTerm
            ? " Ages every 5 years where Integrity Connect returned a published rate for that term and amount."
            : " Age ranges: 10-year term 20–80; 20-year 20–65; 30-year 20–55 (matching typical published sample charts).",
          preferMetaNote: dedicatedTerm || dedicatedChildren || dedicatedAmount,
          bucketNotePrefix: {
            whole_life: "Illustrative monthly premiums (rounded). Rating class: ",
            whole_life_traditional: "Illustrative monthly premiums (rounded). Rating class: ",
            final_expense: "Illustrative monthly premiums (rounded). Band: ",
            guaranteed: "Illustrative monthly premiums (rounded). Band: ",
            universal_life: "Universal / IUL: ",
            children_si_wl:
              "Illustrative monthly premiums (rounded). Rating class: ",
          },
          bucketNoteSuffix: {
            whole_life: dedicatedSeniorsHub
              ? ". Ages 50–85 (every 5 years). Illustrative simplified whole life premiums; not a binding quote."
              : ". Ages 45–85 (every 5 years). Illustrative simplified whole life premiums; not a binding quote.",
            whole_life_traditional:
              ". Ages 40–85 (every 5 years). Educational preferred / non-tobacco sample; larger faces are illustrated case by case.",
            final_expense: dedicatedBurial || dedicatedSeniorsHub
              ? ". Ages 50 and up (appointed companies, non-tobacco). Illustrative premiums; not a binding quote."
              : ". Ages 45–85 (every 5 years). Illustrative premiums; not a binding quote.",
            guaranteed: dedicatedSeniorsHub
              ? ". Ages 50 and up. Illustrative appointed-company premiums; not a binding quote."
              : ". Ages 45–85. Illustrative appointed-company premiums; not a binding quote.",
            universal_life:
              "illustrative monthly premiums (preferred non-tobacco). Actual UL/IUL cost depends on funding and the carrier illustration.",
            children_si_wl:
              ". Age bands 0–17. Educational samples from appointed carriers; not a binding quote.",
          },
          quoteLabel: "Get a quote →",
          femaleProfile: "Female, age ",
          maleProfile: "Male, age ",
          compareNote:
            "Illustrative non-tobacco monthly premiums. Term column: 10-year rates from appointed-carrier tables. Whole life column: appointed-carrier Protect+ Preferred Plus non-tobacco where ages are available, otherwise the traditional whole-life educational sample. For education only — not a binding quote.",
        };

    if (product === "term-vs-whole" || product === "term_vs_whole") {
      var cmpTabs = block.querySelectorAll("[data-lic-compare-face]");
      var cmpBody = block.querySelector("[data-lic-compare-tbody]");
      var cmpNote = block.querySelector("[data-lic-compare-note]");
      function activateCompare(tab) {
        var face = tab.getAttribute("data-lic-compare-face");
        cmpTabs.forEach(function (t) {
          var on = t === tab;
          t.classList.toggle("is-active", on);
          t.setAttribute("aria-selected", on ? "true" : "false");
        });
        renderCompareTable(face, cmpBody, cmpNote, copy, quoteHref);
      }
      cmpTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
          activateCompare(tab);
        });
      });
      var firstCmp =
        block.querySelector("[data-lic-compare-face].is-active") || cmpTabs[0];
      if (firstCmp) activateCompare(firstCmp);
      return;
    }

    var bucketByProduct = {
      whole: "whole_life",
      "whole-trad": "whole_life_traditional",
      "whole_traditional": "whole_life_traditional",
      fe: "final_expense",
      "final-expense": "final_expense",
      gi: "guaranteed",
      guaranteed: "guaranteed",
      ul: "universal_life",
      universal: "universal_life",
      children: "children_si_wl",
      "children-si": "children_si_wl",
      "children_si_wl": "children_si_wl",
    };

    function wireFaceTabs(tabs, tbody, noteEl) {
      if (!tabs.length || !tbody) return;
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
      var first =
        Array.prototype.find.call(tabs, function (t) {
          return t.classList.contains("is-active");
        }) || tabs[0];
      if (first) activate(first);
    }

    // All face tabs on this block share one table (and optional legacy high table).
    var primaryTbody = block.querySelector("[data-lic-tbody]");
    var highTbody = block.querySelector("[data-lic-tbody-high]");
    var allTabs = block.querySelectorAll("[data-lic-face]");
    if (highTbody && primaryTbody) {
      // Legacy markup: two tab rows / two tables — keep groups independent.
      var lowTabs = [];
      var highTabs = [];
      allTabs.forEach(function (tab) {
        if (
          primaryTbody.compareDocumentPosition(tab) &
          Node.DOCUMENT_POSITION_FOLLOWING
        ) {
          highTabs.push(tab);
        } else {
          lowTabs.push(tab);
        }
      });
      wireFaceTabs(lowTabs, primaryTbody, block.querySelector("[data-lic-note]"));
      wireFaceTabs(
        highTabs,
        highTbody,
        block.querySelector("[data-lic-note-high]")
      );
    } else {
      wireFaceTabs(
        allTabs,
        primaryTbody,
        block.querySelector("[data-lic-note]")
      );
      if (!allTabs.length && primaryTbody) {
        var face = block.getAttribute("data-lic-face") || "5000";
        var bucket = bucketByProduct[product];
        var noteEl = block.querySelector("[data-lic-note]");
        if (bucket) {
          renderBucketTable(bucket, face, primaryTbody, noteEl, copy, quoteHref);
        } else {
          renderTermTable(term, face, primaryTbody, noteEl, copy, quoteHref);
        }
      }
    }
  }

  function boot() {
    document.querySelectorAll("[data-lic-product]").forEach(initBlock);
    initMetaTabs();
  }

  function initMetaTabs() {
    document.querySelectorAll(".lic-meta").forEach(function (root) {
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
