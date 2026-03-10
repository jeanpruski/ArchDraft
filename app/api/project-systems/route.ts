import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recomputeProjectComplexity } from "@/lib/project-score";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const where = projectId ? { projectId: Number(projectId) } : {};
  const rows = await prisma.projectSystem.findMany({
    where,
    include: {
      project: { select: { id: true, name: true } },
      system: true
    },
    orderBy: { id: "desc" }
  });
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const row = await prisma.projectSystem.create({
    data: {
      projectId: Number(body.projectId),
      systemId: Number(body.systemId),
      role: body.role || "both",
      notes: body.notes || null
    }
  });
  await recomputeProjectComplexity(row.projectId);
  return NextResponse.json(row, { status: 201 });
}
