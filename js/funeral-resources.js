/**
 * Funeral home + cemetery lookup — one URL per language.
 * City results stay on this page (?estado=&ciudad=).
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
  var pagePath = lang === "en" ? "/en/funeral-homes-cemeteries.html" : "/funerarias-cementerios.html";
  var twinPath = lang === "en" ? "/funerarias-cementerios.html" : "/en/funeral-homes-cemeteries.html";

  var GPL_ROWS = [
    { id: "directCremation", labelEs: "Cremación directa", labelEn: "Direct cremation" },
    { id: "immediateBurial", labelEs: "Entierro inmediato", labelEn: "Immediate burial" },
    { id: "memorialCremation", labelEs: "Cremación con memorial", labelEn: "Cremation with memorial" },
    { id: "traditional", labelEs: "Funeral tradicional con velatorio", labelEn: "Traditional funeral with visitation" },
  ];

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
      cityH2: function (city, state) {
        return "Funerarias en " + city + ", " + state;
      },
      cityNear: function (city, state) {
        return "Funerarias cerca de " + city + ", " + state;
      },
      cityLead: "Vea contactos, sitios web y precios publicados cuando estén disponibles.",
      crumbHub: "Funerarias y cementerios",
      allState: function (name) {
        return "Todas las ciudades de " + name;
      },
      homes: "Funerarias",
      cemeteries: "Cementerios",
      guide: "Guía local de gastos finales",
      localHomes: function (town) {
        return "Funerarias en " + town;
      },
      nearbyHomes: function (parent) {
        return "Otras funerarias del área de " + parent;
      },
      areaHomes: function (parent) {
        return "Funerarias reunidas para el área de " + parent;
      },
      localCems: function (town) {
        return "Cementerios en " + town;
      },
      nearbyCems: function (parent) {
        return "Cementerios del área de " + parent;
      },
      areaCems: function (parent) {
        return "Cementerios reunidos para el área de " + parent;
      },
      filterGpl: "Lista de precios disponible",
      sortAz: "Alfabético A–Z",
      visit: "Visitar sitio",
      call: "Llamar",
      seeGpl: "Ver lista general de precios",
      address: "Dirección",
      phone: "Teléfono",
      site: "Sitio web oficial",
      publishedHead: "Precios publicados",
      noGpl: "Lista general de precios no disponible en línea.",
      noGplAsk: "Pida la lista vigente directamente en la funeraria.",
      extraPkg: "Otros paquetes publicados",
      pkgNote: "Un mismo nombre de paquete no incluye lo mismo de una funeraria a otra.",
      notOnList: "No figura en esta lista",
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
      cityH2: function (city, state) {
        return "Funeral homes in " + city + ", " + state;
      },
      cityNear: function (city, state) {
        return "Funeral homes near " + city + ", " + state;
      },
      cityLead: "See contact information, websites, and published prices when they are available.",
      crumbHub: "Funeral homes and cemeteries",
      allState: function (name) {
        return "All " + name + " cities";
      },
      homes: "Funeral homes",
      cemeteries: "Cemeteries",
      guide: "Local final expense guide",
      localHomes: function (town) {
        return "Funeral homes in " + town;
      },
      nearbyHomes: function (parent) {
        return "Other funeral homes in the " + parent + " area";
      },
      areaHomes: function (parent) {
        return "Funeral homes gathered for the " + parent + " area";
      },
      localCems: function (town) {
        return "Cemeteries in " + town;
      },
      nearbyCems: function (parent) {
        return "Cemeteries in the " + parent + " area";
      },
      areaCems: function (parent) {
        return "Cemeteries gathered for the " + parent + " area";
      },
      filterGpl: "Price list available",
      sortAz: "Alphabetical A–Z",
      visit: "Visit website",
      call: "Call",
      seeGpl: "View general price list",
      address: "Address",
      phone: "Phone",
      site: "Official website",
      publishedHead: "Published prices",
      noGpl: "General price list not available online.",
      noGplAsk: "Contact the funeral home directly to request current pricing.",
      extraPkg: "Other published packages",
      pkgNote: "Packages with the same name at different funeral homes do not include the same items.",
      notOnList: "Not on this published list",
    },
  };

  var t = COPY[lang] || COPY.es;
  var data = null;
  var selectedState = (root.getAttribute("data-state") || "").toUpperCase();
  var skipHistory = false;

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

  function money(n) {
    if (!n) return "";
    return "$" + Number(n).toLocaleString("en-US");
  }

  function phoneTel(phone) {
    var digits = String(phone || "").replace(/\D/g, "");
    return digits ? "tel:+1" + digits : "";
  }

  function hasCopiedPrices(home) {
    return (home.packages || []).some(function (p) {
      return p.amt;
    });
  }

  function records() {
    if (!data) return [];
    if (data.listings && data.listings.length) return data.listings;
    return data.places || [];
  }

  function recName(r) {
    return lang === "es" ? r.nameEs : r.nameEn;
  }

  function recState(r) {
    return lang === "es" ? r.stateNameEs : r.stateNameEn;
  }

  function recHref(r) {
    return pagePath + "?estado=" + encodeURIComponent(r.stateSlug || r.stateCode || "") + "&ciudad=" + encodeURIComponent(r.slug || "");
  }

  function stateQueryHref(codeOrSlug) {
    var st = resolveStateObj(codeOrSlug);
    var slug = st ? st.slug : String(codeOrSlug || "").toLowerCase();
    return pagePath + "?estado=" + encodeURIComponent(slug);
  }

  function currentState() {
    if (stateSel && stateSel.value) return String(stateSel.value).toUpperCase();
    return selectedState || "";
  }

  function resolveStateObj(raw) {
    var v = String(raw || "").trim();
    if (!v || !data || !data.states) return null;
    var up = v.toUpperCase();
    var low = v.toLowerCase();
    for (var i = 0; i < data.states.length; i++) {
      var s = data.states[i];
      if (String(s.code || "").toUpperCase() === up) return s;
      if (String(s.slug || "").toLowerCase() === low) return s;
    }
    return null;
  }

  function applyStateValue(raw) {
    var st = resolveStateObj(raw);
    selectedState = st ? String(st.code || "").toUpperCase() : String(raw || "").toUpperCase();
    if (stateSel && selectedState) stateSel.value = selectedState;
    return selectedState;
  }

  function stateLabel(code) {
    var match = resolveStateObj(code);
    if (match) return lang === "es" ? match.nameEs : match.nameEn;
    var rec = records().filter(function (r) {
      return String(r.stateCode || "").toUpperCase() === String(code || "").toUpperCase();
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
        return String(r.stateCode || "").toUpperCase() === String(code || "").toUpperCase();
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
        var label = esc(recName(r)) + ", " + esc(recState(r));
        return (
          "<li><button type='button' data-slug='" +
          esc(r.slug) +
          "' data-state='" +
          esc(r.stateCode) +
          "'>" +
          label +
          "</button></li>"
        );
      })
      .join("");
    suggestEl.hidden = false;
  }

  function syncShareUrl(href, replace) {
    if (!skipHistory) {
      var now = window.location.pathname + window.location.search;
      if (replace) history.replaceState({}, "", href);
      else if (now !== href) history.pushState({}, "", href);
    }
    var fab = document.querySelector(".mvi-lang-fab");
    if (fab) {
      var q = href.indexOf("?") >= 0 ? href.slice(href.indexOf("?")) : "";
      fab.setAttribute("href", twinPath + q);
    }
  }

  function uniqueHomes(listing) {
    var homes = [].concat(listing.localHomes || [], listing.nearbyHomes || []);
    var seen = {};
    return homes.filter(function (h) {
      var key = h.id || h.name;
      if (seen[key]) return false;
      seen[key] = true;
      return true;
    });
  }

  function sortHomes(homes) {
    return (homes || []).slice().sort(function (a, b) {
      return String(a.name || "").localeCompare(String(b.name || ""), "en", { sensitivity: "base" });
    });
  }

  function displayHost(url) {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch (e) {
      return String(url || "")
        .replace(/^https?:\/\/(www\.)?/, "")
        .replace(/\/$/, "");
    }
  }

  function siteUrl(home) {
    return home.href || "";
  }

  function gplUrl(home) {
    return home.gplHref || (hasCopiedPrices(home) ? home.href : "");
  }

  function homeCard(home) {
    var copied = hasCopiedPrices(home);
    var site = siteUrl(home);
    var gpl = gplUrl(home);
    var tel = phoneTel(home.phone);
    var actions = [];
    if (site) {
      actions.push(
        "<a class='mvi-fhdir__btn mvi-fhdir__btn--ghost' href='" +
          esc(site) +
          "' rel='noopener' target='_blank'>" +
          esc(t.visit) +
          "</a>"
      );
    }
    if (tel) {
      actions.push("<a class='mvi-fhdir__btn mvi-fhdir__btn--ghost' href='" + esc(tel) + "'>" + esc(t.call) + "</a>");
    }
    if (gpl) {
      actions.push(
        "<a class='mvi-fhdir__btn mvi-fhdir__btn--outline' href='" +
          esc(gpl) +
          "' rel='noopener' target='_blank'>" +
          esc(t.seeGpl) +
          "</a>"
      );
    }
    var addr = home.address
      ? "<div><dt>" + esc(t.address) + "</dt><dd><address>" + esc(home.address) + "</address></dd></div>"
      : "";
    var phone = home.phone
      ? "<div><dt>" + esc(t.phone) + "</dt><dd><a href='" + esc(tel) + "'>" + esc(home.phone) + "</a></dd></div>"
      : "";
    var web = site
      ? "<div><dt>" +
        esc(t.site) +
        "</dt><dd><a href='" +
        esc(site) +
        "' rel='noopener' target='_blank'>" +
        esc(displayHost(site)) +
        "</a></dd></div>"
      : "";
    var prices;
    if (copied) {
      var byId = {};
      (home.packages || []).forEach(function (p) {
        byId[p.id] = p;
      });
      var locked = {};
      var rows = GPL_ROWS.map(function (row) {
        locked[row.id] = true;
        var pkg = byId[row.id];
        var amt = pkg && pkg.amt ? money(pkg.amt) : "";
        var label = lang === "en" ? row.labelEn : row.labelEs;
        if (!amt) {
          return (
            "<div class='mvi-fhdir__pkg mvi-fhdir__pkg--na'><span>" +
            esc(label) +
            "</span><span class='mvi-fhdir__pkg-amt mvi-fhdir__pkg-amt--na'>" +
            esc(t.notOnList) +
            "</span></div>"
          );
        }
        return (
          "<div class='mvi-fhdir__pkg'><span>" +
          esc(label) +
          "</span><span class='mvi-fhdir__pkg-amt'>" +
          amt +
          "</span></div>"
        );
      }).join("");
      var extras = (home.packages || []).filter(function (p) {
        return p.amt && !locked[p.id];
      });
      var extraHtml = extras.length
        ? "<p class='mvi-fhdir__extra-label'>" +
          esc(t.extraPkg) +
          "</p>" +
          extras
            .map(function (p) {
              var label = lang === "en" ? p.labelEn || p.id : p.labelEs || p.id;
              return (
                "<div class='mvi-fhdir__pkg'><span>" +
                esc(label) +
                "</span><span class='mvi-fhdir__pkg-amt'>" +
                money(p.amt) +
                "</span></div>"
              );
            })
            .join("")
        : "";
      var date = lang === "en" ? home.gplDateEn : home.gplDateEs;
      var source = lang === "en" ? home.sourceEn : home.sourceEs;
      prices =
        "<div class='mvi-fhdir__prices'><p class='mvi-fhdir__gpl-kicker'>" +
        esc(t.publishedHead) +
        (date ? " · " + esc(date) : "") +
        "</p>" +
        rows +
        extraHtml +
        "<p class='mvi-fhdir__pkg-note'>" +
        esc(t.pkgNote) +
        "</p>" +
        (source ? "<p class='mvi-fhdir__source'>" + esc(source) + "</p>" : "") +
        "</div>";
    } else {
      prices =
        "<div class='mvi-fhdir__nogpl'><p><strong>" +
        esc(t.noGpl) +
        "</strong></p><p>" +
        esc(t.noGplAsk) +
        "</p></div>";
    }
    return (
      "<article class='mvi-fhdir__card' data-fhdir-home data-has-gpl='" +
      (copied ? "1" : "0") +
      "'><h3>" +
      esc(home.name) +
      "</h3><dl class='mvi-fhdir__contact'>" +
      addr +
      phone +
      web +
      "</dl>" +
      (actions.length ? "<div class='mvi-fhdir__actions'>" + actions.join("") + "</div>" : "") +
      prices +
      "</article>"
    );
  }

  function cemCard(c) {
    var note = lang === "en" ? c.noteEn : c.noteEs;
    var tel = phoneTel(c.phone);
    return (
      "<article class='mvi-fhdir__card mvi-fhdir__card--cem'><h3>" +
      esc(c.name) +
      "</h3>" +
      (c.address ? "<address class='mvi-fhdir__meta'>" + esc(c.address) + "</address>" : "") +
      (c.phone && tel ? "<p class='mvi-fhdir__meta'><a href='" + esc(tel) + "'>" + esc(c.phone) + "</a></p>" : "") +
      (note ? "<p class='mvi-fhdir__source'>" + esc(note) + "</p>" : "") +
      "</article>"
    );
  }

  function homeSection(title, homes) {
    var list = sortHomes(homes);
    if (!list.length) return "";
    return (
      "<section class='mvi-fhdir__section'><h2>" +
      esc(title) +
      "</h2>" +
      list.map(homeCard).join("") +
      "</section>"
    );
  }

  function cemSection(title, cems) {
    if (!cems || !cems.length) return "";
    return (
      "<section class='mvi-fhdir__section'><h2>" +
      esc(title) +
      "</h2>" +
      cems.map(cemCard).join("") +
      "</section>"
    );
  }

  function listingLinks(listing) {
    var guide = lang === "en" ? listing.guideEn : listing.guideEs;
    var bits = [];
    if (guide) bits.push("<a href='" + esc(guide) + "'>" + esc(t.guide) + "</a>");
    (listing.other || []).forEach(function (o) {
      bits.push(
        "<a href='" +
          esc(o.href) +
          "' rel='noopener' target='_blank'>" +
          esc(lang === "en" ? o.nameEn : o.nameEs) +
          "</a>"
      );
    });
    if (!bits.length) return "";
    return "<div class='mvi-fhdir__links'>" + bits.join("") + "</div>";
  }

  function renderListing(listing, replaceUrl) {
    if (!resultsEl) return;
    var city = recName(listing);
    var state = recState(listing);
    var parent = lang === "en" ? listing.parentNameEn : listing.parentNameEs;
    var isTown = listing.kind === "town";
    var homes = uniqueHomes(listing);
    var heading = isTown ? t.cityNear(city, state) : t.cityH2(city, state);
    var homesHtml = "";
    var cemsHtml = "";
    if (isTown) {
      homesHtml =
        homeSection(t.localHomes(city), listing.localHomes) +
        homeSection(
          listing.localHomes && listing.localHomes.length ? t.nearbyHomes(parent) : t.areaHomes(parent),
          listing.nearbyHomes
        );
      cemsHtml =
        cemSection(t.localCems(city), listing.localCemeteries) +
        cemSection(
          listing.localCemeteries && listing.localCemeteries.length ? t.nearbyCems(parent) : t.areaCems(parent),
          listing.nearbyCemeteries
        );
    } else {
      homesHtml = homeSection(t.homes, listing.localHomes);
      cemsHtml = cemSection(t.cemeteries, listing.localCemeteries);
    }
    if (!homes.length) {
      homesHtml =
        "<div class='mvi-fhdir__empty'><p><strong>" +
        esc(t.none) +
        "</strong></p><p>" +
        esc(t.noneHint) +
        "</p></div>";
    }
    var toolbar = homes.length
      ? "<div class='mvi-fhdir__toolbar'><p class='mvi-fhdir__count' data-fhdir-count>" +
        esc(t.found(homes.length, city, state)) +
        "</p><div class='mvi-fhdir__filters'><label class='mvi-fhdir__filter'><input type='checkbox' data-fhdir-gpl-filter'/><span>" +
        esc(t.filterGpl) +
        "</span></label><p class='mvi-fhdir__sort'>" +
        esc(t.sortAz) +
        "</p></div></div>"
      : "";
    resultsEl.innerHTML =
      "<div class='mvi-fhdir__place'><nav class='mvi-fhdir__crumb' aria-label='breadcrumb'><ol>" +
      "<li><a href='" +
      esc(pagePath) +
      "'>" +
      esc(t.crumbHub) +
      "</a></li>" +
      "<li><button type='button' data-state-cities='" +
      esc(listing.stateCode) +
      "'>" +
      esc(state) +
      "</button></li>" +
      "<li aria-current='page'>" +
      esc(city) +
      "</li></ol></nav>" +
      "<header class='mvi-fhdir__placehead'><h2>" +
      esc(heading) +
      "</h2><p class='mvi-fhdir__lede'>" +
      esc(t.cityLead) +
      "</p>" +
      (data.updated ? "<p class='mvi-fhdir__updated'>" + esc(t.updated(data.updated)) + "</p>" : "") +
      "</header>" +
      toolbar +
      "<div data-fhdir-home-list>" +
      homesHtml +
      "</div>" +
      cemsHtml +
      listingLinks(listing) +
      "</div>";
    applyStateValue(listing.stateCode);
    if (input) input.value = city;
    setStatus(homes.length ? t.found(homes.length, city, state) : t.none);
    syncShareUrl(recHref(listing), replaceUrl);
    bindGplFilter();
    resultsEl.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function goTo(rec, replaceUrl) {
    hideSuggest();
    renderListing(rec, !!replaceUrl);
  }

  function cityPills(items) {
    return (
      "<ul class='mvi-fhdir__pills'>" +
      items
        .map(function (r) {
          return (
            "<li><button type='button' data-slug='" +
            esc(r.slug) +
            "' data-state='" +
            esc(r.stateCode) +
            "'>" +
            esc(recName(r)) +
            "</button></li>"
          );
        })
        .join("") +
      "</ul>"
    );
  }

  function renderChoices(items) {
    if (!resultsEl) return;
    resultsEl.innerHTML = '<p class="mvi-fhdir__lede">' + esc(t.several) + "</p>" + cityPills(items);
  }

  function renderStateCities(code, replaceUrl) {
    var resolved = applyStateValue(code);
    var name = stateLabel(resolved);
    var items = citiesInState(resolved);
    if (!resultsEl) return;
    if (!items.length) {
      resultsEl.innerHTML =
        '<div class="mvi-fhdir__empty"><p><strong>' + esc(t.noneState) + "</strong></p></div>";
      setStatus(t.noneState);
      syncShareUrl(stateQueryHref(resolved), replaceUrl);
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
    if (input) input.value = "";
    setStatus(t.citiesFound(items.length, name));
    syncShareUrl(stateQueryHref(resolved), replaceUrl);
    resultsEl.scrollIntoView({ block: "start", behavior: "smooth" });
  }

  function stateHasData(code) {
    return citiesInState(code).length > 0;
  }

  function runQuery(q, replaceUrl) {
    var query = String(q || "").trim();
    hideSuggest();
    if (!query) {
      var code = currentState();
      if (!code) {
        if (resultsEl) resultsEl.innerHTML = "";
        setStatus(t.needState);
        syncShareUrl(pagePath, replaceUrl);
        return;
      }
      renderStateCities(code, replaceUrl);
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
      goTo(items[0], replaceUrl);
      return;
    }
    setStatus(t.several);
    renderChoices(items);
  }

  function applyGplFilter() {
    var box = root.querySelector("[data-fhdir-gpl-filter]");
    var on = !!(box && box.checked);
    var cards = root.querySelectorAll("[data-fhdir-home]");
    var visible = 0;
    cards.forEach(function (card) {
      var keep = !on || card.getAttribute("data-has-gpl") === "1";
      card.hidden = !keep;
      if (keep) visible += 1;
    });
    var countNow = root.querySelector("[data-fhdir-count]");
    if (countNow && input) {
      countNow.textContent = t.found(visible, input.value || "", stateLabel(currentState()));
    }
  }

  function bindGplFilter() {
    var box = root.querySelector("[data-fhdir-gpl-filter]");
    if (box) box.addEventListener("change", applyGplFilter);
  }

  function applyFromUrl(replaceUrl) {
    var params = new URLSearchParams(window.location.search);
    var ciudad = params.get("ciudad") || params.get("city") || params.get("q");
    var st = params.get("estado") || params.get("state");
    if (st) applyStateValue(st);
    if (ciudad) runQuery(ciudad, replaceUrl);
    else if (st) runQuery("", replaceUrl);
    else {
      if (resultsEl) resultsEl.innerHTML = "";
      setStatus(data ? t.updated(data.updated) : "");
    }
  }

  if (form) {
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      runQuery(input ? input.value : "", false);
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
    var stateBtn = ev.target.closest("[data-state-cities]");
    if (stateBtn) {
      ev.preventDefault();
      renderStateCities(stateBtn.getAttribute("data-state-cities"), false);
      return;
    }
    var btn = ev.target.closest("[data-slug]");
    if (!btn || !data) return;
    ev.preventDefault();
    var rec = records().filter(function (r) {
      if (r.slug !== btn.getAttribute("data-slug")) return false;
      var st = btn.getAttribute("data-state");
      return !st || String(r.stateCode) === st;
    })[0];
    if (rec) goTo(rec, false);
  });

  window.addEventListener("popstate", function () {
    skipHistory = true;
    applyFromUrl(true);
    skipHistory = false;
  });

  setStatus(t.looking);
  fetch(dataUrl, { credentials: "same-origin" })
    .then(function (res) {
      if (!res.ok) throw new Error("load");
      return res.json();
    })
    .then(function (json) {
      data = json;
      setStatus(t.updated(data.updated));
      applyFromUrl(true);
    })
    .catch(function () {
      setStatus(t.error);
    });
})();
