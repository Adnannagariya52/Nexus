import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import ZAI from "z-ai-web-dev-sdk"

const SYSTEM_PROMPT = `You are NEXUS AI Tutor, an intelligent educational assistant.

Your purpose is to help students learn and understand.

Adapt explanations to the student's education level and selected subject.

Do not blindly provide answers when teaching is more useful.

Explain concepts clearly.

Use step-by-step explanations when appropriate.

Use examples.

For mathematics: Show calculations clearly.
For physics: Explain formulas and variables.
For chemistry: Explain concepts and reactions.
For coding: Explain logic before giving code.

If uncertain: Say that you are uncertain.

Do not fabricate facts, citations, sources or textbook references.

Be helpful but concise unless detailed explanation is requested.

Format responses using Markdown (headings, bold, italics, lists, code blocks) when it improves clarity. Use LaTeX-style math notation (e.g. \\( F = ma \\)) when helpful.`

const SUBJECT_CONTEXT: Record<string, string> = {
  general: "General academic context. Provide broad, accessible explanations.",
  mathematics: "Mathematics. Show step-by-step calculations. Use clear notation.",
  physics: "Physics. Explain formulas, variables, and physical intuition.",
  chemistry: "Chemistry. Explain reactions, mechanisms, and molecular behavior.",
  biology: "Biology. Explain biological processes and structures clearly.",
  "computer science": "Computer Science. Explain logic before showing code. Use clean code samples.",
}

// Simple in-memory rate limiter
const rateMap = new Map<string, { count: number; windowStart: number }>()
const WINDOW_MS = 60 * 1000 // 1 min
const MAX_PER_MIN = 12

function checkRate(userId: string): { ok: boolean; message?: string } {
  const now = Date.now()
  const entry = rateMap.get(userId)
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateMap.set(userId, { count: 1, windowStart: now })
    return { ok: true }
  }
  if (entry.count >= MAX_PER_MIN) {
    return {
      ok: false,
      message: "You're asking questions fast. Please wait a moment and try again.",
    }
  }
  entry.count += 1
  return { ok: true }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 })
    }

    const rate = checkRate(session.user.id)
    if (!rate.ok) {
      return NextResponse.json({ error: rate.message }, { status: 429 })
    }

    const body = await req.json()
    const { conversationId, message, subject, quickAction, history } = body as {
      conversationId?: string
      message: string
      subject?: string
      quickAction?: string
      history?: { role: string; content: string }[]
    }

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is empty." }, { status: 400 })
    }

    // Get or create conversation
    let conversation = conversationId
      ? await db.aIConversation.findFirst({
          where: { id: conversationId, userId: session.user.id },
        })
      : null

    if (!conversation) {
      const title = message.slice(0, 50) + (message.length > 50 ? "..." : "")
      conversation = await db.aIConversation.create({
        data: {
          userId: session.user.id,
          title,
        },
      })
    }

    // Save the user message
    await db.aIMessage.create({
      data: {
        conversationId: conversation.id,
        userId: session.user.id,
        role: "user",
        content: message,
      },
    })

    // Build context
    const profile = await db.profile.findUnique({ where: { userId: session.user.id } })
    const subjectKey = (subject || "general").toLowerCase()
    const subjectContext = SUBJECT_CONTEXT[subjectKey] ?? SUBJECT_CONTEXT.general
    const grade = profile?.grade || "secondary"
    const eduLevel = profile?.educationLevel || "high school"

    const quickActionPrefix: Record<string, string> = {
      explain: "Please explain the following in a clear, structured way:",
      solve: "Please solve the following step-by-step, showing every stage of the work:",
      example: "Please give a concrete example illustrating the following concept:",
      quiz: "Please quiz me on the following topic with 3 short questions, then provide the answers after I respond:",
      summarize: "Please summarize the following concisely:",
      simplify: "Please simplify the following so a beginner can understand it easily:",
      check: "Please check my answer below. Tell me if it is correct, and if not, explain where I went wrong:",
    }
    const finalUserContent =
      (quickAction && quickActionPrefix[quickAction]
        ? `${quickActionPrefix[quickAction]}\n\n${message}`
        : message)

    const messages = [
      {
        role: "system" as const,
        content: `${SYSTEM_PROMPT}\n\nStudent context: education level = ${eduLevel}, grade = ${grade}. Subject context: ${subjectContext}`,
      },
      ...(history ?? []).slice(-10).map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
      { role: "user" as const, content: finalUserContent },
    ]

    // Call Gemini via ZAI SDK
    let assistantContent: string
    try {
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages,
        temperature: 0.4,
        max_tokens: 1200,
      })
      assistantContent =
        completion?.choices?.[0]?.message?.content ||
        "I couldn't generate a response. Please try again."
    } catch (err) {
      assistantContent =
        "AI Tutor is temporarily unavailable. Please try again in a moment."
    }

    // Save the assistant reply
    await db.aIMessage.create({
      data: {
        conversationId: conversation.id,
        userId: session.user.id,
        role: "assistant",
        content: assistantContent,
      },
    })

    // Update conversation timestamp
    await db.aIConversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      ok: true,
      conversationId: conversation.id,
      reply: assistantContent,
    })
  } catch (err) {
    return NextResponse.json(
      { error: "AI Tutor is temporarily unavailable. Please try again." },
      { status: 500 },
    )
  }
}
