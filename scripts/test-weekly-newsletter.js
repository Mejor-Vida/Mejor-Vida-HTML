/**
 * Smoke tests for weekly newsletter window + RSS parse (no secrets, no network).
 * Usage: node scripts/test-weekly-newsletter.js
 */
const assert = require("assert");
const {
  newsletterWindow,
  addDaysISO,
  inNewsWindow,
  isoDateFromPubDate,
  chicagoWallTimeUtc,
  isSundayMorningSendWindow,
  weeklyFacebookSlotTimes,
} = require("../lib/weekly-newsletter-window");
const { parseRssItems, pickThree } = require("../lib/weekly-newsletter-research");
const { assertNewsletterPartsOk } = require("../lib/crm-weekly-topic-guard");
const { latestDigestWeekFromSitemap, parseDigestStories } = require("../lib/weekly-facebook-parse");
const { stripUrls, defaultFirstComment, rewriteCaptionCta, HASHTAGS } = require("../lib/weekly-facebook-compose");

const xml = `<?xml version="1.0"?><rss><channel>
<item>
  <title>Funeral costs rise in new NFDA report - NFDA</title>
  <link>https://news.google.com/rss/articles/abc</link>
  <pubDate>Thu, 20 Aug 2026 07:00:00 GMT</pubDate>
  <source url="https://nfda.org">NFDA</source>
</item>
</channel></rss>`;

const items = parseRssItems(xml);
assert.strictEqual(items.length, 1);
assert.strictEqual(items[0].sourceName, "NFDA");
assert.ok(items[0].sourceUrl.includes("nfda.org"));

const win = newsletterWindow(new Date("2026-08-23T12:00:00Z"));
assert.strictEqual(win.today, "2026-08-23");
assert.strictEqual(win.startDate, "2026-08-16");
assert.strictEqual(win.endDate, "2026-08-22");
assert.strictEqual(addDaysISO("2026-08-23", -7), "2026-08-16");
assert.ok(inNewsWindow("2026-08-20", win));
assert.ok(!inNewsWindow("2026-08-23", win));
assert.strictEqual(isoDateFromPubDate("Thu, 20 Aug 2026 07:00:00 GMT"), "2026-08-20");

const picked = pickThree([], {
  evergreen: [
    { category: "final_expense", title_en: "A", source_url: "https://consumer.ftc.gov/x", source_name: "FTC" },
    { category: "term_life", title_en: "B", source_url: "https://lifehappens.org/x", source_name: "LIMRA" },
    { category: "whole_life", title_en: "C", source_url: "https://www.iii.org/x", source_name: "III" },
  ],
});
assert.strictEqual(picked.length, 3);

const okEn = assertNewsletterPartsOk({
  subject: "3 life insurance and annuity topics this week",
  bodyHtml: "This week we cover final expense and term life.",
});
assert.ok(okEn.ok, okEn.error);

const blocked = assertNewsletterPartsOk({
  subject: "Medicare Advantage open enrollment",
  bodyHtml: "Medigap rates",
});
assert.ok(!blocked.ok);

assert.ok(isSundayMorningSendWindow(new Date("2026-08-23T11:00:00Z")));
assert.ok(!isSundayMorningSendWindow(new Date("2026-08-23T12:00:00Z")));
assert.ok(isSundayMorningSendWindow(new Date("2027-01-10T12:00:00Z")));
assert.ok(!isSundayMorningSendWindow(new Date("2026-08-24T11:00:00Z")));

assert.strictEqual(
  chicagoWallTimeUtc("2026-08-23", 6, 0).toISOString(),
  "2026-08-23T11:00:00.000Z"
);
assert.strictEqual(
  chicagoWallTimeUtc("2027-01-10", 6, 0).toISOString(),
  "2027-01-10T12:00:00.000Z"
);
assert.strictEqual(
  chicagoWallTimeUtc("2026-08-25", 10, 0).toISOString(),
  "2026-08-25T15:00:00.000Z"
);

const sunAfternoon = new Date("2026-08-23T21:36:00Z");
const slots = weeklyFacebookSlotTimes("2026-08-23", sunAfternoon);
assert.strictEqual(slots[1].toISOString(), sunAfternoon.toISOString());
assert.strictEqual(slots[2].toISOString(), "2026-08-25T15:00:00.000Z");
assert.strictEqual(slots[3].toISOString(), "2026-08-27T15:00:00.000Z");

const sitemap = `
<url><loc>https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-08-16.html</loc></url>
<url><loc>https://www.mejorvidainsurance.com/blog/weekly-insurance-update-2026-08-23.html</loc></url>
`;
assert.strictEqual(latestDigestWeekFromSitemap(sitemap), "2026-08-23");

const digestHtml = `
<section class="story-section" id="story1">
<h2>Historia 1: Pruebas genéticas y seguro de vida</h2>
<p>Cuando usted pide un seguro de vida, la compañía pregunta por su salud.</p>
<p class="mt-4 mb-2 fw-semibold">¿Quiere conocer todos los detalles?</p>
<p class="mb-4"><a class="btn btn-primary" href="x.html">Leer</a></p>
</section>
<section class="story-section" id="story2">
<h2>Historia 2: Anualidad</h2>
<p>Una anualidad no es una cuenta de cheques.</p>
</section>
<section class="story-section" id="story3">
<h2>Historia 3: Derechos en la funeraria</h2>
<p>Los gastos finales importan cuando la familia planea un funeral.</p>
</section>
`;
const stories = parseDigestStories(digestHtml, "2026-08-23", "https://www.mejorvidainsurance.com");
assert.strictEqual(stories.length, 3);
assert.strictEqual(stories[0].title, "Pruebas genéticas y seguro de vida");
assert.ok(stories[0].story_url.endsWith("#story1"));
assert.ok(stories[0].image_url.endsWith("/story-1.png"));
assert.ok(!/Leer/.test(stories[0].summary));

assert.ok(!stripUrls("Hola https://example.com mundo").includes("http"));
assert.ok(defaultFirstComment("https://www.mejorvidainsurance.com/blog/x.html#story1", "GINA").includes("#story1"));
assert.ok(HASHTAGS.includes("#SeguroDeVida"));
const { CAPTION_CTA } = require("../lib/weekly-facebook-compose");
assert.ok(!/INFO|REVISAR/.test(CAPTION_CTA));
assert.ok(CAPTION_CTA.includes("440-5438"));
assert.ok(!/INFO|REVISAR/.test(rewriteCaptionCta("Cuerpo del post.\n\nComenta INFO si quieres el artículo completo, o REVISAR si quieres que revisemos tu situación. También puedes mandarnos un mensaje.\n#SeguroDeVida #GastosFinales")));
assert.ok(rewriteCaptionCta("Cuerpo del post.\n\nComenta INFO si quieres el artículo completo.").includes("cotización gratis"));

const { parseFeedCommentEvents, commentIntent, isKeywordOnly, ragToFacebookText } = require("../lib/facebook-comment-reply");
assert.strictEqual(commentIntent("INFO"), "info");
assert.strictEqual(commentIntent("quiero info por favor"), "info");
assert.strictEqual(commentIntent("REVISAR"), "revisar");
assert.strictEqual(commentIntent("¿Cuánto cuesta?"), "other");
assert.ok(isKeywordOnly("INFO", "info"));
assert.ok(isKeywordOnly("revisar!", "revisar"));
assert.ok(!isKeywordOnly("INFO que es GINA", "info"));
assert.ok(ragToFacebookText("Lee [el artículo](https://example.com) y **esto**").includes("https://example.com"));
const feed = parseFeedCommentEvents({
  object: "page",
  entry: [
    {
      id: "111",
      changes: [
        {
          field: "feed",
          value: {
            item: "comment",
            verb: "add",
            comment_id: "111_999",
            post_id: "111_222",
            sender_id: "555",
            message: "INFO",
          },
        },
      ],
    },
  ],
});
assert.strictEqual(feed.length, 1);
assert.strictEqual(feed[0].commentId, "111_999");
assert.strictEqual(parseFeedCommentEvents({ object: "page", entry: [] }).length, 0);

const { wordCount, storyLengthError } = require("../lib/weekly-newsletter-compose");
assert.strictEqual(wordCount("one two three"), 3);
const long = Array(220).fill("word").join(" ");
const okStories = [{ summary: long }, { summary: long }, { summary: long }];
assert.strictEqual(storyLengthError(okStories, okStories), null);
assert.ok(storyLengthError([{ summary: "short" }, { summary: long }, { summary: long }], okStories));

const { writeModel, FORBIDDEN_WRITE_RE } = require("../lib/weekly-newsletter-models");
assert.ok(FORBIDDEN_WRITE_RE.test("gpt-4o-mini"));
assert.ok(!FORBIDDEN_WRITE_RE.test("gpt-5.6"));
process.env.WEEKLY_NEWSLETTER_WRITE_MODEL = "gpt-5.6";
assert.strictEqual(writeModel(), "gpt-5.6");
delete process.env.WEEKLY_NEWSLETTER_WRITE_MODEL;
let threw = false;
try {
  process.env.WEEKLY_NEWSLETTER_WRITE_MODEL = "gpt-4o-mini";
  writeModel();
} catch (_) {
  threw = true;
} finally {
  delete process.env.WEEKLY_NEWSLETTER_WRITE_MODEL;
}
assert.ok(threw, "mini write model must be rejected");

const {
  validateResearchBrief,
  heuristicBriefFromCandidates,
  normalizeSelected,
} = require("../lib/weekly-newsletter-research-brief");
const briefWin = newsletterWindow(new Date("2026-08-30T12:00:00Z"));
assert.strictEqual(briefWin.startDate, "2026-08-23");
assert.strictEqual(briefWin.endDate, "2026-08-29");
const heuristic = heuristicBriefFromCandidates(
  [
    {
      title: "NFDA funeral costs",
      url: "https://content.nfda.org/news/statistics",
      source_name: "NFDA",
      published: "2026-08-25",
      category: "final_expense",
    },
  ],
  briefWin,
  {
    evergreen: [
      {
        category: "term_life",
        title_en: "Term cost",
        source_url: "https://www.limra.com/",
        source_name: "LIMRA",
        published: "evergreen",
      },
      {
        category: "annuity",
        title_en: "Annuity guide",
        source_url: "https://content.naic.org/",
        source_name: "NAIC",
        published: "evergreen",
      },
    ],
  }
);
assert.strictEqual(heuristic.selected.length, 3);
assert.ok(heuristic.selected[0].verified_facts.length >= 5);

const badBrief = {
  window: briefWin,
  selected: [
    normalizeSelected({
      working_headline: "Bad date story",
      event_date: "2020-01-01",
      publication_date: "2020-01-01",
      primary_source_name: "Example",
      primary_source_url: "https://example.com/",
      verified_facts: ["a", "b", "c", "d", "e"],
      why_it_matters: "x",
      practical_takeaway: "y",
    }),
    normalizeSelected({
      working_headline: "Ok evergreen",
      publication_date: "evergreen",
      primary_source_name: "FTC",
      primary_source_url: "https://consumer.ftc.gov/articles/ftc-funeral-rule",
      verified_facts: ["a", "b", "c", "d", "e"],
      why_it_matters: "x",
      practical_takeaway: "y",
      is_background_evergreen: true,
    }),
    normalizeSelected({
      working_headline: "Missing facts",
      event_date: "2026-08-24",
      publication_date: "2026-08-24",
      primary_source_name: "LIMRA",
      primary_source_url: "https://www.limra.com/",
      verified_facts: ["only one"],
      why_it_matters: "x",
      practical_takeaway: "y",
    }),
  ],
  candidates_reviewed: [],
};
validateResearchBrief(badBrief, { window: briefWin, harvestCount: 3 }).then((v) => {
  assert.ok(!v.ok);
  assert.ok(v.errors.some((e) => /news period|verified_facts/i.test(e)));
  console.log("weekly-newsletter tests ok");
});
