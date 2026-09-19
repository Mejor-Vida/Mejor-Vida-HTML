/**
 * Directory-only cities (no full city-guide page yet).
 * Kansas is generated from the Kansas Board of Mortuary Arts roster.
 * Nebraska is generated from the NFDA member directory.
 * Colorado is generated from the DORA funeral establishment (FES) roster.
 * Nevada is generated from the Funeral Board EST/DC licensee PDFs.
 * Do not invent GPL dollars.
 */
const kansasPlaces = require("./kansas-places");
const nebraskaPlaces = require("./nebraska-places");
const coloradoPlaces = require("./colorado-places");
const nevadaPlaces = require("./nevada-places");

module.exports = [...kansasPlaces, ...nebraskaPlaces, ...coloradoPlaces, ...nevadaPlaces];
