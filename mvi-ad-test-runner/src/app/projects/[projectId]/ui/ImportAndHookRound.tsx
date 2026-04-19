"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function ImportAndHookRound({ projectId }: { projectId: string }) {
  const router = useRouter();
  const [importId, setImportId] = useState<string | null>(null);
  const [headlineCount, setHeadlineCount] = useState<number | null>(null);
  const [roundName, setRoundName] = useState("Hook test — v1");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("file", f);
      const res = await fetch("/api/import", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Import failed");
      setImportId(data.importId);
      setHeadlineCount(data.headlineCount);
      setMsg(`Imported ${data.headlineCount} headlines.`);
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Import error");
    } finally {
      setLoading(false);
    }
  }

  async function createHookRound(e: React.FormEvent) {
    e.preventDefault();
    if (!importId) {
      setErr("Import a standalone HTML file first.");
      return;
    }
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/rounds/hook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: roundName,
          importId,
          primaryMetric: "COST_PER_WHATSAPP",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not create round");
      router.push(`/projects/${projectId}/rounds/${data.round.id}`);
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <h2 className="text-lg font-medium text-white">Import & hook round</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Upload the Claude Design standalone HTML (bundler format). We parse{" "}
        <code className="text-emerald-400">HEADLINES</code> and copy the file into
        managed storage.
      </p>

      <div className="mt-4 space-y-3">
        <label className="block text-sm">
          <span className="text-zinc-500">Standalone HTML file</span>
          <input
            type="file"
            accept=".html,text/html"
            className="mt-1 block w-full text-sm text-zinc-400"
            onChange={onFile}
            disabled={loading}
          />
        </label>
        {msg ? <p className="text-sm text-emerald-400">{msg}</p> : null}
        {headlineCount != null ? (
          <p className="text-xs text-zinc-500">Import ID: {importId}</p>
        ) : null}

        <form onSubmit={createHookRound} className="space-y-2 border-t border-zinc-800 pt-4">
          <label className="block text-sm">
            <span className="text-zinc-500">Round name</span>
            <input
              className="mt-1 w-full max-w-md rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
              value={roundName}
              onChange={(e) => setRoundName(e.target.value)}
              required
            />
          </label>
          <button
            type="submit"
            disabled={loading || !importId}
            className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-40"
          >
            Create hook test round
          </button>
        </form>
        {err ? <p className="text-sm text-red-400">{err}</p> : null}
      </div>
    </div>
  );
}
