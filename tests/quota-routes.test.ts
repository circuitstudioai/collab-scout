import {POST as scout} from '../app/api/scout/route';
import {POST as research} from '../app/api/research/route';
import {POST as explore} from '../app/api/explore/route';
import {POST as sites} from '../app/api/sites/route';
import {POST as mcp} from '../app/api/mcp/route';
import {sampleBrief} from '../lib/sites/schema';
const brief={city:'Toronto',center:{latitude:43.65,longitude:-79.38},radiusKm:10,concept:'Cafe',references:['Blue Bottle Coffee']};
const request=(body:unknown)=>new Request('https://local.test/api',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream'},body:JSON.stringify(body)});
beforeEach(()=>{delete process.env.SITEBRIEF_REDIS_REST_URL;delete process.env.SITEBRIEF_REDIS_REST_TOKEN;});
it('protects every public paid entry point with fail-closed shared admission',async()=>{
 for(const [handler,body] of [[scout,brief],[explore,brief],[sites,{...sampleBrief,mode:'live'}],[research,{brief,area:{id:'area-1',name:'Near Spadina',address:null,latitude:43.65,longitude:-79.38,venues:[]}}]] as const){const r=await handler(request(body));expect(r.status).toBe(503);expect((await r.json()).error).toMatch(/shared usage protection/);}
});
it('does not meter fixed sample comparisons or MCP discovery',async()=>{expect((await sites(request(sampleBrief))).status).toBe(200);const r=await mcp(request({jsonrpc:'2.0',id:1,method:'tools/list'}));expect((await r.json()).result.tools.length).toBeGreaterThan(0);});
it('prevents bypassing the shared budget through MCP evidence tools',async()=>{const r=await mcp(request({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'explore_restaurant_areas',arguments:brief}}));const result=(await r.json()).result;expect(result.isError).toBe(true);expect(result.content[0].text).toContain('shared usage protection');});
