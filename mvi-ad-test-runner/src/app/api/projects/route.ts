import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { CreateProjectBody } from "@/lib/api/validation";

export const runtime = "nodejs";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { rounds: true } } },
  });
  return NextResponse.json({ projects });
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CreateProjectBody.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const p = await prisma.project.create({ data: parsed.data });
  return NextResponse.json({ project: p });
}
