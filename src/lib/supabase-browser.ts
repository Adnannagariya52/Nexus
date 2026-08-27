import { createBrowserClient } from "@supabase/ssr"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://nygcabkvbvhrtjuhsxcb.supabase.co"
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55Z2NhYmt2YnZocnRqdWhzeGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjQ1MDYsImV4cCI6MjEwMzE0MDUwNn0.TXSWeC6c70DjqOWMVuFLCyCrgpBmrGQ__KLY7cXpLTQ"

export function createSupabaseBrowserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
