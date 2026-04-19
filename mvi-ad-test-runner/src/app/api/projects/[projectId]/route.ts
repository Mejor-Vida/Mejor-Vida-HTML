import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ projectId: string }> },
) {
  const { projectId } = await ctx.params;
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      rounds: {
        orderBy: { createdAt: "desc" },
        include: {
          _count: { select: { variants: true } },
          winnerVariant: true,
          parentRound: { select: { id: true, name: true } },
        },
      },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ project });
}
