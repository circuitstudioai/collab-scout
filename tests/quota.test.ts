import {reserveLiveAnalysis,QUOTA_SCRIPT} from '../lib/sites/quota';
const fetchMock=jest.fn();
beforeEach(()=>{global.fetch=fetchMock;fetchMock.mockReset();process.env.SITEBRIEF_REDIS_REST_URL='https://redis.test';process.env.SITEBRIEF_REDIS_REST_TOKEN='private-token';process.env.SITEBRIEF_DAILY_ANALYSIS_LIMIT='50';});
afterEach(()=>{delete process.env.SITEBRIEF_REDIS_REST_URL;delete process.env.SITEBRIEF_REDIS_REST_TOKEN;delete process.env.SITEBRIEF_DAILY_ANALYSIS_LIMIT;});
it('fails closed before calling providers when no shared store is configured',async()=>{delete process.env.SITEBRIEF_REDIS_REST_TOKEN;await expect(reserveLiveAnalysis()).rejects.toMatchObject({status:503});expect(fetchMock).not.toHaveBeenCalled();});
it('uses an atomic expiring shared budget without exposing its token',async()=>{
 fetchMock.mockResolvedValue(Response.json({result:[1,49]}));
 const result=await reserveLiveAnalysis(new Date('2026-10-23T23:55:00Z'));expect(result).toEqual({limit:50,remaining:1,resetsAt:'2026-10-24T00:00:00.000Z'});
 const body=JSON.parse(fetchMock.mock.calls[0][1].body);expect(body[0]).toBe('EVAL');expect(body[1]).toBe(QUOTA_SCRIPT);expect(body[3]).toBe('sitebrief:budget:v1:preview:2026-10-23');expect(JSON.stringify(result)).not.toContain('private-token');
});
it('rejects an exhausted shared budget until UTC reset',async()=>{fetchMock.mockResolvedValue(Response.json({result:[0,50]}));await expect(reserveLiveAnalysis(new Date('2026-10-23T23:55:00Z'))).rejects.toMatchObject({status:429,retryAfter:300});});
it('fails closed on store outages and malformed replies',async()=>{for(const data of [{error:'private-token'}, {result:[1,999]}, {result:'oops'}]){fetchMock.mockResolvedValue(Response.json(data));await expect(reserveLiveAnalysis()).rejects.toMatchObject({status:503});}});
