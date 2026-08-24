"use client"

import * as React from "react"

export interface Profile {
  id: string
  userId: string
  fullName: string | null
  avatarUrl: string | null
  grade: string | null
  educationLevel: string | null
  stream: string | null
  schoolName: string | null
  studyTargetMinutes: number
  academicGoal: string | null
  onboardingCompleted: boolean
  themePreference: string
}

export interface Subject {
  id: string
  userId: string
  name: string
  color: string
  icon: string | null
  description: string | null
  createdAt: string
  chapters?: Chapter[]
  _count?: { assignments: number; exams: number; notes: number }
}

export interface Chapter {
  id: string
  subjectId: string
  title: string
  description: string | null
  status: "not_started" | "in_progress" | "completed"
  progress: number
}

export interface Assignment {
  id: string
  userId: string
  subjectId: string | null
  subject?: Subject | null
  title: string
  description: string | null
  priority: "low" | "medium" | "high" | "urgent"
  status: "pending" | "in_progress" | "completed"
  dueDate: string | null
  estimatedMinutes: number | null
  createdAt: string
  completedAt: string | null
}

export interface Exam {
  id: string
  userId: string
  subjectId: string | null
  subject?: Subject | null
  title: string
  examDate: string
  syllabus: string | null
  preparationProgress: number
  createdAt: string
}

export interface Note {
  id: string
  userId: string
  subjectId: string | null
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Goal {
  id: string
  userId: string
  title: string
  description: string | null
  targetDate: string | null
  progress: number
  status: "on_track" | "at_risk" | "completed"
  createdAt: string
  updatedAt: string
}

export interface Habit {
  id: string
  userId: string
  name: string
  icon: string | null
  frequency: string
  color: string
  createdAt: string
}

export interface HabitLog {
  id: string
  habitId: string
  userId: string
  completedDate: string
}

export interface StudySession {
  id: string
  userId: string
  subjectId: string | null
  durationMinutes: number
  startedAt: string
  completedAt: string | null
  sessionType: string
}

export interface FocusSession {
  id: string
  userId: string
  durationMinutes: number
  status: string
  mode: string
  startedAt: string
  completedAt: string | null
}

export interface Achievement {
  id: string
  userId: string
  achievementType: string
  title: string
  description: string | null
  unlockedAt: string
}

export interface AppNotification {
  id: string
  userId: string
  title: string
  message: string
  type: string
  read: boolean
  createdAt: string
}

export interface CareerProfile {
  id: string
  userId: string
  interests: string
  skills: string
  strengths: string
  preferredFields: string
  updatedAt: string
}

export interface AIConversation {
  id: string
  userId: string
  title: string
  subjectId: string | null
  createdAt: string
  updatedAt: string
  messages?: AIMessage[]
}

export interface AIMessage {
  id: string
  conversationId: string
  userId: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export interface Snapshot {
  profile: Profile | null
  subjects: Subject[]
  assignments: Assignment[]
  exams: Exam[]
  notes: Note[]
  goals: Goal[]
  habits: Habit[]
  habitLogs: HabitLog[]
  studySessions: StudySession[]
  focusSessions: FocusSession[]
  achievements: Achievement[]
  notifications: AppNotification[]
  careerProfile: CareerProfile | null
  aiConversations: AIConversation[]
}

interface DataContextValue {
  snapshot: Snapshot | null
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  mutate: (mutation: () => Promise<any>) => Promise<any>
}

const DataContext = React.createContext<DataContextValue | null>(null)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [snapshot, setSnapshot] = React.useState<Snapshot | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const refresh = React.useCallback(async () => {
    try {
      const r = await fetch("/api/data", { cache: "no-store" })
      if (!r.ok) throw new Error("Failed to load data")
      const json = await r.json()
      setSnapshot(json.data)
      setError(null)
    } catch (e: any) {
      setError(e?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    refresh()
  }, [refresh])

  const mutate = React.useCallback(
    async (mutation: () => Promise<any>) => {
      try {
        const result = await mutation()
        await refresh()
        return result
      } catch (e: any) {
        setError(e?.message || "Operation failed")
        throw e
      }
    },
    [refresh],
  )

  return (
    <DataContext.Provider value={{ snapshot, loading, error, refresh, mutate }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = React.useContext(DataContext)
  if (!ctx) throw new Error("useData must be used within DataProvider")
  return ctx
}

// ─── Mutation helpers ─────────────────────────────────────────────────────────

export async function createResource(model: string, data: any) {
  const r = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, action: "create", data }),
  })
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(e?.error || "We couldn't save that right now.")
  }
  const json = await r.json()
  return json.data
}

export async function updateResource(model: string, id: string, data: any) {
  const r = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, action: "update", id, data }),
  })
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(e?.error || "We couldn't update that right now.")
  }
  const json = await r.json()
  return json.data
}

export async function deleteResource(model: string, id: string) {
  const r = await fetch("/api/data", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model, action: "delete", id }),
  })
  if (!r.ok) {
    const e = await r.json().catch(() => ({}))
    throw new Error(e?.error || "We couldn't delete that right now.")
  }
  return true
}
