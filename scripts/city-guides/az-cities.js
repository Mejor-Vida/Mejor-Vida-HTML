/**
 * Arizona city guides — same pattern as ca-cities.js: one module per metro,
 * Funeralocity estimator column (9 Oct 2026), named-home GPL columns when published,
 * burial-plot section with Grave Solutions resale data.
 */
const phoenix = require("./phoenix");
const tucson = require("./tucson");
const mesa = require("./mesa");
const chandler = require("./chandler");
const scottsdale = require("./scottsdale");
const glendale = require("./glendale");
const gilbert = require("./gilbert");
const tempe = require("./tempe");

module.exports = [
  phoenix,
  tucson,
  mesa,
  chandler,
  scottsdale,
  glendale,
  gilbert,
  tempe,
];
