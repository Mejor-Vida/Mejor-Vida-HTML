const assert = require("assert");
const {
  parseFeedCommentEvents,
  commentIntent,
  isKeywordOnly,
  isInfoOnly,
  commentOpening,
  ragToFacebookText,
  wrapFacebookReply,
  lockedFacebookAnswer,
  lockFacebookAnswer,
  composeReply,
  buildFacebookCommentNotifyEmail,
} = require("../lib/facebook-comment-reply");

assert.strictEqual(commentIntent("INFO"), "info");
assert.strictEqual(commentIntent("quiero info por favor"), "info");
assert.strictEqual(commentIntent("Information.!!!!"), "info");
assert.strictEqual(commentIntent("REVISAR"), "revisar");
assert.strictEqual(commentIntent("¿Cuánto cuesta?"), "other");
assert.ok(isKeywordOnly("INFO", "info"));
assert.ok(isKeywordOnly("revisar!", "revisar"));
assert.ok(!isKeywordOnly("INFO que es GINA", "info"));
assert.ok(isInfoOnly("Information.!!!!"));
assert.ok(commentOpening("info").includes("asistente automático"));
assert.ok(commentOpening("info").includes("Julie"));
assert.ok(!commentOpening("info").includes("http"));
assert.ok(!ragToFacebookText("Lee [el artículo](https://example.com) y **esto**").includes("https://example.com"));
assert.ok(ragToFacebookText("Lee [el artículo](https://example.com) y **esto**").includes("esto"));

const costBody = lockedFacebookAnswer("¿Cuánto cuesta el seguro?");
assert.ok(costBody && costBody.includes("no es igual para todos"));
assert.ok(!/402|Llámala|Assurity|\$30/i.test(costBody));
const costFirst = wrapFacebookReply("¿Cuánto cuesta el seguro?", costBody, { firstInConversation: true });
assert.ok(costFirst.includes("asistente automático"));
assert.ok(costFirst.includes("no es igual para todos"));
const costLater = wrapFacebookReply("¿Cuánto cuesta el seguro?", costBody, { firstInConversation: false });
assert.ok(!costLater.includes("asistente automático"));
assert.ok(costLater.includes("Si tiene otra pregunta"));

const whoBody = lockedFacebookAnswer("quien es Julie?");
assert.ok(whoBody.includes("fundadora de Mejor Vida Seguros"));
assert.ok(whoBody.includes("NPN #21695431"));
assert.ok(!/Bogotá|about-julie|402-440|@mejorvidainsurance/i.test(whoBody));

const ageBody = lockedFacebookAnswer("tengo 35 años, puedo comprar?");
assert.ok(ageBody.includes("A los 35 años puede comprar"));
assert.ok(ageBody.includes("gastos finales empiezan a edades más altas"));
assert.ok(!/Assurity|Transamerica|402-440|en qué estado/i.test(ageBody));

assert.ok(lockedFacebookAnswer("vivo en Nebraska").includes("mensaje privado"));
assert.ok(!/Nebraska|Kansas|Colorado|Nevada/i.test(lockedFacebookAnswer("vivo en Nebraska")));
const stripped = lockFacebookAnswer(
  "Puedes ver precios de $30–$100. Llámala al 402-440-5438. Assurity Protect+ empieza a $10,000."
);
assert.ok(!/402-440|Assurity|Llámala/i.test(stripped));
assert.ok(wrapFacebookReply("hola", "Respuesta.", { firstInConversation: false }).includes("Si tiene otra pregunta"));

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
            from: { id: "555", name: "Ana" },
            message: "INFO",
          },
        },
      ],
    },
  ],
});
assert.strictEqual(feed.length, 1);
assert.strictEqual(feed[0].commentId, "111_999");
assert.strictEqual(feed[0].senderName, "Ana");
assert.strictEqual(parseFeedCommentEvents({ object: "page", entry: [] }).length, 0);
const commentMail = buildFacebookCommentNotifyEmail({
  fromName: "Ana <script>",
  message: "<b>hola</b>",
  replyStatus: "replied",
  replyText: "Gracias",
  commentId: "111_999",
});
assert.ok(commentMail.to.includes("julie@mejorvidainsurance.com"));
assert.ok(commentMail.to.includes("admin@mejorvidainsurance.com"));
assert.ok(commentMail.subject.includes("hola"));
assert.ok(!commentMail.subject.startsWith("[TEST]"));
const testMail = buildFacebookCommentNotifyEmail({
  message: "preview",
  subjectPrefix: "[TEST]",
});
assert.ok(testMail.subject.startsWith("[TEST] New Facebook comment:"));
assert.ok(!commentMail.html.includes("<b>hola</b>"));
assert.ok(commentMail.html.includes("&lt;b&gt;hola&lt;/b&gt;"));
assert.ok(commentMail.html.includes("Ana &lt;script&gt;"));
assert.ok(commentMail.text.includes("The Page auto-replied."));
assert.ok(commentMail.html.includes("Julie Braunsroth"));

(async () => {
  const infoFirst = await composeReply({ intent: "info", message: "Information!!!!", firstInConversation: true });
  assert.ok(infoFirst.includes("asistente automático"));
  assert.ok(!/http|blog|#story/i.test(infoFirst));
  const infoLater = await composeReply({ intent: "info", message: "info", firstInConversation: false });
  assert.strictEqual(infoLater, "¿Qué le gustaría saber?");
  const costRoute = await composeReply({
    intent: "other",
    message: "¿Cuánto cuesta el seguro?",
    firstInConversation: false,
  });
  assert.ok(costRoute.includes("no es igual para todos"));
  assert.ok(!costRoute.includes("asistente automático"));
  const whoRoute = await composeReply({ intent: "other", message: "quien es Julie?", firstInConversation: false });
  assert.ok(whoRoute.includes("NPN #21695431"));
  const ageRoute = await composeReply({
    intent: "other",
    message: "tengo 35 años, puedo comprar?",
    firstInConversation: false,
  });
  assert.ok(ageRoute.includes("A los 35 años puede comprar"));
  assert.ok(!/Assurity|402-440/i.test(ageRoute));
  console.log("facebook-comment-reply tests ok");
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
