import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { DESIGNATION_HIERARCHY } from "@/lib/hierarchy"
import { Department } from "@prisma/client"

const MAX_IMAGE_SIZE = 2 * 1024 * 1024 // 2MB in bytes

// GET current user's full profile
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any)?.id
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        image: true,
        profileImage: true,
        status: true,
        designation: true,
        department: true,
        hierarchyLevel: true,
        isDeptAdmin: true,
        isSuperAdmin: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching profile:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}

// PUT update profile (image, name, phone, designation)
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = (session.user as any)?.id
    if (!userId) {
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 })
    }

    const body = await req.json()
    const { profileImage, name, phone, designation, department } = body

    const updateData: Record<string, unknown> = {}

    // Handle profileImage update
    if (profileImage !== undefined) {
      if (profileImage !== null) {
        if (typeof profileImage !== "string") {
          return NextResponse.json(
            { error: "profileImage must be a string or null" },
            { status: 400 }
          )
        }

        if (!profileImage.startsWith("data:image/")) {
          return NextResponse.json(
            { error: "profileImage must be a valid image data URL" },
            { status: 400 }
          )
        }

        const byteSize = Math.ceil((profileImage.length * 3) / 4)
        if (byteSize > MAX_IMAGE_SIZE) {
          return NextResponse.json(
            { error: "Image must be 2MB or smaller" },
            { status: 400 }
          )
        }
      }
      updateData.profileImage = profileImage ?? null
    }

    if (name !== undefined) updateData.name = name
    if (phone !== undefined) updateData.phone = phone

    // Handle designation — auto-derive department and hierarchyLevel if not explicitly provided
    if (designation !== undefined) {
      updateData.designation = designation
      const info = designation ? DESIGNATION_HIERARCHY[designation] : null
      if (info) {
        updateData.hierarchyLevel = info.level
        // department can be overridden by explicit param
        updateData.department = (department as Department) || (info.department as Department)
        // Mark isSuperAdmin for level 1-2, isDeptAdmin for level 3-5
        updateData.isSuperAdmin = info.level <= 2
        updateData.isDeptAdmin = info.level >= 3 && info.level <= 5
      }
    }

    if (department !== undefined && designation === undefined) {
      updateData.department = department as Department
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImage: true,
        designation: true,
        department: true,
        hierarchyLevel: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}
