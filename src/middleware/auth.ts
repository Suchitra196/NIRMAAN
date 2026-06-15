import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export type AuthenticatedRequest = NextRequest & {
  user?: {
    id?: string
    email?: string
    name?: string
    role?: string
  }
}

export async function withAuth(
  handler: (req: AuthenticatedRequest) => Promise<NextResponse>
) {
  return async (req: AuthenticatedRequest) => {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    req.user = {
      id: session.user?.email ?? undefined,
      email: session.user?.email ?? undefined,
      name: session.user?.name ?? undefined,
      role: (session.user as any)?.role,
    }

    return handler(req)
  }
}

export function withRole(...allowedRoles: string[]) {
  return (handler: (req: AuthenticatedRequest) => Promise<NextResponse>) => {
    return async (req: AuthenticatedRequest) => {
      const session = await getServerSession(authOptions)

      if (!session) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        )
      }

      const userRole = (session.user as any)?.role

      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { error: "Forbidden" },
          { status: 403 }
        )
      }

      req.user = {
        id: session.user?.email ?? undefined,
        email: session.user?.email ?? undefined,
        name: session.user?.name ?? undefined,
        role: userRole,
      }

      return handler(req)
    }
  }
}
