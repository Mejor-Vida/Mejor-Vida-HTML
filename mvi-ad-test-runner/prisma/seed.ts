/**
 * Seed sample project when `data/sample/Facebook_Ads_standalone.html` exists
 * (copy from Downloads — see README).
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
  DEFAULT_BULLET_LINES,
  DEFAULT_CTA_BUTTON,
  DEFAULT_CTA_PRIMARY,
  parseHeadlinesFromStandaloneHtml,
} from "../src/lib/import/bundlerParser";
import { hookAssetBaseName } from "../src/lib/import/assetNames";
import { writePerHookStandaloneFiles } from "../src/lib/import/splitStandaloneHtml";

const prisma = new PrismaClient();

async function main() {
  const sample = path.join(process.cwd(), "data/sample/Facebook_Ads_standalone.html");
  if (!fs.existsSync(sample)) {
    console.log("No sample HTML at data/sample/Facebook_Ads_standalone.html — skip seed.");
    return;
  }

  const html = fs.readFileSync(sample, "utf8");
  const headlines = parseHeadlinesFromStandaloneHtml(html);

  const existing = await prisma.project.findFirst({
    where: { name: "Sample — Nebraska hook pack" },
  });
  if (existing) {
    console.log("Sample project already exists — skip.");
    return;
  }

  const inbox = path.join(process.cwd(), "data/imports/inbox");
  fs.mkdirSync(inbox, { recursive: true });
  const storedPath = path.join(inbox, `seed_${Date.now()}_Facebook_Ads_standalone.html`);
  fs.copyFileSync(sample, storedPath);

  const imp = await prisma.importSource.create({
    data: {
      originalName: "Facebook_Ads_standalone.html",
      storedPath,
      headlines: JSON.stringify(headlines),
    },
  });

  const project = await prisma.project.create({
    data: {
      name: "Sample — Nebraska hook pack",
      description: "Seeded from data/sample — five hook variants on the same layout.",
    },
  });

  await prisma.importSource.update({
    where: { id: imp.id },
    data: { projectId: project.id },
  });

  const round = await prisma.round.create({
    data: {
      projectId: project.id,
      type: "HOOK_TEST",
      name: "Round 1 — Hook test",
      objective: "Compare hooks with identical layout, audience, and CTA.",
      audience: "{}",
      budget: "{}",
      schedule: JSON.stringify({ mode: "SIMULTANEOUS", note: "Adjust in UI" }),
      testVariable: "hook",
      primaryMetric: "COST_PER_WHATSAPP",
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
  });

  const destDir = path.join(
    process.cwd(),
    "data/projects",
    project.id,
    "rounds",
    round.id,
    "assets",
    "source",
  );
  fs.mkdirSync(destDir, { recursive: true });
  const destHtml = path.join(destDir, "original.html");
  fs.copyFileSync(sample, destHtml);

  await prisma.variant.updateMany({
    where: { roundId: round.id },
    data: { sourcePath: destHtml },
  });

  const splitDir = path.join(
    process.cwd(),
    "data/projects",
    project.id,
    "rounds",
    round.id,
    "assets",
    "split",
  );
  const baseNames = headlines.map((h) => hookAssetBaseName(h));
  const splitFiles = writePerHookStandaloneFiles(html, splitDir, headlines, baseNames);
  const dataRoot = path.join(process.cwd(), "data");

  const vRows = await prisma.variant.findMany({
    where: { roundId: round.id },
    orderBy: { sortOrder: "asc" },
  });
  for (let i = 0; i < vRows.length; i++) {
    const v = vRows[i];
    const sf = splitFiles[i];
    if (!v || !sf) continue;
    let meta: Record<string, unknown> = {};
    try {
      meta = JSON.parse(v.metadata) as Record<string, unknown>;
    } catch {
      /* ignore */
    }
    meta.splitHtmlPath = path
      .relative(dataRoot, sf.absolutePath)
      .split(path.sep)
      .join("/");
    await prisma.variant.update({
      where: { id: v.id },
      data: { metadata: JSON.stringify(meta) },
    });
  }

  console.log("Seeded project", project.id, "round", round.id);
  console.log("Split HTML:", splitFiles.length, "files in", splitDir);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
