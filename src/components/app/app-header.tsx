"use client"

import * as React from "react"
import { useApp } from "@/lib/store"
import { Bell, Search, Menu, Moon, Sun } from "lucide-react"
import { useData } from "@/lib/data-client"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"

export function AppHeader() {
  const route = useApp((s) => s.route)
  const setCommandOpen = useApp((s) => s.setCommandOpen)
  const setNotifOpen = useApp((s) => s.setNotifOpen)
  const setMobileSidebarOpen = useApp((s) => s.setMobileSidebarOpen)
  const { snapshot } = useData()
  const { theme, setTheme } = useTheme()
  const [greeting, setGreeting] = React.useState("")

  React.useEffect(() => {
    const h = new Date().getHours()
    setGreeting(h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening")
  }, [])

  const titleMap: Record<string, string> = {
    dashboard: "Dashboard", subjects: "Subjects", subject_detail: "Subject",
    assignments: "Assignments", exams: "Exams", study: "Study Planner",
    focus: "Focus", notes: "Notes", goals: "Goals", habits: "Habits",
    analytics: "Analytics", achievements: "Achievements", career: "Career",
    "ai-tutor": "AI Tutor", profile: "Profile", settings: "Settings",
  }

  const unread = snapshot?.notifications.filter((n) => !n.read).length || 0
  const firstName = (snapshot?.profile?.fullName || "Student").split(" ")[0]

  return (
    <header className="sticky top-0 z-30 h-16 px-6 flex items-center justify-between bg-paper/80 backdrop-blur-xl border-b border-black/[0.06]">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg border border-black/[0.06] bg-white text-black/40 hover:text-ink transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <div className="text-[10px] font-mono tracking-[0.15em] text-black/30 hidden sm:block">
            {greeting.toUpperCase()} · {firstName.toUpperCase()}
          </div>
          <div
            className="text-base font-semibold tracking-tight truncate"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {titleMap[route] || "Dashboard"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-full border border-black/[0.06] bg-white hover:bg-black/[0.04] text-sm text-black/35 transition-colors group"
        >
          <Search className="h-3.5 w-3.5 group-hover:text-ink transition-colors" strokeWidth={2.2} />
          <span className="text-[10px]">Search subjects, tasks, notes…</span>
          <kbd className="text-[9px] font-mono text-black/30 border border-black/[0.06] rounded px-1.5 py-0.5 ml-2">⌘K</kbd>
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 inline-flex items-center justify-center rounded-full border border-black/[0.06] bg-white text-black/40 hover:text-ink transition-colors"
          aria-label="Toggle theme"
        >
          <motion.div key={theme} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} transition={{ duration: 0.2 }}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </motion.div>
        </button>
        <button
          onClick={() => setNotifOpen(true)}
          className="relative h-9 w-9 inline-flex items-center justify-center rounded-full border border-black/[0.06] bg-white text-black/40 hover:text-ink transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" strokeWidth={2.2} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-iris text-white text-[10px] font-bold flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
