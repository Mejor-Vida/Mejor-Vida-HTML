/**
 * Vercel Cron — nightly Supabase backup to Julie's Google Drive.
 * vercel.json: 0 10 * * *  (5:00am CDT / 4:00am CST)
 *
 * Env: CRON_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { createBackupArchive } = require("../lib/supabase-db-backup");
const { hasDriveBackupCredentials, uploadBackupZip } = require("../lib/google-drive-backup");

module.exports = async function handler(req, res) {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (!hasDriveBackupCredentials()) {
    return res.status(503).json({
      error: "Google Drive backup is not connected",
      hint: "Open /api/staff/drive-auth as julie@mejorvidainsurance.com and set GOOGLE_DRIVE_REFRESH_TOKEN",
    });
  }

  const workDir = path.join(os.tmpdir(), "mvi-supabase-backup");
  try {
    const archive = await createBackupArchive(workDir);
    const bytes = fs.statSync(archive.filePath).size;
    const uploaded = await uploadBackupZip(archive.filePath, archive.fileName);
    try {
      fs.unlinkSync(archive.filePath);
    } catch (e) {
      /* ignore */
    }
    return res.status(200).json({
      ok: true,
      method: archive.method,
      fileName: archive.fileName,
      bytes,
      folderId: uploaded.folderId,
      driveFileId: uploaded.file && uploaded.file.id,
      pruned: uploaded.pruned,
      skipped: archive.manifest && archive.manifest.skipped,
    });
  } catch (e) {
    console.error("[supabase-backup-cron]", e.message || e);
    return res.status(500).json({ error: e.message || "Backup failed" });
  }
};
