import {POST as scout} from '../app/api/scout/route';
import {POST as research} from '../app/api/research/route';
import {POST as explore} from '../app/api/explore/route';
import {POST as sites} from '../app/api/sites/route';
import {POST as mcp} from '../app/api/mcp/route';
import {sampleBrief} from '../lib/sites/schema';
const brief={city:'Toronto',center:{latitude:43.65,longitude:-79.38},radiusKm:10,concept:'Cafe',references:['Blue Bottle Coffee']};
const request=(body:unknown)=>new Request('https://local.test/api',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify(body)});
beforeEach(()=>{for(const key of ['SITEBRIEF_REDIS_REST_URL','SITEBRIEF_REDIS_REST_TOKEN','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','KV_REST_API_URL','KV_REST_API_TOKEN'])delete process.env[key];});
it('protects every public paid entry point with fail-closed shared admission',async()=>{
 for(const [handler,body] of [[scout,brief],[explore,brief],[sites,{...sampleBrief,mode:'live'}],[research,{brief,area:{id:'area-1',name:'Near Spadina',address:null,latitude:43.65,longitude:-79.38,venues:[]}}]] as const){const r=await handler(request(body));expect(r.status).toBe(503);expect((await r.json()).error).toMatch(/shared usage protection/);}
});
it('does not meter fixed sample comparisons or MCP discovery',async()=>{expect((await sites(request(sampleBrief))).status).toBe(200);const r=await mcp(request({jsonrpc:'2.0',id:1,method:'tools/list'}));expect((await r.json()).result.tools.length).toBeGreaterThan(0);});
it('prevents bypassing the shared budget through MCP evidence tools',async()=>{const r=await mcp(request({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'explore_restaurant_areas',arguments:brief}}));const result=(await r.json()).result;expect(result.isError).toBe(true);expect(result.content[0].text).toContain('shared usage protection');});
it.each(['exhausted','outage','read-only'])('blocks HTTP and MCP provider work when Redis is %s',async(mode)=>{
 const originalFetch=global.fetch;
 process.env.SITEBRIEF_REDIS_REST_URL='https://quota-test.upstash.io';
 process.env.SITEBRIEF_REDIS_REST_TOKEN='private-test-token';
 const now=Math.floor(Date.now()/1000);const reset=(Math.floor(now/86400)+1)*86400;
 const fetchMock=jest.fn(async()=>mode==='exhausted'?Response.json({result:[0,50,reset,now]}):mode==='read-only'?Response.json({error:'read-only private-test-token'}):new Response('outage',{status:503}));
 global.fetch=fetchMock;
 try{
  for(const [handler,body] of [[scout,brief],[explore,brief],[sites,{...sampleBrief,mode:'live'}],[research,{brief,area:{id:'area-1',name:'Near Spadina',address:null,latitude:43.65,longitude:-79.38,venues:[]}}]] as const){
   const r=await handler(request(body));expect(r.status).toBe(mode==='exhausted'?429:503);if(mode==='exhausted')expect(Number(r.headers.get('Retry-After'))).toBeGreaterThan(0);expect(await r.text()).not.toContain('private-test-token');
  }
  const response=await mcp(request({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'explore_restaurant_areas',arguments:brief}}));
  const result=(await response.json()).result;expect(result.isError).toBe(true);expect(result.content[0].text).toMatch(mode==='exhausted'?/daily live-analysis allowance/:/Usage protection is unavailable/);
  expect(fetchMock).toHaveBeenCalledTimes(5);
  for(const call of fetchMock.mock.calls as unknown as [string,RequestInit][]){expect(call[0]).toBe('https://quota-test.upstash.io');expect(JSON.parse(String(call[1].body))[0]).toBe('EVAL');}
 }finally{global.fetch=originalFetch;delete process.env.SITEBRIEF_REDIS_REST_URL;delete process.env.SITEBRIEF_REDIS_REST_TOKEN;}
});
