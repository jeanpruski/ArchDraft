import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    include: {
      client: { select: { id: true, name: true, company: true } },
      _count: {
        select: {
          syncFlows: true,
          risks: true,
          openQuestions: true
        }
      }
    }
  });
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = await prisma.project.create({
    data: {
      name: body.name,
      client: { connect: { id: Number(body.clientId) } },
      description: body.description || null,
      context: body.context || null,
      objective: body.objective || null,
      status: body.status || "discovery",
      deadline: body.deadline ? new Date(body.deadline) : null
    }
  });
  return NextResponse.json(created, { status: 201 });
}
