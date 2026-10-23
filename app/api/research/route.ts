import {reserveLiveAnalysis,quotaResponse} from '@/lib/sites/quota';
import { z } from 'zod';
import { researchArea, researchSchema, researchFailure } from '@/lib/sites/research';
export const maxDuration=60;
let active=0;
export async function GET(){return Response.json({name:'research_restaurant_area',endpoint:'/api/research',method:'POST',description:'Search public web sources for practical restaurant scouting context. Returns provider-grounded inline citations, retrieval date and search queries. Does not change Qloo taste rankings.',input_schema:z.toJSONSchema(researchSchema)});}
export async function POST(request:Request){
 if(active>=2)return Response.json({error:'Research is busy. Try again shortly; your map is still available.'},{status:429});
 active++;
 try{
  const text=await request.text();if(text.length>16000)return Response.json({error:'The research brief is too long.'},{status:413});
  let json;try{json=JSON.parse(text);}catch{return Response.json({error:'Send a valid JSON brief.'},{status:400});}
  const parsed=researchSchema.safeParse(json);if(!parsed.success)return Response.json({error:'Choose an area from your exploration before requesting research.'},{status:400});
  await reserveLiveAnalysis();
  return Response.json(await researchArea(parsed.data,request.signal),{headers:{'Cache-Control':'no-store'}});
 }catch(error){
  const blocked=quotaResponse(error);if(blocked)return blocked;
  const failure=researchFailure(error);
  return Response.json({error:failure.message,code:failure.code},{status:503});
 }finally{active--;}
}
