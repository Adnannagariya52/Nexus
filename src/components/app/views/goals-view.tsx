"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { useApp } from "@/lib/store"
import { useData, createResource, updateResource, deleteResource } from "@/lib/data-client"
import {
  NexusCard,
  NexusBadge,
  NexusButton,
  NexusEmptyState,
  NexusViewHeader,
  NexusProgressBar,
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Target, Plus, Trash2, Calendar, TrendingUp, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

function calcStatus(progress: number, targetDate: string | null): "on_track" | "at_risk" | "completed" {
  if (progress >= 100) return "completed"
  if (!targetDate) return "on_track"
  const now = new Date()
  const target = new Date(targetDate)
  const total = target.getTime() - now.getTime()
  if (total <= 0) return "at_risk"
  const totalDays = total / (1000 * 60 * 60 * 24)
  const remainingPctAllowed = (totalDays / 30) * 100 // expected remaining progress allowance
  if (100 - progress > remainingPctAllowed * 1.5) return "at_risk"
  return "on_track"
}

export function GoalsView() {
  const { snapshot, mutate } = useData()
  const [open, setOpen] = React.useState(false)
  const goals = snapshot?.goals || []

  async function createGoal(data: any) {
    try {
      await mutate(() => createResource("goal", data))
      toast.success("Goal created")
      setOpen(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to create goal")
    }
  }
  async function updateProgress(id: string, val: number, targetDate: string | null) {
    const status = calcStatus(val, targetDate)
    try {
      await mutate(() => updateResource("goal", id, { progress: val, status }))
    } catch {}
  }
  async function remove(id: string) {
    try {
      await mutate(() => deleteResource("goal", id))
      toast.success("Goal deleted")
    } catch {
      toast.error("Failed to delete goal")
    }
  }

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Goals"
        subtitle="Set academic milestones and track them intelligently."
        action={
          <NexusButton onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New goal
          </NexusButton>
        }
      />

      {goals.length === 0 ? (
        <NexusCard className="p-0">
          <NexusEmptyState
            icon={<Target className="h-6 w-6" />}
            title="No goals set yet."
            description="Set your first academic goal and start tracking your progress."
            action={
              <NexusButton onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                New goal
              </NexusButton>
            }
          />
        </NexusCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {goals.map((g, i) => {
            const status = g.status
            const color = status === "completed" ? "#22C55E" : status === "at_risk" ? "#F59E0B" : "#5B8CFF"
            const Icon = status === "completed" ? CheckCircle2 : status === "at_risk" ? AlertCircle : Target
            return (
              <motion.div
                key={g.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
              >
                <NexusCard className="p-5 group">
                  <div className="flex items-start justify-between mb-3">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${color}15`, color }}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1">
                      <NexusBadge
                        color={
                          status === "completed" ? "green" : status === "at_risk" ? "amber" : "blue"
                        }
                      >
                        {status === "completed"
                          ? "Completed"
                          : status === "at_risk"
                            ? "At risk"
                            : "On track"}
                      </NexusBadge>
                      <button
                        onClick={() => {
                          if (confirm("Delete this goal?")) remove(g.id)
                        }}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[#EF4444]"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-semibold">{g.title}</h3>
                  {g.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{g.description}</p>
                  )}

                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium" style={{ color }}>{g.progress}%</span>
                    </div>
                    <NexusProgressBar progress={g.progress} color={color} className="h-2" />
                  </div>

                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={g.progress}
                    onChange={(e) => updateProgress(g.id, parseInt(e.target.value), g.targetDate)}
                    className="w-full mt-3 accent-[#5B8CFF]"
                  />

                  {g.targetDate && (
                    <div className="mt-3 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      Target: {new Date(g.targetDate).toLocaleDateString()}
                      {" • "}
                      {Math.max(0, Math.ceil((new Date(g.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days left
                    </div>
                  )}
                </NexusCard>
              </motion.div>
            )
          })}
        </div>
      )}

      <GoalDialog open={open} onOpenChange={setOpen} onCreate={createGoal} />
    </div>
  )
}

function GoalDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (data: any) => void
}) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [targetDate, setTargetDate] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setTitle("")
      setDescription("")
      setTargetDate("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>New goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Goal title</Label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Score 90+ in Physics midterm"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does success look like?"
              rows={3}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Target date</Label>
            <Input
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="bg-background"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <NexusButton
            disabled={!title.trim()}
            onClick={() =>
              onCreate({
                title: title.trim(),
                description: description.trim() || null,
                targetDate: targetDate ? new Date(targetDate).toISOString() : null,
                progress: 0,
                status: "on_track",
              })
            }
          >
            Create goal
          </NexusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
