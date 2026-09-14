/**
 * Compact licenses popup for ads landings.
 * Reuses the same PDFs and numbers as licencias.html.
 */
(function (global) {
  "use strict";

  var LICENSED = {
    NE: {
      nameEs: "Nebraska",
      nameEn: "Nebraska",
      typeEs: "Productora residente",
      typeEn: "Resident producer",
      number: "21695431",
      pdf: "julie-license-ne.pdf",
    },
    KS: {
      nameEs: "Kansas",
      nameEn: "Kansas",
      typeEs: "Productora no residente",
      typeEn: "Non-resident producer",
      number: "21695431",
      pdf: "julie-license-ks.pdf",
    },
    CO: {
      nameEs: "Colorado",
      nameEn: "Colorado",
      typeEs: "Productora no residente",
      typeEn: "Non-resident producer",
      number: "955378",
      pdf: "julie-license-co.pdf",
    },
    NV: {
      nameEs: "Nevada",
      nameEn: "Nevada",
      typeEs: "Productora no residente",
      typeEn: "Non-resident producer",
      number: "4237259",
      pdf: "julie-license-nv.pdf",
    },
  };

  var objectUrlCache = {};

  function isEs() {
    return (document.documentElement.lang || "").toLowerCase().indexOf("es") === 0;
  }

  function t(es, en) {
    return isEs() ? es : en;
  }

  function licensesBase() {
    var root = document.body.getAttribute("data-licenses-base") || "../licenses/";
    return root.replace(/\/?$/, "/");
  }

  function track(name, params) {
    if (typeof global.gtag === "function") global.gtag("event", name, params || {});
  }

  function revokeObjectUrl(code) {
    if (objectUrlCache[code]) {
      try {
        URL.revokeObjectURL(objectUrlCache[code]);
      } catch (e) {}
      delete objectUrlCache[code];
    }
  }

  function showPdf(body, name, pdfUrl, code) {
    body.innerHTML =
      '<div class="lf-lic-loading">' + t("Cargando licencia…", "Loading license…") + "</div>";
    fetch(pdfUrl)
      .then(function (r) {
        if (!r.ok) throw new Error("pdf fetch failed");
        return r.blob();
      })
      .then(function (blob) {
        var pdfBlob =
          blob.type === "application/pdf" ? blob : new Blob([blob], { type: "application/pdf" });
        revokeObjectUrl(code);
        var objectUrl = URL.createObjectURL(pdfBlob);
        objectUrlCache[code] = objectUrl;
        body.innerHTML =
          '<object class="lf-lic-pdf-object" data="' +
          objectUrl +
          '#toolbar=0" type="application/pdf" title="' +
          name.replace(/"/g, "") +
          '">' +
          '<iframe class="lf-lic-pdf-frame" title="' +
          name.replace(/"/g, "") +
          '" src="' +
          objectUrl +
          '#toolbar=0&navpanes=0&view=FitH"></iframe>' +
          "</object>";
      })
      .catch(function () {
        var safeName = name.replace(/"/g, "");
        var abs = new URL(pdfUrl, window.location.href).href;
        body.innerHTML =
          '<iframe class="lf-lic-pdf-frame" title="' +
          safeName +
          '" src="' +
          abs +
          '#toolbar=0&navpanes=0&view=FitH"></iframe>';
      });
  }

  function renderList(body) {
    var html = '<ul class="lf-lic-state-list">';
    Object.keys(LICENSED).forEach(function (code) {
      var info = LICENSED[code];
      var name = isEs() ? info.nameEs : info.nameEn;
      var type = isEs() ? info.typeEs : info.typeEn;
      html +=
        '<li><button type="button" class="lf-lic-state-btn" data-lic-state="' +
        code +
        '"><span class="lf-lic-state-name">' +
        name +
        '</span><span class="lf-lic-state-meta">' +
        type +
        " #" +
        info.number +
        "</span></button></li>";
    });
    html += "</ul>";
    html +=
      '<p class="lf-lic-npn">NPN #21695431. ' +
      t("Haga clic en un estado para ver la licencia.", "Tap a state to view the license.") +
      "</p>";
    body.innerHTML = html;
  }

  function openState(code) {
    var info = LICENSED[code];
    if (!info) return;
    var title = document.getElementById("lf-lic-modal-title");
    var body = document.getElementById("lf-lic-modal-body");
    var back = document.getElementById("lf-lic-modal-back");
    if (!body) return;
    var name = isEs() ? info.nameEs : info.nameEn;
    if (title) title.textContent = name + " #" + info.number;
    if (back) back.hidden = false;
    track("license_state_viewed", { state: code });
    showPdf(body, name, licensesBase() + info.pdf, code);
  }

  function showList() {
    var title = document.getElementById("lf-lic-modal-title");
    var body = document.getElementById("lf-lic-modal-body");
    var back = document.getElementById("lf-lic-modal-back");
    if (title) title.textContent = t("Licencias", "Licenses");
    if (back) back.hidden = true;
    if (body) renderList(body);
  }

  function openModal() {
    var backdrop = document.getElementById("lf-lic-modal");
    if (!backdrop) return;
    showList();
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    track("licenses_opened", { location: "landing_v3" });
  }

  function closeModal() {
    var backdrop = document.getElementById("lf-lic-modal");
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    document.body.style.overflow = "";
    track("licenses_closed", { location: "landing_v3" });
  }

  function bind() {
    var openBtn = document.getElementById("lf-licenses-open");
    var backdrop = document.getElementById("lf-lic-modal");
    var body = document.getElementById("lf-lic-modal-body");
    if (!openBtn || !backdrop) return;
    if (openBtn.getAttribute("data-lf-lic-bound") === "1") return;
    openBtn.setAttribute("data-lf-lic-bound", "1");
    openBtn.addEventListener("click", openModal);
    backdrop.addEventListener("click", function (ev) {
      if (ev.target === backdrop) closeModal();
    });
    document.querySelectorAll("[data-lf-lic-close]").forEach(function (btn) {
      btn.addEventListener("click", closeModal);
    });
    var back = document.getElementById("lf-lic-modal-back");
    if (back) {
      back.addEventListener("click", function () {
        track("licenses_back_to_list", { location: "landing_v3" });
        showList();
      });
    }
    if (body) {
      body.addEventListener("click", function (ev) {
        var btn = ev.target.closest("[data-lic-state]");
        if (!btn) return;
        openState(btn.getAttribute("data-lic-state"));
      });
    }
    document.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") closeModal();
    });
  }

  global.MVILandingLicenses = { bind: bind, open: openModal, close: closeModal };
})(window);
