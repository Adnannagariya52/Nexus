"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/store"
import { useData, createResource } from "@/lib/data-client"
import {
  NexusCard,
  NexusButton,
  NexusViewHeader,
  NexusBadge,
} from "@/components/nexus/primitives"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Play, Pause, RotateCcw, CheckCircle2, Timer, Flame, Zap } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Mode = "pomodoro" | "custom"
type State = "ready" | "focusing" | "paused" | "completed"

const PRESETS = [
  { label: "Pomodoro", minutes: 25, mode: "pomodoro" as Mode },
  { label: "Short focus", minutes: 15, mode: "custom" as Mode },
  { label: "Deep work", minutes: 50, mode: "custom" as Mode },
  { label: "Sprint", minutes: 10, mode: "custom" as Mode },
]

export function FocusView() {
  const { snapshot, mutate } = useData()
  const subjects = snapshot?.subjects || []
  const focusSessions = snapshot?.focusSessions || []

  const [mode, setMode] = React.useState<Mode>("pomodoro")
  const [duration, setDuration] = React.useState(25)
  const [remaining, setRemaining] = React.useState(25 * 60)
  const [state, setState] = React.useState<State>("ready")
  const [subjectId, setSubjectId] = React.useState<string>("")
  const [sessionStart, setSessionStart] = React.useState<Date | null>(null)
  const [showCelebration, setShowCelebration] = React.useState(false)

  React.useEffect(() => {
    setRemaining(duration * 60)
  }, [duration])

  const completeSession = React.useCallback(async () => {
    if (!sessionStart) return
    try {
      await mutate(() =>
        createResource("focusSession", {
          durationMinutes: duration,
          status: "completed",
          mode,
          startedAt: sessionStart.toISOString(),
          completedAt: new Date().toISOString(),
        }),
      )
      if (subjectId) {
        await mutate(() =>
          createResource("studySession", {
            subjectId,
            durationMinutes: duration,
            startedAt: sessionStart.toISOString(),
            completedAt: new Date().toISOString(),
            sessionType: "focus",
          }),
        )
      }
      setShowCelebration(true)
      toast.success(`Focus session complete! +${duration} minutes`)
    } catch {
      toast.error("Failed to save focus session")
    }
  }, [sessionStart, duration, mode, subjectId, mutate])

  // Timer tick
  React.useEffect(() => {
    if (state !== "focusing") return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(id)
          setState("completed")
          completeSession()
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [state, completeSession])

  function start() {
    setState("focusing")
    setSessionStart(new Date())
  }
  function pause() {
    setState("paused")
  }
  function resume() {
    setState("focusing")
  }
  function reset() {
    setState("ready")
    setRemaining(duration * 60)
    setSessionStart(null)
  }
  function dismissCelebration() {
    setShowCelebration(false)
    reset()
  }

  const minutes = Math.floor(remaining / 60)
  const seconds = remaining % 60
  const progress = ((duration * 60 - remaining) / (duration * 60)) * 100

  const todayMin = focusSessions
    .filter((f) => {
      const d = new Date(f.startedAt)
      const now = new Date()
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      )
    })
    .reduce((s, f) => s + f.durationMinutes, 0)

  return (
    <div className="pb-8">
      <NexusViewHeader
        title="Focus Mode"
        subtitle="A cinematic experience for deep work."
      />

      {/* Timer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <NexusCard className="lg:col-span-2 p-6 sm:p-12 relative overflow-hidden min-h-[480px] flex flex-col items-center justify-center">
          {/* Background ambient */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0"
            >
              <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-64 w-64 rounded-full bg-[#5B8CFF]/10 blur-3xl" />
              <div className="absolute top-1/2 -right-32 h-64 w-64 rounded-full bg-[#8B5CF6]/10 blur-3xl" />
              <div className="absolute -bottom-32 left-1/3 h-64 w-64 rounded-full bg-[#22D3EE]/10 blur-3xl" />
            </motion.div>
          </div>

          {/* Status badge */}
          <div className="absolute top-6 left-1/2 -translate-x-1/2">
            <NexusBadge
              color={
                state === "focusing"
                  ? "blue"
                  : state === "completed"
                    ? "green"
                    : state === "paused"
                      ? "amber"
                      : "muted"
              }
            >
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  state === "focusing" && "bg-[#5B8CFF] animate-pulse",
                  state === "completed" && "bg-[#22C55E]",
                  state === "paused" && "bg-[#F59E0B]",
                  state === "ready" && "bg-muted-foreground",
                )}
              />
              {state === "ready"
                ? "Ready"
                : state === "focusing"
                  ? "Focusing"
                  : state === "paused"
                    ? "Paused"
                    : "Completed"}
            </NexusBadge>
          </div>

          {/* Circular timer */}
          <div className="relative">
            <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
              <circle
                cx="140"
                cy="140"
                r="120"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="6"
                fill="none"
              />
              <defs>
                <linearGradient id="focus-grad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#5B8CFF" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#22D3EE" />
                </linearGradient>
              </defs>
              <motion.circle
                cx="140"
                cy="140"
                r="120"
                stroke="url(#focus-grad)"
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 120}
                animate={{ strokeDashoffset: 2 * Math.PI * 120 * (1 - progress / 100) }}
                transition={{ duration: 0.5 }}
                style={{ filter: state === "focusing" ? "drop-shadow(0 0 12px rgba(91,140,255,0.6))" : "none" }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-6xl sm:text-7xl font-semibold font-mono tracking-tight tabular-nums">
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </div>
              <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                {duration} minute {mode}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3 mt-8">
            {state === "ready" && (
              <NexusButton size="lg" onClick={start} className="gap-2">
                <Play className="h-4 w-4" />
                Start focus
              </NexusButton>
            )}
            {state === "focusing" && (
              <NexusButton size="lg" variant="outline" onClick={pause} className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </NexusButton>
            )}
            {state === "paused" && (
              <NexusButton size="lg" onClick={resume} className="gap-2">
                <Play className="h-4 w-4" />
                Resume
              </NexusButton>
            )}
            {(state === "focusing" || state === "paused") && (
              <NexusButton size="lg" variant="ghost" onClick={reset} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Reset
              </NexusButton>
            )}
            {state === "completed" && (
              <NexusButton size="lg" onClick={dismissCelebration} className="gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Done
              </NexusButton>
            )}
          </div>
        </NexusCard>

        {/* Sidebar: configuration */}
        <div className="space-y-4">
          <NexusCard className="p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-medium">
              Duration
            </div>
            <div className="grid grid-cols-2 gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.label}
                  onClick={() => {
                    if (state === "ready" || state === "completed") {
                      setMode(p.mode)
                      setDuration(p.minutes)
                    }
                  }}
                  className={cn(
                    "rounded-lg border p-3 text-left transition-all",
                    duration === p.minutes
                      ? "border-[#5B8CFF] bg-[#5B8CFF]/[0.08]"
                      : "border-border bg-card hover:bg-accent",
                    (state === "focusing" || state === "paused") && "opacity-50 cursor-not-allowed",
                  )}
                >
                  <div className="text-lg font-semibold">{p.minutes}</div>
                  <div className="text-[10px] text-muted-foreground">min • {p.label}</div>
                </button>
              ))}
            </div>
          </NexusCard>

          <NexusCard className="p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-medium">
              Subject
            </div>
            <Select
              value={subjectId}
              onValueChange={setSubjectId}
              disabled={state === "focusing" || state === "paused"}
            >
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="General (no subject)" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {subjectId && (
              <div className="text-[10px] text-muted-foreground mt-2">
                Study time will be added to{" "}
                {subjects.find((s) => s.id === subjectId)?.name}.
              </div>
            )}
          </NexusCard>

          <NexusCard className="p-5">
            <div className="text-xs uppercase tracking-wide text-muted-foreground mb-3 font-medium">
              Today
            </div>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-[#5B8CFF]" />
              <div className="text-2xl font-semibold">
                {Math.floor(todayMin / 60)}h {todayMin % 60}m
              </div>
            </div>
            <div className="text-[10px] text-muted-foreground mt-1">
              {focusSessions.filter((f) => {
                const d = new Date(f.startedAt)
                const now = new Date()
                return (
                  d.getFullYear() === now.getFullYear() &&
                  d.getMonth() === now.getMonth() &&
                  d.getDate() === now.getDate()
                )
              }).length}{" "}
              sessions today
            </div>
          </NexusCard>
        </div>
      </div>

      {/* Recent sessions */}
      {focusSessions.length > 0 && (
        <NexusCard className="p-5">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
            Recent sessions
          </h3>
          <div className="space-y-2">
            {focusSessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
              >
                <div className="h-8 w-8 rounded-lg bg-[#5B8CFF]/10 text-[#5B8CFF] flex items-center justify-center">
                  <Flame className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{s.durationMinutes} min focus</div>
                  <div className="text-[10px] text-muted-foreground">
                    {new Date(s.startedAt).toLocaleString()}
                  </div>
                </div>
                <NexusBadge color="green">Completed</NexusBadge>
              </div>
            ))}
          </div>
        </NexusCard>
      )}

      {/* Celebration overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4"
            onClick={dismissCelebration}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="glass-strong border border-white/10 rounded-3xl p-8 max-w-md text-center relative"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex h-16 w-16 rounded-full bg-gradient-to-br from-[#22C55E] to-[#5B8CFF] items-center justify-center mb-5 shadow-glow"
              >
                <CheckCircle2 className="h-8 w-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-semibold tracking-tight">
                Session complete!
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                You focused for {duration} minutes. That's another step toward your goal.
              </p>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <div className="rounded-lg border border-border bg-card p-3">
                  <Zap className="h-3.5 w-3.5 mx-auto mb-1 text-[#5B8CFF]" />
                  <div className="text-xs font-medium">+{duration} min</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <Flame className="h-3.5 w-3.5 mx-auto mb-1 text-[#F59E0B]" />
                  <div className="text-xs font-medium">Streak up</div>
                </div>
                <div className="rounded-lg border border-border bg-card p-3">
                  <Timer className="h-3.5 w-3.5 mx-auto mb-1 text-[#22C55E]" />
                  <div className="text-xs font-medium">{todayMin + duration}m today</div>
                </div>
              </div>
              <NexusButton onClick={dismissCelebration} className="w-full mt-6">
                Continue
              </NexusButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
