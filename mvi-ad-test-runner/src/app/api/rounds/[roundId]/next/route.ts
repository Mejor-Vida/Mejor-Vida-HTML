import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { NextRoundBody } from "@/lib/api/validation";

export const runtime = "nodejs";

/**
 * Clone winning setup into a new round (locked hook / optional image key in notes).
 */
export async function POST(
  req: Request,
  ctx: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = NextRoundBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const prev = await prisma.round.findUnique({
    where: { id: roundId },
    include: { variants: true, winnerVariant: true, project: true },
  });
  if (!prev) return NextResponse.json({ error: "Round not found" }, { status: 404 });
  if (!prev.winnerVariantId || !prev.winnerVariant) {
    return NextResponse.json({ error: "Select a winner before creating the next round" }, { status: 400 });
  }

  const win = prev.winnerVariant;

  const next = await prisma.round.create({
    data: {
      projectId: prev.projectId,
      parentRoundId: prev.id,
      type: parsed.data.type,
      name: parsed.data.name,
      objective: `Continues from "${prev.name}" (winner: ${win.label ?? win.hookText?.slice(0, 40)})`,
      audience: prev.audience || "{}",
      budget: prev.budget || "{}",
      schedule: "{}",
      testVariable: parsed.data.testVariable,
      status: "DRAFT",
      primaryMetric: prev.primaryMetric,
      lockedHookText: win.hookText ?? prev.lockedHookText,
      lockedImageKey: prev.lockedImageKey,
      variants: {
        create: [
          {
            label: `${win.label ?? "Winner"} (clone)`,
            hookText: win.hookText,
            bulletText: win.bulletText,
            ctaText: win.ctaText,
            headlineSize: win.headlineSize,
            imagePath: win.imagePath,
            previewPath: win.previewPath,
            sourcePath: win.sourcePath,
            metadata: JSON.stringify({
              clonedFromVariantId: win.id,
              priorRoundId: prev.id,
            }),
            sortOrder: 0,
          },
        ],
      },
    },
    include: { variants: true },
  });

  return NextResponse.json({ round: next });
}
