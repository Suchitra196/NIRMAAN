import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SAMPLE_STATS } from "@/lib/sampleProjects";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [totalProjects, ongoingProjects, delayedProjects, completedProjects, budgetAgg, deptGroups] =
      await Promise.all([
        prisma.project.count(),
        prisma.project.count({ where: { status: "ONGOING" } }),
        prisma.project.count({ where: { status: "DELAYED" } }),
        prisma.project.count({ where: { status: "COMPLETED" } }),
        prisma.project.aggregate({
          _sum: { budgetPlanned: true, budgetActual: true, tenderAmount: true },
        }),
        prisma.user.groupBy({
          by: ["department"],
          _count: { id: true },
          where: { department: { not: "NONE" } },
        }),
      ]);

    if (!totalProjects || totalProjects === 0) {
      return NextResponse.json(SAMPLE_STATS);
    }

    return NextResponse.json({
      totalProjects,
      ongoingProjects,
      delayedProjects,
      completedProjects,
      totalBudgetPlanned: budgetAgg._sum.budgetPlanned ?? 0,
      totalBudgetActual: budgetAgg._sum.budgetActual ?? 0,
      totalTenderValue: budgetAgg._sum.tenderAmount ?? 0,
      departmentBreakdown: deptGroups.map((g) => ({
        department: g.department,
        count: g._count.id,
      })),
    });
  } catch (error) {
    console.error("Database unavailable in public stats, falling back to SAMPLE_STATS:", error);
    return NextResponse.json(SAMPLE_STATS, { status: 200 });
  }
}
