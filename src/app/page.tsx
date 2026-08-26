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

const AUTH_VIEWS = ["login", "signup", "forgot", "reset"] as const

export default function Page() {
  const { user, loading } = useNexusAuth()
  const view = useApp((s) => s.view)
  const setView = useApp((s) => s.setView)

  // On mount, check URL for ?view= param
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const v = params.get("view")
    if (v && ["landing", "login", "signup", "forgot", "reset", "onboarding", "app"].includes(v)) {
      setView(v as any)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync view with auth state
  React.useEffect(() => {
    if (loading) return
    if (user) {
      if (view === "landing" || AUTH_VIEWS.includes(view as any)) {
        setView("app")
      }
    } else {
      if (view === "app" || view === "onboarding") {
        setView("landing")
      }
    }
  }, [user, loading, view, setView])

  // Determine what to render
  const isAuthView = AUTH_VIEWS.includes(view as any)

  return (
    <>
      <ToastRegion />
      {/* Show loading screen only when auth is loading AND we're not on landing or auth pages */}
      {loading && view !== "landing" && !isAuthView && <FullScreenProgress />}

      {/* Landing page — show when view is landing OR when auth is loading and no specific view requested */}
      {view === "landing" && <LandingPage />}

      {/* Auth screens */}
      {isAuthView && <AuthScreen mode={view as any} />}

      {/* Onboarding */}
      {view === "onboarding" && <OnboardingFlow />}

      {/* App */}
      {view === "app" && <AppShell />}
    </>
  )
}
