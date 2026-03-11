import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { recomputeProjectComplexity } from "@/lib/project-score";

function parseFrequency(value: string | null) {
  if (!value) return null;
  if (value === "5min") return "minutes_5";
  if (value === "15min") return "minutes_15";
  return value;
}

function parseEnumOrNull(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function normalizeText(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  const where = projectId ? { projectId: Number(projectId) } : {};
  const flows = await prisma.syncFlow.findMany({
    where,
    include: {
      sourceSystem: { select: { id: true, name: true } },
      targetSystem: { select: { id: true, name: true } }
    },
    orderBy: { id: "desc" }
  });
  return NextResponse.json(flows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sourceItemTypes = normalizeText(body.sourceItemTypes);
  const targetItemTypes = normalizeText(body.targetItemTypes);
  const flow = await prisma.syncFlow.create({
    data: {
      projectId: Number(body.projectId),
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
  await recomputeProjectComplexity(flow.projectId);
  return NextResponse.json(flow, { status: 201 });
}
