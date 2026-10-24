import fs from 'node:fs';
import assert from 'node:assert/strict';
const base=process.argv[2];assert(base,'Pass exact preview URL');
const out=process.env.VERIFY_OUTPUT_DIR??'/tmp/sitebrief-feature-research';fs.mkdirSync(out,{recursive:true});
const brief={city:'Toronto, Ontario, Canada',center:{latitude:43.6534817,longitude:-79.3839347},radiusKm:10,minimumPopularityPercentile:20,concept:'Scout Toronto areas for a proposed Blue Bottle specialty coffee café.',references:['Blue Bottle Coffee'],restaurant:{brandName:'Blue Bottle Coffee',format:'cafe',servicePeriod:'unspecified',pricePosition:'unspecified'},existingOutlets:[],minimumOutletDistanceKm:0};
const rows=[];
for(let i=0;i<Number(process.env.VERIFY_RUNS??5);i++){
 const start=Date.now();const response=await fetch(base+'/api/scout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(brief),signal:AbortSignal.timeout(170000)});
 const raw=await response.text();const frames=raw.split('\n\n').filter(f=>f.startsWith('data: ')).map(f=>JSON.parse(f.slice(6)));
 const run=frames.find(f=>f.type==='complete')?.value;fs.writeFileSync(`${out}/run-${i+1}.json`,JSON.stringify(run??{status:response.status,body:raw},null,2));
 const point=run?.exploration.areas.find(a=>a.id===run.assessment?.visitFirst);const report=run?.research[point?.id];
 const fields=report?.fields?.filter(f=>f.status==='found')??[];const sources=new Set(fields.flatMap(f=>f.sourceIndices.map(i=>report.sources[i]?.url).filter(Boolean)));
 const matched=point&&report?.target?.areaId===point.id&&report.target.latitude===point.latitude&&report.target.longitude===point.longitude;
 const row={run:i+1,url:base,checkedAt:new Date().toISOString(),seconds:(Date.now()-start)/1000,status:response.status,point:point?{id:point.id,name:point.name,latitude:point.latitude,longitude:point.longitude}:null,matched:Boolean(matched),fields:fields.length,sources:sources.size,cached:run?.cached??false,saved:Boolean(run?.savedDemo),rules:report?.validationRules,error:frames.find(f=>f.type==='error')?.error};
 row.mechanicalPass=Boolean(matched&&fields.length>=3&&sources.size>=2&&!row.cached&&!row.saved);rows.push(row);console.log(JSON.stringify(row));
 fs.writeFileSync(`${out}/summary.json`,JSON.stringify({rows,mechanicalPassed:rows.filter(r=>r.mechanicalPass).length,total:rows.length,sourceLocalityStatus:'not-audited',releaseAcceptanceStatus:'not-established'},null,2));
}
assert(rows.every(r=>r.mechanicalPass),'Mechanical checks only: every fresh run must show three grounded fields and two sources for the exact visit point');
console.log('Mechanical checks complete; geographic/source correctness is NOT established. Run audit-recorded-research.mjs with trusted source reviews before claiming locality acceptance.');
