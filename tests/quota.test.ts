import {reserveLiveAnalysis} from '../lib/sites/quota';
const fetchMock=jest.fn();
const now=new Date('2026-10-23T23:55:00Z');
const reply=(admitted=true,used=49,limit=50)=>({admitted,used,limit,resetsAt:'2026-10-24T00:00:00+00:00'});
beforeEach(()=>{global.fetch=fetchMock;fetchMock.mockReset();process.env.SITEBRIEF_SUPABASE_URL='https://quota-test.supabase.co';process.env.SITEBRIEF_SUPABASE_SECRET_KEY='sb_secret_private-test-token';});
afterEach(()=>{delete process.env.SITEBRIEF_SUPABASE_URL;delete process.env.SITEBRIEF_SUPABASE_SECRET_KEY;delete process.env.VERCEL_ENV;});
it('fails closed before calling providers when no shared store is configured',async()=>{delete process.env.SITEBRIEF_SUPABASE_SECRET_KEY;await expect(reserveLiveAnalysis(now)).rejects.toMatchObject({status:503});expect(fetchMock).not.toHaveBeenCalled();});
it('calls only the server-controlled Supabase quota RPC without exposing its secret',async()=>{
 fetchMock.mockResolvedValue(Response.json(reply()));
 const result=await reserveLiveAnalysis(now);expect(result).toEqual({limit:50,remaining:1,resetsAt:'2026-10-24T00:00:00.000Z'});
 const [url,options]=fetchMock.mock.calls[0];expect(url).toBe('https://quota-test.supabase.co/rest/v1/rpc/sitebrief_reserve_live_analysis');expect(JSON.parse(options.body)).toEqual({p_environment:'preview'});expect(options.headers.apikey).toBe('sb_secret_private-test-token');expect(options.headers.Authorization).toBeUndefined();expect(JSON.stringify(result)).not.toContain('private-test-token');
});
it('separates the Production quota and leaves the limit and UTC day to the database',async()=>{process.env.VERCEL_ENV='production';fetchMock.mockResolvedValue(Response.json(reply()));await reserveLiveAnalysis(now);expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({p_environment:'production'});});
it('rejects an exhausted shared budget until the database UTC reset',async()=>{fetchMock.mockResolvedValue(Response.json(reply(false,50)));await expect(reserveLiveAnalysis(now)).rejects.toMatchObject({status:429,retryAfter:300});});
it('fails closed on store errors and malformed or stale replies',async()=>{for(const data of [{error:'private-token'}, {...reply(),used:999}, {...reply(),admitted:'yes'}, {...reply(),resetsAt:'2026-10-23T00:00:00Z'}, {...reply(),limit:0}, {...reply(false,49)}]){fetchMock.mockResolvedValue(Response.json(data));await expect(reserveLiveAnalysis(now)).rejects.toMatchObject({status:503});}});
it('never forwards a secret to non-Supabase URLs or sends a public client key',async()=>{for(const url of ['http://quota-test.supabase.co','https://example.test','https://user:pass@quota-test.supabase.co','https://quota-test.supabase.co/wrong']){process.env.SITEBRIEF_SUPABASE_URL=url;await expect(reserveLiveAnalysis(now)).rejects.toMatchObject({status:503});}process.env.SITEBRIEF_SUPABASE_URL='https://quota-test.supabase.co';process.env.SITEBRIEF_SUPABASE_SECRET_KEY='sb_publishable_not-a-server-key';await expect(reserveLiveAnalysis(now)).rejects.toMatchObject({status:503});expect(fetchMock).not.toHaveBeenCalled();});
