import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const system = await prisma.system.findUnique({ where: { id } });
  if (!system) return NextResponse.json({ error: "Système introuvable" }, { status: 404 });
  return NextResponse.json(system);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.system.update({
    where: { id },
    data: {
      name: body.name,
      type: body.type,
      description: body.description || null
    }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.system.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
