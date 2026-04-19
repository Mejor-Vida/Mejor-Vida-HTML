import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import type { HeadlineRow } from "@/lib/import/bundlerParser";
import { hookAssetBaseName } from "@/lib/import/assetNames";
import { writePerHookStandaloneFiles } from "@/lib/import/splitStandaloneHtml";
import { getDataRoot, roundAssetsDir } from "@/lib/paths";

export const runtime = "nodejs";

/**
 * (Re)generates `split/*.html` — one standalone file per hook — from the
 * round's import headlines and the original bundled HTML on disk.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await ctx.params;

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { variants: { orderBy: { sortOrder: "asc" } } },
  });
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const imp = await prisma.importSource.findFirst({
    where: { projectId: round.projectId },
    orderBy: { createdAt: "desc" },
  });
  if (!imp?.headlines) {
    return NextResponse.json({ error: "No import headlines for project" }, { status: 400 });
  }

  let headlines: HeadlineRow[];
  try {
    headlines = JSON.parse(imp.headlines) as HeadlineRow[];
  } catch {
    return NextResponse.json({ error: "Invalid headlines JSON" }, { status: 500 });
  }

  const v0 = round.variants[0];
  const sourceFile = v0?.sourcePath;
  if (!sourceFile || !fs.existsSync(sourceFile)) {
    return NextResponse.json(
      { error: "Missing source HTML — re-import or restore source/original.html" },
      { status: 400 },
    );
  }

  const fullSource = fs.readFileSync(sourceFile, "utf8");
  const splitDir = path.join(roundAssetsDir(round.projectId, roundId), "split");
  const baseNames = headlines.map((h) => hookAssetBaseName(h));
  const splitFiles = writePerHookStandaloneFiles(
    fullSource,
    splitDir,
    headlines,
    baseNames,
  );

  const root = getDataRoot();
  const variantRows = await prisma.variant.findMany({
    where: { roundId },
    orderBy: { sortOrder: "asc" },
  });

  for (let i = 0; i < variantRows.length; i++) {
    const v = variantRows[i];
    const sf = splitFiles[i];
    if (!v || !sf) continue;
    let meta: Record<string, unknown> = {};
    try {
      meta = JSON.parse(v.metadata) as Record<string, unknown>;
    } catch {
      /* ignore */
    }
    meta.splitHtmlPath = path.relative(root, sf.absolutePath).split(path.sep).join("/");
    await prisma.variant.update({
      where: { id: v.id },
      data: { metadata: JSON.stringify(meta) },
    });
  }

  return NextResponse.json({
    splitHtml: splitFiles.map((s) => ({
      path: path.relative(root, s.absolutePath).split(path.sep).join("/"),
      baseName: s.baseName,
    })),
  });
}
