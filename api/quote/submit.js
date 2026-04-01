const { forwardQuoteProxy } = require("../_quote-proxy");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).send("Method Not Allowed");
  }
  return forwardQuoteProxy(req, res, "submit");
};
