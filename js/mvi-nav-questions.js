/**
 * Header nav dropdowns: insurance, questions, funeral resources, About Us, and MVI chatbot.
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
      /* Longer grace so diagonal moves into wide megas don't drop the menu */
      hoverCloseTimer = setTimeout(closeMenu, 320);
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

  function bindLifePanels() {
    document.querySelectorAll(".nav-life-mega").forEach(function (mega) {
      var cats = mega.querySelectorAll("[data-life-panel].nav-life-category");
      var panels = mega.querySelectorAll(".nav-life-panel[data-life-panel]");
      if (!cats.length || !panels.length) return;

      function activate(id) {
        cats.forEach(function (c) {
          var on = c.getAttribute("data-life-panel") === id;
          c.classList.toggle("is-active", on);
          c.setAttribute("aria-pressed", on ? "true" : "false");
        });
        panels.forEach(function (p) {
          var on = p.getAttribute("data-life-panel") === id;
          p.classList.toggle("is-active", on);
          if (on) p.removeAttribute("hidden");
          else p.setAttribute("hidden", "");
        });
      }

      cats.forEach(function (cat) {
        cat.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          activate(cat.getAttribute("data-life-panel"));
        });
        cat.addEventListener("mouseenter", function () {
          activate(cat.getAttribute("data-life-panel"));
        });
      });
    });
  }

  function bindMobileAccordions() {
    var menu = document.getElementById("mobile-menu");
    if (!menu) return;

    menu.querySelectorAll(".mobile-menu-toggle").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var panelId = btn.getAttribute("aria-controls");
        var panel = panelId ? document.getElementById(panelId) : null;
        var wrap = btn.closest(".mobile-menu-accordion");
        if (!panel || !wrap) return;

        var willOpen = btn.getAttribute("aria-expanded") !== "true";

        menu.querySelectorAll(".mobile-menu-accordion").forEach(function (other) {
          var otherBtn = other.querySelector(".mobile-menu-toggle");
          var otherPanelId = otherBtn && otherBtn.getAttribute("aria-controls");
          var otherPanel = otherPanelId ? document.getElementById(otherPanelId) : null;
          other.classList.remove("is-open");
          if (otherBtn) otherBtn.setAttribute("aria-expanded", "false");
          if (otherPanel) otherPanel.setAttribute("hidden", "");
        });

        if (willOpen) {
          wrap.classList.add("is-open");
          btn.setAttribute("aria-expanded", "true");
          panel.removeAttribute("hidden");
        }
      });
    });
  }

  function init() {
    bindOpenChatTriggers();
    bindLifePanels();
    bindMobileAccordions();
    document.querySelectorAll(".nav-questions-dropdown-trigger").forEach(function (trigger) {
      bindDropdown(trigger, ".nav-questions-dropdown", ".nav-questions-dropdown-menu");
    });
    document.querySelectorAll(".nav-about-dropdown-trigger").forEach(function (trigger) {
      bindDropdown(trigger, ".nav-about-dropdown", ".nav-about-mega");
    });
    document.querySelectorAll(".nav-funeral-dropdown-trigger").forEach(function (trigger) {
      bindDropdown(trigger, ".nav-funeral-dropdown", ".nav-funeral-mega");
    });
    document.querySelectorAll(".nav-life-dropdown-trigger").forEach(function (trigger) {
      bindDropdown(trigger, ".nav-life-dropdown", ".nav-life-mega");
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
