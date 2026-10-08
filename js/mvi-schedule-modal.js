/**
 * Mount MVI scheduler inside Bootstrap modals on first open.
 */
(function () {
  "use strict";

  function mountInto(root) {
    if (!root || root.getAttribute("data-mvi-scheduler-mounted") === "1") return;
    if (window.MviScheduler && typeof window.MviScheduler.mount === "function") {
      window.MviScheduler.mount(root);
    }
  }

  /**
   * @param {string} modalId
   * @param {string} rootId
   * @param {{ bodyClass?: string }} [opts]
   */
  function bind(modalId, rootId, opts) {
    var modalEl = document.getElementById(modalId);
    var root = document.getElementById(rootId);
    if (!modalEl || !root) return;
    if (modalEl.getAttribute("data-mvi-schedule-bound") === "1") return;
    modalEl.setAttribute("data-mvi-schedule-bound", "1");

    var bodyClass = (opts && opts.bodyClass) || "mvi-schedule-modal-open";

    modalEl.addEventListener("show.bs.modal", function () {
      mountInto(root);
      document.body.classList.add(bodyClass);
    });
    modalEl.addEventListener("hidden.bs.modal", function () {
      document.body.classList.remove(bodyClass);
    });
  }

  window.MviScheduleModal = { bind: bind, mountInto: mountInto };
})();
