#!/usr/bin/env node
/**
 * Apply keep-ranges from a YouTube cut_plan JSON onto a recording (ffmpeg).
 * Background compositing (office set) is a later Remotion pass — this step only
 * removes retakes / "go back" restarts so the take matches the approved script.
 *
 *   node scripts/youtube-apply-cuts.js --in recording.mp4 --plan cut-plan.json --out clean.mp4
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function arg(name) {
  const i = process.argv.indexOf("--" + name);
  if (i < 0) return "";
  return String(process.argv[i + 1] || "").trim();
}

function main() {
  const input = arg("in");
  const planPath = arg("plan");
  const out = arg("out") || "clean.mp4";
  if (!input || !planPath) {
    console.error("Usage: node scripts/youtube-apply-cuts.js --in recording.mp4 --plan cut-plan.json --out clean.mp4");
    process.exit(1);
  }
  const plan = JSON.parse(fs.readFileSync(planPath, "utf8"));
  const keep = Array.isArray(plan.keep) ? plan.keep : [];
  if (!keep.length) {
    console.error("cut_plan.keep is empty");
    process.exit(1);
  }
  const parts = [];
  const filter = keep
    .map((seg, i) => {
      const start = Number(seg.start) || 0;
      const end = Number(seg.end);
      const dur = Number.isFinite(end) ? Math.max(0.05, end - start) : 0;
      parts.push(`[v${i}][a${i}]`);
      if (dur) {
        return `[0:v]trim=start=${start}:end=${end},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=start=${start}:end=${end},asetpts=PTS-STARTPTS[a${i}]`;
      }
      return `[0:v]trim=start=${start},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=start=${start},asetpts=PTS-STARTPTS[a${i}]`;
    })
    .join(";");
  const concat = `${filter};${parts.join("")}concat=n=${keep.length}:v=1:a=1[outv][outa]`;
  const args = ["-y", "-i", input, "-filter_complex", concat, "-map", "[outv]", "-map", "[outa]", out];
  const r = spawnSync("ffmpeg", args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status || 1);
  console.log("Wrote", path.resolve(out));
}

main();
