-- ============================================
-- CPNS CAT Platform - Payment RPC Functions
-- Jalankan di Supabase SQL Editor
-- ============================================

-- 1. Atomic: tandai transaksi success + tambah credits
create or replace function public.complete_payment(p_order_id text)
returns void as $$
declare
  v_user_id uuid;
  v_credits integer;
begin
  update public.transactions
  set status = 'success', updated_at = now()
  where midtrans_order_id = p_order_id and status = 'pending'
  returning user_id, credits_purchased into v_user_id, v_credits;

  if v_user_id is null then
    return; -- Sudah diproses (idempotent)
  end if;

  update public.profiles
  set credits = credits + v_credits
  where id = v_user_id;
end;
$$ language plpgsql security definer;

-- 2. Atomic: kurangi 1 credit + buat exam session
create or replace function public.start_exam_with_credit(
  p_user_id uuid,
  p_ends_at timestamptz,
  p_question_ids uuid[]
) returns uuid as $$
declare
  v_session_id uuid;
  v_updated integer;
begin
  update public.profiles
  set credits = credits - 1
  where id = p_user_id and credits > 0;

  get diagnostics v_updated = row_count;

  if v_updated = 0 then
    raise exception 'Kredit tidak cukup';
  end if;

  insert into public.exam_sessions (user_id, ends_at, question_ids)
  values (p_user_id, p_ends_at, p_question_ids)
  returning id into v_session_id;

  return v_session_id;
end;
$$ language plpgsql security definer;

-- 3. Update trigger: beri 3 kredit gratis saat signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, credits)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    3 -- 3 tryout gratis untuk beta
  );
  return new;
end;
$$ language plpgsql security definer;

-- 4. Beri 3 kredit ke semua user yang sudah ada (jalankan sekali)
-- update public.profiles set credits = 3 where credits = 0;
