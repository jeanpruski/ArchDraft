import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const where = projectId ? { projectId: Number(projectId) } : {};
  const risks = await prisma.risk.findMany({ where, orderBy: { id: "desc" } });
  return NextResponse.json(risks);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const risk = await prisma.risk.create({
    data: {
      projectId: Number(body.projectId),
      description: body.description,
      impact: body.impact,
      status: body.status || "open"
    }
  });
  return NextResponse.json(risk, { status: 201 });
}
