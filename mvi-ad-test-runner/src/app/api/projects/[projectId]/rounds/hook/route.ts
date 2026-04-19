import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { prisma } from "@/lib/prisma";
import { CreateHookRoundBody } from "@/lib/api/validation";
import { ensureDir, roundAssetsDir } from "@/lib/paths";
import {
  DEFAULT_BULLET_LINES,
  DEFAULT_CTA_BUTTON,
  DEFAULT_CTA_PRIMARY,
  type HeadlineRow,
} from "@/lib/import/bundlerParser";
import { hookAssetBaseName } from "@/lib/import/assetNames";
import { writePerHookStandaloneFiles } from "@/lib/import/splitStandaloneHtml";
import { getDataRoot } from "@/lib/paths";

export const runtime = "nodejs";

/**
 * Creates a Hook Test round from a prior import (ImportSource) and seeds variants.
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = CreateHookRoundBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const imp = await prisma.importSource.findUnique({ where: { id: parsed.data.importId } });
  if (!imp) return NextResponse.json({ error: "Import not found" }, { status: 404 });

  if (!fs.existsSync(imp.storedPath)) {
    return NextResponse.json({ error: "Import file missing on disk" }, { status: 410 });
  }

  const headlines = JSON.parse(imp.headlines) as HeadlineRow[];

  const round = await prisma.round.create({
    data: {
      projectId,
      type: "HOOK_TEST",
      name: parsed.data.name,
      objective: parsed.data.objective ?? null,
      audience: "{}",
      budget: "{}",
      schedule: "{}",
      testVariable: "hook",
      primaryMetric: parsed.data.primaryMetric ?? "COST_PER_WHATSAPP",
      status: "DRAFT",
      variants: {
        create: headlines.map((h, idx) => ({
          label: h.label,
          hookText: h.text,
          bulletText: DEFAULT_BULLET_LINES.join(" · "),
          ctaText: `${DEFAULT_CTA_PRIMARY} / ${DEFAULT_CTA_BUTTON}`,
          headlineSize: h.size,
          sortOrder: idx,
          metadata: JSON.stringify({
            hideSinExamen: h.hideSinExamen ?? false,
            designLabel: h.label,
          }),
        })),
      },
    },
    include: { variants: true },
  });

  const destDir = path.join(roundAssetsDir(projectId, round.id), "source");
  ensureDir(destDir);
  const destHtml = path.join(destDir, "original.html");
  fs.copyFileSync(imp.storedPath, destHtml);

  const fullSource = fs.readFileSync(imp.storedPath, "utf8");
  const splitDir = path.join(roundAssetsDir(projectId, round.id), "split");
  const baseNames = headlines.map((h) => hookAssetBaseName(h));
  const splitFiles = writePerHookStandaloneFiles(
    fullSource,
    splitDir,
    headlines,
    baseNames,
  );
  const root = getDataRoot();

  const variantRows = await prisma.variant.findMany({
    where: { roundId: round.id },
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
    const rel = path.relative(root, sf.absolutePath).split(path.sep).join("/");
    meta.splitHtmlPath = rel;
    await prisma.variant.update({
      where: { id: v.id },
      data: { metadata: JSON.stringify(meta) },
    });
  }

  await prisma.importSource.update({
    where: { id: imp.id },
    data: { projectId },
  });

  await prisma.variant.updateMany({
    where: { roundId: round.id },
    data: { sourcePath: destHtml },
  });

  const variantsOut = await prisma.variant.findMany({
    where: { roundId: round.id },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({
    round,
    variants: variantsOut,
    splitHtml: splitFiles.map((s) => ({
      path: path.relative(root, s.absolutePath).split(path.sep).join("/"),
      baseName: s.baseName,
    })),
  });
}
