/**
 * One-off or repeatable: create assets/split/*.html for hook rounds that only
 * have source/original.html (e.g. created before split was added).
 *
 * Usage: DATABASE_URL="file:./data/mvi.sqlite" npx tsx scripts/backfill-split-html.ts
 */
import path from "path";
import fs from "fs";
import { PrismaClient } from "@prisma/client";
import type { HeadlineRow } from "../src/lib/import/bundlerParser";
import { hookAssetBaseName } from "../src/lib/import/assetNames";
import { writePerHookStandaloneFiles } from "../src/lib/import/splitStandaloneHtml";
import { getDataRoot, roundAssetsDir } from "../src/lib/paths";

const prisma = new PrismaClient();

async function main() {
  const rounds = await prisma.round.findMany({
    where: { type: "HOOK_TEST" },
    include: {
      variants: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  const root = getDataRoot();

  for (const round of rounds) {
    const v0 = round.variants[0];
    const sourceFile = v0?.sourcePath;
    if (!sourceFile || !fs.existsSync(sourceFile)) {
      console.warn("Skip round (no source):", round.id);
      continue;
    }

    const imp = await prisma.importSource.findFirst({
      where: { projectId: round.projectId },
      orderBy: { createdAt: "desc" },
    });
    if (!imp?.headlines) {
      console.warn("Skip round (no import headlines):", round.id);
      continue;
    }

    let headlines: HeadlineRow[];
    try {
      headlines = JSON.parse(imp.headlines) as HeadlineRow[];
    } catch {
      console.warn("Skip round (bad headlines JSON):", round.id);
      continue;
    }

    const fullSource = fs.readFileSync(sourceFile, "utf8");
    const splitDir = path.join(roundAssetsDir(round.projectId, round.id), "split");
    const baseNames = headlines.map((h) => hookAssetBaseName(h));
    const splitFiles = writePerHookStandaloneFiles(
      fullSource,
      splitDir,
      headlines,
      baseNames,
    );

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
      meta.splitHtmlPath = path
        .relative(root, sf.absolutePath)
        .split(path.sep)
        .join("/");
      await prisma.variant.update({
        where: { id: v.id },
        data: { metadata: JSON.stringify(meta) },
      });
    }

    console.log("OK", round.id, "→", splitDir, `(${splitFiles.length} files)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
