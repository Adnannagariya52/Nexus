"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ViewKey =
  | "landing"
  | "login"
  | "signup"
  | "forgot"
  | "reset"
  | "onboarding"
  | "app"

export type AppRoute =
  | "dashboard"
  | "subjects"
  | "subject_detail"
  | "assignments"
  | "exams"
  | "study"
  | "focus"
  | "notes"
  | "goals"
  | "habits"
  | "analytics"
  | "achievements"
  | "career"
  | "ai-tutor"
  | "profile"
  | "settings"

interface AppState {
  // top-level view
  view: ViewKey
  setView: (v: ViewKey) => void

  // in-app route
  route: AppRoute
  setRoute: (r: AppRoute) => void

  // contextual params (subjectId etc.)
  params: Record<string, string>
  setParams: (p: Record<string, string>) => void
  navigate: (route: AppRoute, params?: Record<string, string>) => void

  // command palette
  commandOpen: boolean
  setCommandOpen: (v: boolean) => void

  // notifications drawer
  notifOpen: boolean
  setNotifOpen: (v: boolean) => void

  // sidebar collapsed
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (v: boolean) => void

  // mobile sidebar open
  mobileSidebarOpen: boolean
  setMobileSidebarOpen: (v: boolean) => void

  // theme accent
  accent: "blue" | "violet" | "cyan"
  setAccent: (a: "blue" | "violet" | "cyan") => void
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      view: "landing",
      setView: (v) => set({ view: v }),

      route: "dashboard",
      setRoute: (r) => set({ route: r }),

      params: {},
      setParams: (p) => set({ params: p }),
      navigate: (route, params) => set({ route, params: params ?? {} }),

      commandOpen: false,
      setCommandOpen: (v) => set({ commandOpen: v }),

      notifOpen: false,
      setNotifOpen: (v) => set({ notifOpen: v }),

      sidebarCollapsed: false,
      toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

      mobileSidebarOpen: false,
      setMobileSidebarOpen: (v) => set({ mobileSidebarOpen: v }),

      accent: "blue",
      setAccent: (a) => set({ accent: a }),
    }),
    {
      name: "nexus-app-state",
      partialize: (s) => ({
        view: s.view,
        route: s.route,
        sidebarCollapsed: s.sidebarCollapsed,
        accent: s.accent,
      }),
    },
  ),
)
