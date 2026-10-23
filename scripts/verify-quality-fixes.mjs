import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.argv[2];
const brief={city:'Toronto, Ontario, Canada',center:{latitude:43.65348,longitude:-79.38393},radiusKm:10,concept:'A new specialty coffee café',references:['Blue Bottle Coffee']};
const response=await fetch(base+'/api/scout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(brief),signal:AbortSignal.timeout(180000)});
assert.equal(response.status,200);
const frames=(await response.text()).split('\n\n').filter(f=>f.startsWith('data: ')).map(f=>JSON.parse(f.slice(6)));
assert(!frames.some(f=>f.type==='error'),JSON.stringify(frames.filter(f=>f.type==='error')));
const run=frames.find(f=>f.type==='complete')?.value;assert(run?.assessment);assert.equal(run.decisionContract,'structured-v2');assert(run.selection);
function validateRun(run){
 const e=run.exploration;assert.equal(e.rankingMethod,'contrast');assert(e.areas.length>0);assert(e.areas.every(a=>a.popularityPercentile>=e.brief.minimumPopularityPercentile));
 const a=e.areas.find(a=>a.id===run.selection.visitFirst);assert(a);const rank=1+e.areas.filter(b=>b.contrast>a.contrast+1e-9).length;const tied=e.areas.filter(b=>Math.abs(b.contrast-a.contrast)<=1e-9).length;
 assert(run.assessment.reason.includes(`${tied>1?'jointly ranked':'ranked'} ${rank} of ${e.areas.length}`),run.assessment.reason);
 assert(!/highest contrast|market gap|whitespace|unmet demand/i.test(Object.values(run.assessment).join(' ')));
 return {selected:a.id,rank,tied,reason:run.assessment.reason};
}
const decision=validateRun(run);assert(run.steps.filter(s=>s.status==='complete').length>=4);assert(Object.values(run.research).some(r=>r.citations.length>0));
const medianResponse=await fetch(base+'/api/explore',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...brief,minimumPopularityPercentile:50}),signal:AbortSignal.timeout(60000)});assert.equal(medianResponse.status,200);const median=await medianResponse.json();assert(median.areas.length>0);assert(median.areas.every(a=>a.popularityPercentile>=50));
fs.mkdirSync('docs/quality',{recursive:true});
const compact=e=>({floor:e.brief.minimumPopularityPercentile,popularityRejected:e.popularityRejectedCount,screened:e.screenedCount,allTied:e.allTied,areas:e.areas.map(({id,name,popularity,popularityPercentile,affinity,contrast})=>({id,name,popularity,popularityPercentile,affinity,contrast}))});
const report={url:base,checkedAt:new Date().toISOString(),status:'passed',decisionContract:run.decisionContract,selection:run.selection,decision,blueBottle:compact(run.exploration),median:compact(median),steps:run.steps,researchSources:Object.values(run.research).flatMap(r=>r.sources),checks:['Fresh live Gemini tool loop with Blue Bottle','Primary prose agrees with actual shortlist rank and ties','No highest-contrast or market-gap claim in primary decision','Mandatory default20 floor and optional50 floor enforced']};
fs.writeFileSync('docs/quality/validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
