"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type VariantOpt = { id: string; label: string | null };

export function MetricsEntry({ roundId, variants }: { roundId: string; variants: VariantOpt[] }) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [impressions, setImpressions] = useState("");
  const [clicks, setClicks] = useState("");
  const [amountSpent, setAmountSpent] = useState("");
  const [conv, setConv] = useState("");
  const [ctr, setCtr] = useState("");
  const [cpc, setCpc] = useState("");
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const metrics: Record<string, number> = {};
    if (impressions) metrics.impressions = Number(impressions);
    if (clicks) metrics.clicks = Number(clicks);
    if (amountSpent) metrics.amountSpent = Number(amountSpent);
    if (conv) metrics.conversationsStarted = Number(conv);
    if (ctr) metrics.ctr = Number(ctr);
    if (cpc) metrics.cpc = Number(cpc);

    const res = await fetch(`/api/rounds/${roundId}/results`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variantId, metrics }),
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error ?? "Save failed");
      return;
    }
    router.refresh();
  }

  if (variants.length === 0) return null;

  return (
    <form
      onSubmit={submit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
    >
      <h2 className="text-lg font-medium text-white">Enter metrics (manual)</h2>
      <p className="mt-1 text-xs text-zinc-500">
        Pull from Ads Manager / Insights later via API TODO. For now, paste numbers for scoring.
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-zinc-500">Variant</span>
          <select
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-white"
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id}>
                {v.label ?? v.id}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="text-zinc-500">Impressions</span>
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-white"
            inputMode="numeric"
            value={impressions}
            onChange={(e) => setImpressions(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-zinc-500">Clicks</span>
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-white"
            inputMode="numeric"
            value={clicks}
            onChange={(e) => setClicks(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-zinc-500">Amount spent ($)</span>
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-white"
            inputMode="decimal"
            value={amountSpent}
            onChange={(e) => setAmountSpent(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-zinc-500">WhatsApp / conversations started</span>
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-white"
            inputMode="numeric"
            value={conv}
            onChange={(e) => setConv(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-zinc-500">CTR (% or 0–1)</span>
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-white"
            inputMode="decimal"
            value={ctr}
            onChange={(e) => setCtr(e.target.value)}
          />
        </label>
        <label className="text-sm">
          <span className="text-zinc-500">CPC ($)</span>
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-2 py-2 text-white"
            inputMode="decimal"
            value={cpc}
            onChange={(e) => setCpc(e.target.value)}
          />
        </label>
      </div>
      <button
        type="submit"
        className="mt-3 rounded-lg bg-zinc-700 px-4 py-2 text-sm text-white hover:bg-zinc-600"
      >
        Save metrics
      </button>
      {err ? <p className="mt-2 text-sm text-red-400">{err}</p> : null}
    </form>
  );
}
