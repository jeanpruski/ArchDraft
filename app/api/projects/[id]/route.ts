import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, company: true } },
      projectSystems: { include: { system: true } },
      syncFlows: {
        include: {
          sourceSystem: { select: { id: true, name: true } },
          targetSystem: { select: { id: true, name: true } }
        }
      },
      _count: {
        select: {
          risks: true,
          openQuestions: true,
          syncFlows: true
        }
      }
    }
  });

  if (!project) return NextResponse.json({ error: "Projet introuvable" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  const body = await req.json();
  const updated = await prisma.project.update({
    where: { id },
    data: {
      name: body.name,
      description: body.description || null,
      context: body.context || null,
      objective: body.objective || null,
      status: body.status,
      deadline: body.deadline ? new Date(body.deadline) : null
    }
  });
  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id);
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
