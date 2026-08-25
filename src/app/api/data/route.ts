import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"
import type { SupabaseClient } from "@supabase/supabase-js"

// ─────────────────────────────────────────────────────────────────────────────
// NEXUS — Unified data API (Supabase backed).
//
// All reads/writes are scoped to the authenticated user. RLS policies on each
// table enforce ownership; we additionally inject user_id on create, verify
// parent ownership for chapters/ai_messages/habit_logs, and deduplicate
// habit_logs (per habit per day) and achievements (per user per type).
//
// The client speaks camelCase; the database speaks snake_case. We convert at
// the boundary so the rest of the app can stay camelCase end-to-end.
// ─────────────────────────────────────────────────────────────────────────────

type ModelKey =
  | "subject"
  | "chapter"
  | "assignment"
  | "exam"
  | "note"
  | "goal"
  | "habit"
  | "habitLog"
  | "studySession"
  | "focusSession"
  | "notification"
  | "careerProfile"
  | "aiConversation"
  | "aiMessage"
  | "profile"
  | "achievement"

const TABLE: Record<ModelKey, string> = {
  subject: "subjects",
  chapter: "chapters",
  assignment: "assignments",
  exam: "exams",
  note: "notes",
  goal: "goals",
  habit: "habits",
  habitLog: "habit_logs",
  studySession: "study_sessions",
  focusSession: "focus_sessions",
  notification: "notifications",
  careerProfile: "career_profiles",
  aiConversation: "ai_conversations",
  aiMessage: "ai_messages",
  profile: "profiles",
  achievement: "achievements",
}

// Fields the client must not be allowed to set directly. They are either
// server-managed or injected by this route.
const SERVER_MANAGED = new Set([
  "id",
  "user_id",
  "created_at",
  "updated_at",
  "unlocked_at",
])

// ─── camelCase <-> snake_case ─────────────────────────────────────────────────

function toCamelKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
}

function toSnakeKey(key: string): string {
  return key.replace(/([A-Z])/g, "_$1").toLowerCase()
}

function toCamel(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(toCamel)
  if (obj instanceof Date) return obj.toISOString()
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(obj as Record<string, unknown>)) {
      out[toCamelKey(k)] = toCamel((obj as Record<string, unknown>)[k])
    }
    return out
  }
  return obj
}

function toSnake(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj
  if (Array.isArray(obj)) return obj.map(toSnake)
  if (obj instanceof Date) return obj.toISOString()
  if (typeof obj === "object") {
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(obj as Record<string, unknown>)) {
      out[toSnakeKey(k)] = toSnake((obj as Record<string, unknown>)[k])
    }
    return out
  }
  return obj
}

/** Convert + strip server-managed fields from a client payload. */
function sanitizeInsert(snakeData: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(snakeData)) {
    if (SERVER_MANAGED.has(k)) continue
    out[k] = v
  }
  return out
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

async function getAuthUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

// ─── Parent ownership verification ────────────────────────────────────────────

async function subjectBelongsToUser(
  supabase: SupabaseClient,
  subjectId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("subjects")
    .select("id")
    .eq("id", subjectId)
    .eq("user_id", userId)
    .maybeSingle()
  return !!data
}

async function conversationBelongsToUser(
  supabase: SupabaseClient,
  conversationId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("ai_conversations")
    .select("id")
    .eq("id", conversationId)
    .eq("user_id", userId)
    .maybeSingle()
  return !!data
}

async function habitBelongsToUser(
  supabase: SupabaseClient,
  habitId: string,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("habits")
    .select("id")
    .eq("id", habitId)
    .eq("user_id", userId)
    .maybeSingle()
  return !!data
}

// ─── Snapshot GET ─────────────────────────────────────────────────────────────

async function fetchSnapshot(supabase: SupabaseClient, userId: string) {
  const [
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
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle()
      .then((r) => r.data),
    supabase
      .from("subjects")
      .select("*, chapters(*)")
      .eq("user_id", userId)
      .order("created_at", { ascending: true })
      .then((r) => r.data ?? []),
    supabase
      .from("assignments")
      .select("*, subject:subjects(*)")
      .eq("user_id", userId)
      .order("due_date", { ascending: true, nullsFirst: false })
      .then((r) => r.data ?? []),
    supabase
      .from("exams")
      .select("*, subject:subjects(*)")
      .eq("user_id", userId)
      .order("exam_date", { ascending: true })
      .then((r) => r.data ?? []),
    supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .then((r) => r.data ?? []),
    supabase
      .from("goals")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then((r) => r.data ?? []),
    supabase
      .from("habits")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then((r) => r.data ?? []),
    supabase
      .from("habit_logs")
      .select("*")
      .eq("user_id", userId)
      .then((r) => r.data ?? []),
    supabase
      .from("study_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .then((r) => r.data ?? []),
    supabase
      .from("focus_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("started_at", { ascending: false })
      .then((r) => r.data ?? []),
    supabase
      .from("achievements")
      .select("*")
      .eq("user_id", userId)
      .order("unlocked_at", { ascending: false })
      .then((r) => r.data ?? []),
    supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then((r) => r.data ?? []),
    supabase
      .from("career_profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle()
      .then((r) => r.data),
    supabase
      .from("ai_conversations")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(50)
      .then((r) => r.data ?? []),
  ])

  return {
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
  }
}

// ─── Per-model list GET ───────────────────────────────────────────────────────

async function listByModel(
  supabase: SupabaseClient,
  model: ModelKey,
  userId: string,
  filter?: string | null,
): Promise<unknown[]> {
  const table = TABLE[model]
  if (!table) return []

  // Determine which user-owned column to scope by. Profiles are keyed by id.
  const userColumn =
    model === "profile" ? "id" : model === "careerProfile" ? "user_id" : "user_id"

  let query = supabase.from(table).select("*")

  // Special-case relations we need to eager-load to match the prior Prisma API.
  if (model === "subject") {
    query = supabase.from(table).select("*, chapters(*)")
  } else if (model === "assignment" || model === "exam") {
    query = supabase.from(table).select("*, subject:subjects(*)")
  } else if (model === "aiConversation") {
    query = supabase.from(table).select("*, ai_messages(*)")
  }

  // Always scope by the authenticated user (defence-in-depth — RLS also enforces).
  query = query.eq(userColumn, userId)

  // Optional secondary filter (e.g. `?filter=subject:123` or `conversation:abc`).
  if (filter) {
    const [k, v] = filter.split(":")
    if (!v) {
      // ignore malformed filter
    } else if (k === "subject") {
      query = query.eq("subject_id", v)
    } else if (k === "conversation") {
      query = query.eq("conversation_id", v)
    } else if (k === "habit") {
      query = query.eq("habit_id", v)
    }
  }

  // Orderings mirror the previous Prisma behaviour for client UX stability.
  switch (model) {
    case "subject":
    case "chapter":
      query = query.order("created_at", { ascending: true })
      break
    case "assignment":
      query = query.order("due_date", { ascending: true, nullsFirst: false })
      break
    case "exam":
      query = query.order("exam_date", { ascending: true })
      break
    case "note":
      query = query.order("updated_at", { ascending: false })
      break
    case "goal":
    case "habit":
      query = query.order("created_at", { ascending: false })
      break
    case "studySession":
    case "focusSession":
      query = query.order("started_at", { ascending: false })
      break
    case "notification":
      query = query.order("created_at", { ascending: false })
      break
    case "aiConversation":
      query = query.order("updated_at", { ascending: false })
      break
    case "achievement":
      query = query.order("unlocked_at", { ascending: false })
      break
    case "aiMessage":
      query = query.order("created_at", { ascending: true })
      break
  }

  const { data, error } = await query
  if (error) {
    console.error(`[data] listByModel(${model}) error:`, error.message)
    return []
  }
  return (data as unknown[]) ?? []
}

// ─── Create ───────────────────────────────────────────────────────────────────

async function createByModel(
  supabase: SupabaseClient,
  model: ModelKey,
  userId: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const snake = sanitizeInsert(
    toSnake(data) as Record<string, unknown>,
  ) as Record<string, unknown>
  const table = TABLE[model]

  switch (model) {
    case "subject":
    case "assignment":
    case "exam":
    case "note":
    case "goal":
    case "habit":
    case "studySession":
    case "focusSession":
    case "notification":
    case "aiConversation": {
      const { data: row, error } = await supabase
        .from(table)
        .insert({ ...snake, user_id: userId })
        .select("*")
        .single()
      if (error) throw new Error(error.message)
      return row as Record<string, unknown>
    }

    case "chapter": {
      // Verify the parent subject belongs to this user before creating.
      if (snake.subject_id) {
        const ok = await subjectBelongsToUser(
          supabase,
          String(snake.subject_id),
          userId,
        )
        if (!ok) throw new Error("Not found or access denied.")
      }
      const { data: row, error } = await supabase
        .from(table)
        .insert(snake)
        .select("*")
        .single()
      if (error) throw new Error(error.message)
      return row as Record<string, unknown>
    }

    case "habitLog": {
      // Verify habit ownership.
      if (snake.habit_id) {
        const ok = await habitBelongsToUser(
          supabase,
          String(snake.habit_id),
          userId,
        )
        if (!ok) throw new Error("Not found or access denied.")
      }
      // Normalise completed_date to start-of-day UTC so the unique
      // (habit_id, completed_date) constraint dedupes per calendar day.
      const raw = snake.completed_date
        ? new Date(String(snake.completed_date))
        : new Date()
      const dayStart = new Date(
        Date.UTC(
          raw.getUTCFullYear(),
          raw.getUTCMonth(),
          raw.getUTCDate(),
        ),
      )
      const iso = dayStart.toISOString()

      // Prevent duplicate daily logs: if one exists, return it as-is.
      const { data: existing } = await supabase
        .from(table)
        .select("*")
        .eq("habit_id", String(snake.habit_id))
        .eq("completed_date", iso)
        .maybeSingle()
      if (existing) return existing as Record<string, unknown>

      const { data: row, error } = await supabase
        .from(table)
        .insert({
          ...snake,
          user_id: userId,
          completed_date: iso,
        })
        .select("*")
        .single()
      if (error) throw new Error(error.message)
      return row as Record<string, unknown>
    }

    case "aiMessage": {
      // Verify parent conversation ownership before inserting.
      if (snake.conversation_id) {
        const ok = await conversationBelongsToUser(
          supabase,
          String(snake.conversation_id),
          userId,
        )
        if (!ok) throw new Error("Not found or access denied.")
      }
      const { data: row, error } = await supabase
        .from(table)
        .insert({ ...snake, user_id: userId })
        .select("*")
        .single()
      if (error) throw new Error(error.message)
      return row as Record<string, unknown>
    }

    case "careerProfile": {
      // One row per user — upsert by user_id.
      const { data: row, error } = await supabase
        .from(table)
        .upsert(
          { ...snake, user_id: userId },
          { onConflict: "user_id" },
        )
        .select("*")
        .single()
      if (error) throw new Error(error.message)
      return row as Record<string, unknown>
    }

    case "profile": {
      // Profiles are keyed by user id; email comes from auth.users.
      const { data: authUser } = await supabase.auth.getUser()
      const email = authUser?.user?.email ?? null
      const { data: row, error } = await supabase
        .from(table)
        .upsert(
          { ...snake, id: userId, email },
          { onConflict: "id" },
        )
        .select("*")
        .single()
      if (error) throw new Error(error.message)
      return row as Record<string, unknown>
    }

    case "achievement": {
      // Deduplicate by (user_id, achievement_type) — return existing if present.
      if (snake.achievement_type) {
        const { data: existing } = await supabase
          .from(table)
          .select("*")
          .eq("user_id", userId)
          .eq("achievement_type", String(snake.achievement_type))
          .maybeSingle()
        if (existing) return existing as Record<string, unknown>
      }
      const { data: row, error } = await supabase
        .from(table)
        .insert({ ...snake, user_id: userId })
        .select("*")
        .single()
      if (error) throw new Error(error.message)
      return row as Record<string, unknown>
    }

    default:
      throw new Error("Unknown model")
  }
}

// ─── Update ───────────────────────────────────────────────────────────────────

async function updateByModel(
  supabase: SupabaseClient,
  model: ModelKey,
  id: string,
  data: Record<string, unknown>,
): Promise<Record<string, unknown> | null> {
  const snake = sanitizeInsert(
    toSnake(data) as Record<string, unknown>,
  ) as Record<string, unknown>
  const table = TABLE[model]

  // RLS enforces ownership: rows not owned by the user are invisible to both
  // the WHERE filter and the RETURNING clause. A null result means "not found
  // or access denied" — the caller maps that to a 404.
  const { data: row, error } = await supabase
    .from(table)
    .update(snake)
    .eq("id", id)
    .select("*")
    .maybeSingle()

  if (error) throw new Error(error.message)
  return (row as Record<string, unknown>) ?? null
}

// ─── Delete ───────────────────────────────────────────────────────────────────

async function deleteByModel(
  supabase: SupabaseClient,
  model: ModelKey,
  id: string,
): Promise<boolean> {
  const table = TABLE[model]
  // RLS ensures only owned rows can be deleted.
  const { error, count } = await supabase
    .from(table)
    .delete({ count: "exact" })
    .eq("id", id)

  if (error) throw new Error(error.message)
  return (count ?? 0) > 0
}

// ─── GET handler ──────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await getAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = user.id

    const url = new URL(req.url)
    const model = url.searchParams.get("model") as ModelKey | null
    const filter = url.searchParams.get("filter")

    // No model → unified snapshot for the dashboard.
    if (!model) {
      const snapshot = await fetchSnapshot(supabase, userId)
      return NextResponse.json({ ok: true, data: toCamel(snapshot) })
    }

    // Per-model filtered list.
    const rows = await listByModel(supabase, model, userId, filter)
    return NextResponse.json({ ok: true, data: toCamel(rows) })
  } catch (err) {
    console.error("[data] GET error:", err)
    return NextResponse.json({ error: "Failed to load data." }, { status: 500 })
  }
}

// ─── POST handler (create/update/delete) ──────────────────────────────────────

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const user = await getAuthUser(supabase)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = user.id

    const body = (await req.json()) as {
      model: ModelKey
      action: "create" | "update" | "delete"
      id?: string
      data?: Record<string, unknown>
    }
    const { model, action, id, data } = body

    if (!model || !action) {
      return NextResponse.json(
        { error: "model and action are required." },
        { status: 400 },
      )
    }

    if (action === "create") {
      const created = await createByModel(supabase, model, userId, data ?? {})
      return NextResponse.json({ ok: true, data: toCamel(created) })
    }

    if (!id) {
      return NextResponse.json(
        { error: "ID required for update/delete." },
        { status: 400 },
      )
    }

    if (action === "update") {
      const updated = await updateByModel(
        supabase,
        model,
        id,
        data ?? {},
      )
      if (!updated) {
        return NextResponse.json(
          { error: "Not found or access denied." },
          { status: 404 },
        )
      }
      return NextResponse.json({ ok: true, data: toCamel(updated) })
    }

    if (action === "delete") {
      const ok = await deleteByModel(supabase, model, id)
      if (!ok) {
        return NextResponse.json(
          { error: "Not found or access denied." },
          { status: 404 },
        )
      }
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Operation failed."
    // Surface ownership / not-found errors as 404, everything else as 500.
    const isAccessError = /not found|access denied/i.test(message)
    return NextResponse.json(
      { error: isAccessError ? "Not found or access denied." : message },
      { status: isAccessError ? 404 : 500 },
    )
  }
}
