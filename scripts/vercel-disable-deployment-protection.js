#!/usr/bin/env node
/**
 * Disable Vercel Deployment Protection (Vercel Authentication) on mejor-vida-html.
 *
 * Prerequisites:
 *   vercel login
 *   export VERCEL_TOKEN="$(grep '^VERCEL_TOKEN=' .env.local | cut -d= -f2- | tr -d '\"')"
 *   # or: vercel whoami && token from https://vercel.com/account/tokens
 *
 * Usage:
 *   node scripts/vercel-disable-deployment-protection.js
 *   node scripts/vercel-disable-deployment-protection.js --dry-run
 */
const TEAM_ID = "justins-projects-dd0ab4d0";
const PROJECT = "mejor-vida-html";

const dryRun = process.argv.includes("--dry-run");
const token = process.env.VERCEL_TOKEN || process.env.VERCEL_ACCESS_TOKEN;

if (!token) {
  console.error(
    "Missing VERCEL_TOKEN. Run: vercel login, or add VERCEL_TOKEN to .env.local (create at https://vercel.com/account/tokens)"
  );
  process.exit(1);
}

async function api(path, opts = {}) {
  const url = `https://api.vercel.com${path}`;
  const res = await fetch(url, {
    ...opts,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(opts.headers || {}),
    },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.error?.message || body.message || res.statusText;
    throw new Error(`${res.status} ${msg}`);
  }
  return body;
}

async function main() {
  const project = await api(`/v9/projects/${PROJECT}?teamId=${TEAM_ID}`);
  console.log("Project:", project.name);
  console.log("Current ssoProtection:", JSON.stringify(project.ssoProtection, null, 2));
  console.log("Current passwordProtection:", JSON.stringify(project.passwordProtection, null, 2));

  if (!project.ssoProtection && !project.passwordProtection) {
    console.log("Deployment protection already disabled.");
    return;
  }

  const patch = {
    ssoProtection: null,
    passwordProtection: null,
  };

  if (dryRun) {
    console.log("Dry run — would PATCH with:", JSON.stringify(patch, null, 2));
    return;
  }

  const updated = await api(`/v9/projects/${PROJECT}?teamId=${TEAM_ID}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  console.log("Updated ssoProtection:", JSON.stringify(updated.ssoProtection));
  console.log("Updated passwordProtection:", JSON.stringify(updated.passwordProtection));
  console.log("Done. Production custom domains should be public immediately (no redeploy required).");
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
