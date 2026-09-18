/**
 * Canonical city guide: plot resale board + funeral/coverage calculator.
 * Config comes from #city-guide-config (written by scripts/city-guide-html.js).
 * Do not add a second calculator style — see .cursor/rules/city-page-layout.mdc.
 */
(function () {
  var lang = document.documentElement.classList.contains("lang-en") ? "en" : "es";

  function t(en, es) {
    return lang === "en" ? en : es;
  }

  function money(n) {
    if (n == null || n === "") return "—";
    return "$" + Number(n).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function median(nums) {
    if (!nums.length) return null;
    var a = nums.slice().sort(function (x, y) {
      return x - y;
    });
    var mid = Math.floor(a.length / 2);
    return a.length % 2 ? a[mid] : Math.round((a[mid - 1] + a[mid]) / 2);
  }

  function readConfig() {
    var el = document.getElementById("city-guide-config");
    if (!el) return {};
    try {
      return JSON.parse(el.textContent);
    } catch (err) {
      return {};
    }
  }

  var CONFIG = readConfig();

  function perSpace(item) {
    var spaces = Number(item.spaces) || 1;
    return Math.round(Number(item.asking) / spaces);
  }

  function discountPct(item) {
    if (!item.citedListEach) return null;
    var ps = perSpace(item);
    if (item.citedListEach <= 0) return null;
    return Math.round((1 - ps / item.citedListEach) * 100);
  }

  async function loadResales(root) {
    var urls = [root.getAttribute("data-resale-src"), CONFIG.resaleFallback].filter(Boolean);
    var lastErr = null;
    for (var i = 0; i < urls.length; i++) {
      try {
        var res = await fetch(urls[i], { cache: "no-store" });
        if (res.ok) return await res.json();
      } catch (err) {
        lastErr = err;
      }
    }
    throw lastErr || new Error("resale json");
  }

  function renderResales(root, data) {
    var listed = (data.listings || []).filter(function (x) {
      return x.status !== "sold";
    });
    var perSpaces = listed.map(perSpace);
    var asks = listed.map(function (x) {
      return Number(x.asking);
    });
    var medAsk = median(asks);
    var medPer = median(perSpaces);
    var minAsk = asks.length ? Math.min.apply(null, asks) : null;
    var maxAsk = asks.length ? Math.max.apply(null, asks) : null;

    var stats = root.querySelector("[data-resale-stats]");
    if (stats) {
      stats.innerHTML =
        t("Checked ", "Revisado ") +
        esc(lang === "en" ? data.checkedLabelEn : data.checkedLabelEs) +
        ". " +
        listed.length +
        t(" active ads", " anuncios activos") +
        (minAsk != null
          ? t(" asking ", " pidiendo ") +
            money(minAsk) +
            t(" to ", " a ") +
            money(maxAsk) +
            t(" (median ask ", " (mediana ") +
            money(medAsk) +
            t("; about ", "; unos ") +
            money(medPer) +
            t(" per space).", " por espacio).")
          : ".");
    }

    var boards = root.querySelector("[data-resale-boards]");
    if (boards) {
      boards.innerHTML = (data.boards || [])
        .map(function (b) {
          return (
            '<a class="sc-resale-board-link" href="' +
            esc(b.url) +
            '" rel="noopener" target="_blank">' +
            esc(b.name) +
            "<span>" +
            esc(lang === "en" ? b.labelEn : b.labelEs) +
            "</span></a>"
          );
        })
        .join("");
    }

    var list = root.querySelector("[data-resale-list]");
    if (!list) return;
    if (!listed.length) {
      list.innerHTML =
        '<p class="text-body-secondary mb-0">' +
        esc(t("No snapshot ads right now. Use the live boards above.", "No hay anuncios en esta captura. Use los tableros en vivo.")) +
        "</p>";
      return;
    }

    listed.sort(function (a, b) {
      return perSpace(a) - perSpace(b);
    });

    list.innerHTML = listed
      .map(function (item) {
        var disc = discountPct(item);
        var badge =
          disc != null && disc > 0
            ? '<span class="sc-resale-save">' +
              t("About ", "Unos ") +
              disc +
              t("% under the seller-cited cemetery list", "% bajo la lista que cita el vendedor") +
              "</span>"
            : "";
        var transfer = item.transferFee
          ? t(" + ", " + ") + money(item.transferFee) + t(" transfer", " de transferencia")
          : "";
        var obo = item.obo ? t(" (or best offer)", " (o mejor oferta)") : "";
        var spacesLabel =
          item.spaces === 1
            ? t("1 space", "1 espacio")
            : item.spaces + t(" spaces", " espacios");
        return (
          '<article class="sc-resale-card">' +
          '<p class="sc-resale-meta mb-1">' +
          esc(item.cemetery) +
          " · " +
          esc(spacesLabel) +
          "</p>" +
          '<h3 class="sc-resale-title"><a href="' +
          esc(item.url) +
          '" rel="noopener" target="_blank">' +
          esc(lang === "en" ? item.titleEn : item.titleEs) +
          "</a></h3>" +
          '<p class="sc-resale-price mb-1">' +
          money(item.asking) +
          transfer +
          obo +
          "</p>" +
          '<p class="sc-resale-unit mb-2">' +
          money(perSpace(item)) +
          t(" per space", " por espacio") +
          (item.citedListEach
            ? t(" · seller cites cemetery list ", " · el vendedor cita lista ") + money(item.citedListEach)
            : "") +
          "</p>" +
          badge +
          "</article>"
        );
      })
      .join("");
  }

  function initResales() {
    var root =
      document.querySelector("[data-resale-board]") ||
      document.getElementById("city-resale-board") ||
      document.getElementById("lincoln-resale-board");
    if (!root) return;
    loadResales(root)
      .then(function (data) {
        renderResales(root, data);
      })
      .catch(function () {
        var stats = root.querySelector("[data-resale-stats]");
        if (stats) {
          stats.textContent = t(
            "Could not refresh the snapshot. The live boards below still work.",
            "No se pudo actualizar la captura. Los tableros en vivo siguen funcionando."
          );
        }
      });
  }

  function homeIncludesCasket(home, service) {
    var map = CONFIG.homeIncludesCasket || {};
    return Array.isArray(map[home]) && map[home].indexOf(service) !== -1;
  }

  var QUOTE_ENDPOINTS = ["/api/quote-site", "https://www.mejorvidainsurance.com/api/quote-site"];

  function roundCoverage(total) {
    var n = Math.ceil(total / 1000) * 1000;
    return Math.max(5000, Math.min(25000, n));
  }

  function radioValue(form, name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function initCalc() {
    var form = document.getElementById("city-fe-calc") || document.getElementById("lincoln-fe-calc");
    if (!form || !CONFIG.gpl) return;

    var outFuneral = form.querySelector("[data-out-funeral]");
    var outCoverage = form.querySelector("[data-out-coverage]");
    var outPremium = form.querySelector("[data-out-premium]");
    var outRange = form.querySelector("[data-out-range]");
    var outNote = form.querySelector("[data-out-note]");
    var casketWrap = form.querySelector("[data-casket-wrap]");
    var quoteTimer = null;
    var quoteSeq = 0;
    var PLOT_NEW = Number(CONFIG.plotNew) || 0;
    var PLOT_RESALE = Number(CONFIG.plotResale) || 0;
    var VAULT = Number(CONFIG.vault) || 0;
    var CASKET_TYPICAL = Number(CONFIG.casketTypical) || 0;

    function funeralTotal() {
      var service = form.service.value;
      var home = form.home.value;
      var plot = form.plot.value;
      var vaultOn = form.vault.checked;
      var extra = Number(form.extra.value) || 0;
      var gpl = CONFIG.gpl[home] || CONFIG.gpl.us || {};
      var funeral = Object.prototype.hasOwnProperty.call(gpl, service)
        ? gpl[service]
        : (CONFIG.gpl.us && CONFIG.gpl.us[service]) || 0;
      var needsCasket = service === "immediateBurial" || service === "traditional";
      var bundled = homeIncludesCasket(home, service);
      if (casketWrap) casketWrap.hidden = !needsCasket || bundled;
      if (needsCasket && !bundled && form.casket.checked) funeral += CASKET_TYPICAL;
      if (plot === "new") funeral += PLOT_NEW;
      if (plot === "resale") funeral += PLOT_RESALE;
      if (vaultOn && (service === "immediateBurial" || service === "traditional")) funeral += VAULT;
      funeral += extra;
      return Math.round(funeral);
    }

    function homeLabel(home) {
      var labels = CONFIG.homeLabels || {};
      var row = labels[home];
      if (!row) return home;
      return lang === "en" ? row.en : row.es;
    }

    function paintLocal() {
      var funeral = funeralTotal();
      var coverage = roundCoverage(funeral);
      if (outFuneral) outFuneral.textContent = money(funeral);
      if (outCoverage) outCoverage.textContent = money(coverage);
      return coverage;
    }

    function setPremium(text, rangeText, noteText) {
      if (outPremium) outPremium.textContent = text;
      if (outRange) outRange.textContent = rangeText || "";
      if (outNote) outNote.textContent = noteText || "";
    }

    async function lookupQuote(coverage) {
      var seq = ++quoteSeq;
      var age = Number(form.age.value);
      var sex = radioValue(form, "sex") || "female";
      var smoker = radioValue(form, "smoker") === "yes";
      var body = JSON.stringify({
        age: age,
        sex: sex,
        smoker: smoker,
        coverageAmount: coverage,
        lang: lang,
      });
      var lastErr = null;
      for (var i = 0; i < QUOTE_ENDPOINTS.length; i++) {
        try {
          var res = await fetch(QUOTE_ENDPOINTS[i], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: body,
          });
          var data = await res.json();
          if (seq !== quoteSeq) return;
          if (!res.ok || data.ok === false) {
            lastErr = data.error || data.quote_error;
            continue;
          }
          if (data.quote_status !== "ok") {
            setPremium(
              "—",
              "",
              data.quote_error ||
                t("No rate for that age, sex, and tobacco combination yet.", "Aún no hay tarifa para esa edad, sexo y tabaco.")
            );
            return;
          }
          var range =
            data.quote_low && data.quote_high && data.quote_low !== data.quote_high
              ? t("Range ", "Rango ") + data.quote_low + " – " + data.quote_high + t("/mo", "/mes")
              : "";
          setPremium(
            (data.quote_anchor || data.quote_low) + t("/mo", "/mes"),
            range,
            t(
              "Appointed-company charts for age, sex, and tobacco. Good-health level plans. " +
                homeLabel(form.home.value) +
                " funeral from the table. Not an official quote.",
              "Tarifas de compañías designadas según edad, sexo y tabaco. Planes nivelados, buena salud. Funeral de " +
                homeLabel(form.home.value) +
                " según la tabla. No es una cotización oficial."
            )
          );
          return;
        } catch (err) {
          lastErr = err;
        }
      }
      if (seq !== quoteSeq) return;
      setPremium(
        "—",
        "",
        t(
          "Could not load appointed-company rates. Get a free quote, or call 402-440-5438.",
          "No se pudieron cargar las tarifas. Pida una cotización gratuita o llame al 402-440-5438."
        )
      );
    }

    function update() {
      var coverage = paintLocal();
      setPremium("…", "", t("Looking up rates…", "Consultando tarifas…"));
      clearTimeout(quoteTimer);
      quoteTimer = setTimeout(function () {
        lookupQuote(coverage);
      }, 220);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
    });
    form.addEventListener("input", update);
    form.addEventListener("change", update);
    update();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      initResales();
      initCalc();
    });
  } else {
    initResales();
    initCalc();
  }
})();
