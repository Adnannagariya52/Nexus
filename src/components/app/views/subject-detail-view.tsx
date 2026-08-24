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
  ArrowLeft,
  BookOpen,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  Plus,
  StickyNote,
  Trash2,
  Edit2,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function SubjectDetailView() {
  const params = useApp((s) => s.params)
  const navigate = useApp((s) => s.navigate)
  const { snapshot, mutate } = useData()
  const [chapterDialog, setChapterDialog] = React.useState(false)
  const [editingChapter, setEditingChapter] = React.useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = React.useState<string | null>(null)

  const subjectId = params.subjectId
  const subject = snapshot?.subjects.find((s) => s.id === subjectId)
  const chapters = subject?.chapters || []
  const assignments = snapshot?.assignments.filter((a) => a.subjectId === subjectId) || []
  const notes = snapshot?.notes.filter((n) => n.subjectId === subjectId) || []
  const exams = snapshot?.exams.filter((e) => e.subjectId === subjectId) || []

  if (!subject) {
    return (
      <NexusEmptyState
        icon={<BookOpen className="h-6 w-6" />}
        title="Subject not found."
        description="This subject doesn't exist or has been deleted."
        action={
          <NexusButton onClick={() => navigate("subjects")}>Back to subjects</NexusButton>
        }
      />
    )
  }

  const completedChapters = chapters.filter((c) => c.status === "completed").length
  const progressPct = chapters.length ? (completedChapters / chapters.length) * 100 : 0

  async function createChapter(title: string, description: string) {
    try {
      await mutate(() =>
        createResource("chapter", {
          subjectId,
          title,
          description: description || null,
          status: "not_started",
          progress: 0,
        }),
      )
      toast.success("Chapter added")
      setChapterDialog(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to add chapter")
    }
  }

  async function updateChapterStatus(id: string, status: string, progress: number) {
    try {
      await mutate(() => updateResource("chapter", id, { status, progress }))
    } catch {
      toast.error("Failed to update chapter")
    }
  }

  async function deleteChapter(id: string) {
    try {
      await mutate(() => deleteResource("chapter", id))
      toast.success("Chapter deleted")
      setConfirmDelete(null)
    } catch {
      toast.error("Failed to delete chapter")
    }
  }

  async function deleteSubject() {
    try {
      await mutate(() => deleteResource("subject", subjectId))
      toast.success("Subject deleted")
      navigate("subjects")
    } catch {
      toast.error("Failed to delete subject")
    }
  }

  return (
    <div className="pb-8 space-y-6">
      <button
        onClick={() => navigate("subjects")}
        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
      >
        <ArrowLeft className="h-3 w-3" />
        Back to subjects
      </button>

      {/* Hero header */}
      <NexusCard className="p-6 sm:p-8 relative overflow-hidden">
        <div
          className="absolute -top-20 -right-20 h-48 w-48 rounded-full blur-3xl opacity-30"
          style={{ backgroundColor: subject.color }}
        />
        <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="h-14 w-14 rounded-2xl flex items-center justify-center text-xl font-semibold"
              style={{ backgroundColor: `${subject.color}20`, color: subject.color }}
            >
              {subject.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">{subject.name}</h1>
              {subject.description && (
                <p className="text-sm text-muted-foreground mt-1 max-w-lg">{subject.description}</p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <NexusBadge color="blue">
                  <BookOpen className="h-3 w-3" />
                  {chapters.length} chapters
                </NexusBadge>
                <NexusBadge color="violet">
                  <CheckSquare className="h-3 w-3" />
                  {assignments.length} assignments
                </NexusBadge>
                <NexusBadge color="amber">
                  <CalendarClock className="h-3 w-3" />
                  {exams.length} exams
                </NexusBadge>
                <NexusBadge color="cyan">
                  <StickyNote className="h-3 w-3" />
                  {notes.length} notes
                </NexusBadge>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <NexusButton
              variant="outline"
              size="icon"
              onClick={() => {
                if (confirm("Delete this subject and all its chapters?")) deleteSubject()
              }}
              aria-label="Delete subject"
            >
              <Trash2 className="h-4 w-4" />
            </NexusButton>
            <NexusButton onClick={() => setChapterDialog(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add chapter
            </NexusButton>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs text-muted-foreground">Overall progress</div>
            <div className="text-sm font-semibold" style={{ color: subject.color }}>
              {Math.round(progressPct)}%
            </div>
          </div>
          <NexusProgressBar progress={progressPct} color={subject.color} className="h-2" />
        </div>
      </NexusCard>

      {/* Chapters roadmap */}
      <div>
        <h2 className="text-base font-semibold mb-3">Chapter Roadmap</h2>
        {chapters.length === 0 ? (
          <NexusCard className="p-0">
            <NexusEmptyState
              icon={<BookOpen className="h-6 w-6" />}
              title="No chapters yet."
              description="Break this subject into chapters to track your progress."
              action={
                <NexusButton onClick={() => setChapterDialog(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add chapter
                </NexusButton>
              }
            />
          </NexusCard>
        ) : (
          <div className="space-y-2">
            {chapters.map((c, i) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <NexusCard className="p-4 flex items-center gap-3">
                  <button
                    onClick={() => {
                      const nextStatus =
                        c.status === "not_started"
                          ? "in_progress"
                          : c.status === "in_progress"
                            ? "completed"
                            : "not_started"
                      const nextProgress =
                        nextStatus === "completed" ? 100 : nextStatus === "in_progress" ? 50 : 0
                      updateChapterStatus(c.id, nextStatus, nextProgress)
                    }}
                    className={cn(
                      "h-7 w-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all",
                      c.status === "completed"
                        ? "bg-[#22C55E] border-[#22C55E] text-white"
                        : c.status === "in_progress"
                          ? "border-[#5B8CFF] text-[#5B8CFF]"
                          : "border-border text-transparent",
                    )}
                  >
                    {c.status === "completed" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-[10px] font-medium">{i + 1}</span>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className={cn("text-sm font-medium", c.status === "completed" && "line-through text-muted-foreground")}>
                      {c.title}
                    </div>
                    {c.description && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                        {c.description}
                      </div>
                    )}
                  </div>
                  <NexusBadge
                    color={
                      c.status === "completed"
                        ? "green"
                        : c.status === "in_progress"
                          ? "blue"
                          : "muted"
                    }
                  >
                    {c.status === "completed"
                      ? "Done"
                      : c.status === "in_progress"
                        ? "Active"
                        : "Not started"}
                  </NexusBadge>
                  <button
                    onClick={() => {
                      if (confirm(`Delete chapter "${c.title}"?`)) deleteChapter(c.id)
                    }}
                    className="text-muted-foreground hover:text-[#EF4444] opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </NexusCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Related assignments & notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <NexusCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Assignments
            </h3>
            <button
              onClick={() => navigate("assignments")}
              className="text-xs text-[#5B8CFF] hover:underline"
            >
              View all
            </button>
          </div>
          {assignments.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No assignments in this subject yet.
            </div>
          ) : (
            <div className="space-y-2">
              {assignments.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center gap-2 text-sm">
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4",
                      a.status === "completed" ? "text-[#22C55E]" : "text-muted-foreground",
                    )}
                  />
                  <span className={cn("flex-1 truncate", a.status === "completed" && "line-through text-muted-foreground")}>
                    {a.title}
                  </span>
                  {a.dueDate && (
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(a.dueDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </NexusCard>

        <NexusCard className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Notes
            </h3>
            <button
              onClick={() => navigate("notes")}
              className="text-xs text-[#5B8CFF] hover:underline"
            >
              View all
            </button>
          </div>
          {notes.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted-foreground">
              No notes in this subject yet.
            </div>
          ) : (
            <div className="space-y-2">
              {notes.slice(0, 5).map((n) => (
                <div key={n.id} className="flex items-center gap-2 text-sm">
                  <StickyNote className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 truncate">{n.title}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(n.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </NexusCard>
      </div>

      <ChapterDialog
        open={chapterDialog}
        onOpenChange={setChapterDialog}
        onCreate={createChapter}
      />
    </div>
  )
}

function ChapterDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (title: string, description: string) => void
}) {
  const [title, setTitle] = React.useState("")
  const [description, setDescription] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setTitle("")
      setDescription("")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>Add chapter</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Chapter title</Label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 3 — Integration"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this chapter cover?"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <NexusButton disabled={!title.trim()} onClick={() => onCreate(title.trim(), description.trim())}>
            Add chapter
          </NexusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
