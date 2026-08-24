"use client"

import * as React from "react"
import { useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { useApp, type AppRoute } from "@/lib/store"
import { DataProvider, useData } from "@/lib/data-client"
import { NexusLogo } from "@/components/nexus/nexus-logo"
import { Sidebar } from "@/components/app/sidebar"
import { AppHeader } from "@/components/app/app-header"
import { CommandPalette } from "@/components/app/command-palette"
import { NotificationsDrawer } from "@/components/app/notifications-drawer"
import { MobileTabBar } from "@/components/app/mobile-tab-bar"
import { MobileSidebar } from "@/components/app/mobile-sidebar"
import { FullScreenProgress } from "@/components/nexus/full-screen-progress"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"

export function AppShell() {
  const { data: session, status } = useSession()
  const setView = useApp((s) => s.setView)

  if (status === "loading") return <FullScreenProgress />

  if (!session?.user) {
    setView("login")
    return <FullScreenProgress />
  }

  return (
    <DataProvider>
      <OnboardingGate>
        <div className="relative min-h-screen bg-background text-foreground">
          <div className="flex">
            <Sidebar />
            <MobileSidebar />
            <main className="flex-1 min-w-0 pb-20 lg:pb-0">
              <AppHeader />
              <div className="px-4 sm:px-6 lg:px-8 pt-6">
                <RouteRenderer />
              </div>
            </main>
          </div>

          <MobileTabBar />
          <CommandPalette />
          <NotificationsDrawer />
        </div>
      </OnboardingGate>
    </DataProvider>
  )
}

function OnboardingGate({ children }: { children: React.ReactNode }) {
  const { snapshot, loading } = useData()
  const setView = useApp((s) => s.setView)

  if (loading || !snapshot) return <FullScreenProgress />
  if (!snapshot.profile?.onboardingCompleted) {
    return <OnboardingFlow />
  }
  return <>{children}</>
}

function RouteRenderer() {
  const route = useApp((s) => s.route)
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={route}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      >
        <RouteView route={route} />
      </motion.div>
    </AnimatePresence>
  )
}

function RouteView({ route }: { route: AppRoute }) {
  const Lazy = React.lazy(() => Promise.resolve({ default: PLACEHOLDER }))
  // Direct imports kept simple — no actual lazy
  switch (route) {
    case "dashboard":
      return <DashboardView />
    case "subjects":
      return <SubjectsView />
    case "subject_detail":
      return <SubjectDetailView />
    case "assignments":
      return <AssignmentsView />
    case "exams":
      return <ExamsView />
    case "study":
      return <StudyPlannerView />
    case "focus":
      return <FocusView />
    case "notes":
      return <NotesView />
    case "goals":
      return <GoalsView />
    case "habits":
      return <HabitsView />
    case "analytics":
      return <AnalyticsView />
    case "achievements":
      return <AchievementsView />
    case "career":
      return <CareerView />
    case "ai-tutor":
      return <AITutorView />
    case "profile":
      return <ProfileView />
    case "settings":
      return <SettingsView />
    default:
      return <DashboardView />
  }
}

// Imports — these components are defined in separate files; we use require to keep file count manageable
import { DashboardView } from "@/components/app/views/dashboard-view"
import { SubjectsView } from "@/components/app/views/subjects-view"
import { SubjectDetailView } from "@/components/app/views/subject-detail-view"
import { AssignmentsView } from "@/components/app/views/assignments-view"
import { ExamsView } from "@/components/app/views/exams-view"
import { StudyPlannerView } from "@/components/app/views/study-planner-view"
import { FocusView } from "@/components/app/views/focus-view"
import { NotesView } from "@/components/app/views/notes-view"
import { GoalsView } from "@/components/app/views/goals-view"
import { HabitsView } from "@/components/app/views/habits-view"
import { AnalyticsView } from "@/components/app/views/analytics-view"
import { AchievementsView } from "@/components/app/views/achievements-view"
import { CareerView } from "@/components/app/views/career-view"
import { AITutorView } from "@/components/app/views/ai-tutor-view"
import { ProfileView } from "@/components/app/views/profile-view"
import { SettingsView } from "@/components/app/views/settings-view"

const PLACEHOLDER = () => null
