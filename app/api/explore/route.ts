import { exploreSchema, exploreCity } from '@/lib/sites/explore';
import { SiteError } from '@/lib/sites/qloo';
export const maxDuration=60;
let active=0;
export async function POST(request:Request){
  if(active>=4)return Response.json({error:'Other explorations are running. Please try again shortly.'},{status:429});
  active++;
  try{const body=await request.text();if(body.length>10000)return Response.json({error:'Your brief is too long.'},{status:413});let json;try{json=JSON.parse(body);}catch{return Response.json({error:'Send a valid JSON brief.'},{status:400});}const parsed=exploreSchema.safeParse(json);if(!parsed.success)return Response.json({error:parsed.error.issues.map(i=>`${i.path.join('.')}: ${i.message}`).join('; ')},{status:400});return Response.json(await exploreCity(parsed.data),{headers:{'Cache-Control':'no-store'}});
  }catch(error){return Response.json({error:error instanceof SiteError?error.message:'The exploration could not finish. Your entries are still here. Try again.',referenceChoice:error instanceof SiteError?error.referenceChoice:undefined},{status:error instanceof SiteError?error.status:500});}finally{active--;}
}
