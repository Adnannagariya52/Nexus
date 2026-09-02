#!/usr/bin/env bash
# NEXUS dev server watchdog — restarts the dev server if it dies.
# Designed to be launched once and run forever in the background.

PROJECT_DIR="/home/z/my-project"
DEV_LOG="$PROJECT_DIR/dev.log"
PID_FILE="$PROJECT_DIR/dev.pid"

# Ensure env files are intact on every restart
write_env() {
  cat > "$PROJECT_DIR/.env.local" <<'ENVEOF'
NEXT_PUBLIC_SUPABASE_URL=https://nygcabkvbvhrtjuhsxcb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55Z2NhYmt2YnZocnRqdWhzeGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NjQ1MDYsImV4cCI6MjEwMzE0MDUwNn0.TXSWeC6c70DjqOWMVuFLCyCrgpBmrGQ__KLY7cXpLTQ
DATABASE_URL=file:/home/z/my-project/db/custom.db
ENVEOF
  cp "$PROJECT_DIR/.env.local" "$PROJECT_DIR/.env"
}

is_running() {
  if [[ -f "$PID_FILE" ]]; then
    local pid
    pid=$(cat "$PID_FILE" 2>/dev/null)
    if [[ -n "$pid" ]] && kill -0 "$pid" 2>/dev/null; then
      return 0
    fi
  fi
  pgrep -f "next-server" >/dev/null 2>&1
  return $?
}

start_dev() {
  write_env
  cd "$PROJECT_DIR"
  NODE_OPTIONS="--max-old-space-size=2048" setsid -f bash -c \
    'exec npx next dev -p 3000 --webpack > '"$DEV_LOG"' 2>&1' \
    < /dev/null > /dev/null 2>&1
  sleep 2
  local pid
  pid=$(pgrep -f "next-server" | head -1)
  if [[ -n "$pid" ]]; then
    echo "$pid" > "$PID_FILE"
    echo "[$(date -Is)] Watchdog: started dev server (pid=$pid)" >> "$PROJECT_DIR/watchdog.log"
  fi
}

# Main loop
while true; do
  if ! is_running; then
    echo "[$(date -Is)] Watchdog: dev server down, restarting..." >> "$PROJECT_DIR/watchdog.log"
    start_dev
  fi
  sleep 30
done
