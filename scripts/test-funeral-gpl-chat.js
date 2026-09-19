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

const denver = answerFuneralCostQuestion("How much does a funeral cost in Denver?", { isSpanish: false });
assert.ok(denver, denver);
assert.ok(/Newcomer West Metro/i.test(denver), denver);
assert.ok(denver.includes("$1,690"), denver);
assert.ok(/Olinger Hampden/i.test(denver), denver);
assert.ok(denver.includes("$2,545"), denver);
assert.ok(/denver\.html/.test(denver));
assert.ok(!/Horan[\s\S]*\$1,/.test(denver));

const pueblo = answerFuneralCostQuestion("How much is a funeral in Pueblo Colorado?", { isSpanish: false });
assert.ok(pueblo, pueblo);
assert.ok(/do not put named funeral-home prices|do not publish/i.test(pueblo), pueblo);
assert.ok(/Montgomery/i.test(pueblo), pueblo);
assert.ok(!pueblo.includes("$1,690"));

const greeley = answerFuneralCostQuestion("How much does a funeral cost in Greeley?", { isSpanish: false });
assert.ok(greeley, greeley);
assert.ok(/Allnutt/i.test(greeley), greeley);
assert.ok(greeley.includes("$3,875"), greeley);
assert.ok(greeley.includes("$4,020"), greeley);
assert.ok(greeley.includes("$6,105"), greeley);
assert.ok(greeley.includes("$11,840"), greeley);
assert.ok(/25 Jun 2026/i.test(greeley), greeley);
assert.ok(!/Adamson[\s\S]*\$/.test(greeley));

const fortCollins = answerFuneralCostQuestion("How much does a funeral cost in Fort Collins?", {
  isSpanish: false,
});
assert.ok(fortCollins, fortCollins);
assert.ok(/Goes Funeral Care/i.test(fortCollins), fortCollins);
assert.ok(/Allnutt Drake/i.test(fortCollins), fortCollins);
assert.ok(fortCollins.includes("$2,400"), fortCollins);
assert.ok(fortCollins.includes("$3,905"), fortCollins);
assert.ok(/25 Jun 2026/i.test(fortCollins), fortCollins);

const coloradoSprings = answerFuneralCostQuestion("How much does a funeral cost in Colorado Springs?", {
  isSpanish: false,
});
assert.ok(coloradoSprings, coloradoSprings);
assert.ok(/All Veterans/i.test(coloradoSprings), coloradoSprings);
assert.ok(coloradoSprings.includes("$1,595"), coloradoSprings);
assert.ok(coloradoSprings.includes("$2,995"), coloradoSprings);
assert.ok(/Evergreen/i.test(coloradoSprings), coloradoSprings);
assert.ok(/3 Jun 2026/i.test(coloradoSprings), coloradoSprings);
assert.ok(!/Shrine[\s\S]*\$/.test(coloradoSprings));

const springsHome = answerFuneralCostQuestion("The Springs funeral prices", { isSpanish: false });
assert.ok(springsHome, springsHome);
assert.ok(/The Springs/i.test(springsHome), springsHome);
assert.ok(/719-328-1793/.test(springsHome), springsHome);
assert.ok(!springsHome.includes("$1,595"), springsHome);

const aurora = answerFuneralCostQuestion("How much does a funeral cost in Aurora Colorado?", {
  isSpanish: false,
});
assert.ok(aurora, aurora);
assert.ok(/Newcomer East Metro/i.test(aurora), aurora);
assert.ok(/Olinger Chapel Hill/i.test(aurora), aurora);
assert.ok(aurora.includes("$3,045"), aurora);

const grandJunction = answerFuneralCostQuestion("How much does a funeral cost in Grand Junction?", {
  isSpanish: false,
});
assert.ok(grandJunction, grandJunction);
assert.ok(/Callahan/i.test(grandJunction), grandJunction);
assert.ok(/Martin Mortuary/i.test(grandJunction), grandJunction);
assert.ok(grandJunction.includes("$1,785"), grandJunction);
assert.ok(grandJunction.includes("$4,390"), grandJunction);
assert.ok(grandJunction.includes("$3,915"), grandJunction);
assert.ok(grandJunction.includes("$12,840"), grandJunction);
assert.ok(/26 Feb 2026/i.test(grandJunction), grandJunction);

const callahanDc = answerFuneralCostQuestion("How much is direct cremation in Grand Junction?", {
  isSpanish: false,
});
assert.ok(callahanDc, callahanDc);
assert.ok(/Callahan/i.test(callahanDc), callahanDc);
assert.ok(callahanDc.includes("$1,785"), callahanDc);
assert.ok(!callahanDc.includes("$12,840"), callahanDc);

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
