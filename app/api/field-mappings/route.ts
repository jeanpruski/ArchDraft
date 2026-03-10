import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const flowId = req.nextUrl.searchParams.get("flowId");
  const projectId = req.nextUrl.searchParams.get("projectId");
  const where: Record<string, any> = {};
  if (flowId) where.syncFlowId = Number(flowId);
  if (projectId) where.syncFlow = { projectId: Number(projectId) };

  const mappings = await prisma.fieldMapping.findMany({
    where,
    include: { syncFlow: { select: { id: true, name: true, projectId: true } } },
    orderBy: { id: "desc" }
  });
  return NextResponse.json(mappings);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const mapping = await prisma.fieldMapping.create({
    data: {
      syncFlowId: Number(body.syncFlowId),
      direction: body.direction || "source_to_target",
      sourceField: body.sourceField,
      targetField: body.targetField,
      transformation: body.transformation || null,
      required: Boolean(body.required),
      defaultValue: body.defaultValue || null,
      notes: body.notes || null
    }
  });
  return NextResponse.json(mapping, { status: 201 });
}
