import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await req.json()
    const {
      fullName,
      grade,
      educationLevel,
      stream,
      schoolName,
      studyTargetMinutes,
      academicGoal,
    } = body

    const updated = await db.profile.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        fullName,
        grade,
        educationLevel,
        stream,
        schoolName,
        studyTargetMinutes: studyTargetMinutes ?? 60,
        academicGoal,
        onboardingCompleted: true,
      },
      update: {
        fullName,
        grade,
        educationLevel,
        stream,
        schoolName,
        studyTargetMinutes: studyTargetMinutes ?? 60,
        academicGoal,
        onboardingCompleted: true,
      },
    })
    return NextResponse.json({ ok: true, profile: updated })
  } catch (err) {
    return NextResponse.json({ error: "Failed to save profile." }, { status: 500 })
  }
}
