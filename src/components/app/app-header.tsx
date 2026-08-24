"use client"

import * as React from "react"
import { useApp } from "@/lib/store"
import { Bell, Search, Menu, Sparkles } from "lucide-react"
import { useData } from "@/lib/data-client"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

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
    dashboard: "Dashboard",
    subjects: "Subjects",
    subject_detail: "Subject",
    assignments: "Assignments",
    exams: "Exams",
    study: "Study Planner",
    focus: "Focus",
    notes: "Notes",
    goals: "Goals",
    habits: "Habits",
    analytics: "Analytics",
    achievements: "Achievements",
    career: "Career",
    "ai-tutor": "AI Tutor",
    profile: "Profile",
    settings: "Settings",
  }

  const unread = snapshot?.notifications.filter((n) => !n.read).length || 0
  const firstName = (snapshot?.profile?.fullName || "Student").split(" ")[0]

  return (
    <header className="sticky top-0 z-30 h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between bg-background/80 backdrop-blur-xl border-b border-border">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <div className="text-[11px] text-muted-foreground hidden sm:block">
            {greeting}, {firstName}
          </div>
          <div className="text-base font-semibold truncate">
            {titleMap[route] || "Dashboard"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-lg border border-border bg-card hover:bg-accent text-sm text-muted-foreground transition-colors"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="text-xs">Search...</span>
          <kbd className="text-[10px] border border-border rounded px-1.5 py-0.5 ml-2">⌘K</kbd>
        </button>
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
        <button
          onClick={() => setNotifOpen(true)}
          className="relative h-9 w-9 inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#EF4444] text-white text-[10px] font-medium flex items-center justify-center">
              {unread}
            </span>
          )}
        </button>
      </div>
    </header>
  )
}
