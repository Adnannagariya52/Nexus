"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/store"
import { useData, createResource, updateResource } from "@/lib/data-client"
import {
  NexusCard,
  NexusStatCard,
  NexusProgressRing,
  NexusBadge,
  NexusEmptyState,
  NexusViewHeader,
  NexusButton,
  NexusProgressBar,
} from "@/components/nexus/primitives"
import {
  Flame,
  Target,
  Timer,
  Brain,
  CalendarClock,
  CheckCircle2,
  TrendingUp,
  Zap,
  ArrowRight,
  Sparkles,
  Award,
  PlayCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

export function DashboardView() {
  const navigate = useApp((s) => s.navigate)
  const { snapshot, mutate } = useData()

  const profile = snapshot?.profile
  const assignments = snapshot?.assignments || []
  const exams = snapshot?.exams || []
  const subjects = snapshot?.subjects || []
  const focusSessions = snapshot?.focusSessions || []
  const studySessions = snapshot?.studySessions || []
  const habits = snapshot?.habits || []
  const habitLogs = snapshot?.habitLogs || []
  const achievements = snapshot?.achievements || []
  const goals = snapshot?.goals || []

  // ─── Derived metrics ──────────────────────────────────────────────────────
  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfWeek.getDate() - 6)

  const todaysFocus = focusSessions.filter(
    (f) => new Date(f.startedAt) >= startOfDay && f.status === "completed",
  )
  const todaysStudyMin = todaysFocus.reduce((sum, f) => sum + f.durationMinutes, 0)
  const weekFocus = focusSessions.filter((f) => new Date(f.startedAt) >= startOfWeek)
  const weekMin = weekFocus.reduce((sum, f) => sum + f.durationMinutes, 0)

  // Streak calculation (consecutive days with at least one focus session)
  const streak = React.useMemo(() => {
    const days = new Set<string>()
    focusSessions.forEach((f) => {
      if (f.status !== "completed") return
      const d = new Date(f.startedAt)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      days.add(key)
    })
    let s = 0
    const d = new Date()
    while (true) {
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (days.has(key)) {
        s++
        d.setDate(d.getDate() - 1)
      } else break
    }
    return s
  }, [focusSessions])

  // Focus score (0-100): based on today's study / target
  const target = profile?.studyTargetMinutes || 60
  const focusScore = Math.min(100, Math.round((todaysStudyMin / target) * 100))

  // Today's tasks
  const todayKey = today.toDateString()
  const todaysTasks = assignments.filter((a) => {
    if (a.status === "completed") return false
    if (!a.dueDate) return false
    return new Date(a.dueDate).toDateString() === todayKey
  })
  const overdueTasks = assignments.filter(
    (a) => a.status !== "completed" && a.dueDate && new Date(a.dueDate) < startOfDay,
  )
  const upcoming = [...todaysTasks, ...overdueTasks].slice(0, 5)

  // Upcoming exams
  const upcomingExams = exams
    .filter((e) => new Date(e.examDate) >= new Date())
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
    .slice(0, 3)

  // Today's mission: pick most urgent assignment or nearest exam
  const nextExam = upcomingExams[0]
  const urgentAssignment = upcoming[0]
  const weakestSubject = subjects
    .map((s) => {
      const chapters = s.chapters || []
      const completed = chapters.filter((c) => c.status === "completed").length
      const pct = chapters.length ? (completed / chapters.length) * 100 : 0
      return { subject: s, pct }
    })
    .sort((a, b) => a.pct - b.pct)[0]

  const firstName = (profile?.fullName || "Student").split(" ")[0]
  const greeting = (() => {
    const h = today.getHours()
    return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
  })()

  async function completeAssignment(id: string) {
    try {
      await mutate(() =>
        updateResource("assignment", id, { status: "completed", completedAt: new Date().toISOString() }),
      )
      toast.success("Assignment completed!")
    } catch {
      toast.error("We couldn't update that right now.")
    }
  }

  // Habit check today
  const todayHabitLogs = habitLogs.filter((l) => new Date(l.completedDate).toDateString() === todayKey)
  const habitCompletionRate = habits.length
    ? Math.round((todayHabitLogs.length / habits.length) * 100)
    : 0

  // Weekly activity for the mini-chart
  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek)
    day.setDate(day.getDate() + i)
    const key = day.toDateString()
    const min = focusSessions
      .filter((f) => f.status === "completed" && new Date(f.startedAt).toDateString() === key)
      .reduce((sum, f) => sum + f.durationMinutes, 0)
    return { day: ["S", "M", "T", "W", "T", "F", "S"][day.getDay()], min }
  })
  const maxMin = Math.max(60, ...weeklyActivity.map((d) => d.min))

  if (!snapshot) return null

  return (
    <div className="space-y-6 pb-8">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-muted-foreground"
          >
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="text-2xl sm:text-3xl font-semibold tracking-tight mt-1"
          >
            {greeting}, {firstName}.
          </motion.h1>
        </div>
        <NexusButton
          variant="default"
          size="default"
          onClick={() => navigate("focus")}
          className="gap-1.5"
        >
          <PlayCircle className="h-4 w-4" />
          Start focus session
        </NexusButton>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <NexusStatCard
          label="Focus Score"
          value={`${focusScore}%`}
          sub={`Target: ${target}m`}
          color="#5B8CFF"
          icon={<Zap className="h-4 w-4" />}
        />
        <NexusStatCard
          label="Streak"
          value={`${streak}d`}
          sub={streak > 0 ? "Keep it going!" : "Start today"}
          color="#F59E0B"
          icon={<Flame className="h-4 w-4" />}
        />
        <NexusStatCard
          label="Today"
          value={`${Math.floor(todaysStudyMin / 60)}h ${todaysStudyMin % 60}m`}
          sub="Focused"
          color="#22C55E"
          icon={<Timer className="h-4 w-4" />}
        />
        <NexusStatCard
          label="Week"
          value={`${Math.floor(weekMin / 60)}h ${weekMin % 60}m`}
          sub="Last 7 days"
          color="#8B5CF6"
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's mission - dominant */}
        <NexusCard className="lg:col-span-2 p-6 relative overflow-hidden">
          <div className="absolute -top-12 -right-12 h-32 w-32 bg-[#5B8CFF]/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#5B8CFF]" />
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Today's Mission
                </h3>
              </div>
              <NexusBadge color="blue">Auto-prioritized</NexusBadge>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              {/* Urgent assignment */}
              <button
                onClick={() => navigate("assignments")}
                className="text-left rounded-xl border border-border bg-card p-4 hover:border-[#5B8CFF]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <NexusBadge color={urgentAssignment ? (urgentAssignment.priority as any) || "amber" : "muted"}>
                    {urgentAssignment?.priority?.toUpperCase() || "No priority"}
                  </NexusBadge>
                  <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">
                  {urgentAssignment?.title || "No urgent tasks"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {urgentAssignment?.dueDate
                    ? `Due ${new Date(urgentAssignment.dueDate).toLocaleDateString()}`
                    : "Enjoy the calm"}
                </div>
              </button>

              {/* Next exam */}
              <button
                onClick={() => navigate("exams")}
                className="text-left rounded-xl border border-border bg-card p-4 hover:border-[#F59E0B]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <NexusBadge color={nextExam ? "amber" : "muted"}>
                    {nextExam ? "Upcoming exam" : "No exams"}
                  </NexusBadge>
                  <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">
                  {nextExam?.title || "No exams scheduled"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {nextExam
                    ? `In ${Math.max(0, Math.ceil((new Date(nextExam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days`
                    : "Add one to prepare"}
                </div>
              </button>

              {/* Weakest subject */}
              <button
                onClick={() => navigate("subjects")}
                className="text-left rounded-xl border border-border bg-card p-4 hover:border-[#8B5CF6]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <NexusBadge color="violet">Focus area</NexusBadge>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="text-sm font-medium">
                  {weakestSubject?.subject.name || "No subjects yet"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {weakestSubject
                    ? `${Math.round(weakestSubject.pct)}% complete`
                    : "Add your first subject"}
                </div>
              </button>

              {/* Recommended focus session */}
              <button
                onClick={() => navigate("focus")}
                className="text-left rounded-xl border border-border bg-gradient-to-br from-[#5B8CFF]/[0.08] to-[#8B5CF6]/[0.05] p-4 hover:border-[#5B8CFF]/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <NexusBadge color="cyan">Recommended</NexusBadge>
                  <PlayCircle className="h-4 w-4 text-[#5B8CFF]" />
                </div>
                <div className="text-sm font-medium">25 min focus session</div>
                <div className="text-xs text-muted-foreground mt-1">
                  Build momentum with Pomodoro
                </div>
              </button>
            </div>
          </div>
        </NexusCard>

        {/* Weekly activity */}
        <NexusCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Weekly Activity
            </h3>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex items-end justify-between gap-2 h-32">
            {weeklyActivity.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="flex-1 w-full flex items-end">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.min / maxMin) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "w-full rounded-t-md",
                      i === 6
                        ? "bg-gradient-to-t from-[#5B8CFF] to-[#8B5CF6]"
                        : "bg-white/10",
                    )}
                    style={{ minHeight: "4px" }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground">{d.day}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="text-xs text-muted-foreground">Total this week</div>
            <div className="text-xl font-semibold mt-0.5">
              {Math.floor(weekMin / 60)}h {weekMin % 60}m
            </div>
          </div>
        </NexusCard>
      </div>

      {/* Today's tasks + upcoming exams */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NexusCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Today's Tasks
            </h3>
            <button
              onClick={() => navigate("assignments")}
              className="text-xs text-[#5B8CFF] hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <NexusEmptyState
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Nothing waiting for you."
              description="No tasks due today. Time to plan ahead."
              action={
                <NexusButton size="sm" onClick={() => navigate("assignments")}>
                  Create assignment
                </NexusButton>
              }
            />
          ) : (
            <div className="space-y-2">
              {upcoming.map((a) => {
                const overdue =
                  a.dueDate && new Date(a.dueDate) < startOfDay
                return (
                  <div
                    key={a.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <button
                      onClick={() => completeAssignment(a.id)}
                      className="h-5 w-5 rounded-full border-2 border-border hover:border-[#22C55E] flex items-center justify-center transition-colors"
                      aria-label="Mark complete"
                    >
                      <CheckCircle2 className="h-3 w-3 opacity-0 hover:opacity-100 text-[#22C55E]" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{a.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {a.subject?.name || "No subject"}
                      </div>
                    </div>
                    <NexusBadge color={overdue ? "red" : (a.priority as any) || "muted"}>
                      {overdue ? "Overdue" : a.priority}
                    </NexusBadge>
                  </div>
                )
              })}
            </div>
          )}
        </NexusCard>

        <NexusCard className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Upcoming Exams
            </h3>
            <button
              onClick={() => navigate("exams")}
              className="text-xs text-[#5B8CFF] hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {upcomingExams.length === 0 ? (
            <NexusEmptyState
              icon={<CalendarClock className="h-5 w-5" />}
              title="No exams coming up."
              description="Add your next exam to start preparing."
              action={<NexusButton size="sm" onClick={() => navigate("exams")}>Add exam</NexusButton>}
            />
          ) : (
            <div className="space-y-2">
              {upcomingExams.map((e) => {
                const days = Math.max(
                  0,
                  Math.ceil((new Date(e.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                )
                const urgency = days <= 3 ? "red" : days <= 7 ? "amber" : "muted"
                return (
                  <div
                    key={e.id}
                    className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
                  >
                    <div className="h-10 w-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center text-[#F59E0B]">
                      <CalendarClock className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{e.title}</div>
                      <div className="text-[10px] text-muted-foreground">
                        {e.subject?.name || "No subject"} •{" "}
                        {new Date(e.examDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-base font-semibold">{days}d</div>
                      <div className="text-[10px] text-muted-foreground">left</div>
                    </div>
                    <NexusProgressRing
                      progress={e.preparationProgress}
                      size={32}
                      stroke={3}
                      label={<span className="text-[9px]">{e.preparationProgress}%</span>}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </NexusCard>
      </div>

      {/* Subjects + goals + habits + AI tutor shortcut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Subject progress */}
        <NexusCard className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Subject Progress
            </h3>
            <button
              onClick={() => navigate("subjects")}
              className="text-xs text-[#5B8CFF] hover:underline flex items-center gap-1"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>
          {subjects.length === 0 ? (
            <NexusEmptyState
              icon={<Target className="h-5 w-5" />}
              title="No subjects yet."
              description="Add your first subject to start tracking."
              action={<NexusButton size="sm" onClick={() => navigate("subjects")}>Add subject</NexusButton>}
            />
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {subjects.slice(0, 4).map((s) => {
                const chapters = s.chapters || []
                const completed = chapters.filter((c) => c.status === "completed").length
                const pct = chapters.length ? (completed / chapters.length) * 100 : 0
                return (
                  <button
                    key={s.id}
                    onClick={() => navigate("subject_detail", { subjectId: s.id })}
                    className="text-left rounded-xl border border-border bg-card p-4 hover:border-[#5B8CFF]/30 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-sm font-semibold"
                        style={{ backgroundColor: `${s.color}15`, color: s.color }}
                      >
                        {s.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{s.name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {chapters.length} chapters
                        </div>
                      </div>
                    </div>
                    <NexusProgressBar progress={pct} color={s.color} />
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-muted-foreground">
                      <span>{Math.round(pct)}% complete</span>
                      <span>{completed}/{chapters.length}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </NexusCard>

        {/* Goals + Habits */}
        <div className="space-y-4">
          <NexusCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Goals
              </h3>
              <button
                onClick={() => navigate("goals")}
                className="text-xs text-[#5B8CFF] hover:underline"
              >
                View
              </button>
            </div>
            {goals.length === 0 ? (
              <div className="text-center py-4">
                <Target className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <div className="text-xs text-muted-foreground">No goals yet</div>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.slice(0, 2).map((g) => (
                  <div key={g.id}>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-medium truncate">{g.title}</span>
                      <span className="text-muted-foreground">{g.progress}%</span>
                    </div>
                    <NexusProgressBar
                      progress={g.progress}
                      color={g.status === "at_risk" ? "#F59E0B" : "#22C55E"}
                    />
                  </div>
                ))}
              </div>
            )}
          </NexusCard>

          <NexusCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Habits Today
              </h3>
              <button
                onClick={() => navigate("habits")}
                className="text-xs text-[#5B8CFF] hover:underline"
              >
                View
              </button>
            </div>
            {habits.length === 0 ? (
              <div className="text-center py-4">
                <Flame className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <div className="text-xs text-muted-foreground">No habits tracked</div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-semibold">{habitCompletionRate}%</span>
                  <span className="text-[10px] text-muted-foreground">
                    {todayHabitLogs.length}/{habits.length} today
                  </span>
                </div>
                <NexusProgressBar progress={habitCompletionRate} color="#22D3EE" />
              </div>
            )}
          </NexusCard>
        </div>
      </div>

      {/* AI tutor shortcut + achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NexusCard
          hover
          onClick={() => navigate("ai-tutor")}
          className="p-6 relative overflow-hidden cursor-pointer"
        >
          <div className="absolute -top-10 -right-10 h-32 w-32 bg-[#8B5CF6]/15 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#5B8CFF] to-[#8B5CF6] flex items-center justify-center shadow-glow">
              <Brain className="h-7 w-7 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-base font-semibold">Ask NEXUS AI Tutor</div>
              <div className="text-sm text-muted-foreground mt-1">
                Get step-by-step explanations, quizzes, and examples powered by Gemini.
              </div>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
          </div>
        </NexusCard>

        <NexusCard className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Recent Achievements
            </h3>
            <button
              onClick={() => navigate("achievements")}
              className="text-xs text-[#5B8CFF] hover:underline"
            >
              View all
            </button>
          </div>
          {achievements.length === 0 ? (
            <div className="text-center py-4">
              <Award className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <div className="text-xs text-muted-foreground">
                Complete a focus session to unlock your first achievement.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {achievements.slice(0, 3).map((a) => (
                <div
                  key={a.id}
                  className="rounded-xl border border-border bg-card p-3 text-center"
                >
                  <div className="h-8 w-8 rounded-full bg-[#8B5CF6]/15 text-[#8B5CF6] mx-auto mb-1.5 flex items-center justify-center">
                    <Award className="h-4 w-4" />
                  </div>
                  <div className="text-[10px] font-medium truncate">{a.title}</div>
                </div>
              ))}
            </div>
          )}
        </NexusCard>
      </div>
    </div>
  )
}
