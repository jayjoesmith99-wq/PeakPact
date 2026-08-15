alter table public.user_profiles add column if not exists xp integer not null default 0 check (xp >= 0);
alter table public.user_profiles add column if not exists active_pact_deadline timestamptz;
alter table public.user_profiles add column if not exists extensions_used integer not null default 0 check (extensions_used >= 0);

alter table public.pact_history add column if not exists proof_photo_path text;
alter table public.pact_history add column if not exists proof_photo_mime_type text;
alter table public.pact_history add column if not exists proof_latitude double precision;
alter table public.pact_history add column if not exists proof_longitude double precision;

insert into storage.buckets (id, name, public)
values ('pact-proofs', 'pact-proofs', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload own pact proofs" on storage.objects;
create policy "Users can upload own pact proofs" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'pact-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists "Users can read own pact proofs" on storage.objects;
create policy "Users can read own pact proofs" on storage.objects
  for select to authenticated
  using (bucket_id = 'pact-proofs' and (storage.foldername(name))[1] = auth.uid()::text);

create or replace function public.commit_pact_progress(progress_payload jsonb, pact_records jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  progress_user_id text := progress_payload ->> 'user_id';
  record_payload jsonb;
begin
  if auth.uid() is null or progress_user_id is null or auth.uid()::text <> progress_user_id then
    raise exception 'Authenticated user does not match progress payload';
  end if;

  if exists (
    select 1
    from jsonb_array_elements(pact_records) as item
    where item ->> 'user_id' <> progress_user_id
  ) then
    raise exception 'Pact record user does not match progress payload';
  end if;

  insert into public.user_profiles (
    user_id, level, pp, xp, streak, red_state, last_pact_date,
    active_pact_deadline, extensions_used, updated_at
  ) values (
    progress_user_id,
    coalesce((progress_payload ->> 'level')::integer, 1),
    coalesce((progress_payload ->> 'pp')::integer, 0),
    coalesce((progress_payload ->> 'xp')::integer, 0),
    coalesce((progress_payload ->> 'streak')::integer, 0),
    coalesce((progress_payload ->> 'red_state')::boolean, false),
    coalesce(progress_payload ->> 'last_pact_date', current_date::text),
    (progress_payload ->> 'active_pact_deadline')::timestamptz,
    coalesce((progress_payload ->> 'extensions_used')::integer, 0),
    coalesce((progress_payload ->> 'updated_at')::timestamptz, now())
  )
  on conflict (user_id) do update set
    level = excluded.level,
    pp = excluded.pp,
    xp = excluded.xp,
    streak = excluded.streak,
    red_state = excluded.red_state,
    last_pact_date = excluded.last_pact_date,
    active_pact_deadline = excluded.active_pact_deadline,
    extensions_used = excluded.extensions_used,
    updated_at = excluded.updated_at;

  for record_payload in select value from jsonb_array_elements(pact_records) loop
    insert into public.pact_history (
      user_id, content, result, pp_awarded, created_at, synced,
      device_timestamp, signature, proof_photo_path, proof_photo_mime_type,
      proof_latitude, proof_longitude
    ) values (
      progress_user_id,
      record_payload ->> 'content',
      record_payload ->> 'result',
      coalesce((record_payload ->> 'pp_awarded')::integer, 0),
      coalesce((record_payload ->> 'created_at')::timestamptz, now()),
      coalesce((record_payload ->> 'synced')::boolean, true),
      (record_payload ->> 'device_timestamp')::timestamptz,
      record_payload ->> 'signature',
      record_payload ->> 'proof_photo_path',
      record_payload ->> 'proof_photo_mime_type',
      (record_payload ->> 'proof_latitude')::double precision,
      (record_payload ->> 'proof_longitude')::double precision
    );
  end loop;
end;
$$;

revoke all on function public.commit_pact_progress(jsonb, jsonb) from public;
revoke all on function public.commit_pact_progress(jsonb, jsonb) from anon;
grant execute on function public.commit_pact_progress(jsonb, jsonb) to authenticated;
