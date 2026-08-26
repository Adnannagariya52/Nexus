"use client"

import * as React from "react"
import type { User } from "@supabase/supabase-js"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

interface AuthContextValue {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

export function NexusAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    // Create client inside useEffect to avoid SSR issues
    let supabase: ReturnType<typeof createSupabaseBrowserClient> | null = null
    try {
      supabase = createSupabaseBrowserClient()
    } catch (e) {
      console.error("[NexusAuth] Failed to create Supabase client:", e)
      setLoading(false)
      return
    }

    // getSession reads from cookie — fast and reliable
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = React.useCallback(async () => {
    try {
      const supabase = createSupabaseBrowserClient()
      await supabase.auth.signOut()
    } catch {}
    document.cookie.split(";").forEach(function(c) {
      const name = c.split("=")[0].trim()
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
      }
    })
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useNexusAuth() {
  const ctx = React.useContext(AuthContext)
  if (!ctx) throw new Error("useNexusAuth must be used within NexusAuthProvider")
  return ctx
}
