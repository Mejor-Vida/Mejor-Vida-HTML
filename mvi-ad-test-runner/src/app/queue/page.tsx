import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const subs = await prisma.facebookSubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 40,
    include: {
      round: { include: { project: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Facebook submission queue</h1>
      <ul className="space-y-2 text-sm">
        {subs.length === 0 ? (
          <li className="text-zinc-500">No submissions yet.</li>
        ) : (
          subs.map((s) => (
            <li
              key={s.id}
              className="rounded border border-zinc-800 px-3 py-2 text-zinc-300"
            >
              <Link
                href={`/projects/${s.round.projectId}/rounds/${s.roundId}`}
                className="text-emerald-500 hover:underline"
              >
                {s.round.project.name} — {s.round.name}
              </Link>
              <span className="ml-2 text-xs text-zinc-500">
                {s.dryRun ? "dry-run" : "live"} · {s.status}
              </span>
              <div className="mt-1 truncate text-xs text-zinc-600">{s.id}</div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
