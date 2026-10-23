import {POST,GET} from '../app/api/mcp/route';
const request=(body:unknown,origin?:string)=>new Request('https://example.test/api/mcp',{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json, text/event-stream',...(origin?{Origin:origin}:{})},body:JSON.stringify(body)});
it('negotiates stateless MCP and lists the actual restaurant tools',async()=>{
 const initialized=await POST(request({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'test',version:'1'}}}));
 expect((await initialized.json()).result.protocolVersion).toBe('2025-06-18');
 const tools=await (await POST(request({jsonrpc:'2.0',id:2,method:'tools/list'}))).json();
 expect(tools.result.tools.map((t:{name:string})=>t.name)).toEqual(expect.arrayContaining(['explore_restaurant_areas','compare_restaurant_sites','scout_restaurant_city']));
 expect((await GET()).status).toBe(405);
});
it('accepts initialization notifications without a fabricated result',async()=>{const r=await POST(request({jsonrpc:'2.0',method:'notifications/initialized'}));expect(r.status).toBe(202);expect(await r.text()).toBe('');});
it('rejects untrusted origins before dispatching an evidence tool',async()=>{expect((await POST(request({jsonrpc:'2.0',id:1,method:'tools/list'},'https://untrusted.test'))).status).toBe(403);});
it('returns an MCP tool error for malformed operator input',async()=>{const r=await POST(request({jsonrpc:'2.0',id:1,method:'tools/call',params:{name:'explore_restaurant_areas',arguments:{}}}));expect((await r.json()).result.isError).toBe(true);});
