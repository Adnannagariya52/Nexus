"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useData, createResource, updateResource, deleteResource } from "@/lib/data-client"
import {
  NexusCard,
  NexusBadge,
  NexusButton,
  NexusEmptyState,
  NexusViewHeader,
} from "@/components/nexus/primitives"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Flame, Plus, Trash2, CheckCircle2, TrendingUp } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const COLORS = ["#5B8CFF", "#8B5CF6", "#22D3EE", "#22C55E", "#F59E0B", "#EF4444", "#EC4899"]

function calcStreak(habitId: string, logs: { habitId: string; completedDate: string }[]) {
  const habitLogs = logs.filter((l) => l.habitId === habitId)
  const days = new Set<string>()
  habitLogs.forEach((l) => {
    const d = new Date(l.completedDate)
    days.add(d.toDateString())
  })
  let s = 0
  const d = new Date()
  while (true) {
    const key = d.toDateString()
    if (days.has(key)) {
      s++
      d.setDate(d.getDate() - 1)
    } else break
  }
  return s
}

function calcBestStreak(habitId: string, logs: { habitId: string; completedDate: string }[]) {
  const habitLogs = logs
    .filter((l) => l.habitId === habitId)
    .map((l) => new Date(l.completedDate).toDateString())
  const unique = Array.from(new Set(habitLogs)).sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
  let best = 0
  let cur = 0
  let prev: Date | null = null
  for (const d of unique) {
    const date = new Date(d)
    if (prev) {
      const diff = (date.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24)
      if (diff === 1) cur++
      else cur = 1
    } else {
      cur = 1
    }
    if (cur > best) best = cur
    prev = date
  }
  return best
}

export function HabitsView() {
  const { snapshot, mutate } = useData()
  const [open, setOpen] = React.useState(false)
  const habits = snapshot?.habits || []
  const habitLogs = snapshot?.habitLogs || []

  const today = new Date().toDateString()

  async function toggleToday(habitId: string) {
    const existing = habitLogs.find(
      (l) => l.habitId === habitId && new Date(l.completedDate).toDateString() === today,
    )
    try {
      if (existing) {
        await mutate(() => deleteResource("habitLog", existing.id))
      } else {
        await mutate(() =>
          createResource("habitLog", {
            habitId,
            completedDate: new Date().toISOString(),
          }),
        )
        toast.success("Habit completed today!")
      }
    } catch (e: any) {
      toast.error("Failed to update habit")
    }
  }

  async function createHabit(name: string, color: string, frequency: string) {
    try {
      await mutate(() => createResource("habit", { name, color, frequency }))
      toast.success("Habit created")
      setOpen(false)
    } catch {
      toast.error("Failed to create habit")
    }
  }

  async function remove(id: string) {
    try {
      await mutate(() => deleteResource("habit", id))
      toast.success("Habit deleted")
    } catch {
      toast.error("Failed to delete habit")
    }
  }

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Habits"
        subtitle="Build consistency, one day at a time."
        action={
          <NexusButton onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New habit
          </NexusButton>
        }
      />

      {habits.length === 0 ? (
        <NexusCard className="p-0">
          <NexusEmptyState
            icon={<Flame className="h-6 w-6" />}
            title="No habits tracked yet."
            description="Start building daily habits like 'Read 30 min' or 'Solve 5 math problems'."
            action={
              <NexusButton onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                New habit
              </NexusButton>
            }
          />
        </NexusCard>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {habits.map((h, i) => {
            const completedToday = habitLogs.some(
              (l) => l.habitId === h.id && new Date(l.completedDate).toDateString() === today,
            )
            const streak = calcStreak(h.id, habitLogs)
            const best = calcBestStreak(h.id, habitLogs)
            return (
              <motion.div
                key={h.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <NexusCard className="p-5 group">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleToday(h.id)}
                        className={cn(
                          "h-9 w-9 rounded-lg flex items-center justify-center transition-all",
                          completedToday
                            ? "text-white"
                            : "border-2 border-border hover:border-[h.color]",
                        )}
                        style={{
                          backgroundColor: completedToday ? h.color : "transparent",
                          borderColor: completedToday ? h.color : undefined,
                        }}
                      >
                        {completedToday && <CheckCircle2 className="h-4 w-4" />}
                      </button>
                      <div>
                        <h3 className="text-sm font-semibold">{h.name}</h3>
                        <div className="text-[10px] text-muted-foreground capitalize">
                          {h.frequency}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (confirm("Delete this habit?")) remove(h.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[#EF4444]"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="rounded-lg border border-border bg-card p-2.5 text-center">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                        Streak
                      </div>
                      <div className="text-lg font-semibold mt-0.5" style={{ color: h.color }}>
                        {streak}d
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5 text-center">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                        Best
                      </div>
                      <div className="text-lg font-semibold mt-0.5">{best}d</div>
                    </div>
                    <div className="rounded-lg border border-border bg-card p-2.5 text-center">
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wide">
                        Today
                      </div>
                      <div className="text-lg font-semibold mt-0.5">
                        {completedToday ? "✓" : "—"}
                      </div>
                    </div>
                  </div>

                  {/* 30-day calendar heatmap */}
                  <HabitHeatmap habitId={h.id} logs={habitLogs} color={h.color} />
                </NexusCard>
              </motion.div>
            )
          })}
        </div>
      )}

      <HabitDialog open={open} onOpenChange={setOpen} onCreate={createHabit} />
    </div>
  )
}

function HabitHeatmap({
  habitId,
  logs,
  color,
}: {
  habitId: string
  logs: { habitId: string; completedDate: string }[]
  color: string
}) {
  const days = Array.from({ length: 35 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (34 - i))
    return d
  })

  const completedDays = new Set(
    logs
      .filter((l) => l.habitId === habitId)
      .map((l) => new Date(l.completedDate).toDateString()),
  )

  return (
    <div>
      <div className="text-[10px] text-muted-foreground mb-2 flex items-center justify-between">
        <span>Last 35 days</span>
        <span className="flex items-center gap-1">
          <TrendingUp className="h-3 w-3" /> Last 5 weeks
        </span>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => {
          const done = completedDays.has(d.toDateString())
          const isToday = d.toDateString() === new Date().toDateString()
          return (
            <div
              key={i}
              className={cn(
                "aspect-square rounded-sm border",
                done ? "" : "bg-muted/30 border-border",
                isToday && "ring-1 ring-[#5B8CFF] ring-offset-1 ring-offset-background",
              )}
              style={
                done
                  ? {
                      backgroundColor: color,
                      borderColor: color,
                    }
                  : undefined
              }
              title={d.toLocaleDateString()}
            />
          )
        })}
      </div>
    </div>
  )
}

function HabitDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (name: string, color: string, frequency: string) => void
}) {
  const [name, setName] = React.useState("")
  const [color, setColor] = React.useState(COLORS[0])
  const [frequency, setFrequency] = React.useState("daily")

  React.useEffect(() => {
    if (open) {
      setName("")
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)])
      setFrequency("daily")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>New habit</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Habit name</Label>
            <Input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Read for 30 minutes"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Color</Label>
            <div className="flex gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "h-7 w-7 rounded-full border-2 transition-all",
                    color === c ? "border-white scale-110" : "border-transparent opacity-70",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <NexusButton
            disabled={!name.trim()}
            onClick={() => onCreate(name.trim(), color, frequency)}
          >
            Create habit
          </NexusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
