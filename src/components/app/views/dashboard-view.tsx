"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/store"
import { useData, updateResource } from "@/lib/data-client"
import {
  Flame, Timer, CheckCircle2, CalendarClock, TrendingUp,
  ArrowRight, Sparkles, Brain,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

const EASE = [0.76, 0, 0.24, 1] as const

export function DashboardView() {
  const navigate = useApp((s) => s.navigate)
  const { snapshot, mutate } = useData()

  const profile = snapshot?.profile
  const assignments = snapshot?.assignments || []
  const exams = snapshot?.exams || []
  const subjects = snapshot?.subjects || []
  const focusSessions = snapshot?.focusSessions || []
  const habits = snapshot?.habits || []
  const habitLogs = snapshot?.habitLogs || []
  const goals = snapshot?.goals || []

  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const startOfWeek = new Date(startOfDay)
  startOfWeek.setDate(startOfWeek.getDate() - 6)

  const todaysFocus = focusSessions.filter((f) => new Date(f.startedAt) >= startOfDay && f.status === "completed")
  const todaysStudyMin = todaysFocus.reduce((sum, f) => sum + f.durationMinutes, 0)
  const weekMin = focusSessions.filter((f) => new Date(f.startedAt) >= startOfWeek).reduce((sum, f) => sum + f.durationMinutes, 0)

  const streak = React.useMemo(() => {
    const days = new Set<string>()
    focusSessions.forEach((f) => { if (f.status === "completed") days.add(new Date(f.startedAt).toDateString()) })
    let s = 0; const d = new Date()
    while (days.has(d.toDateString())) { s++; d.setDate(d.getDate() - 1) }
    return s
  }, [focusSessions])

  const target = profile?.studyTargetMinutes || 60
  const focusScore = Math.min(100, Math.round((todaysStudyMin / target) * 100))

  const todayKey = today.toDateString()
  const todaysTasks = assignments.filter((a) => a.status !== "completed" && a.dueDate && new Date(a.dueDate).toDateString() === todayKey)
  const overdueTasks = assignments.filter((a) => a.status !== "completed" && a.dueDate && new Date(a.dueDate) < startOfDay)
  const upcoming = [...todaysTasks, ...overdueTasks].slice(0, 5)

  const upcomingExams = exams.filter((e) => new Date(e.examDate) >= new Date()).sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()).slice(0, 3)
  const nextExam = upcomingExams[0]

  const firstName = (profile?.fullName || "Student").split(" ")[0]
  const greeting = (() => { const h = today.getHours(); return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening" })()

  async function completeAssignment(id: string) {
    try {
      await mutate(() => updateResource("assignment", id, { status: "completed", completedAt: new Date().toISOString() }))
      toast.success("Assignment completed!")
    } catch { toast.error("We couldn't update that right now.") }
  }

  const todayHabitLogs = habitLogs.filter((l) => new Date(l.completedDate).toDateString() === todayKey)
  const habitCompletionRate = habits.length ? Math.round((todayHabitLogs.length / habits.length) * 100) : 0
  const completedTasks = assignments.filter((a) => a.status === "completed").length

  const weeklyActivity = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(startOfWeek); day.setDate(day.getDate() + i)
    const key = day.toDateString()
    const min = focusSessions.filter((f) => f.status === "completed" && new Date(f.startedAt).toDateString() === key).reduce((sum, f) => sum + f.durationMinutes, 0)
    return { day: ["S","M","T","W","T","F","S"][day.getDay()], min }
  })
  const maxMin = Math.max(60, ...weeklyActivity.map((d) => d.min))

  if (!snapshot) return null

  return (
    <div className="space-y-6 pb-8">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: EASE }}>
        <div className="font-mono text-[9px] tracking-[0.25em] text-black/40">
          {today.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase()} · {today.toLocaleDateString("en-US", { month: "long", day: "numeric" }).toUpperCase()}
        </div>
        <h1 className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
          {greeting}, {firstName}.
        </h1>
        <p className="mt-1.5 text-sm text-black/40">
          {upcoming.length > 0 ? `${upcoming.length} ${upcoming.length === 1 ? "thing" : "things"} worth focusing on today.` : "Your day is clear. Plan ahead."}
        </p>
      </motion.div>

      {/* Stat chips — matches landing page's StatChip design */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: EASE }} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Flame, label: "STREAK", value: `${streak} days`, accent: false },
          { icon: Timer, label: "FOCUS TODAY", value: `${Math.floor(todaysStudyMin / 60)}h ${todaysStudyMin % 60}m`, accent: true },
          { icon: CheckCircle2, label: "TASKS", value: `${completedTasks} / ${assignments.length}`, accent: false },
          { icon: TrendingUp, label: "THIS WEEK", value: `${Math.floor(weekMin / 60)}h ${weekMin % 60}m`, accent: false },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-black/[0.06] bg-[#FAFAF8] p-4">
            <div className="flex items-center gap-1.5 font-mono text-[9px] tracking-[0.18em] text-black/40">
              <s.icon className={cn("h-3 w-3", s.accent && "text-iris")} strokeWidth={2.4} />
              {s.label}
            </div>
            <div className="mt-2 text-xl font-semibold tracking-tight" style={{ color: s.accent ? "#6C63FF" : "#111111", fontFamily: "var(--font-display)" }}>
              {s.value}
            </div>
          </div>
        ))}
      </motion.div>

      {/* Main grid — TODAY (left, 3/5) + UP NEXT (right, 2/5) */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15, ease: EASE }} className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* TODAY panel */}
        <div className="lg:col-span-3 rounded-xl border border-black/[0.06] bg-white p-5">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-mono text-[9px] tracking-[0.25em] text-black/40 font-medium">TODAY</span>
            <span className="font-mono text-[9px] text-iris">{upcoming.length} LEFT</span>
          </div>
          {upcoming.length === 0 ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="h-6 w-6 text-black/20 mx-auto mb-3" strokeWidth={2} />
              <div className="text-sm text-black/40">Nothing waiting for you.</div>
            </div>
          ) : (
            <div className="space-y-[7px]">
              {upcoming.map((a) => {
                const overdue = a.dueDate && new Date(a.dueDate) < startOfDay
                return (
                  <div key={a.id} className="flex items-center gap-2.5 group">
                    <button
                      onClick={() => completeAssignment(a.id)}
                      className="h-[15px] w-[15px] shrink-0 rounded-[5px] border border-black/20 hover:border-iris hover:bg-iris-soft/40 transition-colors flex items-center justify-center"
                      aria-label="Mark complete"
                    >
                      <CheckCircle2 className="h-3 w-3 text-iris opacity-0 hover:opacity-100 transition-opacity" strokeWidth={2.2} />
                    </button>
                    <span className="truncate text-[12px] text-black/80 group-hover:text-ink transition-colors">{a.title}</span>
                    {overdue && <span className="font-mono text-[8px] text-[#E5484D]">OVERDUE</span>}
                    <span className="ml-auto shrink-0 font-mono text-[8px] text-black/30">
                      {a.subject?.name?.toUpperCase().slice(0, 8) || "—"}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          {/* AI suggestion bar */}
          <div className="mt-4 hidden sm:flex items-center gap-2 rounded-lg bg-iris-soft/60 p-2.5">
            <Sparkles className="h-3.5 w-3.5 shrink-0 text-iris" strokeWidth={2.2} />
            <span className="text-[11px] leading-snug text-iris-dark">
              {nextExam
                ? `${nextExam.title} in ${Math.max(0, Math.ceil((new Date(nextExam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days — schedule a review session.`
                : "Take a 25-min focus session to build momentum."}
            </span>
          </div>
        </div>

        {/* UP NEXT panel */}
        <div className="lg:col-span-2 rounded-xl border border-black/[0.06] bg-white p-5">
          <div className="mb-4 font-mono text-[9px] tracking-[0.25em] text-black/40 font-medium">UP NEXT</div>
          {nextExam ? (
            <>
              <div className="text-3xl font-semibold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
                {Math.max(0, Math.ceil((new Date(nextExam.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                <span className="text-sm font-normal text-black/40 ml-2">days</span>
              </div>
              <div className="mt-2 text-sm font-medium">{nextExam.title}</div>
              <div className="text-[11px] text-black/40 mt-0.5">
                {nextExam.subject?.name || "No subject"} · {new Date(nextExam.examDate).toLocaleDateString()}
              </div>
              <div className="mt-3">
                <div className="h-[5px] overflow-hidden rounded-full bg-black/[0.06]">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${nextExam.preparationProgress}%` }}
                    transition={{ duration: 1, ease: EASE }}
                    className="h-full rounded-full bg-iris"
                  />
                </div>
                <div className="mt-1.5 font-mono text-[8.5px] tracking-[0.15em] text-black/40">
                  {nextExam.preparationProgress}% READY
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <CalendarClock className="h-6 w-6 text-black/20 mx-auto mb-3" strokeWidth={2} />
              <div className="text-sm text-black/40">No exams scheduled.</div>
              <button onClick={() => navigate("exams")} className="mt-3 text-[11px] text-iris hover:underline">Add one →</button>
            </div>
          )}
          {/* Week load mini-chart */}
          <div className="mt-auto pt-4 border-t border-black/[0.06] mt-4">
            <div className="flex justify-between font-mono text-[8.5px] tracking-[0.15em] text-black/40 mb-2">
              <span>WEEK LOAD</span>
              <span className="text-ink">{focusScore > 50 ? "ON TRACK" : "BUILDING"}</span>
            </div>
            <div className="flex gap-1">
              {weeklyActivity.map((d, i) => (
                <div key={i} className="flex h-8 flex-1 items-end rounded-[4px] bg-black/[0.035]">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${(d.min / maxMin) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.3 + i * 0.08, ease: EASE }}
                    className={cn("w-full rounded-[4px]", i === 6 ? "bg-iris" : "bg-ink/70")}
                    style={{ opacity: i === 6 ? 1 : 0.35 + (d.min / maxMin) / 2 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Focus + AI Tutor row */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: EASE }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Focus ring */}
        <div className="rounded-xl border border-black/[0.06] bg-white p-6 flex flex-col items-center">
          <div className="font-mono text-[9px] tracking-[0.25em] text-black/40 mb-4">FOCUS SCORE</div>
          <div className="relative h-32 w-32">
            <svg viewBox="0 0 120 120" className="-rotate-90">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(17,17,17,0.06)" strokeWidth="4" />
              <motion.circle
                cx="60" cy="60" r="52" fill="none" stroke="#6C63FF" strokeWidth="4" strokeLinecap="round"
                strokeDasharray="326.7"
                initial={{ strokeDashoffset: 326.7 }}
                animate={{ strokeDashoffset: 326.7 - (focusScore / 100) * 326.7 }}
                transition={{ duration: 1, ease: EASE }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{focusScore}%</div>
              <div className="font-mono text-[8px] tracking-[0.15em] text-black/40">OF TARGET</div>
            </div>
          </div>
          <button
            onClick={() => navigate("focus")}
            className="group mt-5 inline-flex items-center gap-2 rounded-full bg-ink text-white py-2.5 pl-6 pr-5 text-[11px] font-medium tracking-[0.15em] hover:bg-iris transition-colors duration-300"
          >
            START FOCUS
            <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" strokeWidth={2} />
          </button>
        </div>

        {/* Subjects */}
        <div className="lg:col-span-2 rounded-xl border border-black/[0.06] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[9px] tracking-[0.25em] text-black/40 font-medium">SUBJECTS</span>
            <button onClick={() => navigate("subjects")} className="font-mono text-[9px] text-iris hover:underline">VIEW ALL →</button>
          </div>
          {subjects.length === 0 ? (
            <div className="py-6 text-center text-sm text-black/40">No subjects yet. <button onClick={() => navigate("subjects")} className="text-iris hover:underline">Add one →</button></div>
          ) : (
            <div className="space-y-3">
              {subjects.slice(0, 5).map((s, idx) => {
                const chapters = s.chapters || []
                const completed = chapters.filter((c) => c.status === "completed").length
                const pct = chapters.length ? (completed / chapters.length) * 100 : 0
                return (
                  <button key={s.id} onClick={() => navigate("subject_detail", { subjectId: s.id })} className="w-full text-left group flex items-center gap-4">
                    <span className="font-mono text-[9px] text-black/30 w-6">{String(idx + 1).padStart(2, "0")}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[12px] font-medium text-ink truncate">{s.name}</span>
                        <span className="font-mono text-[8px] text-black/40">{Math.round(pct)}%</span>
                      </div>
                      <div className="h-[5px] overflow-hidden rounded-full bg-black/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 1, ease: EASE }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-black/20 group-hover:text-ink group-hover:translate-x-0.5 transition-all" />
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* Goals + Habits + AI Tutor */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25, ease: EASE }} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Goals */}
        <div className="rounded-xl border border-black/[0.06] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[9px] tracking-[0.25em] text-black/40 font-medium">GOALS</span>
            <button onClick={() => navigate("goals")} className="font-mono text-[9px] text-iris hover:underline">VIEW →</button>
          </div>
          {goals.length === 0 ? (
            <div className="py-4 text-center text-xs text-black/40">No goals yet</div>
          ) : (
            <div className="space-y-3">
              {goals.slice(0, 2).map((g) => (
                <div key={g.id}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-medium truncate">{g.title}</span>
                    <span className="font-mono text-black/40">{g.progress}%</span>
                  </div>
                  <div className="h-[5px] overflow-hidden rounded-full bg-black/[0.06]">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${g.progress}%` }} transition={{ duration: 1, ease: EASE }} className="h-full rounded-full bg-ink" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Habits */}
        <div className="rounded-xl border border-black/[0.06] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[9px] tracking-[0.25em] text-black/40 font-medium">HABITS</span>
            <button onClick={() => navigate("habits")} className="font-mono text-[9px] text-iris hover:underline">VIEW →</button>
          </div>
          {habits.length === 0 ? (
            <div className="py-4 text-center text-xs text-black/40">No habits tracked</div>
          ) : (
            <div>
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl font-semibold" style={{ fontFamily: "var(--font-display)" }}>{habitCompletionRate}%</span>
                <span className="font-mono text-[8.5px] tracking-[0.15em] text-black/40">{todayHabitLogs.length}/{habits.length} TODAY</span>
              </div>
              <div className="h-[5px] overflow-hidden rounded-full bg-black/[0.06]">
                <motion.div initial={{ width: 0 }} animate={{ width: `${habitCompletionRate}%` }} transition={{ duration: 1, ease: EASE }} className="h-full rounded-full bg-lime" />
              </div>
            </div>
          )}
        </div>

        {/* AI Tutor — dark accent card */}
        <button
          onClick={() => navigate("ai-tutor")}
          className="group rounded-xl bg-ink text-white p-5 text-left hover:bg-coal transition-colors duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[9px] tracking-[0.25em] text-white/40 font-medium">AI TUTOR</span>
            <Brain className="h-4 w-4 text-iris" strokeWidth={2.2} />
          </div>
          <div className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>Ask anything.</div>
          <div className="text-xs text-white/40 mt-1">Powered by Gemini. Always online.</div>
          <div className="mt-4 flex items-center gap-1 font-mono text-[9px] tracking-[0.2em] text-iris">
            ASK NOW
            <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" strokeWidth={2.2} />
          </div>
        </button>
      </motion.div>
    </div>
  )
}
