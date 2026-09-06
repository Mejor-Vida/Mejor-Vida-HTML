#!/usr/bin/env node
/**
 * Dump the Supabase database and upload the zip to Julie's Google Drive.
 *
 *   npm run backup:supabase
 *
 * Requires GOOGLE_DRIVE_REFRESH_TOKEN (open /api/staff/drive-auth once).
 * Local dumps use Postgres COPY when SUPABASE_DB_PASSWORD is set.
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");

function loadEnvLocal() {
  const envPath = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i === -1) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = val;
  }
}

async function main() {
  loadEnvLocal();
  const { createBackupArchive } = require("../lib/supabase-db-backup");
  const { hasDriveBackupCredentials, uploadBackupZip } = require("../lib/google-drive-backup");

  const workDir = path.join(os.tmpdir(), "mvi-supabase-backup");
  const archive = await createBackupArchive(workDir);
  const bytes = fs.statSync(archive.filePath).size;
  const keepDir = path.join(__dirname, "..", "backups");
  fs.mkdirSync(keepDir, { recursive: true });
  const localCopy = path.join(keepDir, archive.fileName);
  fs.copyFileSync(archive.filePath, localCopy);
  console.log(
    `Backup file ready (${archive.method}, ${bytes} bytes): ${archive.fileName}`
  );
  console.log(`Local copy: ${localCopy}`);

  if (!hasDriveBackupCredentials()) {
    console.error(
      "Drive is not connected. Keep the local file, then open /api/staff/drive-auth as admin@mejorvidainsurance.com."
    );
    console.error(`Local file: ${archive.filePath}`);
    process.exit(2);
  }

  const uploaded = await uploadBackupZip(archive.filePath, archive.fileName);
  console.log(
    `Uploaded to Google Drive folder ${uploaded.folderId} as ${uploaded.file && uploaded.file.name}`
  );
  if (uploaded.file && uploaded.file.webViewLink) {
    console.log(uploaded.file.webViewLink);
  }
  console.log(`Retention: kept ${uploaded.pruned.kept}, deleted ${uploaded.pruned.deleted} old backup(s)`);
  try {
    fs.unlinkSync(archive.filePath);
  } catch (e) {
    /* keep file if delete fails */
  }
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
