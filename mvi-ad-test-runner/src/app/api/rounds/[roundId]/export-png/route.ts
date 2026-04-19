import { NextResponse } from "next/server";
import path from "path";
import { prisma } from "@/lib/prisma";
import { exportHookGridPngs } from "@/lib/export/playwrightExport";
import { validateFacebookSquarePng } from "@/lib/export/imageValidation";
import { getDataRoot, roundAssetsDir, ensureDir } from "@/lib/paths";
import { hookAssetBaseName } from "@/lib/import/assetNames";
import type { HeadlineRow } from "@/lib/import/bundlerParser";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * Renders each hook variant from the stored standalone HTML via Playwright (Chromium).
 * Requires `npx playwright install chromium` once per machine.
 */
export async function POST(
  _req: Request,
  ctx: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await ctx.params;

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { variants: { orderBy: { sortOrder: "asc" } }, project: true },
  });
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const v0 = round.variants[0];
  if (!v0?.sourcePath) {
    return NextResponse.json({ error: "No source HTML on variants — re-create round from import" }, { status: 400 });
  }

  const imp = await prisma.importSource.findFirst({
    where: { projectId: round.projectId },
    orderBy: { createdAt: "desc" },
  });
  let headlines: HeadlineRow[] = [];
  if (imp?.headlines) {
    try {
      headlines = JSON.parse(imp.headlines) as HeadlineRow[];
    } catch {
      /* ignore */
    }
  }
  if (headlines.length < 5) {
    return NextResponse.json({ error: "Import headlines missing — cannot name files" }, { status: 400 });
  }

  const outDir = roundAssetsDir(round.projectId, roundId);
  ensureDir(outDir);

  const baseNames = headlines.map((h) => hookAssetBaseName(h));

  try {
    const files = await exportHookGridPngs({
      sourceHtmlPath: v0.sourcePath,
      outDir,
      baseNames,
    });

    const warnings: string[] = [];
    const updates = [];

    for (let i = 0; i < round.variants.length; i++) {
      const variant = round.variants[i];
      const fp = files[i];
      if (!fp || !variant) continue;

      const v = await validateFacebookSquarePng(fp);
      warnings.push(...v.warnings.map((w) => `${path.basename(fp)}: ${w}`));

      const rel = path.relative(getDataRoot(), fp).split(path.sep).join("/");
      updates.push(
        prisma.variant.update({
          where: { id: variant.id },
          data: {
            imagePath: rel,
            previewPath: rel,
          },
        }),
      );
    }

    await prisma.$transaction(updates);

    await prisma.round.update({
      where: { id: roundId },
      data: { status: "READY" },
    });

    return NextResponse.json({ ok: true, files, warnings });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
