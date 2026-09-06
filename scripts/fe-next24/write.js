#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "../..");
const OUT = path.join(ROOT, "data/fe-guides");

const parts = [
  require("./guides-01"),
  require("./guides-02"),
  require("./guides-03"),
  require("./guides-04"),
  require("./guides-05"),
  require("./guides-06"),
  require("./guides-07"),
  require("./guides-08"),
  require("./guides-09"),
  require("./guides-10"),
  require("./guides-11"),
  require("./guides-12"),
];

const guides = parts.flat();
const seen = new Set();
for (const g of guides) {
  if (seen.has(g.slug)) {
    console.error("Duplicate slug:", g.slug);
    process.exit(1);
  }
  seen.add(g.slug);
  const dest = path.join(OUT, `${g.slug}.json`);
  fs.writeFileSync(dest, JSON.stringify(g, null, 2) + "\n", "utf8");
}

console.log(`Wrote ${guides.length} guide JSON files to data/fe-guides/`);
