import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

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

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, officerId: true } },
        contractor: { select: { id: true, name: true, email: true } },
        officer: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
    })

    if (!paymentRequest) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 })
    }

    return NextResponse.json(paymentRequest)
  } catch (error) {
    console.error("Error fetching payment request:", error)
    return NextResponse.json({ error: "Failed to fetch payment request" }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== "OFFICER") {
      return NextResponse.json({ error: "Only officers can approve/reject payment requests" }, { status: 403 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const { id } = await params

    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id },
      include: {
        project: { select: { id: true, name: true, officerId: true } },
        contractor: { select: { id: true, name: true, email: true } },
      },
    })

    if (!paymentRequest) {
      return NextResponse.json({ error: "Payment request not found" }, { status: 404 })
    }

    // Verify officer is assigned to this project
    if (paymentRequest.project.officerId !== userId) {
      return NextResponse.json({ error: "You are not the officer for this project" }, { status: 403 })
    }

    const body = await req.json()
    const { action, officerNote, datePaid } = body

    if (action === "approve") {
      // Update payment request
      const updated = await prisma.paymentRequest.update({
        where: { id },
        data: {
          status: "APPROVED",
          officerId: userId,
          ...(officerNote ? { officerNote } : {}),
        },
        include: {
          project: { select: { id: true, name: true } },
          contractor: { select: { id: true, name: true, email: true } },
          officer: { select: { id: true, name: true, email: true } },
          task: { select: { id: true, title: true } },
        },
      })

      // Create installment record
      const installment = await prisma.installment.create({
        data: {
          projectId: paymentRequest.projectId,
          amount: paymentRequest.amount,
          description: paymentRequest.description,
          datePaid: datePaid ? new Date(datePaid) : new Date(),
        },
      })

      // Update project budgetActual
      const totalPaid = await prisma.installment.aggregate({
        where: { projectId: paymentRequest.projectId },
        _sum: { amount: true },
      })

      await prisma.project.update({
        where: { id: paymentRequest.projectId },
        data: { budgetActual: totalPaid._sum.amount || 0 },
      })

      // Notify contractor
      const amountFormatted = paymentRequest.amount.toLocaleString("en-IN")
      await prisma.notification.create({
        data: {
          userId: paymentRequest.contractorId,
          title: "Payment Approved",
          message: `Your payment request of ₹${amountFormatted} for ${paymentRequest.project.name} has been approved.`,
          link: `/contractor/projects/${paymentRequest.projectId}`,
        },
      })

      // suppress unused variable warning
      void installment

      return NextResponse.json(updated)
    } else if (action === "reject") {
      const updated = await prisma.paymentRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          officerId: userId,
          officerNote: officerNote || null,
        },
        include: {
          project: { select: { id: true, name: true } },
          contractor: { select: { id: true, name: true, email: true } },
          officer: { select: { id: true, name: true, email: true } },
          task: { select: { id: true, title: true } },
        },
      })

      // Notify contractor
      const amountFormatted = paymentRequest.amount.toLocaleString("en-IN")
      const noteText = officerNote ? ` Reason: ${officerNote}` : ""
      await prisma.notification.create({
        data: {
          userId: paymentRequest.contractorId,
          title: "Payment Request Rejected",
          message: `Your payment request of ₹${amountFormatted} for ${paymentRequest.project.name} has been rejected.${noteText}`,
          link: `/contractor/projects/${paymentRequest.projectId}`,
        },
      })

      return NextResponse.json(updated)
    } else {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error updating payment request:", error)
    return NextResponse.json({ error: "Failed to update payment request" }, { status: 500 })
  }
}
