/** Searchable combobox — Ethos-style filter + scroll browse. */
(function () {
  "use strict";

  function createSearchableCombobox(container, options) {
    options = options || {};
    var rawItems = options.items || [];
    var allowEmpty = !!options.allowEmpty;
    var isEn =
      document.documentElement.lang === "en" ||
      document.body.getAttribute("data-lf-lang") === "en";
    var placeholder = options.placeholder || (isEn ? "Select..." : "Selecciona...");
    var inputId = options.inputId || "lf-search-combobox-input";
    var listboxId = options.listboxId || "lf-search-combobox-listbox";
    var labelId = options.labelId || null;
    var baseClass = options.baseClass || "lf-search-combobox";
    var showCode = !!options.showCode;

    function normalizeItem(item) {
      if (typeof item === "string") {
        return {
          value: item,
          label: item,
          code: "",
          searchText: item.toLowerCase(),
        };
      }
      var name = item.name || item.value || "";
      var code = item.code || "";
      return {
        value: name,
        label: name,
        code: code,
        searchText: (name + " " + code).toLowerCase(),
      };
    }

    var items = rawItems.map(normalizeItem);
    var fallbackValue = options.defaultValue || (allowEmpty ? "" : items[0] ? items[0].value : "");

    var state = {
      value: options.value !== undefined && options.value !== null ? options.value : fallbackValue,
      open: false,
      query: "",
      highlightIndex: -1,
      filtered: [],
    };

    container.innerHTML = "";
    container.classList.add(baseClass);

    if (options.label && !options.skipLabel) {
      var label = document.createElement("label");
      label.className = "lf-select-label " + baseClass + "__label";
      if (labelId) label.id = labelId;
      label.setAttribute("for", inputId);
      label.textContent = options.label;
      container.appendChild(label);
    }

    var triggerWrap = document.createElement("div");
    triggerWrap.className = baseClass + "__trigger-wrap";

    var input = document.createElement("input");
    input.type = "text";
    input.className = baseClass + "__input";
    input.id = inputId;
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", listboxId);
    if (labelId) input.setAttribute("aria-labelledby", labelId);
    input.setAttribute("aria-autocomplete", "list");
    if (options.autocomplete) input.setAttribute("autocomplete", options.autocomplete);
    input.placeholder = placeholder;
    input.readOnly = true;

    var chevron = document.createElement("span");
    chevron.className = baseClass + "__chevron";
    chevron.setAttribute("aria-hidden", "true");

    var panel = document.createElement("div");
    panel.className = baseClass + "__panel";
    panel.hidden = true;

    var listbox = document.createElement("div");
    listbox.className = baseClass + "__list";
    listbox.id = listboxId;
    listbox.setAttribute("role", "listbox");

    var empty = document.createElement("div");
    empty.className = baseClass + "__empty";
    empty.textContent = "No se encontraron resultados";
    empty.hidden = true;

    triggerWrap.appendChild(input);
    triggerWrap.appendChild(chevron);
    panel.appendChild(listbox);
    panel.appendChild(empty);
    container.appendChild(triggerWrap);
    container.appendChild(panel);

    function getFilteredItems() {
      var q = state.query.trim().toLowerCase();
      if (!q) return items.slice();
      return items.filter(function (item) {
        return item.searchText.indexOf(q) >= 0;
      });
    }

    function findItem(value) {
      if (!value) return null;
      var lower = String(value).toLowerCase();
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.value === value || item.value.toLowerCase() === lower) return item;
        if (item.code && item.code.toLowerCase() === lower) return item;
      }
      return null;
    }

    function formatDisplay(item) {
      if (!item) return "";
      if (showCode && item.code && item.code !== "OTHER") return item.label + " (" + item.code + ")";
      return item.label;
    }

    function optionId(index) {
      return listboxId + "-opt-" + index;
    }

    function updateActivedescendant() {
      if (state.highlightIndex >= 0 && state.filtered[state.highlightIndex]) {
        input.setAttribute("aria-activedescendant", optionId(state.highlightIndex));
      } else {
        input.removeAttribute("aria-activedescendant");
      }
    }

    function scrollHighlightedIntoView() {
      if (state.highlightIndex < 0) return;
      var el = document.getElementById(optionId(state.highlightIndex));
      if (el) el.scrollIntoView({ block: "nearest" });
    }

    function renderList() {
      state.filtered = getFilteredItems();
      listbox.innerHTML = "";

      if (state.filtered.length === 0) {
        empty.hidden = false;
        listbox.hidden = true;
        input.removeAttribute("aria-activedescendant");
        return;
      }

      empty.hidden = true;
      listbox.hidden = false;

      state.filtered.forEach(function (item, index) {
        var opt = document.createElement("div");
        opt.className = baseClass + "__option";
        opt.setAttribute("role", "option");
        opt.id = optionId(index);
        opt.setAttribute("data-value", item.value);
        opt.setAttribute("aria-selected", item.value === state.value ? "true" : "false");
        opt.classList.toggle("is-selected", item.value === state.value);
        opt.classList.toggle("is-highlighted", index === state.highlightIndex);

        if (showCode && item.code && item.code !== "OTHER") {
          var nameEl = document.createElement("span");
          nameEl.className = baseClass + "__option-label";
          nameEl.textContent = item.label;
          var codeEl = document.createElement("span");
          codeEl.className = baseClass + "__option-code";
          codeEl.textContent = "(" + item.code + ")";
          opt.appendChild(nameEl);
          opt.appendChild(codeEl);
        } else {
          opt.textContent = item.label;
        }

        opt.addEventListener("mousedown", function (ev) {
          ev.preventDefault();
        });
        opt.addEventListener("pointerdown", function (ev) {
          ev.preventDefault();
          selectItem(item.value);
        });
        opt.addEventListener("click", function (ev) {
          ev.preventDefault();
          selectItem(item.value);
        });

        listbox.appendChild(opt);
      });

      updateActivedescendant();
    }

    function syncInputDisplay() {
      var selected = findItem(state.value);
      if (state.value && selected) {
        input.value = formatDisplay(selected);
        input.classList.remove("is-empty");
      } else if (state.value) {
        input.value = state.value;
        input.classList.remove("is-empty");
      } else {
        input.value = "";
        input.classList.add("is-empty");
      }
      state.query = "";
    }

    function openDropdown() {
      if (state.open) return;
      state.open = true;
      input.readOnly = false;
      input.classList.remove("is-empty");
      input.setAttribute("aria-expanded", "true");
      container.classList.add("is-open");
      panel.hidden = false;
      state.query = "";
      input.value = "";
      state.filtered = getFilteredItems();
      var selectedIdx = -1;
      for (var i = 0; i < state.filtered.length; i++) {
        if (state.filtered[i].value === state.value) {
          selectedIdx = i;
          break;
        }
      }
      state.highlightIndex = selectedIdx >= 0 ? selectedIdx : 0;
      renderList();
      scrollHighlightedIntoView();
    }

    function closeDropdown(revert) {
      if (!state.open) return;
      state.open = false;
      input.readOnly = true;
      input.setAttribute("aria-expanded", "false");
      container.classList.remove("is-open");
      panel.hidden = true;
      empty.hidden = true;
      state.query = "";
      state.highlightIndex = -1;
      if (revert !== false) syncInputDisplay();
      input.removeAttribute("aria-activedescendant");
    }

    function selectItem(name) {
      if (!name) return;
      state.value = name;
      closeDropdown(true);
      if (typeof options.onChange === "function") options.onChange(name);
    }

    function moveHighlight(delta) {
      if (!state.filtered.length) return;
      if (state.highlightIndex < 0) state.highlightIndex = 0;
      else {
        state.highlightIndex =
          (state.highlightIndex + delta + state.filtered.length) % state.filtered.length;
      }
      renderList();
      scrollHighlightedIntoView();
    }

    function onDocPointerDown(ev) {
      if (!container.contains(ev.target)) closeDropdown(true);
    }

    triggerWrap.addEventListener("pointerdown", function (ev) {
      if (state.open) return;
      ev.preventDefault();
      input.focus({ preventScroll: true });
      openDropdown();
    });

    input.addEventListener("click", function () {
      if (!state.open) openDropdown();
    });

    input.addEventListener("input", function () {
      if (!state.open) openDropdown();
      state.query = input.value;
      state.filtered = getFilteredItems();
      state.highlightIndex = state.filtered.length ? 0 : -1;
      renderList();
      if (state.highlightIndex >= 0) scrollHighlightedIntoView();
    });

    input.addEventListener("keydown", function (ev) {
      if (!state.open) {
        if (ev.key === "ArrowDown" || ev.key === "Enter" || ev.key === " ") {
          ev.preventDefault();
          openDropdown();
        }
        return;
      }

      if (ev.key === "ArrowDown") {
        ev.preventDefault();
        moveHighlight(1);
      } else if (ev.key === "ArrowUp") {
        ev.preventDefault();
        moveHighlight(-1);
      } else if (ev.key === "Enter") {
        ev.preventDefault();
        if (state.highlightIndex >= 0 && state.filtered[state.highlightIndex]) {
          selectItem(state.filtered[state.highlightIndex].value);
        }
      } else if (ev.key === "Escape") {
        ev.preventDefault();
        closeDropdown(true);
      } else if (ev.key === "Tab") {
        closeDropdown(true);
      }
    });

    document.addEventListener("pointerdown", onDocPointerDown);

    function setValue(name) {
      if (!name && allowEmpty) {
        state.value = "";
        syncInputDisplay();
        return;
      }
      var match = findItem(name);
      var normalized = match ? match.value : name || fallbackValue;
      if (!match && items.every(function (item) { return item.value !== normalized; })) {
        normalized = fallbackValue;
      }
      state.value = normalized;
      syncInputDisplay();
    }

    function destroy() {
      document.removeEventListener("pointerdown", onDocPointerDown);
    }

    setValue(state.value);

    return {
      getValue: function () {
        return state.value || null;
      },
      setValue: setValue,
      open: openDropdown,
      close: function () {
        closeDropdown(true);
      },
      destroy: destroy,
      focus: function () {
        input.focus();
      },
    };
  }

  window.MVILandingSearchCombobox = {
    create: createSearchableCombobox,
  };

  window.MVILandingCountryCombobox = {
    create: function (container, options) {
      options = options || {};
      return createSearchableCombobox(container, {
        items: options.countries || window.MVILandingBirthCountries || ["United States", "Other"],
        defaultValue: "United States",
        allowEmpty: false,
        autocomplete: "country",
        inputId: options.inputId,
        listboxId: options.listboxId,
        labelId: options.labelId,
        skipLabel: options.skipLabel,
        label: options.label,
        value: options.value,
        onChange: options.onChange,
      });
    },
  };
})();
