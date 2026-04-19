import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ImportAndHookRound } from "./ui/ImportAndHookRound";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      rounds: {
        orderBy: { createdAt: "desc" },
        include: {
          winnerVariant: true,
          _count: { select: { variants: true } },
        },
      },
      imports: { orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div>
        <Link href="/projects" className="text-sm text-emerald-500 hover:underline">
          ← Projects
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-white">{project.name}</h1>
        {project.description ? (
          <p className="mt-1 text-zinc-500">{project.description}</p>
        ) : null}
      </div>

      <ImportAndHookRound projectId={project.id} />

      <section>
        <h2 className="mb-3 text-lg font-medium text-white">Rounds</h2>
        <ul className="space-y-2">
          {project.rounds.length === 0 ? (
            <li className="text-zinc-500">No rounds — import HTML and add a hook test.</li>
          ) : (
            project.rounds.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/projects/${project.id}/rounds/${r.id}`}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/40 px-3 py-2 hover:border-zinc-600"
                >
                  <span className="font-medium text-white">{r.name}</span>
                  <span className="text-xs text-zinc-500">{r.type}</span>
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
                    {r.status}
                  </span>
                  {r.winnerVariant ? (
                    <span className="text-xs text-emerald-400">
                      Winner: {r.winnerVariant.label ?? r.winnerVariant.hookText?.slice(0, 32)}
                    </span>
                  ) : null}
                </Link>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
