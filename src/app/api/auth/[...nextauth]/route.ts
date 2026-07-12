import NextAuth, { AuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export const authOptions: AuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.identifier || !credentials?.password) {
          return null
        }

        const identifier = credentials.identifier.trim()

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: identifier },
              { phone: identifier },
            ],
          },
        })

        if (!user || !user.password) {
          return null
        }

        if (user.status === "SUSPENDED") {
          return null
        }

        // Auto-activate credential users who were created before the status field was added
        // (they have PENDING_APPROVAL but have a password set, meaning they were approved)
        if (user.status === "PENDING_APPROVAL" && user.password) {
          await prisma.user.update({
            where: { id: user.id },
            data: { status: "ACTIVE" },
          })
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          image: user.profileImage || user.image,
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } })
        if (dbUser && dbUser.status === "SUSPENDED") return false
        return true
      }
      return true
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }

      const dbUserId = (token.id as string | undefined) || token.sub
      if (dbUserId) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: dbUserId },
            select: { id: true, role: true, status: true, designation: true },
          })
          if (dbUser) {
            token.id = dbUser.id
            token.designation = dbUser.designation

            // ADMIN users are always treated as ACTIVE regardless of status field
            // This fixes the migration issue where existing admins have PENDING_APPROVAL
            const effectiveStatus =
              dbUser.role === "ADMIN" ? "ACTIVE" : dbUser.status

            token.status = effectiveStatus

            if (effectiveStatus === "PENDING_APPROVAL") {
              token.pendingApproval = true
              token.suspended = false
            } else if (effectiveStatus === "SUSPENDED") {
              token.suspended = true
              token.pendingApproval = false
            } else {
              // ACTIVE
              token.role = dbUser.role
              token.pendingApproval = false
              token.suspended = false
            }
          }
        } catch {
          // DB unavailable — keep token as-is
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session?.user) {
        ;(session.user as any).role = token.role
        ;(session.user as any).id = token.id
        ;(session.user as any).status = token.status
        ;(session.user as any).pendingApproval = token.pendingApproval
        ;(session.user as any).suspended = token.suspended
        ;(session.user as any).designation = token.designation
      }
      return session
    },

    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
