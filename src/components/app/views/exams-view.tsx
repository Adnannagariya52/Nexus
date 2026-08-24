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
  NexusProgressRing,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CalendarClock, Plus, Trash2, Clock, AlertCircle, BookOpen } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function ExamsView() {
  const { snapshot, mutate } = useData()
  const [open, setOpen] = React.useState(false)
  const exams = snapshot?.exams || []
  const subjects = snapshot?.subjects || []

  const now = new Date()
  const upcoming = exams
    .filter((e) => new Date(e.examDate) >= now)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())
  const past = exams
    .filter((e) => new Date(e.examDate) < now)
    .sort((a, b) => new Date(b.examDate).getTime() - new Date(a.examDate).getTime())

  async function createExam(data: any) {
    try {
      await mutate(() => createResource("exam", data))
      toast.success("Exam added")
      setOpen(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to add exam")
    }
  }
  async function updateProgress(id: string, val: number) {
    try {
      await mutate(() => updateResource("exam", id, { preparationProgress: val }))
    } catch {}
  }
  async function remove(id: string) {
    try {
      await mutate(() => deleteResource("exam", id))
      toast.success("Exam deleted")
    } catch {
      toast.error("Failed to delete exam")
    }
  }

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Exams"
        subtitle="Prepare with live countdowns and progress tracking."
        action={
          <NexusButton onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add exam
          </NexusButton>
        }
      />

      {upcoming.length === 0 && past.length === 0 ? (
        <NexusCard className="p-0">
          <NexusEmptyState
            icon={<CalendarClock className="h-6 w-6" />}
            title="No exams scheduled."
            description="Add your next exam to start preparing with countdowns and progress tracking."
            action={
              <NexusButton onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add exam
              </NexusButton>
            }
          />
        </NexusCard>
      ) : (
        <>
          {upcoming.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Upcoming
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcoming.map((e, i) => {
                  const days = Math.max(
                    0,
                    Math.ceil((new Date(e.examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
                  )
                  const urgency = days <= 3 ? "red" : days <= 7 ? "amber" : days <= 30 ? "blue" : "muted"
                  return (
                    <motion.div
                      key={e.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    >
                      <NexusCard className="p-5 group">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-11 w-11 rounded-xl flex items-center justify-center"
                              style={{
                                backgroundColor: e.subject
                                  ? `${e.subject.color}15`
                                  : "rgba(245,158,11,0.15)",
                                color: e.subject?.color || "#F59E0B",
                              }}
                            >
                              <CalendarClock className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="text-sm font-semibold">{e.title}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {e.subject?.name || "No subject"}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              if (confirm("Delete this exam?")) remove(e.id)
                            }}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-[#EF4444]"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                              Exam date
                            </div>
                            <div className="text-sm font-medium mt-0.5">
                              {new Date(e.examDate).toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div
                              className="text-3xl font-semibold tracking-tight"
                              style={{
                                color:
                                  urgency === "red"
                                    ? "#EF4444"
                                    : urgency === "amber"
                                      ? "#F59E0B"
                                      : "#5B8CFF",
                              }}
                            >
                              {days}
                            </div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
                              days left
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-muted-foreground">Preparation</span>
                            <span className="font-medium">{e.preparationProgress}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={e.preparationProgress}
                            onChange={(ev) => updateProgress(e.id, parseInt(ev.target.value))}
                            className="w-full h-1.5 accent-[#5B8CFF]"
                          />
                        </div>

                        <NexusBadge color={urgency} className="mt-3">
                          {urgency === "red"
                            ? "Critical"
                            : urgency === "amber"
                              ? "Warning"
                              : urgency === "blue"
                                ? "Approaching"
                                : "On track"}
                        </NexusBadge>
                      </NexusCard>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Past exams
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 opacity-60">
                {past.slice(0, 6).map((e) => (
                  <NexusCard key={e.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                        <CalendarClock className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{e.title}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {new Date(e.examDate).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </NexusCard>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <ExamDialog open={open} onOpenChange={setOpen} subjects={subjects} onCreate={createExam} />
    </div>
  )
}

function ExamDialog({
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
  const [subjectId, setSubjectId] = React.useState("")
  const [examDate, setExamDate] = React.useState("")
  const [syllabus, setSyllabus] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setTitle("")
      setSubjectId("")
      setExamDate("")
      setSyllabus("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>Add exam</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Exam title</Label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Physics Midterm"
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
              <Label className="text-xs">Exam date</Label>
              <Input
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="bg-background"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Syllabus (optional)</Label>
            <Textarea
              value={syllabus}
              onChange={(e) => setSyllabus(e.target.value)}
              placeholder="Topics, chapters, materials..."
              rows={4}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <NexusButton
            disabled={!title.trim() || !examDate}
            onClick={() =>
              onCreate({
                title: title.trim(),
                subjectId: subjectId || null,
                examDate: new Date(examDate).toISOString(),
                syllabus: syllabus.trim() || null,
                preparationProgress: 0,
              })
            }
          >
            Add exam
          </NexusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
