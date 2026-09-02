"use client"

import * as React from "react"
import { motion, LayoutGroup } from "framer-motion"
import { useApp, type AppRoute } from "@/lib/store"
import { NexusLogo } from "@/components/nexus/nexus-logo"
import {
  LayoutDashboard, BookOpen, CheckSquare, CalendarClock, StickyNote, Timer,
  Target, Flame, BarChart3, Award, Compass, Brain, User, Settings,
  ChevronLeft, ChevronRight, Search, Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/lib/data-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface NavItem { route: AppRoute; label: string; icon: React.ComponentType<{ className?: string }> }
interface NavSection { label: string; items: NavItem[] }

const NAV: NavSection[] = [
  { label: "OVERVIEW", items: [{ route: "dashboard", label: "Dashboard", icon: LayoutDashboard }] },
  { label: "STUDY", items: [
    { route: "subjects", label: "Subjects", icon: BookOpen },
    { route: "assignments", label: "Assignments", icon: CheckSquare },
    { route: "exams", label: "Exams", icon: CalendarClock },
    { route: "study", label: "Planner", icon: Target },
    { route: "focus", label: "Focus", icon: Timer },
  ]},
  { label: "INTELLIGENCE", items: [
    { route: "ai-tutor", label: "AI Tutor", icon: Brain },
    { route: "analytics", label: "Analytics", icon: BarChart3 },
  ]},
  { label: "PERSONAL", items: [
    { route: "notes", label: "Notes", icon: StickyNote },
    { route: "goals", label: "Goals", icon: Target },
    { route: "habits", label: "Habits", icon: Flame },
    { route: "achievements", label: "Achievements", icon: Award },
    { route: "career", label: "Career", icon: Compass },
  ]},
]

export function Sidebar() {
  const route = useApp((s) => s.route)
  const navigate = useApp((s) => s.navigate)
  const collapsed = useApp((s) => s.sidebarCollapsed)
  const toggle = useApp((s) => s.toggleSidebar)
  const setCommandOpen = useApp((s) => s.setCommandOpen)
  const setNotifOpen = useApp((s) => s.setNotifOpen)
  const { snapshot } = useData()

  const unreadNotifs = snapshot?.notifications.filter((n) => !n.read).length || 0

  return (
    <TooltipProvider delayDuration={collapsed ? 200 : 9999}>
      <aside
        className={cn(
          "hidden lg:flex flex-col shrink-0 sticky top-0 h-screen bg-white border-r border-black/[0.05] transition-[width] duration-300 ease-[cubic-bezier(0.76,0,0.24,1)]",
          collapsed ? "w-[64px]" : "w-[240px]",
        )}
      >
        {/* Logo */}
        <div className="h-16 px-5 flex items-center justify-between">
          <button
            onClick={() => navigate("dashboard")}
            className={cn("flex items-center", collapsed && "justify-center w-full")}
          >
            <NexusLogo size={22} withWordmark={!collapsed} wordmarkClassName="text-ink text-[14px]" variant="iris" />
          </button>
          {!collapsed && (
            <button onClick={toggle} className="text-black/30 hover:text-ink transition-colors" aria-label="Collapse">
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search + Notif */}
        <div className="px-3 pb-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => setCommandOpen(true)}
                className={cn(
                  "group flex items-center gap-2 h-9 rounded-lg border border-black/[0.06] bg-[#FAFAF8] hover:bg-black/[0.04] text-sm text-black/40 transition-colors",
                  collapsed ? "w-9 justify-center" : "w-full px-3",
                )}
                aria-label="Search"
              >
                <Search className="h-3.5 w-3.5 group-hover:text-ink transition-colors" strokeWidth={2.2} />
                {!collapsed && (
                  <>
                    <span className="flex-1 text-left text-[12px]">Search...</span>
                    <kbd className="text-[9px] font-mono text-black/30 border border-black/[0.06] rounded px-1.5 py-0.5">⌘K</kbd>
                  </>
                )}
              </button>
            </TooltipTrigger>
            {collapsed && <TooltipContent side="right" className="text-xs">Search (⌘K)</TooltipContent>}
          </Tooltip>
          {!collapsed && (
            <button
              onClick={() => setNotifOpen(true)}
              className="relative mt-2 h-9 w-full flex items-center gap-2 px-3 rounded-lg border border-black/[0.06] bg-[#FAFAF8] hover:bg-black/[0.04] text-black/40 hover:text-ink transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-3.5 w-3.5" strokeWidth={2.2} />
              <span className="text-[12px]">Notifications</span>
              {unreadNotifs > 0 && (
                <span className="ml-auto h-4 min-w-4 px-1 rounded-full bg-iris text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifs}
                </span>
              )}
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2.5 overflow-y-auto pb-2">
          <LayoutGroup>
            {NAV.map((section) => (
              <div key={section.label} className="mb-4">
                {!collapsed && (
                  <div className="px-2.5 py-2 text-[9px] uppercase tracking-[0.2em] text-black/30 font-mono font-semibold">
                    {section.label}
                  </div>
                )}
                {collapsed && <div className="mx-auto my-2 h-px w-4 bg-black/[0.06]" />}
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive = route === item.route || (route === "subject_detail" && item.route === "subjects")
                    return (
                      <Tooltip key={item.route}>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() => navigate(item.route)}
                            className={cn(
                              "relative flex items-center gap-2.5 w-full h-9 rounded-lg text-[12px] font-medium transition-colors duration-300",
                              collapsed ? "justify-center px-0" : "px-2.5",
                              isActive ? "text-ink" : "text-black/40 hover:text-ink",
                            )}
                            title={collapsed ? item.label : undefined}
                          >
                            {isActive && (
                              <motion.span
                                layoutId="sidebar-pill"
                                className="absolute inset-0 rounded-lg bg-black/[0.05]"
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                              />
                            )}
                            <item.icon
                              className={cn("relative h-3.5 w-3.5 shrink-0", isActive && "text-iris")}
                              strokeWidth={2.2}
                            />
                            {!collapsed && <span className="relative">{item.label}</span>}
                            {!collapsed && isActive && (
                              <motion.span
                                layoutId="sidebar-dot"
                                className="relative ml-auto h-1 w-1 rounded-full bg-iris"
                                transition={{ type: "spring", stiffness: 500, damping: 40 }}
                              />
                            )}
                          </button>
                        </TooltipTrigger>
                        {collapsed && <TooltipContent side="right" className="text-xs">{item.label}</TooltipContent>}
                      </Tooltip>
                    )
                  })}
                </div>
              </div>
            ))}
          </LayoutGroup>
        </nav>

        {/* Profile + Settings */}
        <div className="p-2.5 border-t border-black/[0.05]">
          {collapsed ? (
            <div className="flex flex-col items-center gap-1">
              {[
                { icon: User, action: () => navigate("profile"), label: "Profile" },
                { icon: Settings, action: () => navigate("settings"), label: "Settings" },
                { icon: ChevronRight, action: toggle, label: "Expand" },
              ].map((btn) => (
                <Tooltip key={btn.label}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={btn.action}
                      className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-black/[0.04] text-black/40 hover:text-ink transition-colors"
                      aria-label={btn.label}
                    >
                      <btn.icon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="text-xs">{btn.label}</TooltipContent>
                </Tooltip>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2.5 rounded-lg p-2 hover:bg-black/[0.04] transition-colors group">
              <button onClick={() => navigate("profile")} className="flex items-center gap-2.5 flex-1 min-w-0">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={snapshot?.profile?.avatarUrl || undefined} />
                  <AvatarFallback className="text-[10px] bg-iris text-white font-medium">
                    {(snapshot?.profile?.fullName || "U").split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-xs font-medium text-ink truncate">{snapshot?.profile?.fullName || "User"}</div>
                  <div className="text-[10px] text-black/40 truncate">{snapshot?.profile?.grade || "Student"}</div>
                </div>
              </button>
              <button
                onClick={() => navigate("settings")}
                className="h-8 w-8 flex items-center justify-center rounded text-black/30 hover:text-ink opacity-0 group-hover:opacity-100 transition-all"
                aria-label="Settings"
              >
                <Settings className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  )
}
