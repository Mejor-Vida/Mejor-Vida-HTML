"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function CreateProjectForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description: description || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message ?? "Create failed");
      setName("");
      setDescription("");
      router.refresh();
    } catch (e2) {
      setErr(e2 instanceof Error ? e2.message : "Error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
    >
      <h2 className="mb-3 text-sm font-medium text-zinc-300">New project</h2>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex-1 text-sm">
          <span className="text-zinc-500">Name</span>
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={200}
          />
        </label>
        <label className="flex-[2] text-sm">
          <span className="text-zinc-500">Description (optional)</span>
          <input
            className="mt-1 w-full rounded border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={2000}
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? "…" : "Create"}
        </button>
      </div>
      {err ? <p className="mt-2 text-sm text-red-400">{err}</p> : null}
    </form>
  );
}
