import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const projectId = req.nextUrl.searchParams.get("projectId");
  if (!projectId) return NextResponse.json({ error: "projectId manquant" }, { status: 400 });
  const answers = await prisma.answer.findMany({
    where: { projectId: Number(projectId) },
    include: { question: true },
    orderBy: { id: "asc" }
  });
  return NextResponse.json(answers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const projectId = Number(body.projectId);
  const questionId = Number(body.questionId);

  const saved = await prisma.answer.upsert({
    where: {
      project_question: { projectId, questionId }
    },
    update: { answer: String(body.answer), updatedAt: new Date() },
    create: {
      projectId,
      questionId,
      answer: String(body.answer)
    }
  });
  return NextResponse.json(saved, { status: 201 });
}
