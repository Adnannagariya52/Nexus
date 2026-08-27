"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp, type AppRoute } from "@/lib/store"
import { NexusLogo } from "@/components/nexus/nexus-logo"
import { useNexusAuth } from "@/components/providers/nexus-auth-provider"
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  CalendarClock,
  StickyNote,
  Target,
  Timer,
  Flame,
  BarChart3,
  Award,
  Compass,
  Brain,
  User,
  Settings,
  X,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/lib/data-client"

const NAV: { label: string; items: { route: AppRoute; label: string; icon: any }[] }[] = [
  {
    label: "Home",
    items: [{ route: "dashboard", label: "Dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Organize",
    items: [
      { route: "subjects", label: "Subjects", icon: BookOpen },
      { route: "assignments", label: "Assignments", icon: CheckSquare },
      { route: "exams", label: "Exams", icon: CalendarClock },
      { route: "notes", label: "Notes", icon: StickyNote },
    ],
  },
  {
    label: "Study",
    items: [
      { route: "study", label: "Study Planner", icon: Target },
      { route: "focus", label: "Focus", icon: Timer },
    ],
  },
  {
    label: "Grow",
    items: [
      { route: "goals", label: "Goals", icon: Target },
      { route: "habits", label: "Habits", icon: Flame },
      { route: "analytics", label: "Analytics", icon: BarChart3 },
      { route: "achievements", label: "Achievements", icon: Award },
    ],
  },
  {
    label: "Explore",
    items: [
      { route: "career", label: "Career", icon: Compass },
      { route: "ai-tutor", label: "AI Tutor", icon: Brain },
    ],
  },
]

export function MobileSidebar() {
  const open = useApp((s) => s.mobileSidebarOpen)
  const setOpen = useApp((s) => s.setMobileSidebarOpen)
  const route = useApp((s) => s.route)
  const navigate = useApp((s) => s.navigate)
  const { signOut } = useNexusAuth()
  const { snapshot } = useData()

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 top-0 z-[110] h-screen w-[280px] bg-sidebar border-r border-border flex flex-col lg:hidden"
          >
            <div className="h-16 px-4 flex items-center justify-between border-b border-border">
              <NexusLogo size={26} withWordmark />
              <button onClick={() => setOpen(false)} className="text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4">
              {NAV.map((section) => (
                <div key={section.label} className="mb-4">
                  <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                    {section.label}
                  </div>
                  <div className="space-y-0.5">
                    {section.items.map((item) => (
                      <button
                        key={item.route}
                        onClick={() => {
                          navigate(item.route)
                          setOpen(false)
                        }}
                        className={cn(
                          "flex items-center gap-3 w-full h-10 px-3 rounded-lg text-sm transition-colors",
                          route === item.route
                            ? "bg-accent text-foreground"
                            : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                        )}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>

            <div className="border-t border-border p-3">
              <div className="flex items-center gap-2 mb-2">
                <button
                  onClick={() => { navigate("profile"); setOpen(false) }}
                  className="flex items-center gap-2 flex-1 h-10 px-3 rounded-lg hover:bg-accent text-sm"
                >
                  <User className="h-4 w-4" />
                  {snapshot?.profile?.fullName || "Profile"}
                </button>
                <button
                  onClick={() => { navigate("settings"); setOpen(false) }}
                  className="h-10 w-10 flex items-center justify-center rounded-lg hover:bg-accent"
                >
                  <Settings className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={async () => {
                  await signOut()
                  localStorage.clear()
                  
                  window.location.href = "/"
                }}
                className="flex items-center gap-2 w-full h-10 px-3 rounded-lg hover:bg-accent text-sm text-[#E5484D]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
