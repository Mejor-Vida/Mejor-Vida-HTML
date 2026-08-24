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
const { stripUrls, defaultFirstComment, HASHTAGS } = require("../lib/weekly-facebook-compose");

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

const { parseFeedCommentEvents, commentIntent } = require("../lib/facebook-comment-reply");
assert.strictEqual(commentIntent("INFO"), "info");
assert.strictEqual(commentIntent("quiero info por favor"), "info");
assert.strictEqual(commentIntent("REVISAR"), "revisar");
assert.strictEqual(commentIntent("¿Cuánto cuesta?"), "other");
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

console.log("weekly-newsletter tests ok");
