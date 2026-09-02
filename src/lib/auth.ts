import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/?view=login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const email = credentials.email.toLowerCase().trim()
        const user = await db.user.findUnique({
          where: { email },
          include: { profile: true },
        })
        if (!user || !user.hashedPassword) return null

        const ok = await bcrypt.compare(credentials.password, user.hashedPassword)
        if (!ok) return null

        return {
          id: user.id,
          email: user.email,
          name: user.profile?.fullName || user.name,
          image: user.profile?.avatarUrl || user.image,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}

export type SessionUser = {
  id: string
  email: string | null
  name: string | null
  image: string | null
}
