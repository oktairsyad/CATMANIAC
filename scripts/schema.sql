-- ============================================
-- CPNS CAT Platform - Supabase Schema
-- Jalankan di Supabase SQL Editor
-- ============================================

-- USERS (extend auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  credits integer not null default 0,
  created_at timestamptz default now()
);

-- QUESTION BANK
create table public.question_bank (
  id uuid primary key default gen_random_uuid(),
  soal_text text not null,
  opsi_a text not null,
  opsi_b text not null,
  opsi_c text not null,
  opsi_d text not null,
  opsi_e text,
  jawaban_benar text not null check (jawaban_benar in ('a','b','c','d','e')),
  tipe text not null check (tipe in ('TWK','TIU','TKP')),
  bobot_tkp integer check (bobot_tkp between 1 and 5),
  tingkat_kesulitan integer default 2 check (tingkat_kesulitan between 1 and 3),
  tags text[],
  created_at timestamptz default now()
);

-- EXAM SESSIONS
create table public.exam_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  started_at timestamptz default now(),
  ends_at timestamptz not null,
  submitted_at timestamptz,
  status text not null default 'active' check (status in ('active','submitted','expired')),
  question_ids uuid[] not null
);

-- EXAM ANSWERS
create table public.exam_answers (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.exam_sessions(id) on delete cascade not null,
  question_id uuid references public.question_bank(id) not null,
  jawaban text check (jawaban in ('a','b','c','d','e')),
  answered_at timestamptz default now(),
  unique(session_id, question_id)
);

-- EXAM RESULTS
create table public.exam_results (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references public.exam_sessions(id) on delete cascade not null unique,
  user_id uuid references public.profiles(id) not null,
  skor_twk integer not null default 0,
  skor_tiu integer not null default 0,
  skor_tkp integer not null default 0,
  skor_total integer not null default 0,
  lulus_twk boolean not null default false,
  lulus_tiu boolean not null default false,
  lulus_tkp boolean not null default false,
  lulus_total boolean not null default false,
  detail jsonb,
  created_at timestamptz default now()
);

-- TRANSACTIONS
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) not null,
  midtrans_order_id text unique not null,
  amount integer not null,
  credits_purchased integer not null,
  status text not null default 'pending' check (status in ('pending','success','failed')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

alter table public.profiles enable row level security;
alter table public.question_bank enable row level security;
alter table public.exam_sessions enable row level security;
alter table public.exam_answers enable row level security;
alter table public.exam_results enable row level security;
alter table public.transactions enable row level security;

-- Profiles: user hanya bisa lihat & edit milik sendiri
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Question bank: semua user authenticated bisa baca (tapi TIDAK kolom jawaban_benar via client)
create policy "questions_select_auth" on public.question_bank for select to authenticated using (true);

-- Exam sessions: user hanya bisa lihat milik sendiri
create policy "sessions_select_own" on public.exam_sessions for select using (auth.uid() = user_id);
create policy "sessions_insert_own" on public.exam_sessions for insert with check (auth.uid() = user_id);

-- Exam answers: user hanya bisa lihat & insert milik sendiri
create policy "answers_select_own" on public.exam_answers for select using (
  session_id in (select id from public.exam_sessions where user_id = auth.uid())
);
create policy "answers_insert_own" on public.exam_answers for insert with check (
  session_id in (select id from public.exam_sessions where user_id = auth.uid())
);
create policy "answers_update_own" on public.exam_answers for update using (
  session_id in (select id from public.exam_sessions where user_id = auth.uid())
);

-- Exam results: user hanya bisa lihat milik sendiri
create policy "results_select_own" on public.exam_results for select using (auth.uid() = user_id);

-- Transactions: user hanya bisa lihat milik sendiri
create policy "transactions_select_own" on public.transactions for select using (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
