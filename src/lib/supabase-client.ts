"use client"

import * as React from "react"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSupabaseBrowserClient } from "@/lib/supabase-browser"

let cachedClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!cachedClient) {
    cachedClient = createSupabaseBrowserClient()
  }
  return cachedClient
}
