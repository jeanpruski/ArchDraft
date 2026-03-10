import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const where = projectId ? { projectId: Number(projectId) } : {};
  const rows = await prisma.decision.findMany({ where, orderBy: { id: "desc" } });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const row = await prisma.decision.create({
    data: {
      projectId: Number(body.projectId),
      description: body.description,
      decision: body.decision
    }
  });
  return NextResponse.json(row, { status: 201 });
}
