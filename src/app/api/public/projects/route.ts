import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SAMPLE_PROJECTS } from "@/lib/sampleProjects";

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

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        SAMPLE_PROJECTS.slice(0, 6).map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          status: p.status,
          budgetPlanned: p.budgetPlanned,
          budgetActual: p.budgetActual,
          tenderAmount: p.tenderAmount,
          createdAt: new Date().toISOString(),
          officer: { name: p.officerName },
        }))
      );
    }

    return NextResponse.json(projects);
  } catch (error) {
    console.error("Database unavailable in public projects, returning sample projects:", error);
    return NextResponse.json(
      SAMPLE_PROJECTS.slice(0, 6).map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        status: p.status,
        budgetPlanned: p.budgetPlanned,
        budgetActual: p.budgetActual,
        tenderAmount: p.tenderAmount,
        createdAt: new Date().toISOString(),
        officer: { name: p.officerName },
      })),
      { status: 200 }
    );
  }
}
