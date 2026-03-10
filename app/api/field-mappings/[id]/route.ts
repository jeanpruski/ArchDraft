import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.fieldMapping.update({
    where: { id },
    data: {
      direction: body.direction || "source_to_target",
      sourceField: body.sourceField,
      targetField: body.targetField,
      transformation: body.transformation || null,
      required: Boolean(body.required),
      defaultValue: body.defaultValue || null,
      notes: body.notes || null
    }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.fieldMapping.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
