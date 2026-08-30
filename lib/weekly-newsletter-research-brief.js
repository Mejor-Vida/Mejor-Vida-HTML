/**
 * Stage 1 — Weekly research brief: score candidates, select three stories, validate.
 * Must complete and pass validation before Stage 2 (compose) begins.
 */

const fs = require("fs");
const path = require("path");
const { inNewsWindow, newsletterWindow } = require("./weekly-newsletter-window");
const { researchModel, openAiJsonChat } = require("./weekly-newsletter-models");
const { evergreenFallbacks } = require("./weekly-newsletter-research");

const OUT_DIR = path.join(__dirname, "..", "tools", "weekly-newsletter", "out");
const UA = "MejorVidaWeeklyNewsletter/1.0 (+https://www.mejorvidainsurance.com)";

const RESEARCH_SYSTEM = `You are the Stage 1 research editor for Mejor Vida Insurance's weekly client newsletter.

Your job is ONLY research and story selection. Do NOT write the finished newsletter.

Audience: U.S. families, especially Hispanic families, considering life insurance / final expense / term / whole life. Annuities only when directly relevant to family protection or final-expense planning.

News period: use the dates supplied. The actual event, announcement, report, or regulatory development MUST fall in that Sunday–Saturday America/Chicago window.

Source preference (highest first):
1. Government / insurance regulators
2. Official legislation, orders, court decisions
3. Official carrier documents
4. NAIC, LIMRA, ACLI, recognized professional orgs
5. Original research reports
6. Reputable national or local news

Whenever a secondary article cites an official study or announcement, prefer the original source URL from the candidate list when available.

Reject or down-score:
- Events outside the news period
- Old pages with a cosmetic "updated" date and no new development
- Recent articles that only repeat an older study (mark older material as background only)
- Evergreen guides presented as that week's news
- Unverified market-size forecasts, "best company" lists, promotional vendor reports
- Health insurance, P&C, agent/IMO hiring, competitor brand pitches as facts
- Unsupported premiums, rates, or eligibility claims

Score every candidate 1–5 on: freshness, source_authority, consumer_relevance, life_insurance_connection, educational_value, difference_from_others.

Select exactly THREE stories with the highest combined scores and a useful mix when possible (e.g. cost/family planning; regulatory/industry; coverage/underwriting/ownership). Do not pick three that teach the same lesson.

OUTPUT JSON only:
{
  "candidates_reviewed": [
    {
      "topic": "...",
      "event_date": "YYYY-MM-DD or null",
      "source_publication_date": "YYYY-MM-DD or evergreen",
      "original_headline": "...",
      "publisher": "...",
      "source_url": "https://...",
      "summary": "what happened",
      "why_consumers_care": "...",
      "verified_facts": ["..."],
      "limitations": "...",
      "primary_or_secondary": "primary|secondary",
      "confirming_url": "https://... or empty",
      "scores": {
        "freshness": 1-5,
        "source_authority": 1-5,
        "consumer_relevance": 1-5,
        "life_insurance_connection": 1-5,
        "educational_value": 1-5,
        "difference_from_others": 1-5
      },
      "combined_score": number,
      "eligible": true|false,
      "reject_reason": "empty if eligible"
    }
  ],
  "selected": [
    {
      "working_headline": "...",
      "event_date": "YYYY-MM-DD",
      "publication_date": "YYYY-MM-DD or evergreen",
      "primary_source_name": "...",
      "primary_source_url": "https://...",
      "confirming_source_name": "... or empty",
      "confirming_source_url": "https://... or empty",
      "verified_facts": ["5 to 10 factual points"],
      "context": "...",
      "why_it_matters": "...",
      "practical_takeaway": "...",
      "terms_to_explain": ["..."],
      "limitations": "...",
      "claims_not_to_make": ["..."],
      "recommended_internal_links": ["quote.html or Spanish guide paths"],
      "suggested_image_concept": "...",
      "category": "final_expense|term_life|whole_life|iul|annuity|life_insurance",
      "is_background_evergreen": false,
      "original_headline": "...",
      "scores": { ... same keys as above ... }
    }
  ],
  "selection_notes": "one short paragraph on mix and rejects"
}

Rules:
- Review at least 8 candidates when that many were supplied. If fewer were supplied, review all of them and say so in selection_notes.
- selected must have exactly 3 objects.
- Use ONLY URLs from the supplied candidate list (or empty confirming_url). Never invent URLs.
- Every number in verified_facts must be supportable from the supplied candidate text/title/source.
- Do not invent premiums, approval odds, or state availability.
- If a candidate is evergreen, set is_background_evergreen true and do not present it as breaking news of this week.`;

async function urlOpens(url, timeoutMs) {
  if (!url || !/^https?:\/\//i.test(url)) return { ok: false, status: 0, error: "invalid_url" };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs || 10000);
  try {
    let r = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: ctrl.signal,
      headers: { "User-Agent": UA, Accept: "*/*" },
    });
    if (r.status === 405 || r.status === 403 || r.status === 401) {
      r = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: ctrl.signal,
        headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,*/*" },
      });
    }
    const ok = r.status >= 200 && r.status < 400;
    return { ok, status: r.status, error: ok ? null : `HTTP ${r.status}` };
  } catch (e) {
    return { ok: false, status: 0, error: String((e && e.message) || e).slice(0, 160) };
  } finally {
    clearTimeout(t);
  }
}

function scoreSum(scores) {
  if (!scores || typeof scores !== "object") return 0;
  return (
    Number(scores.freshness || 0) +
    Number(scores.source_authority || 0) +
    Number(scores.consumer_relevance || 0) +
    Number(scores.life_insurance_connection || 0) +
    Number(scores.educational_value || 0) +
    Number(scores.difference_from_others || 0)
  );
}

function normalizeSelected(story, fallbackCandidate) {
  const c = fallbackCandidate || {};
  const facts = Array.isArray(story.verified_facts)
    ? story.verified_facts.map((f) => String(f || "").trim()).filter(Boolean)
    : [];
  return {
    working_headline: String(story.working_headline || c.title || "").trim(),
    event_date: String(story.event_date || story.publication_date || c.published || "").trim(),
    publication_date: String(story.publication_date || c.published || "").trim(),
    primary_source_name: String(story.primary_source_name || c.source_name || "").trim(),
    primary_source_url: String(story.primary_source_url || c.url || c.source_url || "").trim(),
    confirming_source_name: String(story.confirming_source_name || "").trim(),
    confirming_source_url: String(story.confirming_source_url || "").trim(),
    verified_facts: facts,
    context: String(story.context || "").trim(),
    why_it_matters: String(story.why_it_matters || "").trim(),
    practical_takeaway: String(story.practical_takeaway || "").trim(),
    terms_to_explain: Array.isArray(story.terms_to_explain)
      ? story.terms_to_explain.map((t) => String(t || "").trim()).filter(Boolean)
      : [],
    limitations: String(story.limitations || "").trim(),
    claims_not_to_make: Array.isArray(story.claims_not_to_make)
      ? story.claims_not_to_make.map((t) => String(t || "").trim()).filter(Boolean)
      : [],
    recommended_internal_links: Array.isArray(story.recommended_internal_links)
      ? story.recommended_internal_links.map((t) => String(t || "").trim()).filter(Boolean)
      : ["quote.html"],
    suggested_image_concept: String(story.suggested_image_concept || "").trim(),
    category: String(story.category || c.category || "life_insurance").trim(),
    is_background_evergreen: !!(story.is_background_evergreen || c.evergreen),
    original_headline: String(story.original_headline || c.title || "").trim(),
    scores: story.scores || {},
    combined_score: Number(story.combined_score || scoreSum(story.scores) || 0),
  };
}

function allowedUrlSet(candidates) {
  const set = new Set();
  for (const c of candidates || []) {
    if (c.url) set.add(String(c.url).trim());
    if (c.source_url) set.add(String(c.source_url).trim());
  }
  return set;
}

/**
 * Validate research brief. Returns { ok, errors[], checks[] }.
 */
async function validateResearchBrief(brief, opts) {
  opts = opts || {};
  const window = brief.window || opts.window || newsletterWindow();
  const errors = [];
  const checks = [];
  const selected = Array.isArray(brief.selected) ? brief.selected : [];

  if (selected.length !== 3) {
    errors.push(`selected must have exactly 3 stories (got ${selected.length})`);
  }

  const reviewed = Array.isArray(brief.candidates_reviewed) ? brief.candidates_reviewed : [];
  checks.push({
    name: "candidates_reviewed_count",
    ok: reviewed.length >= Math.min(8, (opts.harvestCount || reviewed.length)),
    detail: `${reviewed.length} reviewed (harvest supplied ${opts.harvestCount || "?"})`,
  });
  if ((opts.harvestCount || 0) >= 8 && reviewed.length < 8) {
    errors.push(`Stage 1 must review at least 8 candidates when available (reviewed ${reviewed.length})`);
  }

  const urlSet = allowedUrlSet(opts.candidates || []);

  for (let i = 0; i < selected.length; i++) {
    const s = selected[i];
    const label = `story ${i + 1}`;
    if (!s.working_headline) errors.push(`${label}: missing working_headline`);
    if (!s.primary_source_url) errors.push(`${label}: missing primary_source_url`);
    if (!s.primary_source_name) errors.push(`${label}: missing primary_source_name`);
    if (!Array.isArray(s.verified_facts) || s.verified_facts.length < 5) {
      errors.push(`${label}: need 5–10 verified_facts (got ${s.verified_facts ? s.verified_facts.length : 0})`);
    }
    if (s.verified_facts && s.verified_facts.length > 12) {
      errors.push(`${label}: too many verified_facts (${s.verified_facts.length}); keep 5–10`);
    }
    if (!s.why_it_matters) errors.push(`${label}: missing why_it_matters`);
    if (!s.practical_takeaway) errors.push(`${label}: missing practical_takeaway`);

    const pub = String(s.publication_date || "").slice(0, 10);
    const event = String(s.event_date || pub).slice(0, 10);
    const evergreen = !!s.is_background_evergreen || pub === "evergreen";
    if (!evergreen) {
      const dateOk = inNewsWindow(event, window) || inNewsWindow(pub, window);
      checks.push({
        name: `${label}_in_news_period`,
        ok: dateOk,
        detail: `event=${event} pub=${pub} window=${window.startDate}..${window.endDate}`,
      });
      if (!dateOk) {
        errors.push(
          `${label}: event/publication date must fall in ${window.startDate}–${window.endDate} (got event=${event} pub=${pub})`
        );
      }
    } else {
      checks.push({
        name: `${label}_evergreen_background`,
        ok: true,
        detail: "marked evergreen / background — not claimed as this week's news",
      });
    }

    if (urlSet.size && s.primary_source_url && !urlSet.has(s.primary_source_url)) {
      // Allow if URL hostname matches a candidate (Google News redirects sometimes)
      const hostOk = [...urlSet].some((u) => {
        try {
          return new URL(u).hostname === new URL(s.primary_source_url).hostname;
        } catch (_) {
          return false;
        }
      });
      if (!hostOk) {
        errors.push(`${label}: primary_source_url not in harvested candidate list`);
      }
    }

    const open = await urlOpens(s.primary_source_url);
    checks.push({
      name: `${label}_url_opens`,
      ok: open.ok,
      detail: open.ok ? `HTTP ${open.status}` : open.error,
    });
    if (!open.ok) errors.push(`${label}: primary URL failed (${open.error})`);

    if (s.confirming_source_url) {
      const open2 = await urlOpens(s.confirming_source_url);
      checks.push({
        name: `${label}_confirming_url_opens`,
        ok: open2.ok,
        detail: open2.ok ? `HTTP ${open2.status}` : open2.error,
      });
      if (!open2.ok) errors.push(`${label}: confirming URL failed (${open2.error})`);
    }

    const blob = `${s.working_headline} ${s.verified_facts.join(" ")} ${s.context}`;
    if (/\b(you are approved|guaranteed approval|guaranteed rate|guaranteed premium)\b/i.test(blob)) {
      errors.push(`${label}: unsupported guarantee language in research brief`);
    }
  }

  // Category mix soft check
  const cats = selected.map((s) => s.category);
  const uniqueCats = new Set(cats);
  checks.push({
    name: "category_spread",
    ok: uniqueCats.size >= 2 || selected.some((s) => s.is_background_evergreen),
    detail: `categories: ${cats.join(", ")}`,
  });

  return { ok: errors.length === 0, errors, checks };
}

function saveResearchBrief(brief) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const key = (brief.window && brief.window.weekKey) || brief.publication_date || "current";
  const file = path.join(OUT_DIR, `research-brief-${key}.json`);
  fs.writeFileSync(file, JSON.stringify(brief, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "current-research-brief.json"), JSON.stringify(brief, null, 2));
  return file;
}

function loadResearchBrief(weekKey) {
  const files = [
    weekKey ? path.join(OUT_DIR, `research-brief-${weekKey}.json`) : null,
    path.join(OUT_DIR, "current-research-brief.json"),
  ].filter(Boolean);
  for (const p of files) {
    if (!fs.existsSync(p)) continue;
    try {
      return JSON.parse(fs.readFileSync(p, "utf8"));
    } catch (_) {
      /* next */
    }
  }
  return null;
}

/**
 * Build selected stories from harvest when AI is unavailable (tests / dry fallback).
 */
function heuristicBriefFromCandidates(candidates, window, sources) {
  const pool = [...(candidates || [])];
  while (pool.length < 3) {
    pool.push(...evergreenFallbacks(sources, 3 - pool.length));
  }
  const selected = pool.slice(0, 3).map((c) =>
    normalizeSelected(
      {
        working_headline: c.title,
        event_date: c.published,
        publication_date: c.published,
        primary_source_name: c.source_name,
        primary_source_url: c.url || c.source_url,
        verified_facts: [
          `Source: ${c.source_name}`,
          `Headline: ${c.title}`,
          `Published: ${c.published || "unknown"}`,
          `Category: ${c.category}`,
          "Confirm details against the primary URL before writing.",
        ],
        context: "Heuristic brief — Stage 1 AI unavailable; verify before publish.",
        why_it_matters: "Relevant to families considering life insurance or final expense coverage.",
        practical_takeaway: "Read the primary source and compare options with a licensed agency.",
        terms_to_explain: [],
        limitations: "Heuristic selection; not AI-validated.",
        claims_not_to_make: ["Do not invent premiums or approval"],
        recommended_internal_links: ["quote.html"],
        suggested_image_concept: "Family protection, calm planning scene",
        category: c.category,
        is_background_evergreen: !!c.evergreen,
        original_headline: c.title,
      },
      c
    )
  );
  return {
    publication_date: window.today,
    news_period_start: window.startDate,
    news_period_end: window.endDate,
    window,
    candidates_reviewed: (candidates || []).slice(0, 12).map((c) => ({
      topic: c.title,
      source_publication_date: c.published,
      original_headline: c.title,
      publisher: c.source_name,
      source_url: c.url,
      eligible: true,
      combined_score: 0,
    })),
    selected,
    selection_notes: "Heuristic fallback brief (no Stage 1 model call).",
    stage: 1,
    model: null,
  };
}

/**
 * Stage 1 entry: harvest candidates → AI research brief → validate → save.
 * If a selected story fails URL/date validation, replace with next-highest eligible candidate once.
 */
async function buildAndValidateResearchBrief(opts) {
  opts = opts || {};
  const apiKey = opts.apiKey || process.env.OPENAI_API_KEY;
  const window = opts.window || newsletterWindow(opts.now);
  const sources = opts.sources;
  let candidates = Array.isArray(opts.candidates) ? opts.candidates.slice() : [];

  if (candidates.length < 8 && sources) {
    const need = 8 - candidates.length;
    const extras = evergreenFallbacks(sources, need).map((e) => ({
      ...e,
      evergreen: true,
      via: "evergreen_pad",
    }));
    candidates = candidates.concat(extras);
  }

  if (!apiKey && opts.allowHeuristic) {
    const brief = heuristicBriefFromCandidates(candidates, window, sources);
    const validation = await validateResearchBrief(brief, {
      window,
      candidates,
      harvestCount: candidates.length,
    });
    brief.validation = validation;
    brief.brief_path = saveResearchBrief(brief);
    return brief;
  }
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY for Stage 1 research brief");

  const model = opts.researchModel || researchModel();
  const payload = {
    publication_date: window.today,
    news_period_start: window.startDate,
    news_period_end: window.endDate,
    timezone: window.timezone || "America/Chicago",
    instructions:
      "Score all supplied candidates. Select exactly 3. Prefer primary sources. Fill the research brief fields completely.",
    candidates: candidates.slice(0, 20).map((c, i) => ({
      n: i + 1,
      title: c.title,
      url: c.url,
      source_name: c.source_name,
      source_url: c.source_url,
      published: c.published,
      category: c.category,
      via: c.via,
      evergreen: !!c.evergreen,
      downranked: !!c.downranked,
    })),
  };

  let parsed = await openAiJsonChat(apiKey, {
    model,
    maxTokens: opts.maxTokens || 10000,
    messages: [
      { role: "system", content: RESEARCH_SYSTEM },
      {
        role: "user",
        content: `Build this week's validated research brief from these harvested candidates:\n${JSON.stringify(payload)}`,
      },
    ],
  });

  let selectedRaw = Array.isArray(parsed.selected) ? parsed.selected.slice(0, 3) : [];
  // Map selected back to harvest candidates by URL/title for fill
  const byUrl = new Map();
  for (const c of candidates) {
    if (c.url) byUrl.set(c.url, c);
  }
  let selected = selectedRaw.map((s) => {
    const match =
      byUrl.get(s.primary_source_url) ||
      candidates.find(
        (c) =>
          String(c.title || "").toLowerCase().slice(0, 60) ===
          String(s.original_headline || s.working_headline || "")
            .toLowerCase()
            .slice(0, 60)
      );
    return normalizeSelected(s, match);
  });

  let brief = {
    publication_date: window.today,
    news_period_start: window.startDate,
    news_period_end: window.endDate,
    window,
    candidates_reviewed: Array.isArray(parsed.candidates_reviewed)
      ? parsed.candidates_reviewed
      : [],
    selected,
    selection_notes: String(parsed.selection_notes || "").trim(),
    stage: 1,
    model,
    harvested_count: candidates.length,
  };

  let validation = await validateResearchBrief(brief, {
    window,
    candidates,
    harvestCount: candidates.length,
  });

  // One replacement pass: drop failing stories, pull next eligible from candidates_reviewed
  if (!validation.ok) {
    const failingIdx = [];
    for (let i = 0; i < brief.selected.length; i++) {
      const storyErrors = validation.errors.filter((e) => e.startsWith(`story ${i + 1}:`));
      if (storyErrors.length) failingIdx.push(i);
    }
    const usedUrls = new Set(brief.selected.map((s) => s.primary_source_url));
    const rankedAlts = (brief.candidates_reviewed || [])
      .filter((c) => c.eligible !== false && c.source_url && !usedUrls.has(c.source_url))
      .sort((a, b) => Number(b.combined_score || 0) - Number(a.combined_score || 0));

    for (const idx of failingIdx) {
      const alt = rankedAlts.shift();
      if (!alt) continue;
      const match = byUrl.get(alt.source_url) || {
        title: alt.original_headline || alt.topic,
        url: alt.source_url,
        source_name: alt.publisher,
        published: alt.source_publication_date,
        category: "life_insurance",
      };
      brief.selected[idx] = normalizeSelected(
        {
          working_headline: alt.topic || alt.original_headline,
          event_date: alt.event_date || alt.source_publication_date,
          publication_date: alt.source_publication_date,
          primary_source_name: alt.publisher,
          primary_source_url: alt.source_url,
          confirming_source_url: alt.confirming_url || "",
          verified_facts:
            Array.isArray(alt.verified_facts) && alt.verified_facts.length >= 5
              ? alt.verified_facts
              : [
                  `Source: ${alt.publisher}`,
                  `Headline: ${alt.original_headline || alt.topic}`,
                  `Published: ${alt.source_publication_date}`,
                  alt.summary || "See primary source",
                  alt.why_consumers_care || "Relevant to life insurance consumers",
                ],
          context: alt.limitations || "",
          why_it_matters: alt.why_consumers_care || "",
          practical_takeaway: "Confirm facts on the primary source, then ask clear questions before buying.",
          terms_to_explain: [],
          limitations: alt.limitations || "",
          claims_not_to_make: ["Do not invent premiums", "Do not promise approval"],
          recommended_internal_links: ["quote.html"],
          suggested_image_concept: "Calm family planning",
          category: match.category || "life_insurance",
          is_background_evergreen: String(alt.source_publication_date) === "evergreen",
          original_headline: alt.original_headline,
          scores: alt.scores,
          combined_score: alt.combined_score,
        },
        match
      );
      usedUrls.add(alt.source_url);
    }
    brief.selection_notes =
      (brief.selection_notes || "") + " Replacement pass applied after validation failures.";
    validation = await validateResearchBrief(brief, {
      window,
      candidates,
      harvestCount: candidates.length,
    });
  }

  brief.validation = validation;
  if (!validation.ok) {
    const err = new Error(
      `Stage 1 research brief failed validation: ${validation.errors.join("; ")}`
    );
    err.brief = brief;
    throw err;
  }

  brief.brief_path = saveResearchBrief(brief);
  return brief;
}

/**
 * Convert validated brief selected[] into the candidate shape Stage 2 historically expected,
 * plus pass-through of the full brief for the writing prompt.
 */
function selectedAsComposeCandidates(brief) {
  return (brief.selected || []).map((s) => ({
    title: s.working_headline || s.original_headline,
    url: s.primary_source_url,
    source_name: s.primary_source_name,
    source_url: s.primary_source_url,
    published: s.publication_date,
    category: s.category,
    evergreen: !!s.is_background_evergreen,
    research: s,
  }));
}

module.exports = {
  RESEARCH_SYSTEM,
  OUT_DIR,
  urlOpens,
  validateResearchBrief,
  buildAndValidateResearchBrief,
  saveResearchBrief,
  loadResearchBrief,
  selectedAsComposeCandidates,
  normalizeSelected,
  heuristicBriefFromCandidates,
};
