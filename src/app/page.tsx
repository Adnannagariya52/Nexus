"use client"

import * as React from "react"
import { useNexusAuth } from "@/components/providers/nexus-auth-provider"
import { useApp } from "@/lib/store"
import { LandingPage } from "@/components/landing/landing-page"
import { AuthScreen } from "@/components/auth/auth-screen"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { AppShell } from "@/components/app/app-shell"
import { ToastRegion } from "@/components/nexus/toast-region"
import { FullScreenProgress } from "@/components/nexus/full-screen-progress"

export default function Page() {
  const { user, loading } = useNexusAuth()
  const view = useApp((s) => s.view)
  const setView = useApp((s) => s.setView)

  // Sync view with auth state
  React.useEffect(() => {
    if (loading) return
    if (user) {
      // If on a marketing/auth view, transition to app
      if (view === "landing" || view === "login" || view === "signup" || view === "forgot") {
        setView("app")
      }
    }
  }, [user, loading, view, setView])

  // Route param sync (for ?view=login deep links)
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const v = params.get("view") as typeof view | null
    if (v && ["landing", "login", "signup", "forgot", "reset", "onboarding", "app"].includes(v)) {
      setView(v)
    }
  }, [])

  return (
    <>
      <ToastRegion />
      {loading && view !== "landing" && <FullScreenProgress />}
      <React.Suspense fallback={<FullScreenProgress />}>
        {view === "landing" && <LandingPage />}
        {(view === "login" || view === "signup" || view === "forgot" || view === "reset") && (
          <AuthScreen mode={view} />
        )}
        {view === "onboarding" && <OnboardingFlow />}
        {view === "app" && <AppShell />}
      </React.Suspense>
    </>
  )
}
