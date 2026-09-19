/**
 * Directory-only cities (no full city-guide page yet).
 * Generated *-places.js files from official/association harvests.
 * Do not invent GPL dollars.
 */
const fs = require("fs");
const path = require("path");

const files = fs
  .readdirSync(__dirname)
  .filter((f) => /-places\.js$/.test(f) && !f.startsWith("build-") && f !== "extra-places.js")
  .sort();

module.exports = files.flatMap((file) => require(`./${file.replace(/\.js$/, "")}`));
