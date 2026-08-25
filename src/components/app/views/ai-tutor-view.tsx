"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp } from "@/lib/store"
import { useData } from "@/lib/data-client"
import {
  NexusCard,
  NexusButton,
  NexusEmptyState,
  NexusBadge,
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
import {
  Brain,
  Send,
  Plus,
  Trash2,
  Edit2,
  Copy,
  RefreshCw,
  X,
  Sparkles,
  MessageSquare,
  Search,
  AlertCircle,
  Clock,
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import ReactMarkdown from "react-markdown"

const SUBJECTS = [
  { value: "general", label: "General" },
  { value: "mathematics", label: "Mathematics" },
  { value: "physics", label: "Physics" },
  { value: "chemistry", label: "Chemistry" },
  { value: "biology", label: "Biology" },
  { value: "computer science", label: "Computer Science" },
]

const QUICK_ACTIONS = [
  { id: "explain", label: "Explain this", icon: Sparkles },
  { id: "solve", label: "Solve step-by-step", icon: Brain },
  { id: "example", label: "Give an example", icon: MessageSquare },
  { id: "quiz", label: "Quiz me", icon: Brain },
  { id: "summarize", label: "Summarize", icon: Sparkles },
  { id: "simplify", label: "Simplify", icon: Sparkles },
  { id: "check", label: "Check my answer", icon: Brain },
]

interface Message {
  role: "user" | "assistant"
  content: string
  id?: string
}

export function AITutorView() {
  const params = useApp((s) => s.params)
  const navigate = useApp((s) => s.navigate)
  const { snapshot, mutate } = useData()
  const conversations = snapshot?.aiConversations || []

  const initialConvId = params.conversationId
  const [activeId, setActiveId] = React.useState<string | null>(initialConvId || null)
  const [messages, setMessages] = React.useState<Message[]>([])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [subject, setSubject] = React.useState("general")
  const [quickAction, setQuickAction] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [renameOpen, setRenameOpen] = React.useState<string | null>(null)

  const active = conversations.find((c) => c.id === activeId)

  // Load messages when active conversation changes
  React.useEffect(() => {
    if (!activeId) {
      setMessages([])
      return
    }
    fetch(`/api/data?model=aiMessage&filter=conversation:${activeId}`)
      .then((r) => r.json())
      .then((j) => {
        setMessages(j.data || [])
      })
      .catch(() => setMessages([]))
  }, [activeId, snapshot])

  // Scroll to bottom on new message
  const scrollRef = React.useRef<HTMLDivElement>(null)
  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  async function send(e?: React.FormEvent) {
    e?.preventDefault()
    if (!input.trim() || loading) return

    const userMsg: Message = { role: "user", content: input.trim() }
    const history = messages
    setMessages((m) => [...m, userMsg])
    setInput("")
    setLoading(true)

    try {
      const r = await fetch("/api/ai-tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeId,
          message: userMsg.content,
          subject,
          quickAction,
          history: history.map((m) => ({ role: m.role, content: m.content })),
        }),
      })
      const j = await r.json()
      if (!r.ok) {
        throw new Error(j.error || "Failed")
      }
      setMessages((m) => [...m, { role: "assistant", content: j.reply, id: "new" }])
      if (!activeId) {
        setActiveId(j.conversationId)
      }
      await mutate(async () => Promise.resolve()) // refresh data
      setQuickAction(null)
    } catch (e: any) {
      toast.error(e?.message || "AI Tutor is temporarily unavailable.")
    } finally {
      setLoading(false)
    }
  }

  async function newConversation() {
    setActiveId(null)
    setMessages([])
    setSubject("general")
    setQuickAction(null)
  }

  async function deleteConversation(id: string) {
    try {
      const r = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: "aiConversation", action: "delete", id }),
      })
      if (!r.ok) throw new Error("Failed")
      toast.success("Conversation deleted")
      if (id === activeId) newConversation()
      await mutate(async () => Promise.resolve())
    } catch {
      toast.error("Failed to delete conversation")
    }
  }

  async function renameConversation(id: string, title: string) {
    try {
      const r = await fetch("/api/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "aiConversation",
          action: "update",
          id,
          data: { title },
        }),
      })
      if (!r.ok) throw new Error("Failed")
      toast.success("Conversation renamed")
      setRenameOpen(null)
      await mutate(async () => Promise.resolve())
    } catch {
      toast.error("Failed to rename conversation")
    }
  }

  async function copyMessage(content: string) {
    try {
      await navigator.clipboard.writeText(content)
      toast.success("Copied to clipboard")
    } catch {
      toast.error("Failed to copy")
    }
  }

  async function regenerateLast() {
    if (messages.length < 2) return
    const lastUser = [...messages].reverse().find((m) => m.role === "user")
    if (!lastUser) return
    setMessages((m) => m.slice(0, m.length - 1))
    setInput(lastUser.content)
    setTimeout(() => send(), 50)
  }

  const filteredConvs = conversations.filter((c) =>
    !search || c.title.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="pb-8">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 h-[calc(100vh-9rem)]">
        {/* Sidebar: conversations */}
        <NexusCard className="hidden lg:flex flex-col p-3 overflow-hidden">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-[#4238D6]" />
              <span className="text-sm font-semibold">Conversations</span>
            </div>
            <button
              onClick={newConversation}
              className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="New conversation"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="relative mb-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="h-8 pl-7 text-xs bg-background"
            />
          </div>
          <div className="flex-1 overflow-y-auto space-y-0.5">
            {filteredConvs.length === 0 ? (
              <div className="text-center py-8 text-xs text-muted-foreground">
                No conversations yet.
              </div>
            ) : (
              filteredConvs.map((c) => (
                <div
                  key={c.id}
                  className={cn(
                    "group relative rounded-lg p-2 cursor-pointer transition-colors",
                    c.id === activeId ? "bg-accent" : "hover:bg-accent/50",
                  )}
                  onClick={() => setActiveId(c.id)}
                >
                  <div className="text-xs font-medium truncate pr-4">{c.title}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <Clock className="h-2.5 w-2.5" />
                    {new Date(c.updatedAt).toLocaleDateString()}
                  </div>
                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 flex items-center gap-0.5">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setRenameOpen(c.id)
                      }}
                      className="h-6 w-6 flex items-center justify-center rounded hover:bg-background text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        if (confirm("Delete this conversation?")) deleteConversation(c.id)
                      }}
                      className="h-6 w-6 flex items-center justify-center rounded hover:bg-background text-muted-foreground hover:text-[#E5484D]"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </NexusCard>

        {/* Main: chat */}
        <NexusCard className="flex flex-col overflow-hidden">
          {/* Header */}
          <div className="h-14 px-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#4238D6] flex items-center justify-center shadow-glow">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold">NEXUS AI Tutor</div>
                <div className="text-[10px] text-muted-foreground">
                  Your personal study companion
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger className="h-8 w-32 text-xs bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={newConversation}
                className="lg:hidden h-8 w-8 flex items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 && !loading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#4238D6] flex items-center justify-center mb-5 shadow-glow">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-lg font-semibold">Ask your first question</h2>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-sm">
                  Ask anything about your studies. The AI tutor adapts to your level and selected subject.
                </p>
                <div className="mt-6 grid grid-cols-2 gap-2 max-w-md">
                  {[
                    "Explain Newton's third law simply",
                    "Solve: 2x + 5 = 15",
                    "What is photosynthesis?",
                    "Quiz me on basic calculus",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-left text-xs p-2.5 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                      "flex gap-3",
                      m.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {m.role === "assistant" && (
                      <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#4238D6] flex items-center justify-center shrink-0">
                        <Brain className="h-4 w-4 text-white" />
                      </div>
                    )}
                    <div
                      className={cn(
                        "max-w-[80%] group relative",
                      )}
                    >
                      <div
                        className={cn(
                          "rounded-2xl px-4 py-2.5 text-sm",
                          m.role === "user"
                            ? "bg-[#6C63FF]/[0.15] border border-[#6C63FF]/30 text-foreground rounded-tr-md"
                            : "bg-card border border-border text-foreground rounded-tl-md",
                        )}
                      >
                        {m.role === "assistant" ? (
                          <div className="prose prose-sm prose-invert max-w-none [&>*]:first:mt-0 [&>*]:last:mb-0 [&_p]:my-1.5 [&_ul]:my-1.5 [&_ol]:my-1.5 [&_li]:my-0.5 [&_pre]:bg-background/50 [&_pre]:border [&_pre]:border-border [&_code]:text-[#6C63FF] [&_h1]:text-base [&_h1]:font-semibold [&_h2]:text-sm [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_strong]:text-foreground">
                            <ReactMarkdown>{m.content}</ReactMarkdown>
                          </div>
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap">{m.content}</p>
                        )}
                      </div>
                      {m.role === "assistant" && (
                        <div className="absolute -bottom-7 left-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => copyMessage(m.content)}
                            className="h-6 px-1.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            <Copy className="h-2.5 w-2.5" /> Copy
                          </button>
                          <button
                            onClick={regenerateLast}
                            className="h-6 px-1.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground"
                          >
                            <RefreshCw className="h-2.5 w-2.5" /> Regenerate
                          </button>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex gap-3">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-[#6C63FF] to-[#4238D6] flex items-center justify-center shrink-0">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div className="rounded-2xl rounded-tl-md bg-card border border-border px-4 py-3 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#6C63FF] animate-bounce" />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[#6C63FF] animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="h-1.5 w-1.5 rounded-full bg-[#6C63FF] animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Quick actions */}
          <div className="px-3 pt-2 border-t border-border">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
              {QUICK_ACTIONS.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setQuickAction(q.id === quickAction ? null : q.id)
                    toast.info(`Quick action: ${q.label}${input ? " — send to apply" : " — then type your question"}`)
                  }}
                  className={cn(
                    "shrink-0 inline-flex items-center gap-1 h-7 px-2 rounded-full text-[10px] font-medium border transition-all",
                    quickAction === q.id
                      ? "bg-[#6C63FF]/15 border-[#6C63FF]/40 text-[#6C63FF]"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <q.icon className="h-2.5 w-2.5" />
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          {/* Composer */}
          <form onSubmit={send} className="p-3 border-t border-border flex items-center gap-2">
            <input
              type="file"
              id="ai-image-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  toast.info("Image upload requires Supabase Storage. Coming soon — paste your question as text for now.")
                }
              }}
            />
            <button
              type="button"
              onClick={() => toast.info("Image upload requires Supabase Storage. Coming soon.")}
              className="h-10 w-10 flex items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground"
              aria-label="Attach image"
              title="Image upload requires Supabase Storage"
            >
              <Plus className="h-4 w-4" />
            </button>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your studies..."
              className="flex-1 h-10 px-4 bg-background border border-border rounded-lg text-sm outline-none focus:border-[#6C63FF]/50"
            />
            <NexusButton type="submit" size="icon" className="h-10 w-10" disabled={!input.trim() || loading}>
              <Send className="h-4 w-4" />
            </NexusButton>
          </form>
        </NexusCard>
      </div>

      {/* Rename dialog */}
      <RenameDialog
        open={!!renameOpen}
        initialTitle={conversations.find((c) => c.id === renameOpen)?.title || ""}
        onCancel={() => setRenameOpen(null)}
        onSave={(t) => renameOpen && renameConversation(renameOpen, t)}
      />
    </div>
  )
}

function RenameDialog({
  open,
  initialTitle,
  onCancel,
  onSave,
}: {
  open: boolean
  initialTitle: string
  onCancel: () => void
  onSave: (title: string) => void
}) {
  const [title, setTitle] = React.useState(initialTitle)
  React.useEffect(() => setTitle(initialTitle), [initialTitle])
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="bg-popover border-border">
        <DialogHeader>
          <DialogTitle>Rename conversation</DialogTitle>
        </DialogHeader>
        <div className="py-2">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onCancel}>Cancel</Button>
          <NexusButton disabled={!title.trim()} onClick={() => onSave(title.trim())}>
            Save
          </NexusButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
