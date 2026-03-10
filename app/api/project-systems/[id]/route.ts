import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recomputeProjectComplexity } from "@/lib/project-score";

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const existing = await prisma.projectSystem.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Affectation introuvable" }, { status: 404 });
  await prisma.projectSystem.delete({ where: { id } });
  await recomputeProjectComplexity(existing.projectId);
  return NextResponse.json({ ok: true });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.projectSystem.update({
    where: { id },
    data: {
      role: body.role,
      notes: body.notes || null
    }
  });
  return NextResponse.json(updated);
}
