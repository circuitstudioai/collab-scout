/** Shared Supabase admission. The database owns the UTC day, limit and atomic increment. */
export class QuotaError extends Error{
 constructor(message:string,public status=503,public retryAfter?:number){super(message);}
}
export async function reserveLiveAnalysis(now=new Date()){
 const rawUrl=process.env.SITEBRIEF_SUPABASE_URL?.trim();const key=process.env.SITEBRIEF_SUPABASE_SECRET_KEY?.trim()??'';
 let origin='';try{const url=new URL(rawUrl??'');if(url.protocol==='https:'&&/^[a-z0-9-]+\.supabase\.co$/.test(url.hostname)&&!url.username&&!url.password&&url.pathname==='/'&&!url.search&&!url.hash&&!url.port)origin=url.origin;}catch{}
 let legacy=false;try{legacy=JSON.parse(Buffer.from(key.split('.')[1]??'','base64url').toString()).role==='service_role';}catch{}
 if(!origin||!(key.startsWith('sb_secret_')&&key.length>20||legacy))throw new QuotaError('Live analysis is unavailable until shared usage protection is configured. Recorded examples remain available.');
 let data:Record<string,unknown>;
 try{
  const response=await fetch(`${origin}/rest/v1/rpc/sitebrief_reserve_live_analysis`,{method:'POST',headers:{apikey:key,...(legacy?{Authorization:`Bearer ${key}`} : {}),'Content-Type':'application/json'},body:JSON.stringify({p_environment:process.env.VERCEL_ENV==='production'?'production':'preview'}),signal:AbortSignal.timeout(4000),redirect:'error',cache:'no-store'});
  if(!response.ok)throw Error();data=await response.json();
 }catch{throw new QuotaError('Usage protection is unavailable. No new live analysis was started. Please try later.');}
 const {admitted,used,limit,resetsAt}=data??{};const reset=typeof resetsAt==='string'?new Date(resetsAt):new Date(NaN);const until=reset.getTime()-now.getTime();
 if(typeof admitted!=='boolean'||!Number.isSafeInteger(used)||!Number.isSafeInteger(limit)||Number(limit)<1||Number(limit)>10000||Number(used)<0||Number(used)>10000||(admitted?(Number(used)<1||Number(used)>Number(limit)):Number(used)<Number(limit))||!Number.isFinite(until)||until<=0||until>86700000||reset.getUTCHours()!==0||reset.getUTCMinutes()!==0||reset.getUTCSeconds()!==0||reset.getUTCMilliseconds()!==0)throw new QuotaError('Usage protection returned an invalid allowance. No live analysis was started.');
 if(!admitted)throw new QuotaError('The shared daily live-analysis allowance is used. It resets at 00:00 UTC. Recorded examples remain available.',429,Math.ceil(until/1000));
 return {limit:Number(limit),remaining:Number(limit)-Number(used),resetsAt:reset.toISOString()};
}
export function quotaResponse(error:unknown){return error instanceof QuotaError?Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'no-store',...(error.retryAfter?{'Retry-After':String(error.retryAfter)}:{})}}):null;}
