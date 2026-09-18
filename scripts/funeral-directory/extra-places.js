/**
 * Directory-only cities (no full city-guide page yet).
 * Kansas is hand-listed. Nebraska is generated from the NFDA member directory.
 * Do not invent GPL dollars.
 */
const kansasPlaces = require("./kansas-places");
const nebraskaPlaces = require("./nebraska-places");

module.exports = [...kansasPlaces, ...nebraskaPlaces];
