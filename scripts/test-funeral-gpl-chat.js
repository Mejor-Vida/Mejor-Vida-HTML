const assert = require("assert");
const {
  isFuneralCostQuestion,
  isInsuranceCostQuestion,
  answerFuneralCostQuestion,
} = require("../lib/funeral-gpl-chat");

assert.ok(isFuneralCostQuestion("How much does a funeral cost in Olathe?"));
assert.ok(isFuneralCostQuestion("¿Cuánto cuesta una cremación directa en Lincoln?"));
assert.ok(isFuneralCostQuestion("lista de precios de funerarias en Overland Park"));
assert.ok(isInsuranceCostQuestion("cuánto cuesta el seguro de funeral"));
assert.ok(!isFuneralCostQuestion("cuánto cuesta el seguro de funeral"));
assert.ok(!isFuneralCostQuestion("How much is burial insurance?"));
assert.ok(!isFuneralCostQuestion("What is final expense insurance?"));

const olathe = answerFuneralCostQuestion("How much does a funeral cost in Olathe?", { isSpanish: false });
assert.ok(olathe, "Olathe should return an answer");
assert.ok(/Penwell-Gabel/i.test(olathe), olathe);
assert.ok(olathe.includes("$4,905"), olathe);
assert.ok(olathe.includes("$2,045"), olathe);
assert.ok(/15 Sep 2026/i.test(olathe), olathe);
assert.ok(!/McGilley & Frye[\s\S]*\$/.test(olathe));
assert.ok(/olathe\.html/.test(olathe));
assert.ok(/not Mejor Vida Insurance prices/i.test(olathe));

const olatheMem = answerFuneralCostQuestion("cuánto cuesta una cremación con memorial en Olathe", {
  isSpanish: true,
});
assert.ok(olatheMem.includes("$4,905"), olatheMem);
assert.ok(!olatheMem.includes("$6,195"), olatheMem);
assert.ok(/Mejor Vida Seguros/.test(olatheMem));

const op = answerFuneralCostQuestion("How much is a funeral in Overland Park?", { isSpanish: false });
assert.ok(op, op);
assert.ok(/do not put named funeral-home prices/i.test(op), op);
assert.ok(/McGilley & Hoge/i.test(op), op);
assert.ok(/913-642-3565/.test(op), op);
assert.ok(!op.includes("$4,905"));
assert.ok(!/standard funeral/i.test(op));

const penwell = answerFuneralCostQuestion("Penwell-Gabel Olathe memorial cost", { isSpanish: false });
assert.ok(penwell, "named home should answer");
assert.ok(penwell.includes("$4,905"), penwell);
assert.ok(!penwell.includes("$6,195"), penwell);

const porter = answerFuneralCostQuestion("Porter funeral home prices", { isSpanish: false });
assert.ok(porter, porter);
assert.ok(/more than one match|Lenexa|Kansas City/i.test(porter), porter);
assert.ok(!/Bonner Springs/i.test(porter), porter);

const rumsey = answerFuneralCostQuestion("Rumsey-Yost funeral prices in Lawrence", { isSpanish: false });
assert.ok(rumsey, rumsey);
assert.ok(/Rumsey-Yost/i.test(rumsey), rumsey);
assert.ok(!/\$6,\d{3}/.test(rumsey) || /Warren-McElwain/.test(rumsey));

const lincoln = answerFuneralCostQuestion("¿Cuánto cuesta una cremación directa en Lincoln?", {
  isSpanish: true,
});
assert.ok(lincoln, lincoln);
assert.ok(/\$1,595|\$1,755|\$3,910|\$3,285/.test(lincoln), lincoln);
assert.ok(/lincoln\.html/.test(lincoln));

const noCity = answerFuneralCostQuestion("How much does a funeral cost?", { isSpanish: false });
assert.ok(/Which city/i.test(noCity), noCity);
assert.ok(/funeral-homes-cemeteries/.test(noCity));

const ctx = answerFuneralCostQuestion("How much is direct cremation?", {
  isSpanish: false,
  conversationContext: "User: I live in Olathe\nAssistant: Thanks.\nUser: How much is direct cremation?",
});
assert.ok(/Penwell-Gabel/i.test(ctx), ctx);
assert.ok(ctx.includes("$2,045"), ctx);

const gardner = answerFuneralCostQuestion("funeral prices in Gardner Kansas", { isSpanish: false });
assert.ok(gardner, gardner);
assert.ok(/Bruce Funeral Home/i.test(gardner) || /Penwell-Gabel/i.test(gardner), gardner);

console.log("test-funeral-gpl-chat: ok");
