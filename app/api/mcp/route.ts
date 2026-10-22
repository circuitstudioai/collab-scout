import {listMcpTools,callMcpTool,mcpTools} from '@/lib/sites/mcp';
import {SiteError} from '@/lib/sites/qloo';
import {z} from 'zod';
export const maxDuration=180;
const rpcSchema=z.object({jsonrpc:z.literal('2.0'),id:z.union([z.string(),z.number(),z.null()]).optional(),method:z.string(),params:z.record(z.string(),z.unknown()).optional()});
let active=0;
export async function GET(){return new Response(null,{status:405,headers:{Allow:'POST'}});}
export async function DELETE(){return new Response(null,{status:405,headers:{Allow:'POST'}});}
export async function POST(request:Request){
 const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return Response.json({error:'Origin is not allowed.'},{status:403});
 const accept=request.headers.get('accept')??'';if(!accept.includes('application/json')||!accept.includes('text/event-stream'))return Response.json({error:'Accept application/json and text/event-stream.'},{status:406});
 if(!request.headers.get('content-type')?.includes('application/json'))return Response.json({error:'Send application/json.'},{status:415});
 const version=request.headers.get('mcp-protocol-version');if(version&&!['2025-06-18','2025-03-26'].includes(version))return Response.json({error:'Unsupported MCP protocol version.'},{status:400});
 const body=await request.text();if(body.length>20000)return Response.json({error:'Request too large.'},{status:413});
 let json;try{json=JSON.parse(body);}catch{return Response.json({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}},{status:400});}
 const parsed=rpcSchema.safeParse(json);if(!parsed.success)return Response.json({jsonrpc:'2.0',id:null,error:{code:-32600,message:'Invalid request'}},{status:400});
 const rpc=parsed.data;if(rpc.id===undefined)return new Response(null,{status:202});
 const result=(value:unknown)=>Response.json({jsonrpc:'2.0',id:rpc.id,result:value},{headers:{'Cache-Control':'no-store'}});
 const error=(code:number,message:string)=>Response.json({jsonrpc:'2.0',id:rpc.id,error:{code,message}});
 if(rpc.method==='initialize')return result({protocolVersion:'2025-06-18',capabilities:{tools:{listChanged:false}},serverInfo:{name:'sitebrief',version:'2.0.0'},instructions:'Read-only restaurant scouting. Taste/popularity rank contrast is not demand or success probability. Demographic signals are reference affinities, not resident percentages. Never infer competitor scarcity from the ranked nearby sample.'});
 if(rpc.method==='ping')return result({});
 if(rpc.method==='tools/list')return result({tools:listMcpTools()});
 if(rpc.method!=='tools/call')return error(-32601,'Method not found');
 const name=rpc.params?.name;if(typeof name!=='string'||!mcpTools.some(t=>t.name===name))return error(-32602,'Unknown tool');
 if(active>=2)return result({isError:true,content:[{type:'text',text:'The public demo is busy. Try again shortly.'}]});
 active++;
 try{const output=await callMcpTool(name,rpc.params?.arguments??{});return result({content:[{type:'text',text:JSON.stringify(output)}]});}
 catch(e){return result({isError:true,content:[{type:'text',text:JSON.stringify({error:e instanceof SiteError?e.message:e instanceof z.ZodError?'Invalid tool arguments.':'The evidence tool could not finish.',referenceChoice:e instanceof SiteError?e.referenceChoice:undefined})}]});}
 finally{active--;}
}
