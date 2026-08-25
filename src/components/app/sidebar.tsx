"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useApp, type AppRoute } from "@/lib/store"
import { NexusLogo } from "@/components/nexus/nexus-logo"
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  CalendarClock,
  StickyNote,
  Timer,
  Target,
  Flame,
  BarChart3,
  Award,
  Compass,
  Brain,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  Search,
  Bell,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useData } from "@/lib/data-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface NavItem {
  route: AppRoute
  label: string
  icon: React.ComponentType<{ className?: string }>
}

interface NavSection {
  label: string
  items: NavItem[]
}

const NAV: NavSection[] = [
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
    <aside
      className={cn(
        "hidden lg:flex flex-col shrink-0 sticky top-0 h-screen border-r border-border bg-sidebar transition-[width] duration-300",
        collapsed ? "w-[72px]" : "w-[248px]",
      )}
    >
      {/* Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-border">
        <button
          onClick={() => navigate("dashboard")}
          className={cn("flex items-center", collapsed && "justify-center w-full")}
        >
          <NexusLogo size={28} withWordmark={!collapsed} />
        </button>
        {!collapsed && (
          <button
            onClick={toggle}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Collapse sidebar"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Quick actions */}
      <div className="p-3 flex items-center gap-2">
        <button
          onClick={() => setCommandOpen(true)}
          className={cn(
            "flex items-center gap-2 h-9 rounded-lg border border-border bg-card hover:bg-accent text-sm text-muted-foreground transition-colors",
            collapsed ? "w-9 justify-center" : "w-full px-3",
          )}
          aria-label="Search"
        >
          <Search className="h-4 w-4" />
          {!collapsed && (
            <>
              <span className="flex-1 text-left">Search...</span>
              <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">
                ⌘K
              </kbd>
            </>
          )}
        </button>
        {!collapsed && (
          <button
            onClick={() => setNotifOpen(true)}
            className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-border bg-card hover:bg-accent text-muted-foreground hover:text-foreground"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            {unreadNotifs > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-[#E5484D] text-white text-[10px] font-medium flex items-center justify-center">
                {unreadNotifs}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 overflow-y-auto">
        {NAV.map((section) => (
          <div key={section.label} className="mb-4">
            {!collapsed && (
              <div className="px-3 py-2 text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                {section.label}
              </div>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => (
                <SidebarItem
                  key={item.route}
                  item={item}
                  active={route === item.route || (route === "subject_detail" && item.route === "subjects")}
                  collapsed={collapsed}
                  onClick={() => navigate(item.route)}
                />
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Profile section */}
      <div className="p-2 border-t border-border">
        {collapsed ? (
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={() => navigate("profile")}
              className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Profile"
            >
              <User className="h-4 w-4" />
            </button>
            <button
              onClick={() => navigate("settings")}
              className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
            <button
              onClick={toggle}
              className="h-9 w-9 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Expand sidebar"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 p-2">
            <button
              onClick={() => navigate("profile")}
              className="flex items-center gap-2.5 flex-1 min-w-0 hover:bg-accent rounded-lg p-1 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={snapshot?.profile?.avatarUrl || undefined} />
                <AvatarFallback className="text-xs bg-gradient-to-br from-[#6C63FF] to-[#4238D6] text-white">
                  {(snapshot?.profile?.fullName || "U")
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0 text-left">
                <div className="text-xs font-medium truncate">
                  {snapshot?.profile?.fullName || "User"}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {snapshot?.profile?.grade || "Student"}
                </div>
              </div>
            </button>
            <button
              onClick={() => navigate("settings")}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground"
              aria-label="Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}

function SidebarItem({
  item,
  active,
  collapsed,
  onClick,
}: {
  item: NavItem
  active: boolean
  collapsed: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-3 w-full h-9 rounded-lg text-sm transition-all",
        collapsed ? "justify-center px-0" : "px-3",
        active
          ? "bg-accent text-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
      )}
      title={collapsed ? item.label : undefined}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full bg-[#6C63FF]"
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        />
      )}
      <item.icon className="h-4 w-4 shrink-0" />
      {!collapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
    </button>
  )
}
