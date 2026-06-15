import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/admin/promote
 *
 * One-time bootstrap endpoint to promote a user to ADMIN role.
 * Protected by ADMIN_SETUP_SECRET environment variable.
 *
 * Body: { email: string, secret: string }
 *
 * Usage (first time setup):
 *   curl -X POST http://localhost:3000/api/admin/promote \
 *     -H "Content-Type: application/json" \
 *     -d '{"email":"your@email.com","secret":"your-admin-setup-secret"}'
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, secret } = body

    // Verify the setup secret
    const setupSecret = process.env.ADMIN_SETUP_SECRET
    if (!setupSecret) {
      return NextResponse.json(
        { error: "ADMIN_SETUP_SECRET is not configured on the server." },
        { status: 500 }
      )
    }

    if (!secret || secret !== setupSecret) {
      return NextResponse.json(
        { error: "Invalid setup secret." },
        { status: 403 }
      )
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "email is required." },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      return NextResponse.json(
        { error: `No user found with email: ${email}. Sign in with Google first, then call this endpoint.` },
        { status: 404 }
      )
    }

    const updated = await prisma.user.update({
      where: { email },
      data: { role: "ADMIN" },
      select: { id: true, name: true, email: true, role: true },
    })

    return NextResponse.json({
      message: `Successfully promoted ${updated.email} to ADMIN.`,
      user: updated,
    })
  } catch (error) {
    console.error("Error promoting user to admin:", error)
    return NextResponse.json(
      { error: "Failed to promote user." },
      { status: 500 }
    )
  }
}
