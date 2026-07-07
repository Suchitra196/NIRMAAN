import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        budgetPlanned: true,
        budgetActual: true,
        tenderAmount: true,
        createdAt: true,
        officer: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error fetching public projects:", error);
    return NextResponse.json([], { status: 200 });
  }
}
