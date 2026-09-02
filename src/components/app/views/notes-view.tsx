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
import { StickyNote, Plus, Search, Trash2, X, Save, FileText } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export function NotesView() {
  const { snapshot, mutate } = useData()
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [filterSubject, setFilterSubject] = React.useState("all")

  const notes = snapshot?.notes || []
  const subjects = snapshot?.subjects || []

  const filtered = notes.filter((n) => {
    const matchesSearch =
      !search ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.content.toLowerCase().includes(search.toLowerCase())
    const matchesSubject = filterSubject === "all" || n.subjectId === filterSubject
    return matchesSearch && matchesSubject
  })

  async function createNote(title: string, content: string, subjectId: string | null) {
    try {
      const created = await mutate(() => createResource("note", { title, content, subjectId }))
      setOpen(false)
      setEditing(created.id)
      toast.success("Note created")
    } catch {
      toast.error("Failed to create note")
    }
  }

  async function updateNote(id: string, data: any) {
    try {
      await mutate(() => updateResource("note", id, data))
    } catch {
      toast.error("Failed to save note")
    }
  }

  async function remove(id: string) {
    try {
      await mutate(() => deleteResource("note", id))
      setEditing(null)
      toast.success("Note deleted")
    } catch {
      toast.error("Failed to delete note")
    }
  }

  const editingNote = notes.find((n) => n.id === editing)

  return (
    <div className="pb-8 space-y-6">
      <NexusViewHeader
        title="Notes"
        subtitle="A clean, distraction-free place for your knowledge."
        action={
          <NexusButton onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            New note
          </NexusButton>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search notes..."
            className="pl-8 bg-card"
          />
        </div>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-48 bg-card">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subjects</SelectItem>
            {subjects.map((s) => (
              <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <NexusCard className="p-0">
          <NexusEmptyState
            icon={<FileText className="h-6 w-6" />}
            title={search ? "No notes match your search." : "Your knowledge base starts here."}
            description={
              search
                ? "Try a different search term."
                : "Capture ideas, summaries, and concepts in a clean editor."
            }
            action={
              <NexusButton onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                New note
              </NexusButton>
            }
          />
        </NexusCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
            >
              <NexusCard hover onClick={() => setEditing(n.id)} className="p-4 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="h-7 w-7 rounded-lg flex items-center justify-center"
                    style={{
                      backgroundColor: n.subjectId
                        ? `${subjects.find((s) => s.id === n.subjectId)?.color || "#6C63FF"}15`
                        : "rgba(148,163,184,0.1)",
                      color: n.subjectId
                        ? subjects.find((s) => s.id === n.subjectId)?.color || "#6C63FF"
                        : "#94A3B8",
                    }}
                  >
                    <StickyNote className="h-3.5 w-3.5" />
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    {n.subjectId
                      ? subjects.find((s) => s.id === n.subjectId)?.name || "Unknown"
                      : "No subject"}
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-1 line-clamp-2">{n.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-4 flex-1">
                  {n.content || "Empty note"}
                </p>
                <div className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border">
                  Updated {new Date(n.updatedAt).toLocaleDateString()}
                </div>
              </NexusCard>
            </motion.div>
          ))}
        </div>
      )}

      <NoteDialog open={open} onOpenChange={setOpen} subjects={subjects} onCreate={createNote} />

      {/* Editor */}
      <AnimatePresence>
        {editingNote && (
          <NoteEditor
            note={editingNote}
            subjectName={
              editingNote.subjectId
                ? subjects.find((s) => s.id === editingNote.subjectId)?.name
                : undefined
            }
            onSave={updateNote}
            onDelete={remove}
            onClose={() => setEditing(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function NoteDialog({
  open,
  onOpenChange,
  subjects,
  onCreate,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
  subjects: { id: string; name: string }[]
  onCreate: (title: string, content: string, subjectId: string | null) => void
}) {
  const [title, setTitle] = React.useState("")
  const [content, setContent] = React.useState("")
  const [subjectId, setSubjectId] = React.useState("none")

  React.useEffect(() => {
    if (open) {
      setTitle("")
      setContent("")
      setSubjectId("none")
    }
  }, [open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>New note</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs">Title</Label>
            <Input
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Subject</Label>
            <Select value={subjectId} onValueChange={setSubjectId}>
              <SelectTrigger className="bg-background">
                <SelectValue placeholder="No subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No subject</SelectItem>
                {subjects.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <NexusButton
            disabled={!title.trim()}
            onClick={() =>
              onCreate(
                title.trim(),
                content.trim(),
                subjectId === "none" ? null : subjectId,
              )
            }
          >
            Create note
          </NexusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function NoteEditor({
  note,
  subjectName,
  onSave,
  onDelete,
  onClose,
}: {
  note: any
  subjectName?: string
  onSave: (id: string, data: any) => void
  onDelete: (id: string) => void
  onClose: () => void
}) {
  const [title, setTitle] = React.useState(note.title)
  const [content, setContent] = React.useState(note.content)
  const [savedAt, setSavedAt] = React.useState<Date | null>(null)

  // Autosave debounced
  React.useEffect(() => {
    const id = setTimeout(() => {
      if (title !== note.title || content !== note.content) {
        onSave(note.id, { title, content })
        setSavedAt(new Date())
      }
    }, 1200)
    return () => clearTimeout(id)
     
  }, [title, content])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] bg-black/70 backdrop-blur-md flex items-stretch p-0 sm:p-6"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex-1 sm:max-w-4xl mx-auto bg-background rounded-none sm:rounded-2xl border border-border flex flex-col overflow-hidden"
      >
        <div className="h-14 px-4 flex items-center justify-between border-b border-border">
          <div className="flex items-center gap-2">
            {subjectName && <NexusBadge color="blue">{subjectName}</NexusBadge>}
            <span className="text-[10px] text-muted-foreground">
              {savedAt ? `Saved ${savedAt.toLocaleTimeString()}` : "Autosaves"}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-[#E5484D]"
              onClick={() => {
                if (confirm("Delete this note?")) onDelete(note.id)
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-2xl mx-auto px-6 sm:px-8 py-8">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled note"
              className="w-full bg-transparent text-2xl sm:text-3xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
            />
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className="w-full mt-6 bg-transparent text-sm leading-relaxed outline-none resize-none min-h-[60vh] placeholder:text-muted-foreground/40"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
