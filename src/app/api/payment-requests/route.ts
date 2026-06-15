import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    const userId = (session.user as { id?: string })?.id

    const statusFilter = req.nextUrl.searchParams.get("status")
    const projectIdFilter = req.nextUrl.searchParams.get("projectId")

    const where: Record<string, unknown> = {}
    if (statusFilter) where.status = statusFilter
    if (projectIdFilter) where.projectId = projectIdFilter

    if (userRole === "ADMIN") {
      // Admin sees all
    } else if (userRole === "OFFICER") {
      // Officer sees requests for projects where they are the officer
      where.project = { officerId: userId }
    } else if (userRole === "CONTRACTOR") {
      // Contractor sees their own
      where.contractorId = userId
    } else {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const requests = await prisma.paymentRequest.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, officerId: true } },
        contractor: { select: { id: true, name: true, email: true } },
        officer: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching payment requests:", error)
    return NextResponse.json({ error: "Failed to fetch payment requests" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as { role?: string })?.role
    if (userRole !== "CONTRACTOR") {
      return NextResponse.json({ error: "Only contractors can submit payment requests" }, { status: 403 })
    }

    const userId = (session.user as { id?: string })?.id
    if (!userId) {
      return NextResponse.json({ error: "User not found" }, { status: 401 })
    }

    const body = await req.json()
    const { projectId, taskId, amount, description, proofImages } = body

    if (!projectId || !description) {
      return NextResponse.json({ error: "projectId and description are required" }, { status: 400 })
    }
    if (!amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Amount must be greater than 0" }, { status: 400 })
    }
    if (!Array.isArray(proofImages)) {
      return NextResponse.json({ error: "proofImages must be an array" }, { status: 400 })
    }
    if (proofImages.length > 5) {
      return NextResponse.json({ error: "Maximum 5 proof images allowed" }, { status: 400 })
    }

    // Validate each image
    for (const img of proofImages) {
      if (typeof img !== "string" || !img.startsWith("data:image/")) {
        return NextResponse.json({ error: "Each proof image must be a base64 data URL starting with data:image/" }, { status: 400 })
      }
      // Check size: base64 string length * 0.75 gives bytes
      const sizeBytes = (img.length * 3) / 4
      if (sizeBytes > 2 * 1024 * 1024) {
        return NextResponse.json({ error: "Each image must be under 2MB" }, { status: 400 })
      }
    }

    // Fetch project to get officer info
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { contractor: { select: { name: true } } },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const contractor = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    })

    const paymentRequest = await prisma.paymentRequest.create({
      data: {
        amount: parseFloat(amount),
        description,
        proofImages,
        status: "PENDING",
        projectId,
        contractorId: userId,
        ...(taskId ? { taskId } : {}),
      },
      include: {
        project: { select: { id: true, name: true } },
        contractor: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } },
      },
    })

    // Notify the officer if one is assigned
    if (project.officerId) {
      const contractorName = contractor?.name || "A contractor"
      const amountFormatted = parseFloat(amount).toLocaleString("en-IN")
      await prisma.notification.create({
        data: {
          userId: project.officerId,
          title: "Payment Request Received",
          message: `${contractorName} has requested ₹${amountFormatted} for ${project.name}`,
          link: `/officer/projects/${projectId}`,
        },
      })
    }

    return NextResponse.json(paymentRequest, { status: 201 })
  } catch (error) {
    console.error("Error creating payment request:", error)
    return NextResponse.json({ error: "Failed to create payment request" }, { status: 500 })
  }
}
