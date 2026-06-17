import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { Department, UserStatus } from "@prisma/client"

// GET user by ID
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

    const user = await prisma.user.findUnique({
      where: { id },
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
        managedProjects: true,
        contractedProjects: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
  }
}

// PUT update user (admin only)
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
    const {
      role,
      name,
      status,
      designation,
      department,
      hierarchyLevel,
      isDeptAdmin,
      isSuperAdmin,
    } = body

    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(role !== undefined && { role }),
        ...(name !== undefined && { name }),
        ...(status !== undefined && { status: status as UserStatus }),
        ...(designation !== undefined && { designation }),
        ...(department !== undefined && { department: department as Department }),
        ...(hierarchyLevel !== undefined && { hierarchyLevel: Number(hierarchyLevel) }),
        ...(isDeptAdmin !== undefined && { isDeptAdmin: Boolean(isDeptAdmin) }),
        ...(isSuperAdmin !== undefined && { isSuperAdmin: Boolean(isSuperAdmin) }),
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
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 })
  }
}

// DELETE user (admin only)
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
    const user = await prisma.user.findUnique({ where: { id } })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await prisma.user.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 })
  }
}
