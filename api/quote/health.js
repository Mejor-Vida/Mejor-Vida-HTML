const { forwardQuoteProxy } = require("../_quote-proxy");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).send("Method Not Allowed");
  }
  return forwardQuoteProxy(req, res, "health");
};
