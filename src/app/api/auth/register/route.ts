import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { Role } from "@prisma/client"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, phone, password, requestedRole } = body

    // Validate required fields
    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    if (!email && !phone) {
      return NextResponse.json(
        { error: "At least one of email or phone is required" },
        { status: 400 }
      )
    }

    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    const allowedRoles: Role[] = [Role.OFFICER, Role.CONTRACTOR]
    if (!requestedRole || !allowedRoles.includes(requestedRole as Role)) {
      return NextResponse.json(
        { error: "Requested role must be OFFICER or CONTRACTOR" },
        { status: 400 }
      )
    }

    // Check if user already exists in User table
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        return NextResponse.json(
          { error: "An account with this email already exists" },
          { status: 409 }
        )
      }
    }

    if (phone) {
      const existingUserPhone = await prisma.user.findFirst({ where: { phone } })
      if (existingUserPhone) {
        return NextResponse.json(
          { error: "An account with this phone number already exists" },
          { status: 409 }
        )
      }
    }

    // Check for existing PENDING LoginRequest
    const existingRequest = await prisma.loginRequest.findFirst({
      where: {
        status: "PENDING",
        OR: [
          ...(email ? [{ email }] : []),
          ...(phone ? [{ phone }] : []),
        ],
      },
    })

    if (existingRequest) {
      return NextResponse.json(
        { error: "Request already pending" },
        { status: 409 }
      )
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create the LoginRequest
    await prisma.loginRequest.create({
      data: {
        name: name.trim(),
        email: email || null,
        phone: phone || null,
        password: hashedPassword,
        requestedRole: requestedRole as Role,
        status: "PENDING",
      },
    })

    return NextResponse.json(
      { message: "Registration request submitted. Awaiting admin approval." },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error creating registration request:", error)
    return NextResponse.json(
      { error: "Failed to submit registration request" },
      { status: 500 }
    )
  }
}
