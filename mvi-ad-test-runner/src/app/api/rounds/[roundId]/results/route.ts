import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MetricsBody } from "@/lib/api/validation";
import type { PerformanceMetrics } from "@/lib/scoring/metrics";
import { computeWeightedScore } from "@/lib/scoring/metrics";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = MetricsBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const round = await prisma.round.findUnique({ where: { id: roundId } });
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const variant = await prisma.variant.findFirst({
    where: { id: parsed.data.variantId, roundId },
  });
  if (!variant) return NextResponse.json({ error: "Variant not in round" }, { status: 400 });

  const m = parsed.data.metrics as PerformanceMetrics;
  let weights: Partial<Record<keyof PerformanceMetrics, number>> | undefined;
  if (round.metricWeights) {
    try {
      weights = JSON.parse(round.metricWeights) as Partial<
        Record<keyof PerformanceMetrics, number>
      >;
    } catch {
      weights = undefined;
    }
  }

  const weightedScore =
    round.primaryMetric === "WEIGHTED" && weights
      ? computeWeightedScore(m, weights)
      : null;

  const result = await prisma.roundResult.upsert({
    where: {
      roundId_variantId: { roundId, variantId: variant.id },
    },
    create: {
      roundId,
      variantId: variant.id,
      metrics: JSON.stringify(m),
      weightedScore: weightedScore ?? undefined,
    },
    update: {
      metrics: JSON.stringify(m),
      weightedScore: weightedScore ?? undefined,
    },
  });

  return NextResponse.json({ result });
}
