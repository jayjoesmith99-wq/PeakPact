alter table public.user_profiles
  alter column level set default 1,
  alter column pp set default 300,
  alter column xp set default 0;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (user_id, level, pp, xp, streak, red_state, last_pact_date)
  values (new.id::text, 1, 300, 0, 0, false, current_date::text)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

revoke all on function public.handle_new_user_profile() from public;
grant execute on function public.handle_new_user_profile() to postgres, service_role;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.handle_new_user_profile();
