/**
 * Last-week news harvest for the Sunday newsletter.
 * Google News RSS for discovery + direct reputable feeds.
 */

const fs = require("fs");
const path = require("path");
const {
  newsletterWindow,
  isoDateFromPubDate,
  inNewsWindow,
} = require("./weekly-newsletter-window");
const { BLOCKED_TOPIC_RE } = require("./crm-weekly-topic-guard");

const SOURCES_PATH = path.join(__dirname, "..", "tools", "weekly-newsletter", "sources.json");

const REJECT_RE =
  /\b(hiring|jobs|recruit|IMO|BGA|producer|for agents|commission|insurconnect|chatgpt|career|underwriter hiring|New York Life|State Farm|Northwestern Mutual|MassMutual|PolicyGenius|Ethos|Colonial Penn|SelectQuote|Mutual of Omaha Direct)\b/i;

const TOPIC_RE =
  /\b(final\s*expense|burial|funeral|whole\s*life|term\s*life|life\s*insurance|indexed\s*universal|IUL|annuit(?:y|ies)|gastos\s*finales|seguro\s*de\s*vida|vida\s*entera|vida\s*a\s*t[eé]rmino|anualidad(?:es)?)\b/i;

const UA = "MejorVidaWeeklyNewsletter/1.0 (+https://www.mejorvidainsurance.com)";

function loadSources() {
  return JSON.parse(fs.readFileSync(SOURCES_PATH, "utf8"));
}

function decodeXml(s) {
  return String(s || "")
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .trim();
}

function innerTag(block, tag) {
  const m = String(block || "").match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, "i"));
  return m ? decodeXml(m[1]) : "";
}

function sourceAttrs(block) {
  const m = String(block || "").match(/<source\s+url="([^"]*)"[^>]*>([\s\S]*?)<\/source>/i);
  if (!m) return { url: "", name: innerTag(block, "source") };
  return { url: decodeXml(m[1]), name: decodeXml(m[2]) };
}

function parseRssItems(xml) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/gi;
  let m;
  while ((m = re.exec(String(xml || "")))) {
    const block = m[1];
    const src = sourceAttrs(block);
    items.push({
      title: innerTag(block, "title"),
      link: innerTag(block, "link"),
      pubDate: innerTag(block, "pubDate") || innerTag(block, "dc:date"),
      sourceName: src.name,
      sourceUrl: src.url,
    });
  }
  return items;
}

function hostnameOf(url) {
  try {
    return new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
  } catch (_) {
    return "";
  }
}

function isAllowedPublisher(item, sources) {
  const host = hostnameOf(item.sourceUrl || item.link);
  if (host.endsWith(".gov") || host === "gov") return true;
  const suffixes = sources.allow_host_suffixes || [];
  if (host && suffixes.some((s) => host === s || host.endsWith(`.${s}`))) return true;
  const name = String(item.sourceName || "");
  const names = sources.allow_source_names || [];
  if (names.some((n) => name.toLowerCase() === String(n).toLowerCase() || name.toLowerCase().includes(String(n).toLowerCase()))) {
    return true;
  }
  return false;
}

function downranked(title, sources) {
  const t = String(title || "").toLowerCase();
  return (sources.title_downrank || []).some((p) => t.includes(String(p).toLowerCase()));
}

function googleNewsSearchUrl(query) {
  const q = encodeURIComponent(query);
  return `https://news.google.com/rss/search?q=${q}&hl=en-US&gl=US&ceid=US:en`;
}

async function fetchText(url, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs || 12000);
  try {
    const r = await fetch(url, {
      headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, text/xml, */*" },
      signal: ctrl.signal,
      redirect: "follow",
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.text();
  } finally {
    clearTimeout(t);
  }
}

function classifyCategory(text) {
  const s = String(text || "");
  if (/\b(final\s*expense|burial|funeral|gastos\s*finales)\b/i.test(s)) return "final_expense";
  if (/\b(indexed\s*universal|IUL)\b/i.test(s)) return "iul";
  if (/\bannuit(?:y|ies)|anualidad/i.test(s)) return "annuity";
  if (/\bterm\s*life|vida\s*a\s*t[eé]rmino/i.test(s)) return "term_life";
  if (/\bwhole\s*life|vida\s*entera/i.test(s)) return "whole_life";
  return "life_insurance";
}

function toCandidate(item, window, sources, via) {
  const published = isoDateFromPubDate(item.pubDate);
  const blob = `${item.title} ${item.sourceName}`;
  if (BLOCKED_TOPIC_RE.test(blob)) return null;
  if (REJECT_RE.test(blob)) return null;
  if (/\$\d+(\.\d+)?\s*[MK]\b/i.test(blob)) return null;
  if (!TOPIC_RE.test(blob)) return null;
  const evergreen = via === "evergreen";
  if (!evergreen && !inNewsWindow(published, window)) return null;
  if (!evergreen && !isAllowedPublisher(item, sources)) return null;
  return {
    title: item.title,
    url: item.link,
    source_name: item.sourceName || hostnameOf(item.sourceUrl) || "News",
    source_url: item.sourceUrl || "",
    published: published || item.pubDate || "",
    category: classifyCategory(blob),
    via,
    downranked: downranked(item.title, sources),
  };
}

function dedupeCandidates(list) {
  const seen = new Set();
  const out = [];
  for (const c of list) {
    const key = `${String(c.title || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .slice(0, 80)}|${hostnameOf(c.source_url || c.url)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(c);
  }
  return out;
}

function rankCandidates(list) {
  const catScore = {
    final_expense: 50,
    term_life: 40,
    whole_life: 35,
    iul: 25,
    annuity: 25,
    life_insurance: 15,
  };
  return [...list].sort((a, b) => {
    const sa = (catScore[a.category] || 0) - (a.downranked ? 30 : 0) + (a.via === "feed" ? 8 : 0);
    const sb = (catScore[b.category] || 0) - (b.downranked ? 30 : 0) + (b.via === "feed" ? 8 : 0);
    return sb - sa;
  });
}

async function harvestWeeklyNews(opts) {
  opts = opts || {};
  const sources = opts.sources || loadSources();
  const window = opts.window || newsletterWindow(opts.now);
  const timeoutMs = opts.timeoutMs || 12000;
  const raw = [];
  const errors = [];

  const urls = [
    ...(sources.google_news_queries || []).map((q) => ({ via: "google_news", url: googleNewsSearchUrl(q) })),
    ...(sources.direct_feeds || []).map((f) => ({ via: "feed", url: f.url, name: f.name })),
  ];

  const fetched = await Promise.all(
    urls.map(async (u) => {
      try {
        const xml = await fetchText(u.url, timeoutMs);
        return { ...u, xml };
      } catch (e) {
        errors.push({ url: u.url, error: String((e && e.message) || e).slice(0, 180) });
        return null;
      }
    })
  );

  for (const f of fetched) {
    if (!f || !f.xml) continue;
    for (const item of parseRssItems(f.xml)) {
      const c = toCandidate(item, window, sources, f.via);
      if (c) raw.push(c);
    }
  }

  // Keep a wide pool so Stage 1 can review ≥8 credible candidates before selecting three.
  const ranked = rankCandidates(dedupeCandidates(raw)).slice(0, 24);
  return { window, candidates: ranked, errors, fetched: fetched.filter(Boolean).length };
}

function evergreenFallbacks(sources, need) {
  const list = (sources && sources.evergreen) || [];
  return list.slice(0, need).map((e) => ({
    title: e.title_en,
    url: e.source_url,
    source_name: e.source_name,
    source_url: e.source_url,
    published: e.published || "evergreen",
    category: e.category,
    via: "evergreen",
    downranked: false,
    evergreen: true,
  }));
}

function pickThree(candidates, sources) {
  const picked = [];
  const usedCats = new Set();
  const add = (c) => {
    if (!c || picked.includes(c) || picked.length >= 3) return;
    picked.push(c);
    usedCats.add(c.category);
  };
  for (const c of candidates || []) {
    if (c.downranked) continue;
    if (usedCats.has(c.category)) continue;
    add(c);
  }
  for (const c of candidates || []) {
    if (c.downranked) continue;
    add(c);
  }
  if (picked.length < 3) {
    picked.push(...evergreenFallbacks(sources || loadSources(), 3 - picked.length));
  }
  return picked.slice(0, 3);
}

module.exports = {
  SOURCES_PATH,
  loadSources,
  parseRssItems,
  decodeXml,
  harvestWeeklyNews,
  pickThree,
  evergreenFallbacks,
  toCandidate,
};
