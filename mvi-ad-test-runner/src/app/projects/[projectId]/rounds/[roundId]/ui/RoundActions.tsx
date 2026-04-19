"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function RoundActions({
  projectId,
  roundId,
  roundType,
  status,
}: {
  projectId: string;
  roundId: string;
  roundType: string;
  status: string;
}) {
  const router = useRouter();
  const [log, setLog] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function exportPng() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/rounds/${roundId}/export-png`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Export failed");
      setLog(
        `Exported ${data.files?.length ?? 0} PNGs. ${(data.warnings ?? []).join(" ")}`,
      );
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function submitDryRun() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch("/api/facebook/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundId, confirmLive: false }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submit failed");
      setLog(`Dry-run submission recorded: ${data.submission?.id}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function regenerateSplitHtml() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/rounds/${roundId}/split-html`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Split failed");
      setLog(`Wrote ${data.splitHtml?.length ?? 0} split HTML file(s) under assets/split/`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function autoWinner() {
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/rounds/${roundId}/winner`, { method: "PUT" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Auto pick failed");
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  async function nextRound() {
    const name = window.prompt("Next round name?", "Image test — v1");
    if (!name) return;
    setErr(null);
    setBusy(true);
    try {
      const res = await fetch(`/api/rounds/${roundId}/next`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type:
            roundType === "HOOK_TEST"
              ? "IMAGE_TEST"
              : roundType === "IMAGE_TEST"
                ? "TEMPLATE_TEST"
                : "TEMPLATE_TEST",
          testVariable:
            roundType === "HOOK_TEST"
              ? "image"
              : roundType === "IMAGE_TEST"
                ? "template"
                : "template",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not branch");
      router.push(`/projects/${projectId}/rounds/${data.round.id}`);
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="text-lg font-medium text-white">Actions</h2>
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={busy}
          onClick={exportPng}
          className="rounded-lg bg-sky-700 px-3 py-2 text-sm text-white hover:bg-sky-600 disabled:opacity-50"
        >
          Export PNGs (Playwright)
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={regenerateSplitHtml}
          className="rounded-lg bg-teal-800 px-3 py-2 text-sm text-white hover:bg-teal-700 disabled:opacity-50"
        >
          Generate split HTML (5 files)
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={submitDryRun}
          className="rounded-lg bg-violet-700 px-3 py-2 text-sm text-white hover:bg-violet-600 disabled:opacity-50"
        >
          Queue Meta dry-run
        </button>
        <button
          type="button"
          disabled={busy || status !== "WINNER_SELECTED"}
          onClick={nextRound}
          className="rounded-lg bg-emerald-800 px-3 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          Create next round from winner
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={autoWinner}
          className="rounded-lg border border-zinc-600 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
        >
          Auto-select winner (metrics)
        </button>
      </div>
      <p className="text-xs text-zinc-500">
        Live Meta launch requires env vars and{" "}
        <code className="text-zinc-400">confirmLive: true</code> in API — use Settings
        for safety.
      </p>
      {log ? <p className="text-sm text-emerald-400">{log}</p> : null}
      {err ? <p className="text-sm text-red-400">{err}</p> : null}
    </div>
  );
}
