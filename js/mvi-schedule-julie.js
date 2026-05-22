/**
 * Julie-only HubSpot scheduler — no quote wizard.
 * Share page: /schedule-julie.html
 */
(function () {
  var HUBSPOT_ES = "https://meetings-na2.hubspot.com/julie-braunsroth";
  var HUBSPOT_EN =
    "https://meetings-na2.hubspot.com/julie-braunsroth/insurance-consultation-mejor-vida-insurance";

  function pageShareUrl() {
    var path = "/schedule-julie.html";
    if (location.origin && location.origin !== "null") {
      return location.origin.replace(/\/$/, "") + path;
    }
    return "https://www.mejorvidainsurance.com/schedule-julie.html";
  }

  function currentLang() {
    return document.documentElement.classList.contains("lang-en") ? "en" : "es";
  }

  function hubspotUrl(lang) {
    return lang === "en" ? HUBSPOT_EN : HUBSPOT_ES;
  }

  function syncIframe() {
    var iframe = document.getElementById("julie-schedule-iframe");
    if (!iframe) return;
    var url = hubspotUrl(currentLang());
    if (iframe.getAttribute("src") !== url) {
      iframe.setAttribute("src", url);
    }
  }

  function initCopyLink() {
    var input = document.getElementById("julie-schedule-share-url");
    var btn = document.getElementById("julie-schedule-copy-btn");
    var status = document.getElementById("julie-schedule-copy-status");
    if (!input || !btn) return;

    input.value = pageShareUrl();

    function showStatus(msg, isError) {
      if (!status) return;
      status.textContent = msg;
      status.classList.toggle("text-danger", !!isError);
      status.classList.toggle("text-success", !isError);
    }

    btn.addEventListener("click", function () {
      var url = input.value;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard
          .writeText(url)
          .then(function () {
            showStatus(
              currentLang() === "en" ? "Link copied!" : "¡Enlace copiado!",
              false
            );
          })
          .catch(fallbackCopy);
      } else {
        fallbackCopy();
      }

      function fallbackCopy() {
        input.focus();
        input.select();
        try {
          document.execCommand("copy");
          showStatus(
            currentLang() === "en" ? "Link copied!" : "¡Enlace copiado!",
            false
          );
        } catch (e) {
          showStatus(
            currentLang() === "en"
              ? "Select the link and copy manually (Ctrl+C)."
              : "Selecciona el enlace y cópialo manualmente (Ctrl+C).",
            true
          );
        }
      }
    });
  }

  document.addEventListener("language-changed", function () {
    syncIframe();
    var input = document.getElementById("julie-schedule-share-url");
    if (input) input.value = pageShareUrl();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      syncIframe();
      initCopyLink();
    });
  } else {
    syncIframe();
    initCopyLink();
  }
})();
