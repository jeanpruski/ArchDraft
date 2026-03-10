import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recomputeProjectComplexity } from "@/lib/project-score";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.syncFlow.update({
    where: { id },
    data: {
      name: body.name,
      sourceSystemId: Number(body.sourceSystemId),
      targetSystemId: Number(body.targetSystemId),
      objectType: body.objectType,
      direction: body.direction,
      triggerType: body.triggerType,
      mode: body.mode,
      frequency: body.frequency === "5min" ? "minutes_5" : body.frequency === "15min" ? "minutes_15" : body.frequency,
      description: body.description || null
    }
  });
  await recomputeProjectComplexity(updated.projectId);
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const existing = await prisma.syncFlow.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Flow introuvable" }, { status: 404 });
  await prisma.syncFlow.delete({ where: { id } });
  await recomputeProjectComplexity(existing.projectId);
  return NextResponse.json({ ok: true });
}
