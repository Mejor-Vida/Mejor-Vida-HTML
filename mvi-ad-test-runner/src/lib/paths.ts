import fs from "fs";
import path from "path";

/**
 * Root directory for all managed files (imports, per-project assets, sqlite parent folder).
 * Defaults to `<cwd>/data` so the app stays self-contained when run locally.
 */
export function getDataRoot(): string {
  const override = process.env.MVI_DATA_DIR?.trim();
  if (override) return path.resolve(override);
  return path.join(process.cwd(), "data");
}

export function ensureDir(p: string): void {
  fs.mkdirSync(p, { recursive: true });
}

export function projectDir(projectId: string): string {
  return path.join(getDataRoot(), "projects", projectId);
}

export function roundAssetsDir(projectId: string, roundId: string): string {
  return path.join(projectDir(projectId), "rounds", roundId, "assets");
}

export function importInboxDir(): string {
  return path.join(getDataRoot(), "imports", "inbox");
}

export function previewsDir(projectId: string, roundId: string): string {
  return path.join(projectDir(projectId), "rounds", roundId, "previews");
}
