import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET single installment
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const installment = await prisma.installment.findUnique({
      where: { id },
      include: { project: true },
    })

    if (!installment) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 })
    }

    return NextResponse.json(installment)
  } catch (error) {
    console.error("Error fetching installment:", error)
    return NextResponse.json({ error: "Failed to fetch installment" }, { status: 500 })
  }
}

// PUT update installment (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const body = await req.json()
    const { amount, description, datePaid } = body

    const installment = await prisma.installment.findUnique({ where: { id } })

    if (!installment) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 })
    }

    const updated = await prisma.installment.update({
      where: { id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(description && { description }),
        ...(datePaid && { datePaid: new Date(datePaid) }),
      },
    })

    // Recalculate project's actual budget
    const totalPaid = await prisma.installment.aggregate({
      where: { projectId: installment.projectId },
      _sum: { amount: true },
    })

    await prisma.project.update({
      where: { id: installment.projectId },
      data: { budgetActual: totalPaid._sum.amount || 0 },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating installment:", error)
    return NextResponse.json({ error: "Failed to update installment" }, { status: 500 })
  }
}

// DELETE installment (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const installment = await prisma.installment.findUnique({ where: { id } })

    if (!installment) {
      return NextResponse.json({ error: "Installment not found" }, { status: 404 })
    }

    await prisma.installment.delete({ where: { id } })

    // Recalculate project's actual budget
    const totalPaid = await prisma.installment.aggregate({
      where: { projectId: installment.projectId },
      _sum: { amount: true },
    })

    await prisma.project.update({
      where: { id: installment.projectId },
      data: { budgetActual: totalPaid._sum.amount || 0 },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting installment:", error)
    return NextResponse.json({ error: "Failed to delete installment" }, { status: 500 })
  }
}
