import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const systems = await prisma.system.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(systems);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const system = await prisma.system.create({
    data: {
      name: body.name,
      type: body.type,
      description: body.description || null
    }
  });
  return NextResponse.json(system, { status: 201 });
}
