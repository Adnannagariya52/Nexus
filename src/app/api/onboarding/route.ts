import { NextResponse } from "next/server"
import { createSupabaseServerClient } from "@/lib/supabase-server"

// ─────────────────────────────────────────────────────────────────────────────
// NEXUS — Onboarding endpoint.
//
// Upserts the user's profile row with the data collected during onboarding
// and flips onboarding_completed to true. The profiles table is keyed by the
// authenticated user's id (= auth.users.id), so we upsert by `id` and let RLS
// enforce that only the owner can touch their own row.
//
// Client speaks camelCase; database speaks snake_case.
// ─────────────────────────────────────────────────────────────────────────────

function toSnakeKey(key: string): string {
  return key.replace(/([A-Z])/g, "_$1").toLowerCase()
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

function toCamelKey(key: string): string {
  return key.replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase())
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

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServerClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const userId = user.id

    const body = (await req.json()) as {
      fullName?: string | null
      grade?: string | null
      educationLevel?: string | null
      stream?: string | null
      schoolName?: string | null
      studyTargetMinutes?: number | null
      academicGoal?: string | null
    }

    // Build the snake_case payload, picking only onboarding-related fields.
    const payload = toSnake({
      fullName: body.fullName ?? null,
      grade: body.grade ?? null,
      educationLevel: body.educationLevel ?? null,
      stream: body.stream ?? null,
      schoolName: body.schoolName ?? null,
      studyTargetMinutes:
        typeof body.studyTargetMinutes === "number"
          ? body.studyTargetMinutes
          : 60,
      academicGoal: body.academicGoal ?? null,
      onboardingCompleted: true,
    }) as Record<string, unknown>

    // Keep the email in sync with the auth account on upsert.
    const email = user.email ?? null

    const { data: profile, error } = await supabase
      .from("profiles")
      .upsert(
        {
          id: userId, // PK = auth.users.id
          email,
          ...payload,
        },
        { onConflict: "id" },
      )
      .select("*")
      .single()

    if (error) {
      console.error("[onboarding] upsert error:", error.message)
      return NextResponse.json(
        { error: "Failed to save profile." },
        { status: 500 },
      )
    }

    return NextResponse.json({ ok: true, profile: toCamel(profile) })
  } catch (err) {
    console.error("[onboarding] route error:", err)
    return NextResponse.json(
      { error: "Failed to save profile." },
      { status: 500 },
    )
  }
}
