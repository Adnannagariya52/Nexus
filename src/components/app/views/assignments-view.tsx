"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/store"
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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarIcon, Plus, CheckCircle2, Clock, AlertCircle, ListChecks, LayoutGrid, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

type Filter = "all" | "today" | "upcoming" | "completed" | "overdue"
type Priority = "low" | "medium" | "high" | "urgent"

const PRIORITY_COLOR: Record<Priority, any> = {
  low: "muted",
  medium: "blue",
  high: "amber",
  urgent: "red",
}

export function AssignmentsView() {
  const { snapshot, mutate } = useData()
  const [open, setOpen] = React.useState(false)
  const [filter, setFilter] = React.useState<Filter>("all")
  const [view, setView] = React.useState<"list" | "grid">("list")
  const assignments = snapshot?.assignments || []
  const subjects = snapshot?.subjects || []

  const today = new Date()
  const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())

  const filtered = assignments.filter((a) => {
    switch (filter) {
      case "today":
        return (
          a.status !== "completed" &&
          a.dueDate &&
          new Date(a.dueDate).toDateString() === today.toDateString()
        )
      case "upcoming":
        return a.status !== "completed" && a.dueDate && new Date(a.dueDate) > today
      case "completed":
        return a.status === "completed"
      case "overdue":
        return a.status !== "completed" && a.dueDate && new Date(a.dueDate) < startOfDay
      default:
        return true
    }
  })

  async function createAssignment(data: any) {
    try {
      await mutate(() => createResource("assignment", data))
      toast.success("Assignment created")
      setOpen(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to create assignment")
    }
  }

  async function toggleComplete(id: string, current: string) {
    try {
      await mutate(() =>
        updateResource("assignment", id, {
          status: current === "completed" ? "pending" : "completed",
          completedAt: current === "completed" ? null : new Date().toISOString(),
        }),
      )
    } catch {
      toast.error("Failed to update")
    }
  }

  async function remove(id: string) {
    try {
      await mutate(() => deleteResource("assignment", id))
      toast.success("Assignment deleted")
    } catch {
      toast.error("Failed to delete")
    }
  }

  const counts = {
    all: assignments.length,
    today: assignments.filter(
      (a) =>
        a.status !== "completed" &&
        a.dueDate &&
        new Date(a.dueDate).toDateString() === today.toDateString(),
    ).length,
    upcoming: assignments.filter(
      (a) => a.status !== "completed" && a.dueDate && new Date(a.dueDate) > today,
    ).length,
    completed: assignments.filter((a) => a.status === "completed").length,
    overdue: assignments.filter(
      (a) => a.status !== "completed" && a.dueDate && new Date(a.dueDate) < startOfDay,
    ).length,
  }

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Assignments"
        subtitle="Track everything that needs to get done."
        action={
          <NexusButton onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New assignment
          </NexusButton>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "today", "upcoming", "overdue", "completed"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "h-8 px-3 rounded-lg text-xs font-medium transition-colors capitalize",
              filter === f
                ? "bg-accent text-foreground border border-border"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
            )}
          >
            {f}
            {counts[f] > 0 && (
              <span className="ml-1.5 text-[10px] text-muted-foreground">({counts[f]})</span>
            )}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-1 border border-border rounded-lg p-0.5">
          <button
            onClick={() => setView("list")}
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-md",
              view === "list" ? "bg-accent text-foreground" : "text-muted-foreground",
            )}
          >
            <ListChecks className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setView("grid")}
            className={cn(
              "h-7 w-7 flex items-center justify-center rounded-md",
              view === "grid" ? "bg-accent text-foreground" : "text-muted-foreground",
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <NexusCard className="p-0">
          <NexusEmptyState
            icon={<CheckCircle2 className="h-6 w-6" />}
            title={
              filter === "completed"
                ? "No completed assignments yet."
                : filter === "today"
                  ? "Nothing waiting for you."
                  : "No assignments to show."
            }
            description={
              filter === "today"
                ? "You're all caught up for today."
                : "Create your first assignment to get started."
            }
            action={
              <NexusButton onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Create assignment
              </NexusButton>
            }
          />
        </NexusCard>
      ) : view === "list" ? (
        <div className="space-y-2">
          {filtered.map((a, i) => {
            const overdue =
              a.status !== "completed" &&
              a.dueDate &&
              new Date(a.dueDate) < startOfDay
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <NexusCard className="p-4 flex items-center gap-3 group">
                  <button
                    onClick={() => toggleComplete(a.id, a.status)}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                      a.status === "completed"
                        ? "bg-[#B8FF6A] border-[#B8FF6A] text-white"
                        : "border-border hover:border-[#B8FF6A]",
                    )}
                  >
                    {a.status === "completed" && <CheckCircle2 className="h-3.5 w-3.5" />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div
                      className={cn(
                        "text-sm font-medium truncate",
                        a.status === "completed" && "line-through text-muted-foreground",
                      )}
                    >
                      {a.title}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {a.subject?.name || "No subject"}
                      </span>
                      {a.dueDate && (
                        <>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span
                            className={cn(
                              "text-[10px] flex items-center gap-0.5",
                              overdue ? "text-[#E5484D]" : "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="h-3 w-3" />
                            {new Date(a.dueDate).toLocaleDateString()}
                          </span>
                        </>
                      )}
                      {a.estimatedMinutes && (
                        <>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {a.estimatedMinutes}m
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <NexusBadge color={overdue ? "red" : PRIORITY_COLOR[a.priority as Priority]}>
                    {overdue ? "overdue" : a.priority}
                  </NexusBadge>
                  <button
                    onClick={() => {
                      if (confirm("Delete this assignment?")) remove(a.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[#E5484D] transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </NexusCard>
              </motion.div>
            )
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((a, i) => {
            const overdue = a.status !== "completed" && a.dueDate && new Date(a.dueDate) < startOfDay
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
              >
                <NexusCard className="p-4 flex flex-col gap-3 group">
                  <div className="flex items-start justify-between">
                    <button
                      onClick={() => toggleComplete(a.id, a.status)}
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all shrink-0",
                        a.status === "completed"
                          ? "bg-[#B8FF6A] border-[#B8FF6A] text-white"
                          : "border-border hover:border-[#B8FF6A]",
                      )}
                    >
                      {a.status === "completed" && <CheckCircle2 className="h-3 w-3" />}
                    </button>
                    <NexusBadge color={overdue ? "red" : PRIORITY_COLOR[a.priority as Priority]}>
                      {overdue ? "overdue" : a.priority}
                    </NexusBadge>
                  </div>
                  <div>
                    <div
                      className={cn(
                        "text-sm font-medium",
                        a.status === "completed" && "line-through text-muted-foreground",
                      )}
                    >
                      {a.title}
                    </div>
                    {a.description && (
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {a.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-3 border-t border-border">
                    <span>{a.subject?.name || "No subject"}</span>
                    {a.dueDate && (
                      <span className={overdue ? "text-[#E5484D]" : ""}>
                        {new Date(a.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </NexusCard>
              </motion.div>
            )
          })}
        </div>
      )}

      <AssignmentDialog
        open={open}
        onOpenChange={setOpen}
        subjects={subjects}
        onCreate={createAssignment}
      />
    </div>
  )
}

function AssignmentDialog({
  open,
  onOpenChange,
  subjects,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  subjects: { id: string; name: string }[]
  onCreate: (data: any) => void
}) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [subjectId, setSubjectId] = React.useState("")
  const [priority, setPriority] = React.useState<Priority>("medium")
  const [dueDate, setDueDate] = React.useState("")
  const [estimatedMinutes, setEstimatedMinutes] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setTitle("")
      setDescription("")
      setSubjectId("")
      setPriority("medium")
      setDueDate("")
      setEstimatedMinutes("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border max-w-lg">
        <DialogHeader>
          <DialogTitle>New assignment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2 max-h-[60vh] overflow-y-auto">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 4 problem set"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Subject</Label>
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
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger className="bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Due date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-background"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Estimated minutes</Label>
              <Input
                type="number"
                value={estimatedMinutes}
                onChange={(e) => setEstimatedMinutes(e.target.value)}
                placeholder="30"
                className="bg-background"
              />
            </div>
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
                subjectId: subjectId || null,
                priority,
                dueDate: dueDate ? new Date(dueDate).toISOString() : null,
                estimatedMinutes: estimatedMinutes ? parseInt(estimatedMinutes) : null,
                status: "pending",
              })
            }
          >
            Create assignment
          </NexusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
