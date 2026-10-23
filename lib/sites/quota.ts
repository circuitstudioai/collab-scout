/** A shared atomic budget. Process-local concurrency is not a usage quota. */
export class QuotaError extends Error{
 constructor(message:string,public status=503,public retryAfter?:number){super(message);}
}
export const QUOTA_SCRIPT=`local n=tonumber(redis.call('GET',KEYS[1]) or '0'); if n>=tonumber(ARGV[1]) then return {0,n}; end; n=redis.call('INCR',KEYS[1]); redis.call('EXPIREAT',KEYS[1],ARGV[2]); return {1,n}`;
export const DEFAULT_DAILY_LIMIT=50;
export async function reserveLiveAnalysis(now=new Date()){
 const url=process.env.SITEBRIEF_REDIS_REST_URL?.trim();const token=process.env.SITEBRIEF_REDIS_REST_TOKEN?.trim();
 const limit=Number(process.env.SITEBRIEF_DAILY_ANALYSIS_LIMIT??DEFAULT_DAILY_LIMIT);
 let valid=false;try{valid=new URL(url??'').protocol==='https:';}catch{}
 if(!valid||!token||!Number.isSafeInteger(limit)||limit<1||limit>10000)throw new QuotaError('Live analysis is unavailable until shared usage protection is configured. Recorded examples remain available.');
 const reset=new Date(now);reset.setUTCHours(24,0,0,0);const retryAfter=Math.ceil((reset.getTime()-now.getTime())/1000);
 const key=`sitebrief:budget:v1:${process.env.VERCEL_ENV==='production'?'production':'preview'}:${now.toISOString().slice(0,10)}`;
 let result:unknown;
 try{
  const response=await fetch(url!,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify(['EVAL',QUOTA_SCRIPT,'1',key,String(limit),String(reset.getTime()/1000)]),signal:AbortSignal.timeout(4000),cache:'no-store'});
  if(!response.ok)throw Error();const data=await response.json();if(data.error)throw Error();result=data.result;
 }catch{throw new QuotaError('Usage protection is unavailable. No new live analysis was started. Please try later.');}
 if(!Array.isArray(result)||result.length!==2||![0,1].includes(result[0])||!Number.isSafeInteger(result[1])||result[1]<0||result[1]>limit)throw new QuotaError('Usage protection returned an invalid allowance. No live analysis was started.');
 if(result[0]===0)throw new QuotaError('The shared daily live-analysis allowance is used. It resets at 00:00 UTC. Recorded examples remain available.',429,retryAfter);
 return {limit,remaining:limit-result[1],resetsAt:reset.toISOString()};
}
export function quotaResponse(error:unknown){return error instanceof QuotaError?Response.json({error:error.message},{status:error.status,headers:{'Cache-Control':'no-store',...(error.retryAfter?{'Retry-After':String(error.retryAfter)}:{})}}):null;}
