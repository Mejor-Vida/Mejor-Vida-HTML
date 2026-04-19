import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AssetsPage() {
  const variants = await prisma.variant.findMany({
    orderBy: { id: "desc" },
    take: 60,
    include: {
      round: { include: { project: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-white">Assets</h1>
      <p className="text-sm text-zinc-500">
        Recent variants with image paths (newest first).
      </p>
      <ul className="space-y-2 text-sm">
        {variants.map((v) => (
          <li
            key={v.id}
            className="flex flex-wrap items-center gap-2 rounded border border-zinc-800 px-3 py-2 text-zinc-300"
          >
            <Link
              href={`/projects/${v.round.projectId}/rounds/${v.roundId}`}
              className="text-emerald-500 hover:underline"
            >
              {v.round.project.name} / {v.round.name}
            </Link>
            <span className="text-zinc-600">·</span>
            <span>{v.label}</span>
            {v.imagePath ? (
              <span className="truncate text-xs text-zinc-500">{v.imagePath}</span>
            ) : (
              <span className="text-xs text-amber-600">no image</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
