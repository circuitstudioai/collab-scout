"""Local PostgreSQL behavioral proof. Never accepts or mutates a hosted database."""
import concurrent.futures, datetime, getpass, json, os, pathlib, shutil, subprocess
ROOT = pathlib.Path(__file__).resolve().parents[1]
psql=shutil.which('psql')
if not os.environ.get('SITEBRIEF_PG_BIN') and not psql:
    raise SystemExit('Install PostgreSQL client tools or set SITEBRIEF_PG_BIN to their directory.')
BIN = pathlib.Path(os.environ.get('SITEBRIEF_PG_BIN') or str(pathlib.Path(psql).parent))
ENV = dict(os.environ)
PG_USER = os.environ.get('SITEBRIEF_TEST_PG_USER',getpass.getuser())
PG_PORT = str(int(os.environ.get('SITEBRIEF_TEST_PG_PORT','55439')))
DB = 'sitebrief_quota_test'
def sql(query, db=DB, check=True):
    result = subprocess.run([str(BIN/'psql'), '-X', '-A', '-t', '-q', '-v', 'ON_ERROR_STOP=1', '-h', '127.0.0.1', '-p', PG_PORT, '-U', PG_USER, '-d', db, '-c', query], env=ENV, text=True, capture_output=True)
    if check and result.returncode:
        raise RuntimeError(result.stderr)
    return result
if sql("select 1 from pg_database where datname='sitebrief_quota_test'", db='postgres').stdout.strip() != '1':
    sql('create database sitebrief_quota_test', db='postgres')
for role in ['anon', 'authenticated', 'service_role']:
    if sql(f"select 1 from pg_roles where rolname='{role}'").stdout.strip() != '1':
        sql(f'create role {role} nologin')
assert sql('select current_database()').stdout.strip() == DB
sql('create table if not exists public.sitebrief_quota_unrelated_fixture(id integer primary key); insert into public.sitebrief_quota_unrelated_fixture values(1) on conflict do nothing')
migration=(ROOT/'supabase/migrations/20261024001000_sitebrief_quota.sql').read_text()
sql(migration)
# Only the isolated local test database can reach this fixture reset.
sql("delete from sitebrief_quota.daily_usage; update sitebrief_quota.policies set daily_limit=case when environment='preview' then 3 else 50 end;")
for role in ['anon', 'authenticated']:
    denied=sql(f"set role {role}; select public.sitebrief_reserve_live_analysis('preview')", check=False)
    assert denied.returncode and 'permission denied' in denied.stderr, (role, denied.stdout)
for role in ['anon', 'authenticated', 'service_role']:
    denied=sql(f'set role {role}; select * from sitebrief_quota.daily_usage', check=False)
    assert denied.returncode and 'permission denied' in denied.stderr

def reserve(environment='preview'):
    result=sql(f"set role service_role; select public.sitebrief_reserve_live_analysis('{environment}')")
    return json.loads(result.stdout.strip())
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
    replies=list(pool.map(lambda _: reserve(), range(12)))
admitted=[r for r in replies if r['admitted']]
assert len(admitted)==3, replies
assert sorted(r['used'] for r in admitted)==[1,2,3]
assert all(r['used']==3 for r in replies if not r['admitted'])
assert reserve('production')['used']==1
assert not reserve()['admitted']
assert sql("set role service_role; select public.sitebrief_reserve_live_analysis('custom')",check=False).returncode
sql(migration)
assert not reserve()['admitted'], 'Reapplying schema must not reset the budget'
assert sql('select count(*) from public.sitebrief_quota_unrelated_fixture').stdout.strip()=='1'
# An exhausted previous UTC day is not copied into a new-day row. No cron is needed.
sql("delete from sitebrief_quota.daily_usage where environment='preview'; insert into sitebrief_quota.daily_usage values('preview',(clock_timestamp() at time zone 'UTC')::date-1,3)")
fresh=reserve();assert fresh['admitted'] and fresh['used']==1
reset=datetime.datetime.fromisoformat(fresh['resetsAt'])
assert reset.astimezone(datetime.timezone.utc).hour==0
assert sql("select count(*) from sitebrief_quota.daily_usage where environment='preview'").stdout.strip()=='2'
print(json.dumps({'database':DB,'parallelAttempts':12,'admittedAtLimitThree':len(admitted),'anonymousAndAuthenticatedDenied':True,'directTableAccessDenied':True,'environmentsSeparated':True,'priorDayIsolated':True,'migrationPreservesBudgetAndUnrelatedTable':True,'serviceRoleRpcWorks':True}))
