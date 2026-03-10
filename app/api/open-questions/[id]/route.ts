import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.openQuestion.update({
    where: { id },
    data: {
      question: body.question,
      response: body.response || null,
      status: body.status
    }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.openQuestion.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
