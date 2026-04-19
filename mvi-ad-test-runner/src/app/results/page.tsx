import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const rounds = await prisma.round.findMany({
    where: { results: { some: {} } },
    orderBy: { updatedAt: "desc" },
    take: 30,
    include: {
      project: true,
      results: { include: { variant: true } },
      winnerVariant: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Results</h1>
      <p className="text-sm text-zinc-500">
        Rounds with at least one metrics entry. Refine in the round detail view.
      </p>
      <ul className="space-y-4">
        {rounds.map((r) => (
          <li
            key={r.id}
            className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4"
          >
            <Link
              href={`/projects/${r.projectId}/rounds/${r.id}`}
              className="font-medium text-emerald-400 hover:underline"
            >
              {r.project.name} — {r.name}
            </Link>
            <p className="text-xs text-zinc-500">
              {r.primaryMetric} · {r.status}
            </p>
            {r.winnerVariant ? (
              <p className="mt-2 text-sm text-amber-200">
                Winner: {r.winnerVariant.label ?? r.winnerVariant.hookText?.slice(0, 40)}
              </p>
            ) : null}
            <ul className="mt-2 space-y-1 text-xs text-zinc-400">
              {r.results.map((x) => (
                <li key={x.id}>
                  {x.variant.label}: {x.metrics}
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
