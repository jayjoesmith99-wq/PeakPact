revoke all on function public.commit_pact_progress(jsonb, jsonb) from public;
revoke all on function public.commit_pact_progress(jsonb, jsonb) from anon;
grant execute on function public.commit_pact_progress(jsonb, jsonb) to authenticated;
