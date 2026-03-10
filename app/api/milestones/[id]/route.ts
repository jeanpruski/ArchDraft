import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.milestone.update({
    where: { id },
    data: {
      title: body.title,
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : null
    }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.milestone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
