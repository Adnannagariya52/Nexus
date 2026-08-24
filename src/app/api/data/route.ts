import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma } from "@prisma/client"

// All data access enforced through userId from session — equivalent of RLS.
// This is a single endpoint that handles create/update/delete for user-owned resources.

const MODELS = {
  subject: "subject",
  chapter: "chapter",
  assignment: "assignment",
  exam: "exam",
  note: "note",
  goal: "goal",
  habit: "habit",
  habitLog: "habitLog",
  studySession: "studySession",
  focusSession: "focusSession",
  notification: "notification",
  careerProfile: "careerProfile",
  aiConversation: "aiConversation",
  aiMessage: "aiMessage",
  profile: "profile",
  achievement: "achievement",
} as const

type ModelKey = keyof typeof MODELS

interface Owned {
  userId?: string | null
  subjectId?: string | null
  conversationId?: string | null
  habitId?: string | null
}

async function getSubjectOwner(subjectId: string) {
  const s = await db.subject.findUnique({ where: { id: subjectId }, select: { userId: true } })
  return s?.userId
}
async function getConversationOwner(conversationId: string) {
  const c = await db.aIConversation.findUnique({
    where: { id: conversationId },
    select: { userId: true },
  })
  return c?.userId
}
async function getHabitOwner(habitId: string) {
  const h = await db.habit.findUnique({ where: { id: habitId }, select: { userId: true } })
  return h?.userId
}

async function assertOwnership(model: ModelKey, id: string, userId: string): Promise<boolean> {
  switch (model) {
    case "subject": {
      const r = await db.subject.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "chapter": {
      const c = await db.chapter.findUnique({ where: { id }, select: { subject: { select: { userId: true } } } })
      return c?.subject?.userId === userId
    }
    case "assignment": {
      const r = await db.assignment.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "exam": {
      const r = await db.exam.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "note": {
      const r = await db.note.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "goal": {
      const r = await db.goal.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "habit": {
      const r = await db.habit.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "habitLog": {
      const r = await db.habitLog.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "studySession": {
      const r = await db.studySession.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "focusSession": {
      const r = await db.focusSession.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "notification": {
      const r = await db.notification.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "careerProfile": {
      const r = await db.careerProfile.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "aiConversation": {
      const r = await db.aIConversation.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "aiMessage": {
      const r = await db.aIMessage.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "profile": {
      const r = await db.profile.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    case "achievement": {
      const r = await db.achievement.findUnique({ where: { id }, select: { userId: true } })
      return r?.userId === userId
    }
    default:
      return false
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    const url = new URL(req.url)
    const model = url.searchParams.get("model") as ModelKey
    const id = url.searchParams.get("id")
    const filter = url.searchParams.get("filter") // e.g. "subject:xyz"

    if (!model) {
      // Return a unified snapshot for the dashboard
      const [profile, subjects, assignments, exams, notes, goals, habits, habitLogs, studySessions, focusSessions, achievements, notifications, careerProfile, aiConversations] =
        await Promise.all([
          db.profile.findUnique({ where: { userId } }),
          db.subject.findMany({ where: { userId }, include: { chapters: true, _count: { select: { assignments: true, exams: true, notes: true } } }, orderBy: { createdAt: "asc" } }),
          db.assignment.findMany({ where: { userId }, include: { subject: true }, orderBy: { dueDate: "asc" } }),
          db.exam.findMany({ where: { userId }, include: { subject: true }, orderBy: { examDate: "asc" } }),
          db.note.findMany({ where: { userId }, orderBy: { updatedAt: "desc" } }),
          db.goal.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
          db.habit.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
          db.habitLog.findMany({ where: { userId } }),
          db.studySession.findMany({ where: { userId }, orderBy: { startedAt: "desc" } }),
          db.focusSession.findMany({ where: { userId }, orderBy: { startedAt: "desc" } }),
          db.achievement.findMany({ where: { userId }, orderBy: { unlockedAt: "desc" } }),
          db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } }),
          db.careerProfile.findUnique({ where: { userId } }),
          db.aIConversation.findMany({ where: { userId }, orderBy: { updatedAt: "desc" }, take: 50 }),
        ])

      return NextResponse.json({
        ok: true,
        data: {
          profile,
          subjects,
          assignments,
          exams,
          notes,
          goals,
          habits,
          habitLogs,
          studySessions,
          focusSessions,
          achievements,
          notifications,
          careerProfile,
          aiConversations,
        },
      })
    }

    // Model-specific GET
    const where: Prisma.WhereInput = { userId } as any
    if (filter) {
      const [k, v] = filter.split(":")
      if (k === "subject") (where as any).subjectId = v
      if (k === "conversation") (where as any).conversationId = v
      if (k === "habit") (where as any).habitId = v
    }

    const result = await listByModel(model, where)
    return NextResponse.json({ ok: true, data: result })
  } catch (err) {
    return NextResponse.json({ error: "Failed to load data." }, { status: 500 })
  }
}

async function listByModel(model: ModelKey, where: any) {
  switch (model) {
    case "subject": return db.subject.findMany({ where, include: { chapters: true }, orderBy: { createdAt: "asc" } })
    case "chapter": return db.chapter.findMany({ where, orderBy: { createdAt: "asc" } })
    case "assignment": return db.assignment.findMany({ where, include: { subject: true }, orderBy: { dueDate: "asc" } })
    case "exam": return db.exam.findMany({ where, include: { subject: true }, orderBy: { examDate: "asc" } })
    case "note": return db.note.findMany({ where, orderBy: { updatedAt: "desc" } })
    case "goal": return db.goal.findMany({ where, orderBy: { createdAt: "desc" } })
    case "habit": return db.habit.findMany({ where, orderBy: { createdAt: "desc" } })
    case "habitLog": return db.habitLog.findMany({ where })
    case "studySession": return db.studySession.findMany({ where, orderBy: { startedAt: "desc" } })
    case "focusSession": return db.focusSession.findMany({ where, orderBy: { startedAt: "desc" } })
    case "notification": return db.notification.findMany({ where, orderBy: { createdAt: "desc" } })
    case "careerProfile": return db.careerProfile.findMany({ where })
    case "aiConversation": return db.aIConversation.findMany({ where, orderBy: { updatedAt: "desc" }, include: { messages: true } })
    case "aiMessage": return db.aIMessage.findMany({ where, orderBy: { createdAt: "asc" } })
    case "achievement": return db.achievement.findMany({ where, orderBy: { unlockedAt: "desc" } })
    case "profile": return db.profile.findMany({ where })
    default: return []
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = session.user.id
    const body = await req.json()
    const { model, action, id, data } = body as {
      model: ModelKey
      action: "create" | "update" | "delete"
      id?: string
      data: any
    }

    // For create, enforce userId
    if (action === "create") {
      const created = await createByModel(model, userId, data)
      return NextResponse.json({ ok: true, data: created })
    }

    if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 })

    // For update/delete, verify ownership first (RLS-style)
    const owned = await assertOwnership(model, id, userId)
    if (!owned) {
      return NextResponse.json({ error: "Not found or access denied." }, { status: 404 })
    }

    if (action === "update") {
      const updated = await updateByModel(model, id, data)
      return NextResponse.json({ ok: true, data: updated })
    }
    if (action === "delete") {
      await deleteByModel(model, id)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Operation failed." }, { status: 500 })
  }
}

async function createByModel(model: ModelKey, userId: string, data: any) {
  switch (model) {
    case "subject": return db.subject.create({ data: { ...data, userId } })
    case "chapter": {
      // Verify parent subject belongs to user
      if (data.subjectId) {
        const owner = await getSubjectOwner(data.subjectId)
        if (owner !== userId) throw new Error("Not found or access denied.")
      }
      return db.chapter.create({ data })
    }
    case "assignment": return db.assignment.create({ data: { ...data, userId } })
    case "exam": return db.exam.create({ data: { ...data, userId } })
    case "note": return db.note.create({ data: { ...data, userId } })
    case "goal": return db.goal.create({ data: { ...data, userId } })
    case "habit": return db.habit.create({ data: { ...data, userId } })
    case "habitLog": {
      // Verify habit ownership
      if (data.habitId) {
        const owner = await getHabitOwner(data.habitId)
        if (owner !== userId) throw new Error("Not found or access denied.")
      }
      // Prevent duplicate daily logs
      const date = new Date(data.completedDate)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const existing = await db.habitLog.findUnique({
        where: { habitId_completedDate: { habitId: data.habitId, completedDate: dayStart } },
      })
      if (existing) return existing
      return db.habitLog.create({ data: { ...data, userId, completedDate: dayStart } })
    }
    case "studySession": return db.studySession.create({ data: { ...data, userId } })
    case "focusSession": return db.focusSession.create({ data: { ...data, userId } })
    case "notification": return db.notification.create({ data: { ...data, userId } })
    case "careerProfile": return db.careerProfile.upsert({ where: { userId }, create: { ...data, userId }, update: data })
    case "aiConversation": return db.aIConversation.create({ data: { ...data, userId } })
    case "aiMessage": {
      if (data.conversationId) {
        const owner = await getConversationOwner(data.conversationId)
        if (owner !== userId) throw new Error("Not found or access denied.")
      }
      return db.aIMessage.create({ data: { ...data, userId } })
    }
    case "profile": return db.profile.upsert({ where: { userId }, create: { ...data, userId }, update: data })
    case "achievement": {
      // Deduplicate by type
      const existing = await db.achievement.findUnique({
        where: { userId_achievementType: { userId, achievementType: data.achievementType } },
      })
      if (existing) return existing
      return db.achievement.create({ data: { ...data, userId } })
    }
    default: throw new Error("Unknown model")
  }
}

async function updateByModel(model: ModelKey, id: string, data: any) {
  switch (model) {
    case "subject": return db.subject.update({ where: { id }, data })
    case "chapter": return db.chapter.update({ where: { id }, data })
    case "assignment": return db.assignment.update({ where: { id }, data })
    case "exam": return db.exam.update({ where: { id }, data })
    case "note": return db.note.update({ where: { id }, data })
    case "goal": return db.goal.update({ where: { id }, data })
    case "habit": return db.habit.update({ where: { id }, data })
    case "habitLog": return db.habitLog.update({ where: { id }, data })
    case "studySession": return db.studySession.update({ where: { id }, data })
    case "focusSession": return db.focusSession.update({ where: { id }, data })
    case "notification": return db.notification.update({ where: { id }, data })
    case "careerProfile": return db.careerProfile.update({ where: { id }, data })
    case "aiConversation": return db.aIConversation.update({ where: { id }, data })
    case "aiMessage": return db.aIMessage.update({ where: { id }, data })
    case "profile": return db.profile.update({ where: { id }, data })
    case "achievement": return db.achievement.update({ where: { id }, data })
    default: throw new Error("Unknown model")
  }
}

async function deleteByModel(model: ModelKey, id: string) {
  switch (model) {
    case "subject": return db.subject.delete({ where: { id } })
    case "chapter": return db.chapter.delete({ where: { id } })
    case "assignment": return db.assignment.delete({ where: { id } })
    case "exam": return db.exam.delete({ where: { id } })
    case "note": return db.note.delete({ where: { id } })
    case "goal": return db.goal.delete({ where: { id } })
    case "habit": return db.habit.delete({ where: { id } })
    case "habitLog": return db.habitLog.delete({ where: { id } })
    case "studySession": return db.studySession.delete({ where: { id } })
    case "focusSession": return db.focusSession.delete({ where: { id } })
    case "notification": return db.notification.delete({ where: { id } })
    case "careerProfile": return db.careerProfile.delete({ where: { id } })
    case "aiConversation": return db.aIConversation.delete({ where: { id } })
    case "aiMessage": return db.aIMessage.delete({ where: { id } })
    case "profile": return db.profile.delete({ where: { id } })
    case "achievement": return db.achievement.delete({ where: { id } })
    default: throw new Error("Unknown model")
  }
}
