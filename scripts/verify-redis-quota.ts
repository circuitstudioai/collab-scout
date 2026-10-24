/** Isolated real Redis proof; no hosted endpoint, credentials or provider calls. */
import {spawn,execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import assert from 'node:assert/strict';
import {QUOTA_SCRIPT,reserveLiveAnalysis} from '../lib/sites/quota';
const exec=promisify(execFile);
async function main(){
 const directory=await mkdtemp(join(tmpdir(),'sitebrief-redis-'));
 const socket=join(directory,'redis.sock');
 const server=spawn(process.env.REDIS_SERVER_BIN??'redis-server',['--port','0','--unixsocket',socket,'--unixsocketperm','700','--save','','--appendonly','no','--maxmemory-policy','noeviction'],{stdio:'ignore'});
 let startError:Error|undefined;server.on('error',error=>{startError=error;});
 async function command(...args:string[]):Promise<unknown>{
  const {stdout}=await exec(process.env.REDIS_CLI_BIN??'redis-cli',['-s',socket,'--json',...args],{timeout:4000});
  // redis-cli prints server errors without necessarily setting a nonzero exit status.
  return JSON.parse(stdout);
 }
 const call=(key:string,limit=3)=>command('EVAL',QUOTA_SCRIPT,'1',key,String(limit)) as Promise<number[]>;
 const originalFetch=global.fetch;const originalEnv={...process.env};
 try{
  for(let i=0;i<40;i++){
   if(startError)throw startError;
   try{if(await command('PING')==='PONG')break;}catch{}
   if(i===39)throw Error('Isolated Redis failed to start');
   await new Promise(resolve=>setTimeout(resolve,50));
  }
  const concurrent=await Promise.all(Array.from({length:12},()=>call('proof:preview')));
  assert.equal(concurrent.filter(r=>r[0]===1).length,3);
  assert.equal(await command('HGET','proof:preview','used'),'3');
  const denied=await call('proof:preview');assert.equal(denied[0],0);
  assert.equal(await command('EXPIRETIME','proof:preview'),denied[2]);
  assert.equal(denied[2],(Math.floor(denied[3]/86400)+1)*86400);
  assert.equal((await call('proof:production'))[1],1);
  const yesterday=String(Math.floor(denied[3]/86400)-1);
  await command('HSET','proof:preview','day',yesterday,'used','3');
  assert.equal((await call('proof:preview'))[1],1);
  await command('SET','unrelated:fixture','preserved');
  await command('HSET','proof:corrupt','day',String(Math.floor(denied[3]/86400)),'used','broken');
  await assert.rejects(()=>call('proof:corrupt'));
  assert.equal(await command('GET','unrelated:fixture'),'preserved');
  // Exercise the application adapter, replacing only the HTTPS transport with real local EVAL.
  for(const name of ['SITEBRIEF_REDIS_REST_URL','SITEBRIEF_REDIS_REST_TOKEN','UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','KV_REST_API_URL','KV_REST_API_TOKEN'])delete process.env[name];
  process.env.SITEBRIEF_REDIS_REST_URL='https://isolated-proof.upstash.io';
  process.env.SITEBRIEF_REDIS_REST_TOKEN='nonsecret-local-fixture';
  process.env.VERCEL_ENV='preview';
  global.fetch=async(_input,options)=>{
   const args=JSON.parse(String(options?.body)) as string[];
   try{return Response.json({result:await command(...args)});}
   catch{return Response.json({error:'local store unavailable'},{status:503});}
  };
  const admitted=await Promise.allSettled(Array.from({length:64},()=>reserveLiveAnalysis()));
  assert.equal(admitted.filter(r=>r.status==='fulfilled').length,50);
  assert.equal(admitted.filter(r=>r.status==='rejected'&&r.reason.status===429).length,14);
  assert.equal(await command('HGET','sitebrief:budget:v2:preview','used'),'50');
  process.env.VERCEL_ENV='production';assert.equal((await reserveLiveAnalysis()).remaining,49);
  process.env.VERCEL_ENV='preview';
  await command('HSET','sitebrief:budget:v2:preview','day',yesterday,'used','50');
  assert.equal((await reserveLiveAnalysis()).remaining,49);
  await command('SHUTDOWN','NOSAVE').catch(()=>{});
  await assert.rejects(()=>reserveLiveAnalysis(),(error:unknown)=>(error as {status:number}).status===503);
  console.log('PASS: real isolated Redis: 3/12 atomic admissions; no exhaustion increment; UTC expiry; previous-day rollover; environment isolation; corrupt-state denial; unrelated data preserved.');
  console.log('PASS: application adapter over real local EVAL: 50/64 admitted, 14 exhausted; per-environment counters; previous-day reset; outage fails closed. Not hosted Upstash REST or integrated Preview proof.');
 }finally{
  global.fetch=originalFetch;
  for(const key of Object.keys(process.env))if(!(key in originalEnv))delete process.env[key];
  Object.assign(process.env,originalEnv);
  if(server.exitCode===null){server.kill('SIGTERM');await new Promise<void>(resolve=>{server.once('exit',()=>resolve());setTimeout(()=>{server.kill('SIGKILL');resolve();},1000).unref();});}
  await rm(directory,{recursive:true,force:true});
 }
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
