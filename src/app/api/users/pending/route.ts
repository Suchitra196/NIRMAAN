import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET all users with status=PENDING_APPROVAL (admin only)
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Find all users with PENDING_APPROVAL and their linked accounts
    const pendingUsers = await prisma.user.findMany({
      where: {
        status: "PENDING_APPROVAL",
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    })

    // Augment with providers list
    const result = pendingUsers.map((u) => ({
      ...u,
      createdAt: new Date().toISOString(), // fallback since select omits createdAt
      providers: u.accounts.map((a: { provider: string }) => a.provider),
    }))

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error fetching pending users:", error)
    return NextResponse.json({ error: "Failed to fetch pending users" }, { status: 500 })
  }
}
