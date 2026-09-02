import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
  try {
    const { email, password, fullName } = await req.json()
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 })
    }
    const normalizedEmail = email.toLowerCase().trim()
    const existing = await db.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
    }
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: fullName,
        hashedPassword,
        profile: {
          create: {
            fullName: fullName || null,
          },
        },
      },
      include: { profile: true },
    })
    return NextResponse.json({ ok: true, userId: user.id })
  } catch (err) {
    return NextResponse.json({ error: "We couldn't create your account right now." }, { status: 500 })
  }
}
