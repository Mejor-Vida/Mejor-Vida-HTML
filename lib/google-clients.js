/**
 * Slim Google API clients used in production.
 *
 * Replaces the kitchen-sink `googleapis` package (300+ APIs, ~190MB) with the
 * three APIs this site actually calls: Gmail, GA4 Data, and Search Console.
 * Auth stays on google-auth-library (same OAuth2 / GoogleAuth classes).
 *
 * Call sites keep `const { google } = require(...)` and the same
 * `google.gmail()`, `google.analyticsdata()`, `google.searchconsole()`,
 * `google.auth.OAuth2`, and `google.auth.GoogleAuth` usage.
 */
"use strict";

const { GoogleAuth, OAuth2Client } = require("google-auth-library");
const { gmail } = require("@googleapis/gmail");
const { analyticsdata } = require("@googleapis/analyticsdata");
const { searchconsole } = require("@googleapis/searchconsole");

const google = {
  auth: {
    OAuth2: OAuth2Client,
    GoogleAuth,
  },
  gmail,
  analyticsdata,
  searchconsole,
};

module.exports = { google };
