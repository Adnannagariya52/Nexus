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
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), [])

  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const signOut = React.useCallback(async () => {
    // Call supabase signOut — @supabase/ssr handles cookie deletion
    await supabase.auth.signOut()
    // Also manually delete all cookies (belt + suspenders)
    document.cookie.split(";").forEach(function(c) {
      const name = c.split("=")[0].trim()
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;domain=localhost`
      }
    })
    setUser(null)
  }, [supabase])

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
