/**
 * Public licensing map — hover licensed states, click to view license PDF.
 */
(function () {
  "use strict";

  var LICENSED = {
    NE: {
      nameEn: "Nebraska",
      nameEs: "Nebraska",
      typeEn: "Resident producer",
      typeEs: "Productora residente",
      number: "21695431",
      pdf: "julie-license-ne.pdf",
    },
    KS: {
      nameEn: "Kansas",
      nameEs: "Kansas",
      typeEn: "Non-resident producer",
      typeEs: "Productora no residente",
      number: "21695431",
      pdf: "julie-license-ks.pdf",
    },
    CO: {
      nameEn: "Colorado",
      nameEs: "Colorado",
      typeEn: "Non-resident producer",
      typeEs: "Productora no residente",
      number: "955378",
      pdf: "julie-license-co.pdf",
    },
    NV: {
      nameEn: "Nevada",
      nameEs: "Nevada",
      typeEn: "Non-resident producer",
      typeEs: "Productora no residente",
      number: "4237259",
      pdf: "julie-license-nv.pdf",
    },
  };

  function isEs() {
    return (document.documentElement.lang || "").toLowerCase().indexOf("es") === 0;
  }

  function licensesBase() {
    var root = document.body.getAttribute("data-licenses-base") || "licenses/";
    return root.replace(/\/?$/, "/");
  }

  function t(es, en) {
    return isEs() ? es : en;
  }

  function syncSelect(code) {
    var select = document.getElementById("mvi-lic-state-select");
    if (select && LICENSED[code]) select.value = code;
  }

  var objectUrlCache = {};

  function revokeObjectUrl(code) {
    if (objectUrlCache[code]) {
      try {
        URL.revokeObjectURL(objectUrlCache[code]);
      } catch (e) {}
      delete objectUrlCache[code];
    }
  }

  function showPdfInModal(body, name, pdfUrl, code) {
    body.innerHTML =
      '<div class="mvi-lic-viewer-loading">' +
      t("Cargando licencia…", "Loading license…") +
      "</div>";

    fetch(pdfUrl)
      .then(function (r) {
        if (!r.ok) throw new Error("pdf fetch failed");
        return r.blob();
      })
      .then(function (blob) {
        var pdfBlob =
          blob.type === "application/pdf"
            ? blob
            : new Blob([blob], { type: "application/pdf" });
        revokeObjectUrl(code);
        var objectUrl = URL.createObjectURL(pdfBlob);
        objectUrlCache[code] = objectUrl;
        body.innerHTML =
          '<object class="mvi-lic-pdf-object" data="' +
          objectUrl +
          '#toolbar=0" type="application/pdf" title="' +
          name.replace(/"/g, "") +
          '">' +
          '<iframe class="mvi-lic-pdf-frame" title="' +
          name.replace(/"/g, "") +
          '" src="' +
          objectUrl +
          '#toolbar=0&navpanes=0&view=FitH"></iframe>' +
          "</object>";
      })
      .catch(function () {
        // Same-origin iframe first; Google Docs viewer as last resort.
        var safeName = name.replace(/"/g, "");
        var abs = new URL(pdfUrl, window.location.href).href;
        var gview =
          "https://docs.google.com/gview?embedded=1&url=" + encodeURIComponent(abs);
        body.innerHTML =
          '<iframe class="mvi-lic-pdf-frame" title="' +
          safeName +
          '" src="' +
          abs +
          '#toolbar=0&navpanes=0&view=FitH"></iframe>' +
          '<p class="mvi-lic-note mvi-lic-viewer-fallback">' +
          t(
            'Si no se ve el PDF, use “Abrir en pestaña”.',
            'If the PDF does not appear, use “Open in new tab”.'
          ) +
          ' <a href="' +
          gview +
          '" target="_blank" rel="noopener">' +
          t("Visor alternativo", "Alternate viewer") +
          "</a></p>";
      });
  }

  function openModal(code) {
    var info = LICENSED[code];
    if (!info) return;
    var backdrop = document.getElementById("mvi-lic-modal");
    var title = document.getElementById("mvi-lic-modal-title");
    var body = document.getElementById("mvi-lic-modal-body");
    var openTab = document.getElementById("mvi-lic-modal-open-tab");
    if (!backdrop || !title || !body) return;

    syncSelect(code);

    var name = isEs() ? info.nameEs : info.nameEn;
    var type = isEs() ? info.typeEs : info.typeEn;
    title.textContent = name + " — " + type + " #" + info.number;

    var pdfUrl = licensesBase() + info.pdf;
    if (openTab) {
      openTab.href = pdfUrl;
      openTab.removeAttribute("download");
    }
    showPdfInModal(body, name, pdfUrl, code);
    backdrop.classList.remove("hidden");
    document.body.style.overflow = "hidden";
  }

  function openFromSelect() {
    var select = document.getElementById("mvi-lic-state-select");
    if (!select || !select.value) return;
    openModal(select.value);
  }

  function renderSelect() {
    var select = document.getElementById("mvi-lic-state-select");
    if (!select) return;
    var placeholder = select.querySelector('option[value=""]');
    select.innerHTML = "";
    if (placeholder) {
      select.appendChild(placeholder);
    } else {
      var opt0 = document.createElement("option");
      opt0.value = "";
      opt0.textContent = t("Seleccione un estado…", "Select a state…");
      select.appendChild(opt0);
    }
    Object.keys(LICENSED)
      .sort(function (a, b) {
        var na = isEs() ? LICENSED[a].nameEs : LICENSED[a].nameEn;
        var nb = isEs() ? LICENSED[b].nameEs : LICENSED[b].nameEn;
        return na.localeCompare(nb);
      })
      .forEach(function (code) {
        var info = LICENSED[code];
        var name = isEs() ? info.nameEs : info.nameEn;
        var type = isEs() ? info.typeEs : info.typeEn;
        var opt = document.createElement("option");
        opt.value = code;
        opt.textContent = name + " (" + code + ") — " + type + " #" + info.number;
        select.appendChild(opt);
      });

    select.addEventListener("change", function () {
      if (select.value) openModal(select.value);
    });
    var viewBtn = document.getElementById("mvi-lic-state-view");
    if (viewBtn) {
      viewBtn.addEventListener("click", openFromSelect);
    }
  }

  function closeModal() {
    var backdrop = document.getElementById("mvi-lic-modal");
    var body = document.getElementById("mvi-lic-modal-body");
    if (backdrop) backdrop.classList.add("hidden");
    if (body) body.innerHTML = "";
    Object.keys(objectUrlCache).forEach(revokeObjectUrl);
    document.body.style.overflow = "";
  }

  function wireMap(svgRoot, highlightOnly) {
    if (!svgRoot) return;
    Object.keys(LICENSED).forEach(function (code) {
      var el = svgRoot.getElementById(code) || svgRoot.querySelector('[data-state="' + code + '"]');
      if (!el) return;
      el.classList.add("is-licensed");
      if (highlightOnly) return;
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      var info = LICENSED[code];
      var label = (isEs() ? info.nameEs : info.nameEn) + " — " + t("Ver licencia", "View license");
      el.setAttribute("aria-label", label);
      el.addEventListener("click", function () {
        openModal(code);
      });
      el.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openModal(code);
        }
      });
    });
  }

  function renderButtons() {
    var wrap = document.getElementById("mvi-lic-state-list");
    if (!wrap) return;
    wrap.innerHTML = Object.keys(LICENSED)
      .sort()
      .map(function (code) {
        var info = LICENSED[code];
        var name = isEs() ? info.nameEs : info.nameEn;
        var type = isEs() ? info.typeEs : info.typeEn;
        return (
          '<button type="button" class="mvi-lic-state-btn" data-state="' +
          code +
          '"><strong>' +
          name +
          " (" +
          code +
          ")</strong><span>" +
          type +
          " · #" +
          info.number +
          "</span></button>"
        );
      })
      .join("");
    wrap.querySelectorAll("[data-state]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        openModal(btn.getAttribute("data-state"));
      });
    });
  }

  function initInlineSvg() {
    var host = document.getElementById("mvi-lic-map-host");
    if (!host) return;
    var src = host.getAttribute("data-map-src");
    if (!src) return;
    var highlightOnly = host.getAttribute("data-map-mode") === "highlight-only";
    fetch(src)
      .then(function (r) {
        if (!r.ok) throw new Error("map fetch failed");
        return r.text();
      })
      .then(function (text) {
        host.innerHTML = text;
        var svg = host.querySelector("svg");
        if (svg && !svg.getAttribute("viewBox")) {
          var w = parseFloat(svg.getAttribute("width")) || 959;
          var h = parseFloat(svg.getAttribute("height")) || 593;
          svg.setAttribute("viewBox", "0 0 " + w + " " + h);
          svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
        }
        wireMap(svg, highlightOnly);
      })
      .catch(function () {
        host.innerHTML =
          '<p class="mvi-lic-note">' +
          t(
            "No se pudo cargar el mapa. Use la lista de estados abajo.",
            "Could not load the map. Use the state list below."
          ) +
          "</p>";
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    renderSelect();
    renderButtons();
    initInlineSvg();

    var closeBtn = document.getElementById("mvi-lic-modal-close");
    var closeBtn2 = document.getElementById("mvi-lic-modal-close-2");
    var backdrop = document.getElementById("mvi-lic-modal");
    if (closeBtn) closeBtn.addEventListener("click", closeModal);
    if (closeBtn2) closeBtn2.addEventListener("click", closeModal);
    if (backdrop) {
      backdrop.addEventListener("click", function (e) {
        if (e.target === backdrop) closeModal();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeModal();
    });
  });
})();
