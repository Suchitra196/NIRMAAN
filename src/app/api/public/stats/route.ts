import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
    console.error("Error fetching public stats:", error);
    return NextResponse.json(
      {
        totalProjects: 0,
        ongoingProjects: 0,
        delayedProjects: 0,
        completedProjects: 0,
        totalBudgetPlanned: 0,
        totalBudgetActual: 0,
        totalTenderValue: 0,
        departmentBreakdown: [{ department: "WORKS_CONSTRUCTION", count: 0 }],
      },
      { status: 200 }
    );
  }
}
