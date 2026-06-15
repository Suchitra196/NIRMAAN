import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { LoginRequestStatus } from "@prisma/client"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userRole = (session.user as any)?.role
    if (userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const statusFilter = req.nextUrl.searchParams.get("status") as LoginRequestStatus | null

    const requests = await prisma.loginRequest.findMany({
      where: statusFilter ? { status: statusFilter } : {},
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
  } catch (error) {
    console.error("Error fetching login requests:", error)
    return NextResponse.json(
      { error: "Failed to fetch login requests" },
      { status: 500 }
    )
  }
}
