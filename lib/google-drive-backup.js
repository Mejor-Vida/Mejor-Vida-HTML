/**
 * Upload files to Julie's Google Drive using a Drive-only refresh token
 * (GOOGLE_DRIVE_REFRESH_TOKEN). Scope is drive.file — only files this app creates.
 */
"use strict";

const fs = require("fs");
const { google } = require("./google-clients");

const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
const DRIVE_BACKUP_STATE = "drive-backup";
const DEFAULT_FOLDER_NAME = "Mejor Vida Supabase backups";
const DEFAULT_KEEP = 14;

function driveOAuthConfig() {
  const clientId = String(process.env.GMAIL_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.GMAIL_CLIENT_SECRET || "").trim();
  const refreshToken = String(process.env.GOOGLE_DRIVE_REFRESH_TOKEN || "").trim();
  return { clientId, clientSecret, refreshToken };
}

function hasDriveBackupCredentials() {
  const { clientId, clientSecret, refreshToken } = driveOAuthConfig();
  return !!(clientId && clientSecret && refreshToken);
}

function driveOAuthClient(redirectUri) {
  const { clientId, clientSecret } = driveOAuthConfig();
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

async function getDriveAccessToken() {
  if (!hasDriveBackupCredentials()) {
    const err = new Error(
      "Google Drive backup is not connected. Open /api/staff/drive-auth once as julie@mejorvidainsurance.com."
    );
    err.code = "DRIVE_NOT_CONFIGURED";
    throw err;
  }
  const { refreshToken } = driveOAuthConfig();
  const client = driveOAuthClient(process.env.GMAIL_REDIRECT_URI || "");
  client.setCredentials({ refresh_token: refreshToken });
  const tok = await client.getAccessToken();
  const accessToken = typeof tok === "string" ? tok : tok && tok.token;
  if (!accessToken) throw new Error("Google Drive access token missing");
  return String(accessToken);
}

async function driveFetch(accessToken, url, options) {
  const headers = Object.assign(
    { Authorization: `Bearer ${accessToken}` },
    (options && options.headers) || {}
  );
  const res = await fetch(url, Object.assign({}, options, { headers }));
  const text = await res.text();
  let json = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch (e) {
      json = null;
    }
  }
  if (!res.ok) {
    const msg =
      (json && json.error && json.error.message) ||
      text.slice(0, 400) ||
      `Drive HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = json || text.slice(0, 400);
    throw err;
  }
  return { res, json, text };
}

async function findOrCreateBackupFolder(accessToken) {
  const fromEnv = String(process.env.GOOGLE_DRIVE_BACKUP_FOLDER_ID || "").trim();
  if (fromEnv) return fromEnv;
  const folderName = String(process.env.GOOGLE_DRIVE_BACKUP_FOLDER_NAME || DEFAULT_FOLDER_NAME).trim();
  const q = encodeURIComponent(
    `name='${folderName.replace(/'/g, "\\'")}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  );
  const listed = await driveFetch(
    accessToken,
    `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&fields=files(id,name)&pageSize=10`
  );
  const existing = listed.json && listed.json.files && listed.json.files[0];
  if (existing && existing.id) return existing.id;
  const created = await driveFetch(accessToken, "https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: folderName,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  if (!created.json || !created.json.id) throw new Error("Failed to create Drive backup folder");
  return created.json.id;
}

async function uploadFileToDrive(accessToken, { filePath, name, mimeType, folderId }) {
  const size = fs.statSync(filePath).size;
  const metadata = {
    name,
    mimeType: mimeType || "application/zip",
    parents: folderId ? [folderId] : undefined,
  };
  const init = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,webViewLink,size",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": metadata.mimeType,
        "X-Upload-Content-Length": String(size),
      },
      body: JSON.stringify(metadata),
    }
  );
  if (!init.ok) {
    const t = await init.text();
    throw new Error(`Drive resumable init failed (${init.status}): ${t.slice(0, 400)}`);
  }
  const loc = init.headers.get("location");
  if (!loc) throw new Error("Drive resumable upload session missing Location");

  const blob = await fs.openAsBlob(filePath);
  const put = await fetch(loc, {
    method: "PUT",
    headers: {
      "Content-Length": String(size),
      "Content-Type": metadata.mimeType,
    },
    body: blob,
  });
  const text = await put.text();
  if (!put.ok) {
    throw new Error(`Drive upload failed (${put.status}): ${text.slice(0, 400)}`);
  }
  return text ? JSON.parse(text) : { name, size };
}

async function listBackupFiles(accessToken, folderId) {
  const q = encodeURIComponent(
    `'${folderId}' in parents and trashed=false and (name contains 'mvi-supabase-' or name contains 'mvi-supabase_')`
  );
  const listed = await driveFetch(
    accessToken,
    `https://www.googleapis.com/drive/v3/files?q=${q}&spaces=drive&orderBy=createdTime desc&pageSize=100&fields=files(id,name,createdTime,size)`
  );
  return (listed.json && listed.json.files) || [];
}

async function pruneOldBackups(accessToken, folderId, keep) {
  const retain = Math.max(1, Number(keep || process.env.GOOGLE_DRIVE_BACKUP_KEEP || DEFAULT_KEEP) || DEFAULT_KEEP);
  const files = await listBackupFiles(accessToken, folderId);
  const extra = files.slice(retain);
  for (const file of extra) {
    await driveFetch(accessToken, `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(file.id)}`, {
      method: "DELETE",
    });
  }
  return { kept: files.length - extra.length, deleted: extra.length };
}

async function uploadBackupZip(filePath, originalName) {
  const accessToken = await getDriveAccessToken();
  const folderId = await findOrCreateBackupFolder(accessToken);
  const uploaded = await uploadFileToDrive(accessToken, {
    filePath,
    name: originalName,
    mimeType: "application/zip",
    folderId,
  });
  const pruned = await pruneOldBackups(accessToken, folderId);
  return {
    folderId,
    file: uploaded,
    pruned,
  };
}

module.exports = {
  DRIVE_SCOPE,
  DRIVE_BACKUP_STATE,
  DEFAULT_FOLDER_NAME,
  hasDriveBackupCredentials,
  driveOAuthClient,
  getDriveAccessToken,
  findOrCreateBackupFolder,
  uploadBackupZip,
};
