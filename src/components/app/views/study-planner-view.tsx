"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/store"
import { useData, createResource } from "@/lib/data-client"
import {
  NexusCard,
  NexusBadge,
  NexusButton,
  NexusEmptyState,
  NexusViewHeader,
  NexusProgressBar,
} from "@/components/nexus/primitives"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  CalendarClock,
  Plus,
  Clock,
  AlertCircle,
  CheckCircle2,
  Target,
  Timer,
  BookOpen,
  Calendar,
  Zap,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function StudyPlannerView() {
  const navigate = useApp((s) => s.navigate)
  const { snapshot, mutate } = useData()
  const subjects = snapshot?.subjects || []
  const assignments = snapshot?.assignments || []
  const exams = snapshot?.exams || []
  const studySessions = snapshot?.studySessions || []

  const [duration, setDuration] = React.useState(30)
  const [subjectId, setSubjectId] = React.useState("")

  async function logSession() {
    try {
      await mutate(() =>
        createResource("studySession", {
          subjectId: subjectId || null,
          durationMinutes: duration,
          startedAt: new Date().toISOString(),
          completedAt: new Date().toISOString(),
          sessionType: "manual",
        }),
      )
      toast.success("Study session logged")
      setSubjectId("")
    } catch {
      toast.error("Failed to log session")
    }
  }

  // Weekly view (last 7 days)
  const today = new Date()
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (6 - i))
    return d
  })

  const weekSessions = week.map((day) => {
    const sessions = studySessions.filter(
      (s) => new Date(s.startedAt).toDateString() === day.toDateString(),
    )
    return {
      day,
      sessions,
      minutes: sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
    }
  })

  // Upcoming exams priority
  const upcomingExams = exams
    .filter((e) => new Date(e.examDate) >= new Date())
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 3)

  // Today's priority tasks
  const todayTasks = assignments.filter(
    (a) =>
      a.status !== "completed" &&
      a.dueDate &&
      new Date(a.dueDate).toDateString() === today.toDateString(),
  )

  const subjectProgress = subjects.map((s) => {
    const chapters = s.chapters || []
    const completed = chapters.filter((c) => c.status === "completed").length
    return { subject: s, pct: chapters.length ? (completed / chapters.length) * 100 : 0 }
  })

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Study Planner"
        subtitle="Plan your sessions and prioritize what to study next."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Log session */}
        <NexusCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="h-4 w-4 text-iris" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Log session
            </h3>
          </div>
          <div className="space-y-3">
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-4 gap-1.5">
              {[15, 30, 60, 90].map((m) => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={cn(
                    "h-9 rounded-lg text-xs font-medium transition-colors",
                    duration === m
                      ? "bg-iris text-white"
                      : "bg-card border border-border hover:bg-accent",
                  )}
                >
                  {m}m
                </button>
              ))}
            </div>
            <NexusButton className="w-full" onClick={logSession}>
              <Plus className="h-4 w-4 mr-1.5" />
              Log {duration} min study
            </NexusButton>
            <div className="text-[10px] text-muted-foreground">
              For a focused Pomodoro experience, use{" "}
              <button onClick={() => navigate("focus")} className="text-iris hover:underline">
                Focus Mode
              </button>
              .
            </div>
          </div>
        </NexusCard>

        {/* Today's priorities */}
        <NexusCard className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-lime" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Today's Priorities
              </h3>
            </div>
            <NexusBadge color="blue">Auto-suggested</NexusBadge>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                Tasks due today
              </div>
              {todayTasks.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No tasks due today
                </div>
              ) : (
                <div className="space-y-2">
                  {todayTasks.slice(0, 4).map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs truncate flex-1">{a.title}</span>
                      <NexusBadge color={(a.priority as any) || "muted"}>
                        {a.priority}
                      </NexusBadge>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-2">
                Upcoming exam priorities
              </div>
              {upcomingExams.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  No upcoming exams
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingExams.map((e) => {
                    const days = Math.max(
                      0,
                      Math.ceil((new Date(e.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                    )
                    return (
                      <div
                        key={e.id}
                        className="flex items-center gap-2 rounded-lg border border-border bg-card p-2.5"
                      >
                        <CalendarClock className="h-3.5 w-3.5 text-[#FFB020]" />
                        <span className="text-xs truncate flex-1">{e.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {days}d left
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </NexusCard>
      </div>

      {/* Weekly planner */}
      <NexusCard className="p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            This Week's Planner
          </h3>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekSessions.map((d, i) => {
            const isToday = d.day.toDateString() === today.toDateString()
            const isActive = d.minutes > 0
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={cn(
                  "rounded-xl border p-3 text-center min-h-[110px] flex flex-col",
                  isToday
                    ? "border-[#6C63FF] bg-iris/[0.04]"
                    : "border-border bg-card",
                )}
              >
                <div
                  className={cn(
                    "text-[10px] uppercase tracking-wide font-medium",
                    isToday ? "text-iris" : "text-muted-foreground",
                  )}
                >
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.day.getDay()]}
                </div>
                <div className="text-sm font-semibold mt-0.5">{d.day.getDate()}</div>
                <div className="flex-1" />
                {isActive ? (
                  <div>
                    <div className="text-base font-semibold" style={{ color: "#6C63FF" }}>
                      {Math.floor(d.minutes / 60)}h
                    </div>
                    <div className="text-[9px] text-muted-foreground">
                      {d.minutes % 60}m
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] text-muted-foreground">—</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </NexusCard>

      {/* Subject progress overview */}
      {subjectProgress.length > 0 && (
        <NexusCard className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-4 w-4 text-iris-dark" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Subject Progress
            </h3>
          </div>
          <div className="space-y-3">
            {subjectProgress.map(({ subject, pct }) => (
              <div key={subject.id}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium">{subject.name}</span>
                  <span className="text-muted-foreground">{Math.round(pct)}%</span>
                </div>
                <NexusProgressBar progress={pct} color={subject.color} />
              </div>
            ))}
          </div>
        </NexusCard>
      )}
    </div>
  )
}
