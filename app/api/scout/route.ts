import {z} from 'zod';
import {exploreSchema} from '@/lib/sites/explore';
import {runScout,type ScoutRun} from '@/lib/sites/scout-agent';
import {buildDemoBrief} from '@/lib/sites/demo-server';
import {SiteError} from '@/lib/sites/qloo';
export const maxDuration=180;
const requestSchema=z.union([exploreSchema,z.object({demo:z.literal(true)})]);
let active=0;let canonical:{run:ScoutRun;expires:number}|null=null;
export async function GET(){return Response.json({name:'scout_restaurant_city',endpoint:'/api/scout',method:'POST',transport:'SSE data messages: step, exploration, profile, comparison, research, complete, error',input_schema:z.toJSONSchema(requestSchema),limits:'Bounded Gemini tool loop; read-only evidence; canonical example cache is per warm server instance, not a durable quota guarantee.'});}
export async function POST(request:Request){
 if(active>=2)return Response.json({error:'The scouting agent is busy. Try again shortly, or explore the map.'},{status:429});
 const body=await request.text();if(body.length>16000)return Response.json({error:'The brief is too long.'},{status:413});
 let json;try{json=JSON.parse(body);}catch{return Response.json({error:'Send a valid JSON brief.'},{status:400});}
 const parsed=requestSchema.safeParse(json);if(!parsed.success)return Response.json({error:'Check your city, audience references and restaurant brief.'},{status:400});
 const demo='demo' in parsed.data;
 active++;let cancelled=false;const encoder=new TextEncoder();
 const stream=new ReadableStream({
  async start(controller){
   const send=(event:unknown)=>{if(!cancelled)controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));};
   try{
    if(demo&&canonical&&canonical.expires>Date.now()){
     send({type:'complete',value:{...canonical.run,cached:true}});
    }else{
     const prepared=demo?await buildDemoBrief():null;
     const brief=prepared?.brief??exploreSchema.parse(parsed.data);
     const run=await runScout(brief,event=>{if(cancelled)throw new Error('Request cancelled');send(event);},undefined,prepared?.evidence);
     if(demo&&run.assessment&&Object.keys(run.research).length)canonical={run,expires:Date.now()+900000};send({type:'complete',value:run});
    }
   }catch(error){send({type:'error',error:error instanceof SiteError?error.message:'The scouting agent could not finish. Your brief is still here; try again or explore the map.',referenceChoice:error instanceof SiteError?error.referenceChoice:undefined});}
   finally{active--;if(!cancelled)controller.close();}
  },cancel(){cancelled=true;}
 });
 return new Response(stream,{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-store','X-Accel-Buffering':'no'}});
}
