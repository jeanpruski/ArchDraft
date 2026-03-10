import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const client = await prisma.client.findUnique({
    where: { id }
  });
  if (!client) return NextResponse.json({ error: "Client introuvable" }, { status: 404 });
  return NextResponse.json(client);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.client.update({
    where: { id },
    data: {
      name: body.name,
      company: body.company,
      website: body.website || null,
      notes: body.notes || null
    }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.client.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
