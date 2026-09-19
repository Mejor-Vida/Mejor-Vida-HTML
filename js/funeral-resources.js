/**
 * Funeral home + cemetery directory — jump to the city’s static resource URL.
 */
(function () {
  "use strict";

  var root = document.querySelector("[data-mvi-fhdir]");
  if (!root) return;

  var lang = root.getAttribute("data-fhdir-lang") === "en" ? "en" : "es";
  var dataUrl = root.getAttribute("data-src") || "/data/funeral-resources.json";
  var form = root.querySelector("[data-fhdir-form]");
  var input = root.querySelector("[data-fhdir-input]");
  var stateSel = root.querySelector("[data-fhdir-state]");
  var suggestEl = root.querySelector("[data-fhdir-suggest]");
  var statusEl = root.querySelector("[data-fhdir-status]");
  var resultsEl = root.querySelector("[data-fhdir-results]");
  var gplFilter = root.querySelector("[data-fhdir-gpl-filter]");
  var countEl = root.querySelector("[data-fhdir-count]");

  var COPY = {
    es: {
      looking: "Buscando…",
      error: "No pudimos cargar el directorio. Recargue la página.",
      empty: "Seleccione un estado y pulse buscar. Si no sabe la ciudad, busque solo con el estado.",
      none: "No encontramos funerarias registradas actualmente para esta ciudad.",
      noneHint: "Busque otra ciudad cercana o vuelva a los resultados del estado.",
      noneState: "Todavía no hay funerarias registradas para este estado.",
      several: "Hay más de una coincidencia. Elija la ciudad:",
      pickCity: function (name) {
        return "Ciudades en " + name;
      },
      pickCityLead: "Pulse una ciudad para ver las funerarias.",
      citiesFound: function (n, name) {
        return n + (n === 1 ? " ciudad en " : " ciudades en ") + name + ". Pulse una para ver las funerarias.";
      },
      needState: "Seleccione un estado para buscar.",
      found: function (n, city, state) {
        return (
          n +
          (n === 1 ? " funeraria encontrada en " : " funerarias encontradas en ") +
          city +
          ", " +
          state
        );
      },
      updated: function (d) {
        return "Actualizado " + d + " a partir de las guías y contactos de ciudad.";
      },
    },
    en: {
      looking: "Searching…",
      error: "We could not load the directory. Reload the page.",
      empty: "Select a state and search. If you do not know the city, search with the state only.",
      none: "We did not find funeral homes currently registered for this city.",
      noneHint: "Search another nearby city or return to the state list.",
      noneState: "We do not yet have funeral homes registered for this state.",
      several: "More than one match. Choose the city:",
      pickCity: function (name) {
        return "Cities in " + name;
      },
      pickCityLead: "Click a city to see the funeral homes.",
      citiesFound: function (n, name) {
        return n + (n === 1 ? " city in " : " cities in ") + name + ". Click one to see the funeral homes.";
      },
      needState: "Select a state to search.",
      found: function (n, city, state) {
        return n + " funeral home" + (n === 1 ? "" : "s") + " found in " + city + ", " + state;
      },
      updated: function (d) {
        return "Updated " + d + " from the city guides and directory contacts.";
      },
    },
  };

  var t = COPY[lang] || COPY.es;
  var data = null;
  var selectedState = (root.getAttribute("data-state") || "").toUpperCase();

  function fold(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  function esc(s) {
    return String(s || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function records() {
    if (!data) return [];
    if (data.listings && data.listings.length) return data.listings;
    return data.places || [];
  }

  function dirStateCodes() {
    if (!data || !data.states) return [];
    return data.states.map(function (s) {
      return String(s.code || "").toUpperCase();
    });
  }

  function recName(r) {
    return lang === "es" ? r.nameEs : r.nameEn;
  }

  function recState(r) {
    return lang === "es" ? r.stateNameEs : r.stateNameEn;
  }

  function recHref(r) {
    if (lang === "en") return r.pathEn || "";
    return r.pathEs || "";
  }

  function currentState() {
    if (stateSel && stateSel.value) return String(stateSel.value).toUpperCase();
    return selectedState || "";
  }

  function stateLabel(code) {
    var match = (data && data.states ? data.states : []).filter(function (s) {
      return String(s.code || "").toUpperCase() === code;
    })[0];
    if (match) return lang === "es" ? match.nameEs : match.nameEn;
    var rec = records().filter(function (r) {
      return String(r.stateCode || "").toUpperCase() === code;
    })[0];
    return rec ? recState(rec) : code;
  }

  function inSelectedState(r) {
    var code = currentState();
    if (!code) return true;
    return String(r.stateCode || "").toUpperCase() === code;
  }

  function findRecords(q) {
    var f = fold(q);
    if (!f || f.length < 2) return [];
    var list = records().filter(inSelectedState);
    var primary = list.filter(function (r) {
      return (
        fold(r.nameEn) === f ||
        fold(r.nameEs) === f ||
        r.slug === String(q).trim() ||
        fold(String(r.slug || "").replace(/-/g, " ")) === f
      );
    });
    if (primary.length) return primary;
    var alias = list.filter(function (r) {
      return (r.aliases || []).some(function (a) {
        return fold(a) === f;
      });
    });
    if (alias.length) return alias;
    return list.filter(function (r) {
      if (fold(r.nameEn).indexOf(f) === 0 || fold(r.nameEs).indexOf(f) === 0) return true;
      return (r.aliases || []).some(function (a) {
        return fold(a).indexOf(f) === 0;
      });
    });
  }

  function citiesInState(code) {
    return records()
      .filter(function (r) {
        return String(r.stateCode || "").toUpperCase() === code;
      })
      .sort(function (a, b) {
        return recName(a).localeCompare(recName(b), lang === "es" ? "es" : "en", {
          sensitivity: "base",
        });
      });
  }

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function hideSuggest() {
    if (!suggestEl) return;
    suggestEl.hidden = true;
    suggestEl.innerHTML = "";
  }

  function showSuggest(items) {
    if (!suggestEl) return;
    if (!items.length) {
      hideSuggest();
      return;
    }
    suggestEl.innerHTML = items
      .slice(0, 8)
      .map(function (r) {
        var href = recHref(r);
        var label = esc(recName(r)) + ", " + esc(recState(r));
        if (href) return "<li><a href='" + esc(href) + "'>" + label + "</a></li>";
        return (
          "<li><button type='button' data-slug='" + esc(r.slug) + "'>" + label + "</button></li>"
        );
      })
      .join("");
    suggestEl.hidden = false;
  }

  function goTo(rec) {
    var href = recHref(rec);
    if (href) {
      window.location.href = href;
      return;
    }
    hideSuggest();
    if (input) input.value = recName(rec);
    setStatus(t.updated(data.updated));
  }

  function cityPills(items) {
    return (
      "<ul class='mvi-fhdir__pills'>" +
      items
        .map(function (r) {
          var href = recHref(r);
          var label = esc(recName(r));
          if (href) return "<li><a href='" + esc(href) + "'>" + label + "</a></li>";
          return (
            "<li><button type='button' data-slug='" + esc(r.slug) + "'>" + label + "</button></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function renderChoices(items) {
    if (!resultsEl) return;
    resultsEl.innerHTML =
      '<p class="mvi-fhdir__lede">' + esc(t.several) + "</p>" + cityPills(items);
  }

  function renderStateCities(code) {
    var name = stateLabel(code);
    var items = citiesInState(code);
    var pageState = String(root.getAttribute("data-state") || "").toUpperCase();
    var existing = root.querySelector(".mvi-fhdir__state-cities");
    if (existing && pageState === code && !root.getAttribute("data-city")) {
      if (resultsEl) resultsEl.innerHTML = "";
      if (!items.length) {
        setStatus(t.noneState);
        return;
      }
      setStatus(t.citiesFound(items.length, name));
      existing.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    if (!resultsEl) return;
    if (!items.length) {
      resultsEl.innerHTML =
        '<div class="mvi-fhdir__empty"><p><strong>' +
        esc(t.noneState) +
        "</strong></p></div>";
      setStatus(t.noneState);
      return;
    }
    resultsEl.innerHTML =
      '<div class="mvi-fhdir__city-results">' +
      "<h2>" +
      esc(t.pickCity(name)) +
      "</h2>" +
      '<p class="mvi-fhdir__lede">' +
      esc(t.pickCityLead) +
      "</p>" +
      cityPills(items) +
      "</div>";
    setStatus(t.citiesFound(items.length, name));
    resultsEl.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function stateHasData(code) {
    return dirStateCodes().indexOf(String(code || "").toUpperCase()) !== -1;
  }

  function runQuery(q) {
    var query = String(q || "").trim();
    hideSuggest();
    if (!query) {
      var code = currentState();
      if (!code) {
        if (resultsEl) resultsEl.innerHTML = "";
        setStatus(t.needState);
        return;
      }
      renderStateCities(code);
      return;
    }
    var items = findRecords(query);
    if (!items.length) {
      if (resultsEl) {
        resultsEl.innerHTML =
          '<div class="mvi-fhdir__empty"><p><strong>' +
          esc(currentState() && !stateHasData(currentState()) ? t.noneState : t.none) +
          "</strong></p><p>" +
          esc(t.noneHint) +
          "</p></div>";
      }
      setStatus(currentState() && !stateHasData(currentState()) ? t.noneState : t.none);
      return;
    }
    if (items.length === 1) {
      goTo(items[0]);
      return;
    }
    setStatus(t.several);
    renderChoices(items);
  }

  function applyGplFilter() {
    var on = !!(gplFilter && gplFilter.checked);
    var cards = root.querySelectorAll("[data-fhdir-home]");
    var visible = 0;
    cards.forEach(function (card) {
      var keep = !on || card.getAttribute("data-has-gpl") === "1";
      card.hidden = !keep;
      if (keep) visible += 1;
    });
    if (countEl) {
      var city = root.getAttribute("data-city") || "";
      var state = root.getAttribute("data-state-name") || "";
      countEl.textContent = t.found(visible, city, state);
    }
  }

  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      runQuery(input ? input.value : "");
    });
  }

  if (stateSel) {
    stateSel.addEventListener("change", function () {
      selectedState = String(stateSel.value || "").toUpperCase();
      hideSuggest();
    });
  }

  if (input) {
    input.addEventListener("input", function () {
      if (!data) return;
      var q = input.value.trim();
      if (q.length < 2) {
        hideSuggest();
        return;
      }
      showSuggest(findRecords(q));
    });
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Escape") hideSuggest();
    });
  }

  if (gplFilter) {
    gplFilter.addEventListener("change", applyGplFilter);
  }

  document.addEventListener("click", function (ev) {
    if (suggestEl && !root.contains(ev.target)) hideSuggest();
  });

  root.addEventListener("click", function (ev) {
    var btn = ev.target.closest("[data-slug]");
    if (!btn || !data) return;
    var rec = records().filter(function (r) {
      return r.slug === btn.getAttribute("data-slug");
    })[0];
    if (rec) goTo(rec);
  });

  if (selectedState && stateSel && !stateSel.value) stateSel.value = selectedState;

  setStatus(t.looking);
  fetch(dataUrl, { credentials: "same-origin" })
    .then(function (res) {
      if (!res.ok) throw new Error("load");
      return res.json();
    })
    .then(function (json) {
      data = json;
      var onListing = !!root.querySelector(".mvi-fhdir__placehead");
      setStatus(onListing ? "" : t.updated(data.updated));
      var params = new URLSearchParams(window.location.search);
      var ciudad = params.get("ciudad") || params.get("city") || params.get("q");
      var st = params.get("state") || params.get("estado");
      if (st && stateSel) {
        selectedState = String(st).toUpperCase();
        stateSel.value = selectedState;
      }
      if (ciudad) runQuery(ciudad);
      else if (st && !onListing) runQuery("");
    })
    .catch(function () {
      setStatus(t.error);
    });
})();
