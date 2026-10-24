-- Sitebrief-only additive objects. Do not reset, migrate or change unrelated application data.
begin;
create schema if not exists sitebrief_quota;
revoke all on schema sitebrief_quota from public, anon, authenticated, service_role;
create table if not exists sitebrief_quota.policies (
 environment text primary key check (environment in ('preview','production')),
 daily_limit integer not null check (daily_limit between 1 and 10000)
);
create table if not exists sitebrief_quota.daily_usage (
 environment text not null references sitebrief_quota.policies(environment),
 usage_day date not null,
 used integer not null check (used between 1 and 10000),
 primary key (environment,usage_day)
);
alter table sitebrief_quota.policies enable row level security;
alter table sitebrief_quota.daily_usage enable row level security;
revoke all on all tables in schema sitebrief_quota from public, anon, authenticated, service_role;
insert into sitebrief_quota.policies(environment,daily_limit) values ('preview',50),('production',50)
 on conflict (environment) do nothing;

create or replace function public.sitebrief_reserve_live_analysis(p_environment text)
returns jsonb
language plpgsql
security definer
set search_path = ''
set statement_timeout = '3s'
as $$
declare
 v_day date := (pg_catalog.clock_timestamp() at time zone 'UTC')::date;
 v_limit integer;
 v_used integer;
 v_admitted boolean := false;
begin
 if p_environment is null or p_environment not in ('preview','production') then
  raise exception 'Invalid Sitebrief quota environment' using errcode='22023';
 end if;
 select daily_limit into strict v_limit from sitebrief_quota.policies where environment=p_environment for share;
 insert into sitebrief_quota.daily_usage as counters(environment,usage_day,used)
 values (p_environment,v_day,1)
 on conflict (environment,usage_day) do update set used=counters.used+1
 where counters.used < v_limit
 returning used into v_used;
 v_admitted := found;
 if not v_admitted then
  select used into strict v_used from sitebrief_quota.daily_usage where environment=p_environment and usage_day=v_day;
 end if;
 return pg_catalog.jsonb_build_object('admitted',v_admitted,'limit',v_limit,'used',v_used,
  'resetsAt',((v_day+1)::timestamp at time zone 'UTC'));
end;
$$;
revoke all on function public.sitebrief_reserve_live_analysis(text) from public, anon, authenticated;
grant execute on function public.sitebrief_reserve_live_analysis(text) to service_role;
comment on function public.sitebrief_reserve_live_analysis(text) is 'Sitebrief server-only atomic global daily admission; separate Preview/Production counters, no caller-supplied limit/day.';
notify pgrst, 'reload schema';
commit;
