/**
 * Header nav dropdowns: "¿Tienes preguntas?" + About Us mega menu + open MVI chatbot.
 */
(function () {
  "use strict";

  function closeMobileMenu() {
    var mm = document.getElementById("mobile-menu");
    if (mm) mm.classList.remove("active");
    var hb = document.getElementById("hamburger-btn");
    if (hb) hb.textContent = "☰";
  }

  function openAssistant() {
    closeMobileMenu();
    if (typeof window.MviOpenAssistant === "function") {
      window.MviOpenAssistant();
      return;
    }
    var fab = document.querySelector("[data-mvi-launcher] button, .mvi-assist-fab");
    if (fab) fab.click();
  }

  function bindOpenChatTriggers() {
    document.addEventListener(
      "click",
      function (e) {
        var el = e.target && e.target.closest && e.target.closest("[data-mvi-open-chat]");
        if (!el) return;
        e.preventDefault();
        openAssistant();
      },
      true
    );
  }

  function bindDropdown(trigger, wrapSelector, menuSelector) {
    var wrap = trigger.closest(wrapSelector);
    var menu = wrap && wrap.querySelector(menuSelector);
    if (!wrap || !menu) return;

    var hoverCloseTimer = null;
    var usesHidden = menu.hasAttribute("hidden") || menuSelector.indexOf("questions") !== -1;

    function openMenu() {
      if (usesHidden) menu.removeAttribute("hidden");
      wrap.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");
    }

    function closeMenu() {
      wrap.classList.remove("is-open");
      trigger.setAttribute("aria-expanded", "false");
      menu.setAttribute("aria-hidden", "true");
      if (usesHidden) menu.setAttribute("hidden", "");
    }

    function scheduleClose() {
      clearTimeout(hoverCloseTimer);
      hoverCloseTimer = setTimeout(closeMenu, 180);
    }

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      if (wrap.classList.contains("is-open")) closeMenu();
      else openMenu();
    });

    trigger.addEventListener("mouseenter", function () {
      clearTimeout(hoverCloseTimer);
      openMenu();
    });
    wrap.addEventListener("mouseleave", scheduleClose);
    menu.addEventListener("mouseenter", function () {
      clearTimeout(hoverCloseTimer);
    });

    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) closeMenu();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeMenu();
    });

    menu.addEventListener("click", function (e) {
      var link = e.target && e.target.closest && e.target.closest("a[href]");
      if (link && !link.getAttribute("target")) closeMenu();
    });
  }

  function init() {
    bindOpenChatTriggers();
    document.querySelectorAll(".nav-questions-dropdown-trigger").forEach(function (trigger) {
      bindDropdown(trigger, ".nav-questions-dropdown", ".nav-questions-dropdown-menu");
    });
    document.querySelectorAll(".nav-about-dropdown-trigger").forEach(function (trigger) {
      bindDropdown(trigger, ".nav-about-dropdown", ".nav-about-mega");
    });
    document.querySelectorAll(".nav-funeral-dropdown-trigger").forEach(function (trigger) {
      bindDropdown(trigger, ".nav-funeral-dropdown", ".nav-funeral-mega");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
