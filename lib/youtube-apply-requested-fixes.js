/**
 * Cut requested off-script ranges out of a CRM holding take (ffmpeg).
 * Remotion is the later office-background pass; this is the actual edit.
 */
"use strict";

const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");
const { siblingAudioPath, purgeRecordingFiles } = require("./youtube-recording-storage");

function hasFfmpeg() {
  const r = spawnSync("ffmpeg", ["-version"], { encoding: "utf8" });
  return r.status === 0;
}

function ffprobeDuration(file) {
  const r = spawnSync(
    "ffprobe",
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file],
    { encoding: "utf8" }
  );
  const n = Number(String(r.stdout || "").trim());
  if (!Number.isFinite(n) || n <= 0) throw new Error("Could not read video duration");
  return n;
}

function keepRanges(duration, cuts) {
  const sorted = (cuts || [])
    .map((c) => ({ start: Math.max(0, Number(c.start) || 0), end: Number(c.end) }))
    .filter((c) => Number.isFinite(c.end) && c.end - c.start >= 0.2)
    .sort((a, b) => a.start - b.start);
  const keep = [];
  let t = 0;
  for (const c of sorted) {
    if (c.start > t + 0.05) keep.push({ start: t, end: Math.min(c.start, duration) });
    t = Math.max(t, c.end);
  }
  if (t < duration - 0.05) keep.push({ start: t, end: duration });
  return keep.filter((k) => k.end - k.start >= 0.05);
}

function mapTime(oldT, keeps) {
  if (oldT == null || oldT === "" || !Number.isFinite(Number(oldT))) return oldT;
  const x = Number(oldT);
  let acc = 0;
  for (const k of keeps) {
    if (x < k.start) return Math.max(0, acc);
    if (x <= k.end) return acc + (x - k.start);
    acc += k.end - k.start;
  }
  return acc;
}

function remapPlan(plan, keeps, appliedCuts) {
  const next = { ...(plan || {}) };
  const shift = (t) => mapTime(t, keeps);
  const inCut = (start, end) =>
    (appliedCuts || []).some((c) => Number(end) <= c.end && Number(start) >= c.start - 0.05);
  const remapSegs = (arr, extraDrop) =>
    (Array.isArray(arr) ? arr : [])
      .filter((s) => s && !inCut(s.start, s.end) && !extraDrop(s))
      .map((s) => ({
        ...s,
        start: shift(s.start),
        end: shift(s.end),
      }));
  next.rows = remapSegs(next.rows, (s) => !String(s.script || "").trim() && inCut(s.start, s.end));
  next.segments = remapSegs(next.segments, () => false);
  next.words = remapSegs(next.words, () => false);
  next.keep = remapSegs(next.keep, () => false);
  next.cut = remapSegs(next.cut, () => false);
  next.issues = (Array.isArray(next.issues) ? next.issues : [])
    .filter((iss) => !appliedCuts.some((c) => Math.abs(Number(iss.start) - c.start) < 0.4 && Math.abs(Number(iss.end) - c.end) < 0.4))
    .map((iss) => ({
      ...iss,
      start: shift(iss.start),
      end: shift(iss.end),
    }));
  return next;
}

function ffmpegOk(output, r) {
  return r.status === 0 && fs.existsSync(output) && fs.statSync(output).size > 1000;
}

function cutWithFfmpeg(input, output, keeps) {
  if (!keeps.length) throw new Error("Nothing left to keep");
  const opts = { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 };
  if (keeps.length === 1) {
    const k = keeps[0];
    const encode = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        input,
        "-ss",
        String(k.start),
        "-t",
        String(Math.max(0.05, k.end - k.start)),
        "-c:v",
        "libx264",
        "-crf",
        "23",
        "-preset",
        "veryfast",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-movflags",
        "+faststart",
        output,
      ],
      opts
    );
    if (!ffmpegOk(output, encode)) throw new Error(String(encode.stderr || "ffmpeg failed").slice(-240));
    return;
  }
  const parts = [];
  const filter = keeps
    .map((seg, i) => {
      parts.push(`[v${i}][a${i}]`);
      return `[0:v]trim=start=${seg.start}:end=${seg.end},setpts=PTS-STARTPTS[v${i}];[0:a]atrim=start=${seg.start}:end=${seg.end},asetpts=PTS-STARTPTS[a${i}]`;
    })
    .join(";");
  const concat = `${filter};${parts.join("")}concat=n=${keeps.length}:v=1:a=1[outv][outa]`;
  const r = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-i",
      input,
      "-filter_complex",
      concat,
      "-map",
      "[outv]",
      "-map",
      "[outa]",
      "-c:v",
      "libx264",
      "-crf",
      "23",
      "-preset",
      "veryfast",
      "-c:a",
      "aac",
      "-b:a",
      "96k",
      output,
    ],
    opts
  );
  if (!ffmpegOk(output, r)) throw new Error(String(r.stderr || "ffmpeg failed").slice(-240));
}

function extractWav(videoPath, wavPath) {
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-i", videoPath, "-ac", "1", "-ar", "16000", wavPath],
    { encoding: "utf8" }
  );
  if (r.status !== 0) throw new Error("Could not extract audio after the cut");
}

function shiftPlanTimes(plan, delta) {
  const n = Number(delta);
  if (!plan || !Number.isFinite(n) || !n) return plan;
  const sh = (t) => {
    if (t == null || t === "" || !Number.isFinite(Number(t))) return t;
    return Number(t) + n;
  };
  const segs = (arr) =>
    (Array.isArray(arr) ? arr : []).map((s) => ({
      ...s,
      start: sh(s.start),
      end: sh(s.end),
    }));
  return {
    ...plan,
    rows: segs(plan.rows),
    segments: segs(plan.segments),
    words: segs(plan.words),
    keep: segs(plan.keep),
    cut: segs(plan.cut),
    issues: segs(plan.issues),
  };
}

async function leftoverBeforeScript(videoPath, scriptEs) {
  const { transcribeRecording, packTranscriptWords, firstScriptWordTime } = require("./youtube-scripts");
  const clip = `${videoPath}.open12.mp4`;
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-i", videoPath, "-t", "12", "-c:v", "libx264", "-preset", "ultrafast", "-crf", "28", "-c:a", "aac", "-b:a", "64k", clip],
    { encoding: "utf8", maxBuffer: 20 * 1024 * 1024 }
  );
  if (r.status !== 0 || !fs.existsSync(clip) || fs.statSync(clip).size < 1000) return null;
  try {
    const data = await transcribeRecording(fs.readFileSync(clip), "open.mp4", "video/mp4");
    const words = packTranscriptWords(data);
    const hit = firstScriptWordTime(scriptEs, words);
    if (!hit) return { overcut: true, text: String((data && data.text) || "").slice(0, 180) };
    if (hit.start > 0.08) {
      return {
        start: 0,
        end: Math.max(0.12, Math.round((hit.start - 0.03) * 100) / 100),
      };
    }
    return null;
  } finally {
    try {
      fs.unlinkSync(clip);
    } catch (e) {}
  }
}

async function trimLeftoverOpening(outputPath, scriptEs) {
  const trims = [];
  if (!String(scriptEs || "").trim()) return { trims, overcut: false };
  for (let i = 0; i < 4; i++) {
    const extra = await leftoverBeforeScript(outputPath, scriptEs);
    if (!extra) return { trims, overcut: false };
    if (extra.overcut) return { trims, overcut: true };
    const dur = ffprobeDuration(outputPath);
    const tmp = `${outputPath}.rev.mp4`;
    cutWithFfmpeg(outputPath, tmp, keepRanges(dur, [extra]));
    fs.renameSync(tmp, outputPath);
    trims.push(extra);
  }
  return { trims, overcut: false };
}

async function downloadObject(cfg, objectPath, dest) {
  const r = await fetch(`${cfg.supabaseUrl}/storage/v1/object/youtube-recordings/${objectPath}`, {
    headers: {
      apikey: cfg.serviceKey,
      Authorization: `Bearer ${cfg.serviceKey}`,
    },
  });
  if (!r.ok) throw new Error("Could not download the take (" + r.status + ")");
  fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer()));
}

async function signObjectUpload(cfg, objectPath) {
  const r = await fetch(
    `${cfg.supabaseUrl}/storage/v1/object/upload/sign/youtube-recordings/${objectPath}`,
    {
      method: "POST",
      headers: {
        apikey: cfg.serviceKey,
        Authorization: `Bearer ${cfg.serviceKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expiresIn: 3600 }),
    }
  );
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error("Upload URL failed");
  const token = data.token || "";
  if (!token) throw new Error("Upload URL failed");
  const base = String(cfg.supabaseUrl || "").replace(/\/$/, "");
  const raw = String(data.url || data.signedUrl || "");
  let signedUrl;
  if (/^https?:\/\//i.test(raw)) signedUrl = raw;
  else if (raw.indexOf("/storage/v1/") === 0) signedUrl = base + raw;
  else if (raw.indexOf("/object/") === 0) signedUrl = base + "/storage/v1" + raw;
  else {
    signedUrl = `${base}/storage/v1/object/upload/sign/youtube-recordings/${objectPath}?token=${encodeURIComponent(token)}`;
  }
  if (signedUrl.indexOf("token=") === -1) {
    signedUrl += (signedUrl.indexOf("?") === -1 ? "?" : "&") + "token=" + encodeURIComponent(token);
  }
  return signedUrl;
}

async function uploadObject(cfg, objectPath, filePath, mime) {
  if (!fs.existsSync(filePath) || fs.statSync(filePath).size < 1000) {
    throw new Error("Cut file was not written");
  }
  const signedUrl = await signObjectUpload(cfg, objectPath);
  const buf = fs.readFileSync(filePath);
  const r = await fetch(signedUrl, {
    method: "PUT",
    headers: { "Content-Type": mime || "application/octet-stream" },
    body: buf,
  });
  if (!r.ok) {
    throw new Error("Could not upload the cut take (" + r.status + ")");
  }
}

async function applyRequestedFixes(cfg, { slug, row, extraCut, skipRemap, localInput }) {
  if (!hasFfmpeg()) throw new Error("ffmpeg is not available to cut the video");
  const objectPath = String(row.recording_path || "").replace(/^\/+/, "");
  if (!objectPath && !localInput) throw new Error("No recording on file");
  const plan = row.cut_plan && typeof row.cut_plan === "object" ? { ...row.cut_plan } : {};
  let issues = Array.isArray(plan.issues) ? plan.issues.slice() : [];
  let cuts;
  if (extraCut && skipRemap) {
    cuts = [{ start: Number(extraCut.start), end: Number(extraCut.end) }];
  } else {
    if (extraCut) {
      const start = Number(extraCut.start);
      const end = Number(extraCut.end);
      let hit = issues.find(
        (x) => Math.abs(Number(x.start) - start) < 0.35 && Math.abs(Number(x.end) - end) < 0.35
      );
      if (!hit) {
        hit = {
          id: `iss-${start.toFixed(2)}-${end.toFixed(2)}`,
          start,
          end,
          kind: extraCut.kind || "off_script",
          label: extraCut.label || extraCut.reason || "Sound that is not the script",
          spoken: extraCut.spoken || "",
        };
        issues.push(hit);
      }
      hit.status = "requested";
      hit.requested_at = new Date().toISOString();
      plan.issues = issues;
    }
    cuts = issues
      .filter((iss) => iss && (iss.status === "requested" || extraCut))
      .filter((iss) => !extraCut || (Math.abs(Number(iss.start) - Number(extraCut.start)) < 0.35 && Math.abs(Number(iss.end) - Number(extraCut.end)) < 0.35))
      .map((iss) => ({ start: Number(iss.start), end: Number(iss.end), id: iss.id }));
  }
  if (!cuts.length || cuts.some((c) => !Number.isFinite(c.start) || !Number.isFinite(c.end) || c.end <= c.start)) {
    throw new Error("No requested cut");
  }

  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "yt-fix-"));
  const input = path.join(dir, "in.mp4");
  const output = path.join(dir, "out.mp4");
  const wavPath = path.join(dir, "out.wav");
  try {
    if (localInput) {
      if (!fs.existsSync(localInput)) throw new Error("Local take not found");
      fs.copyFileSync(localInput, input);
    } else {
      await downloadObject(cfg, objectPath, input);
    }
    const duration = ffprobeDuration(input);
    const keeps = keepRanges(duration, cuts);
    if (!keeps.length) throw new Error("That cut would remove the whole take");
    cutWithFfmpeg(input, output, keeps);
    let nextPlan = skipRemap ? row.cut_plan || plan : remapPlan(plan, keeps, cuts);
    const reviewed = await trimLeftoverOpening(output, row.script_es || "");
    for (const trim of reviewed.trims) {
      nextPlan = remapPlan(nextPlan, keepRanges(9999, [trim]), [trim]);
    }
    extractWav(output, wavPath);
    try {
      if (String(row.script_es || "").trim()) {
        const { transcribeRecording, realignPlanFromTranscript } = require("./youtube-scripts");
        const transcript = await transcribeRecording(fs.readFileSync(wavPath), "take.wav", "audio/wav");
        nextPlan = await realignPlanFromTranscript(row.script_es, transcript, nextPlan);
      }
    } catch (e) {}
    const ext = ((objectPath || localInput || "take.mp4").split(".").pop() || "mp4").replace(/[^a-z0-9]/gi, "") || "mp4";
    const newPath = `${slug}/${Date.now()}-cut.${ext}`;
    await uploadObject(cfg, newPath, output, row.recording_mime || "video/mp4");
    await uploadObject(cfg, siblingAudioPath(newPath), wavPath, "audio/wav");
    if (objectPath) await purgeRecordingFiles(cfg, objectPath, slug);
    return {
      recording_path: newPath,
      cut_plan: nextPlan,
      reviewed_trims: reviewed.trims.length,
      overcut: !!reviewed.overcut,
    };
  } finally {
    try {
      fs.rmSync(dir, { recursive: true, force: true });
    } catch (e) {}
  }
}

module.exports = {
  hasFfmpeg,
  keepRanges,
  mapTime,
  remapPlan,
  shiftPlanTimes,
  applyRequestedFixes,
};
