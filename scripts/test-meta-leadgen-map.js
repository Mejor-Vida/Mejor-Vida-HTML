#!/usr/bin/env node
/**
 * Unit-style checks for Meta instant form field mapping.
 * Usage: node scripts/test-meta-leadgen-map.js
 */

const { mapLeadgenFields, parseWebhookEntries } = require("../lib/meta-leadgen");

function assert(cond, msg) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

const mapped = mapLeadgenFields([
  { name: "nombre", values: ["María"] },
  { name: "apellido", values: ["López"] },
  { name: "correo", values: ["maria@example.com"] },
  { name: "teléfono", values: ["4025551234"] },
  { name: "edad", values: ["62"] },
  { name: "sexo", values: ["Mujer"] },
  { name: "tabaco", values: ["No"] },
]);

assert(mapped.firstName === "María", "firstName");
assert(mapped.lastName === "López", "lastName");
assert(mapped.email === "maria@example.com", "email");
assert(mapped.age === 62, "age");
assert(mapped.sex === "female", "sex");
assert(mapped.smoker === false, "smoker");

const split = mapLeadgenFields([{ name: "full_name", values: ["John Smith"] }]);
assert(split.firstName === "John" && split.lastName === "Smith", "full_name split");

const entries = parseWebhookEntries({
  object: "page",
  entry: [
    {
      id: "123",
      changes: [{ field: "leadgen", value: { leadgen_id: "999", form_id: "f1" } }],
    },
  ],
});
assert(entries.length === 1 && entries[0].leadgenId === "999", "webhook parse");

if (process.exitCode) {
  console.error("\nSome tests failed.");
  process.exit(1);
}
console.log("\nAll mapping tests passed.");
