import NextAuth, { DefaultSession } from "next-auth"
import { Role, UserStatus } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: Role
      status?: UserStatus
      pendingApproval?: boolean
      suspended?: boolean
      designation?: string | null
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    role: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: Role
    id?: string
    status?: UserStatus
    pendingApproval?: boolean
    suspended?: boolean
    designation?: string | null
  }
}
