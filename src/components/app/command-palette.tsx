"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useApp, type AppRoute } from "@/lib/store"
import { useData } from "@/lib/data-client"
import { Command as CommandPrimitive } from "cmdk"
import {
  BookOpen,
  CheckSquare,
  CalendarClock,
  StickyNote,
  Target,
  Brain,
  Flame,
  Award,
  Compass,
  LayoutDashboard,
  Timer,
  BarChart3,
  User,
  Settings,
  Search,
  CornerDownLeft,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  label: string
  hint?: string
  icon: React.ComponentType<{ className?: string }>
  onSelect: () => void
  keywords?: string
}

export function CommandPalette() {
  const open = useApp((s) => s.commandOpen)
  const setOpen = useApp((s) => s.setCommandOpen)
  const navigate = useApp((s) => s.navigate)
  const { snapshot } = useData()
  const [search, setSearch] = React.useState("")

  // Close on Escape (cmdk handles it but reset search on close)
  React.useEffect(() => {
    if (!open) setSearch("")
  }, [open])

  // Global hotkey
  React.useEffect(() => {
    function handler(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        setOpen(!useApp.getState().commandOpen)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [setOpen])

  const navItems: { route: AppRoute; label: string; icon: any; keywords?: string }[] = [
    { route: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { route: "subjects", label: "Subjects", icon: BookOpen, keywords: "subject chapter" },
    { route: "assignments", label: "Assignments", icon: CheckSquare, keywords: "task homework" },
    { route: "exams", label: "Exams", icon: CalendarClock, keywords: "test quiz" },
    { route: "notes", label: "Notes", icon: StickyNote, keywords: "writing" },
    { route: "study", label: "Study Planner", icon: Target, keywords: "plan" },
    { route: "focus", label: "Focus Mode", icon: Timer, keywords: "pomodoro" },
    { route: "goals", label: "Goals", icon: Target, keywords: "milestone" },
    { route: "habits", label: "Habits", icon: Flame, keywords: "streak" },
    { route: "analytics", label: "Analytics", icon: BarChart3, keywords: "stats" },
    { route: "achievements", label: "Achievements", icon: Award, keywords: "trophies" },
    { route: "career", label: "Career", icon: Compass, keywords: "future" },
    { route: "ai-tutor", label: "AI Tutor", icon: Brain, keywords: "ask help gemini" },
    { route: "profile", label: "Profile", icon: User },
    { route: "settings", label: "Settings", icon: Settings },
  ]

  const dataItems: CommandItem[] = []
  for (const s of snapshot?.subjects ?? []) {
    dataItems.push({
      id: `subject-${s.id}`,
      label: s.name,
      hint: "Subject",
      icon: BookOpen,
      onSelect: () => { navigate("subject_detail", { subjectId: s.id }); setOpen(false) },
    })
  }
  for (const a of (snapshot?.assignments ?? []).slice(0, 10)) {
    dataItems.push({
      id: `assign-${a.id}`,
      label: a.title,
      hint: "Assignment",
      icon: CheckSquare,
      onSelect: () => { navigate("assignments"); setOpen(false) },
    })
  }
  for (const e of (snapshot?.exams ?? []).slice(0, 10)) {
    dataItems.push({
      id: `exam-${e.id}`,
      label: e.title,
      hint: "Exam",
      icon: CalendarClock,
      onSelect: () => { navigate("exams"); setOpen(false) },
    })
  }
  for (const n of (snapshot?.notes ?? []).slice(0, 10)) {
    dataItems.push({
      id: `note-${n.id}`,
      label: n.title,
      hint: "Note",
      icon: StickyNote,
      onSelect: () => { navigate("notes"); setOpen(false) },
    })
  }
  for (const g of (snapshot?.goals ?? []).slice(0, 10)) {
    dataItems.push({
      id: `goal-${g.id}`,
      label: g.title,
      hint: "Goal",
      icon: Target,
      onSelect: () => { navigate("goals"); setOpen(false) },
    })
  }
  for (const c of (snapshot?.aiConversations ?? []).slice(0, 8)) {
    dataItems.push({
      id: `ai-${c.id}`,
      label: c.title,
      hint: "AI Conversation",
      icon: Brain,
      onSelect: () => { navigate("ai-tutor", { conversationId: c.id }); setOpen(false) },
    })
  }

  const items: CommandItem[] = [
    ...navItems.map((n) => ({
      id: `nav-${n.route}`,
      label: n.label,
      hint: "Navigate",
      icon: n.icon,
      keywords: n.keywords,
      onSelect: () => { navigate(n.route); setOpen(false) },
    })),
    ...dataItems,
  ]

  const filtered = search
    ? items.filter((i) =>
        `${i.label} ${i.hint} ${i.keywords || ""}`.toLowerCase().includes(search.toLowerCase()),
      )
    : items.slice(0, 8)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4"
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-xl"
          >
            <div className="rounded-2xl border border-border bg-popover shadow-premium overflow-hidden">
              <CommandPrimitive shouldFilter={false} loop>
                <div className="flex items-center gap-3 px-4 border-b border-border">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <CommandPrimitive.Input
                    autoFocus
                    value={search}
                    onValueChange={setSearch}
                    placeholder="Search subjects, assignments, exams, notes, or navigate..."
                    className="flex-1 h-12 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  />
                  <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                    ESC
                  </kbd>
                </div>
                <CommandPrimitive.List className="max-h-[60vh] overflow-y-auto p-2">
                  <CommandPrimitive.Empty className="py-8 text-center text-sm text-muted-foreground">
                    No results found.
                  </CommandPrimitive.Empty>
                  {filtered.map((item, idx) => (
                    <CommandPrimitive.Item
                      key={item.id}
                      value={`${item.label} ${item.hint} ${item.keywords || ""}`}
                      onSelect={() => item.onSelect()}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm",
                        "aria-selected:bg-accent aria-selected:text-foreground",
                      )}
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.hint && (
                        <span className="text-[10px] text-muted-foreground">{item.hint}</span>
                      )}
                      {idx === 0 && (
                        <CornerDownLeft className="h-3 w-3 text-muted-foreground" />
                      )}
                    </CommandPrimitive.Item>
                  ))}
                </CommandPrimitive.List>
              </CommandPrimitive>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
