-- ============================================================================
-- NEXUS — Complete Database Schema with Row Level Security (RLS)
-- Run this in: Supabase Dashboard → SQL Editor → New query → Paste → Run
-- ============================================================================

-- ─── 1. PROFILES ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id                   uuid primary key references auth.users(id) on delete cascade,
  full_name            text,
  email                text,
  avatar_url           text,
  education_level      text,
  grade                text,
  stream               text,
  school_name          text,
  study_target_minutes integer default 60,
  academic_goal        text,
  onboarding_completed boolean default false,
  theme_preference     text default 'dark',
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- ─── 2. SUBJECTS ─────────────────────────────────────────────────────────────
create table if not exists public.subjects (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  name        text not null,
  color       text default '#6C7CFF',
  icon        text,
  description text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_subjects_user on public.subjects(user_id);

-- ─── 3. CHAPTERS ─────────────────────────────────────────────────────────────
create table if not exists public.chapters (
  id          uuid primary key default gen_random_uuid(),
  subject_id  uuid not null references public.subjects(id) on delete cascade,
  title       text not null,
  description text,
  status      text default 'not_started',
  progress    integer default 0,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_chapters_subject on public.chapters(subject_id);

-- ─── 4. ASSIGNMENTS ──────────────────────────────────────────────────────────
create table if not exists public.assignments (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  subject_id        uuid references public.subjects(id) on delete set null,
  title             text not null,
  description       text,
  priority          text default 'medium',
  status            text default 'pending',
  due_date          timestamptz,
  estimated_minutes integer,
  created_at        timestamptz default now(),
  completed_at      timestamptz
);
create index if not exists idx_assignments_user on public.assignments(user_id);

-- ─── 5. EXAMS ────────────────────────────────────────────────────────────────
create table if not exists public.exams (
  id                   uuid primary key default gen_random_uuid(),
  user_id              uuid not null references auth.users(id) on delete cascade,
  subject_id          uuid references public.subjects(id) on delete set null,
  title                text not null,
  exam_date           timestamptz not null,
  syllabus            text,
  preparation_progress integer default 0,
  created_at          timestamptz default now()
);
create index if not exists idx_exams_user on public.exams(user_id);

-- ─── 6. NOTES ────────────────────────────────────────────────────────────────
create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  subject_id uuid references public.subjects(id) on delete set null,
  title      text not null,
  content    text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_notes_user on public.notes(user_id);

-- ─── 7. GOALS ────────────────────────────────────────────────────────────────
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text,
  target_date timestamptz,
  progress    integer default 0,
  status      text default 'on_track',
  created_at  timestamptz default now(),
  updated_at  timestamptz default now()
);
create index if not exists idx_goals_user on public.goals(user_id);

-- ─── 8. HABITS ───────────────────────────────────────────────────────────────
create table if not exists public.habits (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  icon       text,
  frequency  text default 'daily',
  color      text default '#6C7CFF',
  created_at timestamptz default now()
);
create index if not exists idx_habits_user on public.habits(user_id);

-- ─── 9. HABIT_LOGS ───────────────────────────────────────────────────────────
create table if not exists public.habit_logs (
  id             uuid primary key default gen_random_uuid(),
  habit_id       uuid not null references public.habits(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  completed_date date not null,
  created_at     timestamptz default now(),
  unique (habit_id, completed_date)
);
create index if not exists idx_habit_logs_user on public.habit_logs(user_id);

-- ─── 10. STUDY_SESSIONS ──────────────────────────────────────────────────────
create table if not exists public.study_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  subject_id      uuid references public.subjects(id) on delete set null,
  duration_minutes integer not null,
  started_at       timestamptz not null,
  completed_at     timestamptz,
  session_type     text default 'manual'
);
create index if not exists idx_study_sessions_user on public.study_sessions(user_id);

-- ─── 11. FOCUS_SESSIONS ──────────────────────────────────────────────────────
create table if not exists public.focus_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  duration_minutes integer not null,
  status           text default 'completed',
  mode             text default 'pomodoro',
  started_at       timestamptz not null,
  completed_at     timestamptz
);
create index if not exists idx_focus_sessions_user on public.focus_sessions(user_id);

-- ─── 12. ACHIEVEMENTS ────────────────────────────────────────────────────────
create table if not exists public.achievements (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  achievement_type text not null,
  title            text not null,
  description      text,
  unlocked_at      timestamptz default now(),
  unique (user_id, achievement_type)
);
create index if not exists idx_achievements_user on public.achievements(user_id);

-- ─── 13. NOTIFICATIONS ───────────────────────────────────────────────────────
create table if not exists public.notifications (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text not null,
  message    text,
  type       text default 'info',
  read       boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_notifications_user on public.notifications(user_id);

-- ─── 14. CAREER_PROFILES ─────────────────────────────────────────────────────
create table if not exists public.career_profiles (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null unique references auth.users(id) on delete cascade,
  interests       jsonb default '[]'::jsonb,
  skills          jsonb default '[]'::jsonb,
  strengths       jsonb default '[]'::jsonb,
  preferred_fields jsonb default '[]'::jsonb,
  updated_at      timestamptz default now()
);

-- ─── 15. AI_CONVERSATIONS ────────────────────────────────────────────────────
create table if not exists public.ai_conversations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  title      text default 'New Conversation',
  subject_id uuid references public.subjects(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists idx_ai_conversations_user on public.ai_conversations(user_id);

-- ─── 16. AI_MESSAGES ─────────────────────────────────────────────────────────
create table if not exists public.ai_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  role            text not null,
  content         text not null,
  created_at      timestamptz default now()
);
create index if not exists idx_ai_messages_conv on public.ai_messages(conversation_id);
create index if not exists idx_ai_messages_user on public.ai_messages(user_id);

-- ============================================================================
-- 17. AUTO-CREATE PROFILE ON SIGNUP (trigger)
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.email
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================================
-- 18. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
alter table public.profiles           enable row level security;
alter table public.subjects           enable row level security;
alter table public.chapters           enable row level security;
alter table public.assignments        enable row level security;
alter table public.exams              enable row level security;
alter table public.notes              enable row level security;
alter table public.goals              enable row level security;
alter table public.habits            enable row level security;
alter table public.habit_logs         enable row level security;
alter table public.study_sessions    enable row level security;
alter table public.focus_sessions     enable row level security;
alter table public.achievements       enable row level security;
alter table public.notifications      enable row level security;
alter table public.career_profiles    enable row level security;
alter table public.ai_conversations   enable row level security;
alter table public.ai_messages        enable row level security;

-- ============================================================================
-- 19. RLS POLICIES — USER ISOLATION ENFORCED AT DATABASE LEVEL
-- ============================================================================

-- PROFILES (id IS the user_id)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);

-- SUBJECTS
drop policy if exists "subjects_select_own" on public.subjects;
create policy "subjects_select_own" on public.subjects for select using (auth.uid() = user_id);
drop policy if exists "subjects_insert_own" on public.subjects;
create policy "subjects_insert_own" on public.subjects for insert with check (auth.uid() = user_id);
drop policy if exists "subjects_update_own" on public.subjects;
create policy "subjects_update_own" on public.subjects for update using (auth.uid() = user_id);
drop policy if exists "subjects_delete_own" on public.subjects;
create policy "subjects_delete_own" on public.subjects for delete using (auth.uid() = user_id);

-- CHAPTERS (owned via parent subject)
drop policy if exists "chapters_select_own" on public.chapters;
create policy "chapters_select_own" on public.chapters
  for select using (
    exists (select 1 from public.subjects s where s.id = chapters.subject_id and s.user_id = auth.uid())
  );
drop policy if exists "chapters_insert_own" on public.chapters;
create policy "chapters_insert_own" on public.chapters
  for insert with check (
    exists (select 1 from public.subjects s where s.id = chapters.subject_id and s.user_id = auth.uid())
  );
drop policy if exists "chapters_update_own" on public.chapters;
create policy "chapters_update_own" on public.chapters
  for update using (
    exists (select 1 from public.subjects s where s.id = chapters.subject_id and s.user_id = auth.uid())
  );
drop policy if exists "chapters_delete_own" on public.chapters;
create policy "chapters_delete_own" on public.chapters
  for delete using (
    exists (select 1 from public.subjects s where s.id = chapters.subject_id and s.user_id = auth.uid())
  );

-- ASSIGNMENTS
drop policy if exists "assignments_select_own" on public.assignments;
create policy "assignments_select_own" on public.assignments for select using (auth.uid() = user_id);
drop policy if exists "assignments_insert_own" on public.assignments;
create policy "assignments_insert_own" on public.assignments for insert with check (auth.uid() = user_id);
drop policy if exists "assignments_update_own" on public.assignments;
create policy "assignments_update_own" on public.assignments for update using (auth.uid() = user_id);
drop policy if exists "assignments_delete_own" on public.assignments;
create policy "assignments_delete_own" on public.assignments for delete using (auth.uid() = user_id);

-- EXAMS
drop policy if exists "exams_select_own" on public.exams;
create policy "exams_select_own" on public.exams for select using (auth.uid() = user_id);
drop policy if exists "exams_insert_own" on public.exams;
create policy "exams_insert_own" on public.exams for insert with check (auth.uid() = user_id);
drop policy if exists "exams_update_own" on public.exams;
create policy "exams_update_own" on public.exams for update using (auth.uid() = user_id);
drop policy if exists "exams_delete_own" on public.exams;
create policy "exams_delete_own" on public.exams for delete using (auth.uid() = user_id);

-- NOTES
drop policy if exists "notes_select_own" on public.notes;
create policy "notes_select_own" on public.notes for select using (auth.uid() = user_id);
drop policy if exists "notes_insert_own" on public.notes;
create policy "notes_insert_own" on public.notes for insert with check (auth.uid() = user_id);
drop policy if exists "notes_update_own" on public.notes;
create policy "notes_update_own" on public.notes for update using (auth.uid() = user_id);
drop policy if exists "notes_delete_own" on public.notes;
create policy "notes_delete_own" on public.notes for delete using (auth.uid() = user_id);

-- GOALS
drop policy if exists "goals_select_own" on public.goals;
create policy "goals_select_own" on public.goals for select using (auth.uid() = user_id);
drop policy if exists "goals_insert_own" on public.goals;
create policy "goals_insert_own" on public.goals for insert with check (auth.uid() = user_id);
drop policy if exists "goals_update_own" on public.goals;
create policy "goals_update_own" on public.goals for update using (auth.uid() = user_id);
drop policy if exists "goals_delete_own" on public.goals;
create policy "goals_delete_own" on public.goals for delete using (auth.uid() = user_id);

-- HABITS
drop policy if exists "habits_select_own" on public.habits;
create policy "habits_select_own" on public.habits for select using (auth.uid() = user_id);
drop policy if exists "habits_insert_own" on public.habits;
create policy "habits_insert_own" on public.habits for insert with check (auth.uid() = user_id);
drop policy if exists "habits_update_own" on public.habits;
create policy "habits_update_own" on public.habits for update using (auth.uid() = user_id);
drop policy if exists "habits_delete_own" on public.habits;
create policy "habits_delete_own" on public.habits for delete using (auth.uid() = user_id);

-- HABIT_LOGS
drop policy if exists "habit_logs_select_own" on public.habit_logs;
create policy "habit_logs_select_own" on public.habit_logs for select using (auth.uid() = user_id);
drop policy if exists "habit_logs_insert_own" on public.habit_logs;
create policy "habit_logs_insert_own" on public.habit_logs for insert with check (auth.uid() = user_id);
drop policy if exists "habit_logs_update_own" on public.habit_logs;
create policy "habit_logs_update_own" on public.habit_logs for update using (auth.uid() = user_id);
drop policy if exists "habit_logs_delete_own" on public.habit_logs;
create policy "habit_logs_delete_own" on public.habit_logs for delete using (auth.uid() = user_id);

-- STUDY_SESSIONS
drop policy if exists "study_sessions_select_own" on public.study_sessions;
create policy "study_sessions_select_own" on public.study_sessions for select using (auth.uid() = user_id);
drop policy if exists "study_sessions_insert_own" on public.study_sessions;
create policy "study_sessions_insert_own" on public.study_sessions for insert with check (auth.uid() = user_id);
drop policy if exists "study_sessions_update_own" on public.study_sessions;
create policy "study_sessions_update_own" on public.study_sessions for update using (auth.uid() = user_id);
drop policy if exists "study_sessions_delete_own" on public.study_sessions;
create policy "study_sessions_delete_own" on public.study_sessions for delete using (auth.uid() = user_id);

-- FOCUS_SESSIONS
drop policy if exists "focus_sessions_select_own" on public.focus_sessions;
create policy "focus_sessions_select_own" on public.focus_sessions for select using (auth.uid() = user_id);
drop policy if exists "focus_sessions_insert_own" on public.focus_sessions;
create policy "focus_sessions_insert_own" on public.focus_sessions for insert with check (auth.uid() = user_id);
drop policy if exists "focus_sessions_update_own" on public.focus_sessions;
create policy "focus_sessions_update_own" on public.focus_sessions for update using (auth.uid() = user_id);
drop policy if exists "focus_sessions_delete_own" on public.focus_sessions;
create policy "focus_sessions_delete_own" on public.focus_sessions for delete using (auth.uid() = user_id);

-- ACHIEVEMENTS
drop policy if exists "achievements_select_own" on public.achievements;
create policy "achievements_select_own" on public.achievements for select using (auth.uid() = user_id);
drop policy if exists "achievements_insert_own" on public.achievements;
create policy "achievements_insert_own" on public.achievements for insert with check (auth.uid() = user_id);
drop policy if exists "achievements_update_own" on public.achievements;
create policy "achievements_update_own" on public.achievements for update using (auth.uid() = user_id);
drop policy if exists "achievements_delete_own" on public.achievements;
create policy "achievements_delete_own" on public.achievements for delete using (auth.uid() = user_id);

-- NOTIFICATIONS
drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own" on public.notifications for select using (auth.uid() = user_id);
drop policy if exists "notifications_insert_own" on public.notifications;
create policy "notifications_insert_own" on public.notifications for insert with check (auth.uid() = user_id);
drop policy if exists "notifications_update_own" on public.notifications;
create policy "notifications_update_own" on public.notifications for update using (auth.uid() = user_id);
drop policy if exists "notifications_delete_own" on public.notifications;
create policy "notifications_delete_own" on public.notifications for delete using (auth.uid() = user_id);

-- CAREER_PROFILES
drop policy if exists "career_profiles_select_own" on public.career_profiles;
create policy "career_profiles_select_own" on public.career_profiles for select using (auth.uid() = user_id);
drop policy if exists "career_profiles_insert_own" on public.career_profiles;
create policy "career_profiles_insert_own" on public.career_profiles for insert with check (auth.uid() = user_id);
drop policy if exists "career_profiles_update_own" on public.career_profiles;
create policy "career_profiles_update_own" on public.career_profiles for update using (auth.uid() = user_id);
drop policy if exists "career_profiles_delete_own" on public.career_profiles;
create policy "career_profiles_delete_own" on public.career_profiles for delete using (auth.uid() = user_id);

-- AI_CONVERSATIONS
drop policy if exists "ai_conversations_select_own" on public.ai_conversations;
create policy "ai_conversations_select_own" on public.ai_conversations for select using (auth.uid() = user_id);
drop policy if exists "ai_conversations_insert_own" on public.ai_conversations;
create policy "ai_conversations_insert_own" on public.ai_conversations for insert with check (auth.uid() = user_id);
drop policy if exists "ai_conversations_update_own" on public.ai_conversations;
create policy "ai_conversations_update_own" on public.ai_conversations for update using (auth.uid() = user_id);
drop policy if exists "ai_conversations_delete_own" on public.ai_conversations;
create policy "ai_conversations_delete_own" on public.ai_conversations for delete using (auth.uid() = user_id);

-- AI_MESSAGES (owned via parent conversation + user_id)
drop policy if exists "ai_messages_select_own" on public.ai_messages;
create policy "ai_messages_select_own" on public.ai_messages
  for select using (auth.uid() = user_id);
drop policy if exists "ai_messages_insert_own" on public.ai_messages;
create policy "ai_messages_insert_own" on public.ai_messages
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.ai_conversations c
      where c.id = ai_messages.conversation_id and c.user_id = auth.uid()
    )
  );
drop policy if exists "ai_messages_update_own" on public.ai_messages;
create policy "ai_messages_update_own" on public.ai_messages for update using (auth.uid() = user_id);
drop policy if exists "ai_messages_delete_own" on public.ai_messages;
create policy "ai_messages_delete_own" on public.ai_messages for delete using (auth.uid() = user_id);

-- ============================================================================
-- 20. UPDATED_AT TRIGGERS
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles before update on public.profiles
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_subjects on public.subjects;
create trigger set_updated_at_subjects before update on public.subjects
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_chapters on public.chapters;
create trigger set_updated_at_chapters before update on public.chapters
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_notes on public.notes;
create trigger set_updated_at_notes before update on public.notes
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_goals on public.goals;
create trigger set_updated_at_goals before update on public.goals
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_career_profiles on public.career_profiles;
create trigger set_updated_at_career_profiles before update on public.career_profiles
  for each row execute function public.set_updated_at();
drop trigger if exists set_updated_at_ai_conversations on public.ai_conversations;
create trigger set_updated_at_ai_conversations before update on public.ai_conversations
  for each row execute function public.set_updated_at();

-- ============================================================================
-- DONE. All tables created, RLS enabled, policies enforced.
-- ============================================================================
