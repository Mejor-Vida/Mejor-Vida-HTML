import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CreateProjectForm } from "./ui/CreateProjectForm";

export const dynamic = "force-dynamic";

function statusBadge(s: string) {
  const colors: Record<string, string> = {
    DRAFT: "bg-zinc-700",
    READY: "bg-sky-700",
    RUNNING: "bg-amber-600",
    WINNER_SELECTED: "bg-emerald-700",
  };
  return (
    <span
      className={`rounded px-2 py-0.5 text-xs font-medium text-white ${colors[s] ?? "bg-zinc-600"}`}
    >
      {s.replace(/_/g, " ")}
    </span>
  );
}

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      rounds: {
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { winnerVariant: true },
      },
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Projects</h1>
          <p className="text-sm text-zinc-500">
            Each project holds rounds (hook → image → template chains).
          </p>
        </div>
      </div>

      <CreateProjectForm />

      <div className="space-y-3">
        {projects.length === 0 ? (
          <p className="text-zinc-500">No projects yet — create one above.</p>
        ) : (
          projects.map((p) => (
            <Link
              key={p.id}
              href={`/projects/${p.id}`}
              className="block rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-zinc-600"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-medium text-white">{p.name}</h2>
                <span className="text-xs text-zinc-500">
                  {p.rounds.length} round{p.rounds.length === 1 ? "" : "s"}
                </span>
              </div>
              {p.description ? (
                <p className="mt-1 text-sm text-zinc-500">{p.description}</p>
              ) : null}
              <ul className="mt-3 space-y-1 text-sm text-zinc-400">
                {p.rounds.map((r) => (
                  <li key={r.id} className="flex flex-wrap items-center gap-2">
                    <span className="text-zinc-500">{r.type}</span>
                    <span>{r.name}</span>
                    {statusBadge(r.status)}
                  </li>
                ))}
              </ul>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
