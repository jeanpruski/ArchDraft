import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recomputeProjectComplexity } from "@/lib/project-score";

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseEnumOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseFrequency(value: unknown): string | null {
  if (typeof value !== "string") return null;
  if (!value) return null;
  if (value === "5min") return "minutes_5";
  if (value === "15min") return "minutes_15";
  return value;
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const sourceItemTypes = normalizeText(body.sourceItemTypes);
  const targetItemTypes = normalizeText(body.targetItemTypes);
  const updated = await prisma.syncFlow.update({
    where: { id },
    data: {
      name: body.name,
      sourceSystemId: Number(body.sourceSystemId),
      targetSystemId: Number(body.targetSystemId),
      objectType: body.objectType || `${sourceItemTypes || "source"} -> ${targetItemTypes || "cible"}`,
      sourceItemTypes,
      targetItemTypes,
      direction: parseEnumOrNull(body.direction),
      triggerType: parseEnumOrNull(body.triggerType),
      mode: parseEnumOrNull(body.mode),
      frequency: parseFrequency(body.frequency),
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
