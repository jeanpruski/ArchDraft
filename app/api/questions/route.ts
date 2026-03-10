import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const questions = await prisma.question.findMany({ orderBy: [{ category: "asc" }, { id: "asc" }] });
  return NextResponse.json(questions);
}
