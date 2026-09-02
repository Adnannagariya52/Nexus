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
import { BookOpen, Plus, Trash2, Clock, Calendar, ArrowRight, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const COLORS = ["#6C63FF", "#4238D6", "#6C63FF", "#B8FF6A", "#FFB020", "#E5484D", "#EC4899"]

export function SubjectsView() {
  const navigate = useApp((s) => s.navigate)
  const { snapshot, mutate } = useData()
  const [open, setOpen] = React.useState(false)
  const subjects = snapshot?.subjects || []

  async function createSubject(name: string, color: string, description: string) {
    try {
      await mutate(() =>
        createResource("subject", {
          name,
          color,
          description: description || null,
        }),
      )
      toast.success("Subject created")
      setOpen(false)
    } catch (e: any) {
      toast.error(e?.message || "Failed to create subject")
    }
  }

  return (
    <div className="pb-8">
      <NexusViewHeader
        title="Subjects"
        subtitle="Organize your studies into subjects and chapters."
        action={
          <NexusButton onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add subject
          </NexusButton>
        }
      />

      {subjects.length === 0 ? (
        <NexusCard className="p-0">
          <NexusEmptyState
            icon={<BookOpen className="h-6 w-6" />}
            title="No subjects yet."
            description="Add your first subject to start organizing your studies."
            action={
              <NexusButton onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Add subject
              </NexusButton>
            }
          />
        </NexusCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {subjects.map((s) => {
            const chapters = s.chapters || []
            const completed = chapters.filter((c) => c.status === "completed").length
            const inProgress = chapters.filter((c) => c.status === "in_progress").length
            const pct = chapters.length ? (completed / chapters.length) * 100 : 0
            const nextExam = snapshot?.exams.find((e) => e.subjectId === s.id)
            return (
              <motion.div
                key={s.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <NexusCard hover onClick={() => navigate("subject_detail", { subjectId: s.id })} className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center text-base font-semibold"
                      style={{ backgroundColor: `${s.color}15`, color: s.color }}
                    >
                      {s.name.slice(0, 2).toUpperCase()}
                    </div>
                    <NexusProgressRing
                      progress={pct}
                      size={40}
                      stroke={3}
                      color={s.color}
                      label={<span className="text-[9px] font-medium">{Math.round(pct)}%</span>}
                    />
                  </div>
                  <h3 className="text-base font-semibold">{s.name}</h3>
                  {s.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{s.description}</p>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-[10px]">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <BookOpen className="h-3 w-3" />
                      {chapters.length} chapters
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {completed} done
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <AlertCircle className="h-3 w-3" />
                      {inProgress} active
                    </div>
                    {nextExam && (
                      <div className="flex items-center gap-1.5 text-[#FFB020]">
                        <Calendar className="h-3 w-3" />
                        Exam soon
                      </div>
                    )}
                  </div>
                </NexusCard>
              </motion.div>
            )
          })}
        </div>
      )}

      <CreateSubjectDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={createSubject}
      />
    </div>
  )
}

function CreateSubjectDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  onCreate: (name: string, color: string, description: string) => void
}) {
  const [name, setName] = React.useState("")
  const [color, setColor] = React.useState(COLORS[0])
  const [description, setDescription] = React.useState("")

  React.useEffect(() => {
    if (open) {
      setName("")
      setDescription("")
      setColor(COLORS[Math.floor(Math.random() * COLORS.length)])
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>Add new subject</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="subj-name" className="text-xs">Subject name</Label>
            <Input
              id="subj-name"
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Mathematics"
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
                    "h-8 w-8 rounded-full border-2 transition-all",
                    color === c ? "border-white scale-110" : "border-transparent opacity-70",
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="subj-desc" className="text-xs">Description (optional)</Label>
            <Textarea
              id="subj-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this subject about?"
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <NexusButton
            disabled={!name.trim()}
            onClick={() => onCreate(name.trim(), color, description.trim())}
          >
            Create subject
          </NexusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
