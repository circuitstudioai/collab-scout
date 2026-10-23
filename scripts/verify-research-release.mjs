import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.argv[2];assert(base,'Pass the exact preview URL');
const out=process.env.VERIFY_OUTPUT_DIR||'/tmp/sitebrief-final-area-acceptance-20261023';fs.mkdirSync(out,{recursive:true});
const blue={city:'Toronto, Ontario, Canada',center:{latitude:43.65348,longitude:-79.38393},radiusKm:10,minimumPopularityPercentile:20,concept:'A new specialty coffee café',references:['Blue Bottle Coffee']};
const results=[];let playground;
for(let i=0;i<5;i++){
 const scenario=i===0?'canonical-playground':i%2?'blue-bottle':'custom-playground';
 const body=i===0?{demo:true}:i%2?blue:playground;assert(body,'Canonical run must return a usable playground brief');
 const started=Date.now();
 const response=await fetch(base+'/api/scout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(180000)});
 const frames=(await response.text()).split('\n\n').filter(f=>f.startsWith('data: ')).map(f=>JSON.parse(f.slice(6)));
 const run=frames.find(f=>f.type==='complete')?.value;
 const row={scenario,url:base,status:response.status,elapsedSeconds:(Date.now()-started)/1000,checkedAt:new Date().toISOString()};
 if(!run){row.mode='error';row.errors=frames.filter(f=>f.type==='error');results.push(row);console.log(JSON.stringify(row));continue;}
 if(i===0)playground={...run.exploration.brief,referenceSelections:run.exploration.references.map(r=>({query:r.name,id:r.id}))};
 const reports=Object.values(run.research);const visitId=run.assessment?.visitFirst;const point=run.exploration.areas.find(a=>a.id===visitId);const selectedReport=run.research[visitId];const matched=selectedReport?.target?.areaId===visitId&&selectedReport?.target?.latitude===point?.latitude&&selectedReport?.target?.longitude===point?.longitude;const cited=matched&&selectedReport.citations.length>0;
 fs.writeFileSync(`${out}/run-${i+1}.json`,JSON.stringify(run,null,2)+'\n');
 row.mode=run.savedDemo?'saved-demo':run.cached?'cached-real':cited?'live-cited':reports.length?'live-sources-only':'live-ranking-only';
 row.visitFirst=visitId;row.researchTarget=selectedReport?.target;row.research=reports.map(r=>({target:r.target,status:r.status??'cited',sourceCount:r.sources.filter(s=>s.url).length,citationCount:r.citations.length,omittedSentences:r.omittedSentences,validationRules:r.validationRules}));
 row.researchAreaIds=run.steps.filter(s=>s.tool==='research_area'&&s.status==='complete').map(s=>s.areaId);row.decisionOrigin=run.decisionOrigin;
 const areas=run.exploration.areas;const selected=areas.find(a=>a.id===run.assessment?.visitFirst);assert(selected,'Expected an eligible visit');
 const metric=a=>run.exploration.rankingMethod==='contrast'?a.contrast:a.affinity;
 row.rank=1+areas.filter(a=>metric(a)>metric(selected)+1e-9).length;
 row.tied=areas.filter(a=>Math.abs(metric(a)-metric(selected))<=1e-9).length;
 assert(run.assessment.reason.includes(`ranked ${row.rank} of ${areas.length}`));
 assert.equal(row.rank,1);assert(matched,'Visit-first research ID/coordinates must match the recommended map point');assert.deepEqual(Object.keys(run.research),[visitId]);assert(row.researchAreaIds.every(id=>id===visitId));
 assert(areas.every(a=>a.popularityPercentile>=(run.exploration.brief.minimumPopularityPercentile??20)));
 for(const r of reports){for(const c of r.citations){assert(c.end>0&&c.end<=r.text.length);assert(c.sourceIndices.every(index=>r.sources[index]?.url?.startsWith('https:')));}if(r.status==='sources-only'){assert.equal(r.text,'');assert.equal(r.citations.length,0);assert(r.notice);}}
 assert(!run.cached||run.savedDemo,'Fresh acceptance must not count warm-cache reuse');
 results.push(row);console.log(JSON.stringify(row));
 fs.writeFileSync(`${out}/fresh-runs.json`,JSON.stringify({url:base,checkedAt:new Date().toISOString(),results},null,2)+'\n');
}
const counts=Object.fromEntries([...new Set(results.map(r=>r.mode))].map(mode=>[mode,results.filter(r=>r.mode===mode).length]));
fs.writeFileSync(`${out}/fresh-runs.json`,JSON.stringify({url:base,checkedAt:new Date().toISOString(),counts,results},null,2)+'\n');
console.log(JSON.stringify({counts,total:results.length}));
assert.equal(results.filter(r=>r.mode==='live-cited').length,5,'All five fresh runs must return live cited research; recovery modes are reported separately');
