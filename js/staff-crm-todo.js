/**
 * CRM Staff To-Do — Julie / Justin personal lists.
 */
(function () {
  "use strict";

  var OWNERS = ["julie", "justin"];

  var state = {
    owner: "",
    items: [],
    loading: false,
  };

  function t(key, vars) {
    if (window.StaffCrm && window.StaffCrm.t) return window.StaffCrm.t(key, vars);
    if (window.StaffCrmI18n) return window.StaffCrmI18n.t(key, vars);
    return key;
  }

  function esc(s) {
    return window.StaffCrm ? window.StaffCrm.esc(s) : String(s == null ? "" : s);
  }

  function api(path, body, opts) {
    if (!window.StaffCrm || !window.StaffCrm.authedApi) throw new Error("StaffCrm not ready");
    return window.StaffCrm.authedApi(path, body, opts);
  }

  function $(id, root) {
    return (root || document).querySelector("#" + id);
  }

  function navigate(hash) {
    if (window.StaffCrm && window.StaffCrm.navigate) window.StaffCrm.navigate(hash);
    else location.hash = hash;
  }

  function ownerLabel(owner) {
    return owner === "justin" ? t("todo_justin") : t("todo_julie");
  }

  function fmtDateTime(iso) {
    if (!iso) return "—";
    var d = new Date(iso);
    if (isNaN(d.getTime())) return "—";
    var lang = window.StaffCrmI18n ? window.StaffCrmI18n.getLang() : "en";
    var locale = lang === "es" ? "es-US" : "en-US";
    return d.toLocaleString(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  }

  function renderPicker() {
    return (
      '<div class="crm-todo-shell">' +
      '<h1 class="crm-todo-page-title">' +
      esc(t("todo_title")) +
      "</h1>" +
      '<p class="crm-todo-subtitle">' +
      esc(t("todo_pick_blurb")) +
      "</p>" +
      '<div class="crm-todo-picker">' +
      '<button type="button" class="crm-todo-person-btn" data-todo-owner="julie">' +
      "<strong>" +
      esc(t("todo_julie")) +
      "</strong>" +
      "<span>" +
      esc(t("todo_julie_hint")) +
      "</span></button>" +
      '<button type="button" class="crm-todo-person-btn" data-todo-owner="justin">' +
      "<strong>" +
      esc(t("todo_justin")) +
      "</strong>" +
      "<span>" +
      esc(t("todo_justin_hint")) +
      "</span></button></div></div>"
    );
  }

  function renderListView() {
    return (
      '<div class="crm-todo-shell">' +
      '<div class="crm-todo-topbar">' +
      '<button type="button" class="crm-todo-back" id="crm-todo-back">' +
      esc(t("todo_back")) +
      "</button>" +
      '<h2 class="crm-todo-owner-title">' +
      esc(ownerLabel(state.owner)) +
      "</h2></div>" +
      '<div class="crm-todo-card">' +
      '<form id="crm-todo-form" class="crm-todo-compose" autocomplete="off">' +
      "<div>" +
      '<label class="visually-hidden" for="crm-todo-input">' +
      esc(t("todo_input_label")) +
      "</label>" +
      '<textarea id="crm-todo-input" rows="2" placeholder="' +
      esc(t("todo_input_ph")) +
      '"></textarea></div>' +
      '<button type="submit" class="crm-btn" id="crm-todo-add">' +
      esc(t("todo_add")) +
      "</button></form>" +
      '<ul id="crm-todo-list" class="crm-todo-list" aria-live="polite"></ul>' +
      '<div id="crm-todo-status" class="crm-todo-status"></div></div></div>'
    );
  }

  function setStatus(msg, isError) {
    var el = $("crm-todo-status");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("is-error", !!isError);
  }

  function renderItems() {
    var list = $("crm-todo-list");
    if (!list) return;
    if (state.loading) {
      list.innerHTML = '<li class="crm-todo-empty">' + esc(t("loading")) + "</li>";
      return;
    }
    if (!state.items.length) {
      list.innerHTML = '<li class="crm-todo-empty">' + esc(t("todo_empty")) + "</li>";
      return;
    }
    list.innerHTML = state.items
      .map(function (item) {
        return (
          '<li class="crm-todo-item" data-id="' +
          esc(item.id) +
          '"><div class="crm-todo-item-body"><div class="crm-todo-item-text">' +
          esc(item.body || "") +
          '</div><div class="crm-todo-item-when">' +
          esc(fmtDateTime(item.created_at)) +
          '</div></div><button type="button" class="crm-todo-delete" data-id="' +
          esc(item.id) +
          '" aria-label="' +
          esc(t("todo_delete")) +
          '" title="' +
          esc(t("todo_delete")) +
          '">&#128465;</button></li>'
        );
      })
      .join("");
    list.querySelectorAll(".crm-todo-delete").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var id = btn.getAttribute("data-id");
        if (id) void deleteItem(id);
      });
    });
  }

  async function loadItems() {
    if (!state.owner) return;
    state.loading = true;
    renderItems();
    setStatus("");
    try {
      var data = await api(
        "/api/staff/todo?owner=" + encodeURIComponent(state.owner),
        null,
        { method: "GET" }
      );
      state.items = Array.isArray(data.items) ? data.items : [];
    } catch (e) {
      state.items = [];
      setStatus(t("todo_load_failed"), true);
    } finally {
      state.loading = false;
      renderItems();
    }
  }

  async function addItem(text) {
    var addBtn = $("crm-todo-add");
    var input = $("crm-todo-input");
    if (addBtn) addBtn.disabled = true;
    setStatus("");
    try {
      var data = await api(
        "/api/staff/todo",
        { owner: state.owner, body: text },
        { method: "POST" }
      );
      if (data.item) {
        state.items.unshift(data.item);
        renderItems();
      } else {
        await loadItems();
      }
      if (input) input.value = "";
      setStatus("");
    } catch (e) {
      setStatus(t("todo_add_failed"), true);
    } finally {
      if (addBtn) addBtn.disabled = false;
      if (input) input.focus();
    }
  }

  async function deleteItem(id) {
    setStatus("");
    try {
      await api("/api/staff/todo?id=" + encodeURIComponent(id), null, { method: "DELETE" });
      state.items = state.items.filter(function (item) {
        return String(item.id) !== String(id);
      });
      renderItems();
    } catch (e) {
      setStatus(t("todo_delete_failed"), true);
    }
  }

  function wirePicker(root) {
    root.querySelectorAll("[data-todo-owner]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var owner = btn.getAttribute("data-todo-owner") || "";
        if (OWNERS.indexOf(owner) === -1) return;
        navigate("#/todo/" + owner);
      });
    });
  }

  function wireList(root) {
    var back = $("crm-todo-back", root);
    if (back) {
      back.addEventListener("click", function () {
        navigate("#/todo");
      });
    }
    var form = $("crm-todo-form", root);
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var input = $("crm-todo-input");
        var text = input ? String(input.value || "").trim() : "";
        if (!text) return;
        void addItem(text);
      });
    }
    var input = $("crm-todo-input", root);
    if (input) {
      input.addEventListener("keydown", function (e) {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          var text = String(input.value || "").trim();
          if (text) void addItem(text);
        }
      });
    }
  }

  async function mount(main, opts) {
    if (!main) return;
    var owner = opts && opts.owner ? String(opts.owner).toLowerCase() : "";
    if (owner && OWNERS.indexOf(owner) === -1) owner = "";

    if (!owner) {
      state.owner = "";
      state.items = [];
      main.innerHTML = renderPicker();
      wirePicker(main);
      return;
    }

    state.owner = owner;
    main.innerHTML = renderListView();
    wireList(main);
    await loadItems();
    var input = $("crm-todo-input");
    if (input) input.focus();
  }

  window.StaffCrmTodo = { mount: mount };
})();
