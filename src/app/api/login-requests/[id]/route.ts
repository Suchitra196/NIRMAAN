import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

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
    const { action, adminNote } = body

    if (action !== "approve" && action !== "reject") {
      return NextResponse.json(
        { error: "action must be 'approve' or 'reject'" },
        { status: 400 }
      )
    }

    const loginRequest = await prisma.loginRequest.findUnique({ where: { id } })
    if (!loginRequest) {
      return NextResponse.json({ error: "Request not found" }, { status: 404 })
    }

    if (action === "approve") {
      // Create a new User from the LoginRequest with status=ACTIVE
      const newUser = await prisma.user.create({
        data: {
          name: loginRequest.name,
          email: loginRequest.email,
          phone: loginRequest.phone,
          password: loginRequest.password,
          role: loginRequest.requestedRole,
          status: "ACTIVE",
          profileImage: null,
        },
      })

      // Update the LoginRequest status
      await prisma.loginRequest.update({
        where: { id },
        data: { status: "APPROVED", adminNote: adminNote || null },
      })

      return NextResponse.json(newUser)
    } else {
      // Reject
      const updated = await prisma.loginRequest.update({
        where: { id },
        data: {
          status: "REJECTED",
          adminNote: adminNote || null,
        },
      })

      return NextResponse.json(updated)
    }
  } catch (error) {
    console.error("Error processing login request:", error)
    return NextResponse.json(
      { error: "Failed to process login request" },
      { status: 500 }
    )
  }
}
