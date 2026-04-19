import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UpdateRoundBody } from "@/lib/api/validation";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await ctx.params;
  const round = await prisma.round.findUnique({
    where: { id: roundId },
    include: {
      project: true,
      variants: { orderBy: { sortOrder: "asc" } },
      results: { include: { variant: true } },
      winnerVariant: true,
      parentRound: { select: { id: true, name: true, type: true } },
      childRounds: { select: { id: true, name: true, type: true, status: true } },
      submissions: { orderBy: { createdAt: "desc" }, take: 20 },
    },
  });
  if (!round) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ round });
}

export async function PATCH(
  req: Request,
  ctx: { params: Promise<{ roundId: string }> },
) {
  const { roundId } = await ctx.params;
  const json = await req.json().catch(() => null);
  const parsed = UpdateRoundBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const data = parsed.data;
  const round = await prisma.round.update({
    where: { id: roundId },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.objective !== undefined && { objective: data.objective }),
      ...(data.status !== undefined && { status: data.status }),
      ...(data.audience !== undefined && {
        audience: JSON.stringify(data.audience),
      }),
      ...(data.budget !== undefined && {
        budget: JSON.stringify(data.budget),
      }),
      ...(data.schedule !== undefined && {
        schedule: JSON.stringify(data.schedule),
      }),
      ...(data.scheduleMode !== undefined && { scheduleMode: data.scheduleMode }),
      ...(data.primaryMetric !== undefined && { primaryMetric: data.primaryMetric }),
      ...(data.metricWeights !== undefined && {
        metricWeights:
          data.metricWeights === null
            ? null
            : JSON.stringify(data.metricWeights),
      }),
      ...(data.notes !== undefined && { notes: data.notes }),
    },
  });
  return NextResponse.json({ round });
}
