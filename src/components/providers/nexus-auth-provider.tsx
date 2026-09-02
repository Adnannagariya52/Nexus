"use client"

import * as React from "react"
import type { User, SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

interface AuthContextValue {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = React.createContext<AuthContextValue | null>(null)

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nygcabkvbvhrtjuhsxcb.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55Z2NhYmt2YnZocnRqdWhzeGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjQ1MDYsImV4cCI6MjEwMzE0MDUwNn0.TXSWeC6c70DjqOWMVuFLCyCrgpBmrGQ__KLY7cXpLTQ"

export function NexusAuthProvider({ children }: { children: React.ReactNode }) {
  // Keep a reference to the supabase client so signOut can use the SAME instance
  const supabaseRef = React.useRef<SupabaseClient | null>(null)
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    try {
      const supabase = createSupabaseBrowserClient()
      supabaseRef.current = supabase

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
    } catch (e) {
      console.error("[NexusAuth] Failed to create Supabase client:", e)
      setLoading(false)
    }
  }, [])

  const signOut = React.useCallback(async () => {
    const supabase = supabaseRef.current
    if (!supabase) return

    // 1. Get the session from the SAME client
    const { data } = await supabase.auth.getSession()
    const token = data.session?.access_token

    // 2. Call the Supabase logout API to revoke the server session
    if (token) {
      try {
        await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            apikey: SUPABASE_ANON_KEY,
          },
        })
      } catch {}
    }

    // 3. Call signOut on the SAME client (this properly clears the cookie)
    await supabase.auth.signOut()

    // 4. Nuclear cookie deletion — delete EVERY cookie
    document.cookie.split(";").forEach(function(c) {
      const eqPos = c.indexOf("=")
      const name = eqPos > -1 ? c.substring(0, eqPos).trim() : c.trim()
      if (name) {
        // Try multiple path/domain combinations
        const paths = ["/", ""]
        const domains = ["", "localhost", ".localhost"]
        paths.forEach(p => {
          domains.forEach(d => {
            let cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=" + p
            if (d) cookie += ";domain=" + d
            document.cookie = cookie
          })
        })
      }
    })
    
    // 5. Also clear localStorage and sessionStorage
    try { localStorage.clear() } catch {}
    try { sessionStorage.clear() } catch {}

    // 5. Clear local state
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
