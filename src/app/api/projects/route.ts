import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET all projects
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userRole = (session.user as any)?.role
    const userEmail = session.user?.email

    // Get user from DB to get their ID
    const user = await prisma.user.findUnique({
      where: { email: userEmail || "" },
    })

    let projects

    if (userRole === "ADMIN") {
      // Admins see all projects
      projects = await prisma.project.findMany({
        include: {
          officer: { select: { id: true, name: true, email: true } },
          contractor: { select: { id: true, name: true, email: true } },
          tasks: true,
          installments: true,
        },
        orderBy: { createdAt: "desc" },
      })
    } else if (userRole === "OFFICER") {
      // Officers see their own projects
      projects = await prisma.project.findMany({
        where: { officerId: user?.id },
        include: {
          officer: { select: { id: true, name: true, email: true } },
          contractor: { select: { id: true, name: true, email: true } },
          tasks: true,
          installments: true,
        },
        orderBy: { createdAt: "desc" },
      })
    } else if (userRole === "CONTRACTOR") {
      // Contractors see projects assigned to them
      projects = await prisma.project.findMany({
        where: { contractorId: user?.id },
        include: {
          officer: { select: { id: true, name: true, email: true } },
          contractor: { select: { id: true, name: true, email: true } },
          tasks: true,
          installments: true,
        },
        orderBy: { createdAt: "desc" },
      })
    }

    return NextResponse.json(projects)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}

// POST create project
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

    // Only admins and officers can create projects
    if (userRole !== "ADMIN" && userRole !== "OFFICER") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { name, description, budgetPlanned, tenderAmount, contractorId, officerId } = body

    if (!name || !budgetPlanned || !tenderAmount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const userEmail = session.user?.email
    const user = await prisma.user.findUnique({
      where: { email: userEmail || "" },
    })

    const project = await prisma.project.create({
      data: {
        name,
        description,
        budgetPlanned: parseFloat(budgetPlanned),
        tenderAmount: parseFloat(tenderAmount),
        officerId: officerId || user?.id,
        contractorId,
      },
      include: {
        officer: { select: { id: true, name: true, email: true } },
        contractor: { select: { id: true, name: true, email: true } },
      },
    })

    return NextResponse.json(project, { status: 201 })
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    )
  }
}
