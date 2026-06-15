import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET all installments for a project
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const projectId = req.nextUrl.searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId query parameter required" },
        { status: 400 }
      )
    }

    const installments = await prisma.installment.findMany({
      where: { projectId },
      orderBy: { datePaid: "desc" },
    })

    return NextResponse.json(installments)
  } catch (error) {
    console.error("Error fetching installments:", error)
    return NextResponse.json(
      { error: "Failed to fetch installments" },
      { status: 500 }
    )
  }
}

// POST create installment
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role

    // Only admins and officers can record payments
    if (userRole !== "ADMIN" && userRole !== "OFFICER") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { amount, projectId, description, datePaid } = body

    if (!amount || !projectId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Verify project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    })

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      )
    }

    const installment = await prisma.installment.create({
      data: {
        amount: parseFloat(amount),
        projectId,
        description,
        datePaid: datePaid ? new Date(datePaid) : new Date(),
      },
    })

    // Update project's actual budget
    const totalPaid = await prisma.installment.aggregate({
      where: { projectId },
      _sum: { amount: true },
    })

    await prisma.project.update({
      where: { id: projectId },
      data: { budgetActual: totalPaid._sum.amount || 0 },
    })

    return NextResponse.json(installment, { status: 201 })
  } catch (error) {
    console.error("Error creating installment:", error)
    return NextResponse.json(
      { error: "Failed to create installment" },
      { status: 500 }
    )
  }
}
