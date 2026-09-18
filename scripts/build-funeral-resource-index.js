#!/usr/bin/env node
/**
 * Write data/funeral-resources.json from city-guide modules.
 * Usage: node scripts/build-funeral-resource-index.js
 */
const { writeFuneralResourceIndex } = require("../lib/funeral-resource-index");

const result = writeFuneralResourceIndex();
console.log(
  `wrote ${result.out} (${result.places} cities, ${result.listings} listings, ${result.homes} funeral homes)`
);
