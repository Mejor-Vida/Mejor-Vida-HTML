/**
 * Upsert a key in .env.local without logging the value.
 */
const fs = require("fs");
const path = require("path");

function envLocalPath() {
  return path.join(__dirname, "..", ".env.local");
}

function upsertEnvLocal(key, value) {
  const name = String(key || "").trim();
  const val = String(value || "");
  if (!name || !/^[A-Z0-9_]+$/.test(name)) {
    throw new Error("Invalid env key");
  }
  const filePath = envLocalPath();
  const line = `${name}=${val}`;
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, line + "\n", "utf8");
    return { path: filePath, created: true };
  }
  const text = fs.readFileSync(filePath, "utf8");
  const re = new RegExp(`^${name}=.*$`, "m");
  const next = re.test(text)
    ? text.replace(re, line)
    : text.replace(/\s*$/, "") + "\n" + line + "\n";
  fs.writeFileSync(filePath, next, "utf8");
  return { path: filePath, created: false };
}

module.exports = { envLocalPath, upsertEnvLocal };
