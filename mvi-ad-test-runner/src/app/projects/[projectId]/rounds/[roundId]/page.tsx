import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDataRoot } from "@/lib/paths";
import path from "path";
import { RoundActions } from "./ui/RoundActions";
import { MetricsEntry } from "./ui/MetricsEntry";

export const dynamic = "force-dynamic";

function SplitHtmlLink({ metaJson }: { metaJson: string }) {
  let splitPath: string | undefined;
  try {
    splitPath = (JSON.parse(metaJson) as { splitHtmlPath?: string }).splitHtmlPath;
  } catch {
    return null;
  }
  if (!splitPath) return null;
  const href = `/api/files/${splitPath.split("/").map(encodeURIComponent).join("/")}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="mt-2 inline-block text-xs font-medium text-emerald-400 hover:underline"
    >
      Open split standalone HTML →
    </a>
  );
}

export default async function RoundPage({
  params,
}: {
  params: Promise<{ projectId: string; roundId: string }>;
}) {
  const { projectId, roundId } = await params;
  const round = await prisma.round.findFirst({
    where: { id: roundId, projectId },
    include: {
      project: true,
      variants: { orderBy: { sortOrder: "asc" } },
      results: { include: { variant: true } },
      winnerVariant: true,
      parentRound: { select: { id: true, name: true } },
      childRounds: { select: { id: true, name: true, type: true } },
    },
  });
  if (!round) notFound();

  const dataRoot = getDataRoot();
  const anySplit = round.variants.some((v) => {
    try {
      return Boolean(
        (JSON.parse(v.metadata) as { splitHtmlPath?: string }).splitHtmlPath,
      );
    } catch {
      return false;
    }
  });

  return (
    <div className="space-y-8">
      <div>
        <Link
          href={`/projects/${projectId}`}
          className="text-sm text-emerald-500 hover:underline"
        >
          ← {round.project.name}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-white">{round.name}</h1>
        <p className="mt-1 text-sm text-zinc-500">
          {round.type} · {round.status} · Primary: {round.primaryMetric}
        </p>
        {round.objective ? (
          <p className="mt-2 text-zinc-400">{round.objective}</p>
        ) : null}
      </div>

      {round.scheduleMode === "STAGGERED" || round.scheduleMode === "SEQUENTIAL" ? (
        <div className="rounded-lg border border-amber-800/60 bg-amber-950/30 px-3 py-2 text-sm text-amber-200">
          <strong>Timing bias:</strong> staggered or sequential launches can mix in
          time-of-day and weekday effects. Prefer simultaneous tests when possible.
        </div>
      ) : null}

      <RoundActions
        projectId={projectId}
        roundId={roundId}
        roundType={round.type}
        status={round.status}
      />

      <MetricsEntry
        roundId={roundId}
        variants={round.variants.map((v) => ({ id: v.id, label: v.label }))}
      />

      <section>
        <h2 className="mb-1 text-lg font-medium text-white">Variants</h2>
        {!anySplit ? (
          <p className="mb-3 text-xs text-zinc-500">
            The inbox file is the full bundle (all hooks). Per-hook files are under{" "}
            <code className="text-zinc-400">assets/split/</code> — click{" "}
            <strong className="text-zinc-300">Generate split HTML (5 files)</strong> above,
            or create a new hook round.
          </p>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {round.variants.map((v) => {
            const rel = v.imagePath ?? v.previewPath;
            const src = rel
              ? `/api/files/${rel.split("/").map(encodeURIComponent).join("/")}`
              : null;
            return (
              <div
                key={v.id}
                className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50"
              >
                <div className="aspect-square bg-zinc-800">
                  {src ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-zinc-600">
                      No PNG — run export
                    </div>
                  )}
                </div>
                <div className="p-3 text-sm">
                  <div className="font-medium text-white">{v.label}</div>
                  <div className="mt-1 whitespace-pre-wrap text-xs text-zinc-400">
                    {v.hookText}
                  </div>
                  <SplitHtmlLink metaJson={v.metadata} />
                  {v.sourcePath ? (
                    <div className="mt-2 truncate text-[10px] text-zinc-600" title={v.sourcePath}>
                      Source: {path.relative(dataRoot, v.sourcePath)}
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium text-white">Results</h2>
        {round.results.length === 0 ? (
          <p className="text-sm text-zinc-500">No metrics entered yet.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {round.results.map((r) => (
              <li key={r.id} className="rounded border border-zinc-800 px-3 py-2 text-zinc-300">
                <span className="text-zinc-500">{r.variant.label}</span>:{" "}
                {r.metrics}
                {r.weightedScore != null ? (
                  <span className="ml-2 text-emerald-400">
                    weighted {r.weightedScore.toFixed(4)}
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="text-sm text-zinc-500">
        {round.parentRound ? (
          <p>
            Parent round:{" "}
            <Link
              href={`/projects/${projectId}/rounds/${round.parentRound.id}`}
              className="text-emerald-500 hover:underline"
            >
              {round.parentRound.name}
            </Link>
          </p>
        ) : null}
        {round.childRounds.length > 0 ? (
          <p className="mt-2">
            Next rounds:{" "}
            {round.childRounds.map((c) => (
              <Link
                key={c.id}
                href={`/projects/${projectId}/rounds/${c.id}`}
                className="mr-2 text-emerald-500 hover:underline"
              >
                {c.name}
              </Link>
            ))}
          </p>
        ) : null}
      </section>
    </div>
  );
}
