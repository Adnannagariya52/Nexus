"use client"

import * as React from "react"
import { useNexusAuth } from "@/components/providers/nexus-auth-provider"
import { useApp } from "@/lib/store"
import dynamic from "next/dynamic"
import { AuthScreen } from "@/components/auth/auth-screen"
import { OnboardingFlow } from "@/components/onboarding/onboarding-flow"
import { AppShell } from "@/components/app/app-shell"
import { ToastRegion } from "@/components/nexus/toast-region"
import { FullScreenProgress } from "@/components/nexus/full-screen-progress"

const LandingPage = dynamic(
  () => import("@/components/landing/landing-page").then(m => ({ default: m.LandingPage })),
  { ssr: false }
)

const AUTH_VIEWS = new Set(["login", "signup", "forgot", "reset"])
const ALL_VIEWS = new Set(["landing", "login", "signup", "forgot", "reset", "onboarding", "app"])

export default function Page() {
  const { user, loading } = useNexusAuth()
  const view = useApp((s) => s.view)
  const setView = useApp((s) => s.setView)

  // On mount: read URL param
  React.useEffect(() => {
    if (typeof window === "undefined") return
    const params = new URLSearchParams(window.location.search)
    const v = params.get("view")
    if (v && ALL_VIEWS.has(v)) {
      setView(v as any)
    }
  }, [setView])

  // Sync view with auth state
  React.useEffect(() => {
    if (loading) return
    if (user) {
      if (view === "landing" || AUTH_VIEWS.has(view)) {
        setView("app")
      }
    } else {
      if (view === "app" || view === "onboarding") {
        setView("landing")
      }
    }
  }, [user, loading, view, setView])

  const isAuthView = AUTH_VIEWS.has(view)

  // While auth is loading, show FullScreenProgress for everything
  if (loading) {
    return (
      <>
        <ToastRegion />
        <FullScreenProgress />
      </>
    )
  }

  return (
    <>
      <ToastRegion />
      {view === "landing" && <LandingPage />}
      {isAuthView && <AuthScreen mode={view as any} />}
      {view === "onboarding" && <OnboardingFlow />}
      {view === "app" && <AppShell />}
    </>
  )
}
