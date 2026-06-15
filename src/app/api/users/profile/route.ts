import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

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

// PUT update profile image
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
    const { profileImage } = body

    // null means "clear the profile image" (revert to Google photo)
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

      // Check size: base64 string length * 0.75 ≈ byte size
      const byteSize = Math.ceil((profileImage.length * 3) / 4)
      if (byteSize > MAX_IMAGE_SIZE) {
        return NextResponse.json(
          { error: "Image must be 2MB or smaller" },
          { status: 400 }
        )
      }
    }

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { profileImage: profileImage ?? null },
      select: {
        id: true,
        name: true,
        email: true,
        profileImage: true,
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error updating profile image:", error)
    return NextResponse.json({ error: "Failed to update profile image" }, { status: 500 })
  }
}
