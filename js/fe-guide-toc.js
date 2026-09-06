/**
 * FE guide table of contents drawer (hub + article pages).
 */
(function () {
  "use strict";

  function bindToc() {
    var openBtn = document.getElementById("fe-guide-toc-open");
    var backdrop = document.getElementById("fe-guide-toc-backdrop");
    var drawer = document.getElementById("fe-guide-toc-drawer");
    var closeBtn = document.getElementById("fe-guide-toc-close");
    if (!openBtn || !backdrop || !drawer || !closeBtn) return;

    function openDrawer() {
      backdrop.hidden = false;
      backdrop.classList.add("is-open");
      openBtn.setAttribute("aria-expanded", "true");
      document.body.classList.add("fe-guide-toc-open");
      drawer.focus();
    }

    function closeDrawer() {
      backdrop.classList.remove("is-open");
      backdrop.hidden = true;
      openBtn.setAttribute("aria-expanded", "false");
      document.body.classList.remove("fe-guide-toc-open");
      openBtn.focus();
    }

    openBtn.addEventListener("click", openDrawer);
    closeBtn.addEventListener("click", closeDrawer);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeDrawer();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && backdrop.classList.contains("is-open")) closeDrawer();
    });
    drawer.addEventListener("click", function (e) {
      var link = e.target && e.target.closest && e.target.closest("a[href]");
      if (link && !link.getAttribute("target")) closeDrawer();
    });
  }

  function bindModal(openId, backdropId, closeId) {
    var openBtn = document.getElementById(openId);
    var backdrop = document.getElementById(backdropId);
    var closeBtn = document.getElementById(closeId);
    if (!openBtn || !backdrop || !closeBtn) return;

    function openModal() {
      backdrop.hidden = false;
      backdrop.classList.add("is-open");
    }

    function closeModal() {
      backdrop.classList.remove("is-open");
      backdrop.hidden = true;
      openBtn.focus();
    }

    openBtn.addEventListener("click", openModal);
    closeBtn.addEventListener("click", closeModal);
    backdrop.addEventListener("click", function (e) {
      if (e.target === backdrop) closeModal();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && backdrop.classList.contains("is-open")) closeModal();
    });
  }

  function init() {
    bindToc();
    bindModal(
      "fe-guide-disclosures-btn",
      "fe-guide-disclosures-modal-backdrop",
      "fe-guide-disclosures-modal-close"
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
