import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/admin/fix-status
 *
 * One-time migration: sets status=ACTIVE for all ADMIN users and all credential
 * users (users with a password) who were created before the status field was
 * added (and therefore have status=PENDING_APPROVAL by default).
 *
 * Protected by ADMIN_SETUP_SECRET.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { secret } = body

    const setupSecret = process.env.ADMIN_SETUP_SECRET
    if (!setupSecret || secret !== setupSecret) {
      return NextResponse.json({ error: "Invalid secret." }, { status: 403 })
    }

    // Activate all ADMIN role users
    const adminResult = await prisma.user.updateMany({
      where: { role: "ADMIN", status: "PENDING_APPROVAL" },
      data: { status: "ACTIVE" },
    })

    // Activate credential users (those approved via LoginRequest — they have a password)
    const credResult = await prisma.user.updateMany({
      where: {
        password: { not: null },
        status: "PENDING_APPROVAL",
      },
      data: { status: "ACTIVE" },
    })

    return NextResponse.json({
      message: "Status migration complete.",
      adminUsersFixed: adminResult.count,
      credentialUsersFixed: credResult.count,
    })
  } catch (error) {
    console.error("Error fixing status:", error)
    return NextResponse.json({ error: "Migration failed." }, { status: 500 })
  }
}
