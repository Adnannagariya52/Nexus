import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import ZAI from "z-ai-web-dev-sdk"

// ─────────────────────────────────────────────────────────────────────────────
// NEXUS — AI Tutor endpoint.
//
// Verifies the user is signed in, applies a simple per-user rate limit
// (12 requests / minute), gets-or-creates an AI conversation, stores the
// user's message, asks Gemini (via the ZAI SDK) for an educational reply,
// stores the reply, and returns it. Errors are handled gracefully — the UI
// always gets a structured response, and a Gemini outage returns a friendly
// fallback message instead of a 500.
//
// Client speaks camelCase; database speaks snake_case.
// ─────────────────────────────────────────────────────────────────────────────

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
  "computer science":
    "Computer Science. Explain logic before showing code. Use clean code samples.",
}

const QUICK_ACTION_PREFIX: Record<string, string> = {
  explain: "Please explain the following in a clear, structured way:",
  solve: "Please solve the following step-by-step, showing every stage of the work:",
  example: "Please give a concrete example illustrating the following concept:",
  quiz: "Please quiz me on the following topic with 3 short questions, then provide the answers after I respond:",
  summarize: "Please summarize the following concisely:",
  simplify: "Please simplify the following so a beginner can understand it easily:",
  check: "Please check my answer below. Tell me if it is correct, and if not, explain where I went wrong:",
}

// ─── Rate limiter ────────────────────────────────────────────────────────────

const WINDOW_MS = 60 * 1000
const MAX_PER_MIN = 12
const rateMap = new Map<string, { count: number; windowStart: number }>()

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
      message:
        "You're asking questions fast. Please wait a moment and try again.",
    }
  }
  entry.count += 1
  return { ok: true }
}

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      )
    }
    const userId = user.id

    // Rate limit
    const rate = checkRate(userId)
    if (!rate.ok) {
      return NextResponse.json({ error: rate.message }, { status: 429 })
    }

    const body = (await req.json()) as {
      conversationId?: string
      message: string
      subject?: string
      quickAction?: string
      history?: { role: string; content: string }[]
    }

    const message = body.message?.trim?.() ?? ""
    if (!message) {
      return NextResponse.json({ error: "Message is empty." }, { status: 400 })
    }

    // Get or create conversation.
    let conversationId = body.conversationId ?? null
    if (conversationId) {
      const { data: existing } = await supabase
        .from("ai_conversations")
        .select("id")
        .eq("id", conversationId)
        .eq("user_id", userId)
        .maybeSingle()
      if (!existing) conversationId = null // stale/foreign id → make a new one
    }
    if (!conversationId) {
      const title =
        message.length > 50 ? message.slice(0, 50) + "..." : message
      const { data: conv, error: convErr } = await supabase
        .from("ai_conversations")
        .insert({ user_id: userId, title })
        .select("id")
        .single()
      if (convErr || !conv) {
        console.error("[ai-tutor] create conversation error:", convErr?.message)
        return NextResponse.json(
          { error: "Could not start a conversation. Please try again." },
          { status: 500 },
        )
      }
      conversationId = conv.id
    }

    // Persist the user message.
    const { error: userMsgErr } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role: "user",
        content: message,
      })
    if (userMsgErr) {
      console.error("[ai-tutor] save user message error:", userMsgErr.message)
      // Non-fatal — we can still attempt to call the model.
    }

    // Build context: profile + subject context for the system prompt.
    const { data: profile } = await supabase
      .from("profiles")
      .select("grade, education_level")
      .eq("id", userId)
      .maybeSingle()

    const subjectKey = (body.subject || "general").toLowerCase()
    const subjectContext = SUBJECT_CONTEXT[subjectKey] ?? SUBJECT_CONTEXT.general
    const grade = profile?.grade || "secondary"
    const eduLevel = profile?.education_level || "high school"

    const finalUserContent =
      body.quickAction && QUICK_ACTION_PREFIX[body.quickAction]
        ? `${QUICK_ACTION_PREFIX[body.quickAction]}\n\n${message}`
        : message

    const messages = [
      {
        role: "system" as const,
        content: `${SYSTEM_PROMPT}\n\nStudent context: education level = ${eduLevel}, grade = ${grade}. Subject context: ${subjectContext}`,
      },
      ...(body.history ?? [])
        .slice(-10)
        .filter((m) => m && (m.role === "user" || m.role === "assistant"))
        .map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
      { role: "user" as const, content: finalUserContent },
    ]

    // Call Gemini via ZAI SDK.
    let assistantContent: string
    try {
      const zai = await ZAI.create()
      const completion = await zai.chat.completions.create({
        messages,
        temperature: 0.4,
        max_tokens: 1200,
      })
      assistantContent =
        completion?.choices?.[0]?.message?.content?.trim() ||
        "I couldn't generate a response. Please try again."
    } catch (err) {
      console.error(
        "[ai-tutor] ZAI error:",
        err instanceof Error ? err.message : err,
      )
      // Friendly fallback so the UI flow stays intact.
      assistantContent =
        "I'm having trouble connecting to the AI service right now. Please try again in a moment — your conversation will still be saved." +
        (err instanceof Error && err.message
          ? `\n\n*Debug: ${err.message.slice(0, 200)}*`
          : "")
    }

    // Persist the assistant reply.
    const { error: aiMsgErr } = await supabase
      .from("ai_messages")
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        role: "assistant",
        content: assistantContent,
      })
    if (aiMsgErr) {
      console.error("[ai-tutor] save assistant message error:", aiMsgErr.message)
    }

    // Bump the conversation's updated_at.
    const { error: bumpErr } = await supabase
      .from("ai_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId)
    if (bumpErr) {
      console.error("[ai-tutor] bump conversation error:", bumpErr.message)
    }

    return NextResponse.json({
      ok: true,
      conversationId,
      reply: assistantContent,
    })
  } catch (err) {
    console.error(
      "[ai-tutor] route error:",
      err instanceof Error ? err.message : err,
      err instanceof Error ? err.stack : "",
    )
    return NextResponse.json(
      { error: "AI Tutor is temporarily unavailable. Please try again." },
      { status: 500 },
    )
  }
}
