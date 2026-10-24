// Offline acceptance review only. Review records are trusted human/source-audit input,
// never model output or a runtime geocoder. No network, model or quota calls here.
export function distanceKm(a,b){
 const r=Math.PI/180, p=(b.latitude-a.latitude)*r, q=(b.longitude-a.longitude)*r;
 const h=Math.sin(p/2)**2+Math.cos(a.latitude*r)*Math.cos(b.latitude*r)*Math.sin(q/2)**2;
 return 6371*2*Math.asin(Math.sqrt(Math.min(1,h)));
}
const point=p=>p&&Number.isFinite(p.latitude)&&Math.abs(p.latitude)<=90&&Number.isFinite(p.longitude)&&Math.abs(p.longitude)<=180;
const https=s=>{try{return new URL(s).protocol==='https:';}catch{return false;}};
export function auditRun(run,reviews=[],radiusKm){
 if(!Number.isFinite(radiusKm)||radiusKm<=0)throw Error('An explicit positive audit radiusKm is required');
 const area=run?.exploration?.areas?.find(a=>a.id===run.assessment?.visitFirst);
 const report=run?.research?.[area?.id];
 const targetMatches=Boolean(point(area)&&report?.target?.areaId===area.id&&report.target.latitude===area.latitude&&report.target.longitude===area.longitude);
 const fields=(report?.fields??[]).filter(f=>f.status==='found');
 const rows=fields.map(field=>{
  const sources=field.sourceIndices.map(i=>report.sources[i]?.url).filter(https);
  // Exact claim, point and provider-source binding prevents stale/cross-point reviews.
  const review=reviews.find(r=>r.field===field.key&&r.text===field.text&&r.target?.areaId===area?.id&&r.target.latitude===area?.latitude&&r.target.longitude===area?.longitude&&sources.includes(r.sourceUrl));
  let reason='missing-source-locality-review', distance;
  if(review){
   if(!review.supportsFinding)reason='source-does-not-support-finding';
   else if(review.coversEntireFinding!==true||!review.observedText?.trim()||!Number.isFinite(Date.parse(review.observedAt))||!Array.isArray(review.locations)||!review.locations.length||review.locations.some(p=>!p.subject?.trim()||!https(p.sourceUrl)||!point(p)||!Number.isFinite(p.uncertaintyKm)||p.uncertaintyKm<0))reason='incomplete-review-evidence';
   else if(!targetMatches)reason='target-mismatch';
   else {distance=Math.max(...review.locations.map(p=>distanceKm(area,p)+p.uncertaintyKm));reason=distance<=radiusKm?'reviewed-local':'outside-audit-radius';}
  }
  return {field:field.key,text:field.text,sources,reason,...(distance===undefined?{}:{maximumDistanceWithUncertaintyKm:distance}),pass:reason==='reviewed-local'};
 });
 const distinctSources=new Set(rows.flatMap(r=>r.sources)).size;
 const mechanicalPass=Boolean(targetMatches&&new Set(fields.map(f=>f.key)).size>=3&&distinctSources>=2&&!run.cached&&!run.savedDemo);
 return {target:area?{areaId:area.id,latitude:area.latitude,longitude:area.longitude}:null,radiusKm,targetMatches,mechanicalPass,sourceLocalityPass:mechanicalPass&&rows.every(r=>r.pass),rows,notice:'Offline source/locality review only; not full release acceptance, live generation, cache/fallback, UI, MCP, merge or Production approval.'};
}
