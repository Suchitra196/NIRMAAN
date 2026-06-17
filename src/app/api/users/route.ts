import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

// GET all users (admin only)
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

    if (userRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const roleFilter = req.nextUrl.searchParams.get("role") as Role | null
    const statusFilter = req.nextUrl.searchParams.get("status")

    const users = await prisma.user.findMany({
      where: {
        ...(roleFilter ? { role: roleFilter } : {}),
        ...(statusFilter ? { status: statusFilter as any } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        designation: true,
        department: true,
        hierarchyLevel: true,
        isDeptAdmin: true,
        isSuperAdmin: true,
        managedProjects: { select: { id: true } },
        contractedProjects: { select: { id: true } },
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    )
  }
}

// POST - Get current user info
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const userEmail = session.user?.email

    const user = await prisma.user.findUnique({
      where: { email: userEmail || "" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        designation: true,
        department: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching current user:", error)
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 }
    )
  }
}
