import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SelectWinnerBody } from "@/lib/api/validation";
import type { PrimaryMetric } from "@/lib/dbEnums";
import type { PerformanceMetrics } from "@/lib/scoring/metrics";
import { isLowerBetter, primaryMetricValue } from "@/lib/scoring/metrics";

export const runtime = "nodejs";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = SelectWinnerBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { results: true, variants: true },
  });
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  const variant = round.variants.find((v) => v.id === parsed.data.variantId);
  if (!variant) return NextResponse.json({ error: "Variant not in round" }, { status: 400 });

  const updated = await prisma.round.update({
    where: { id: roundId },
    data: {
      winnerVariantId: variant.id,
      status: "WINNER_SELECTED",
    },
  });

  return NextResponse.json({ round: updated, winner: variant });
}

/** Auto-pick winner by primary metric (requires RoundResult rows). */
export async function PUT(
  _req: Request,
  ctx: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await ctx.params;

  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: { results: true, variants: true },
  });
  if (!round) return NextResponse.json({ error: "Round not found" }, { status: 404 });

  if (round.results.length === 0) {
    return NextResponse.json({ error: "No results to compare" }, { status: 400 });
  }

  const lower = isLowerBetter(round.primaryMetric as PrimaryMetric);

  type Cand = { variantId: string; score: number };
  const candidates: Cand[] = [];

  for (const r of round.results) {
    let m: PerformanceMetrics = {};
    try {
      m = JSON.parse(r.metrics) as PerformanceMetrics;
    } catch {
      /* ignore */
    }
    if (round.primaryMetric === "WEIGHTED") {
      const w = r.weightedScore;
      if (w == null || Number.isNaN(w)) continue;
      candidates.push({ variantId: r.variantId, score: w });
      continue;
    }
    const pv = primaryMetricValue(round.primaryMetric as PrimaryMetric, m);
    if (pv === undefined || Number.isNaN(pv)) continue;
    candidates.push({ variantId: r.variantId, score: pv });
  }

  if (candidates.length === 0) {
    return NextResponse.json({ error: "Could not compute scores for any variant" }, { status: 400 });
  }

  let best = candidates[0] as Cand;
  for (const c of candidates.slice(1)) {
    if (lower) {
      if (c.score < best.score) best = c;
    } else if (c.score > best.score) {
      best = c;
    }
  }

  const updated = await prisma.round.update({
    where: { id: roundId },
    data: {
      winnerVariantId: best.variantId,
      status: "WINNER_SELECTED",
    },
  });

  return NextResponse.json({ round: updated, winnerVariantId: best.variantId });
}
