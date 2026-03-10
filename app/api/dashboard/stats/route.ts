import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const totalProjects = await prisma.project.count();
  const activeProjects = await prisma.project.count({
    where: { status: { notIn: ["closed", "delivered"] } }
  });
  const blockedProjects = await prisma.project.count({
    where: { status: "waiting_client" }
  });
  const recentProjects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
    take: 5,
    select: { id: true, name: true, status: true, updatedAt: true }
  });

  return NextResponse.json({
    totalProjects,
    activeProjects,
    blockedProjects,
    recentProjects
  });
}
