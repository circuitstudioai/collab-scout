import {createReader,rows,record} from './qloo';
import type {Trace} from './schema';
export type AudienceProfile={tags:{name:string;affinity:number|null}[];ageSignals:{referenceId:string;referenceName:string;bands:{name:string;score:number}[]}[];relatedBrands:{id:string;name:string}[];trace:Trace[];unavailable:string[]};
export async function profileAudience(references:{id:string;name:string}[]):Promise<AudienceProfile>{
 const trace:Trace[]=[];const get=createReader(trace);const interests=references.map(r=>r.id).join(',');const unavailable:string[]=[];
 const output:AudienceProfile={tags:[],ageSignals:[],relatedBrands:[],trace,unavailable};
 try{const raw=await get('Read audience taste tags','/v2/insights',{'filter.type':'urn:tag','filter.tag.types':'urn:tag:genre:place','signal.interests.entities':interests,take:'8'},'tags');output.tags=rows(raw,'tags').filter(t=>typeof t.name==='string').map(t=>({name:String(t.name),affinity:typeof record(t.query).affinity==='number'?Number(record(t.query).affinity):null}));}catch{unavailable.push('Taste tags');}
 try{const raw=await get('Read reference demographic affinity','/v2/insights',{'filter.type':'urn:demographics','signal.interests.entities':interests},'demographics');output.ageSignals=rows(raw,'demographics').map(d=>({referenceId:String(d.entity_id??''),referenceName:references.find(r=>r.id===d.entity_id)?.name??'Combined reference signal',bands:Object.entries(record(record(d.query).age)).filter(([,v])=>typeof v==='number'&&Number.isFinite(v)).map(([name,score])=>({name,score:Number(score)}))}));}catch{unavailable.push('Demographic affinity');}
 try{const raw=await get('Find cross-brand audience connections','/v2/insights',{'filter.type':'urn:entity:brand','signal.interests.entities':interests,'filter.exclude.entities':interests,take:'5'},'entities');output.relatedBrands=rows(raw,'entities').filter(b=>typeof b.name==='string'&&typeof b.entity_id==='string').map(b=>({id:String(b.entity_id),name:String(b.name)}));}catch{unavailable.push('Related brands');}
 return output;
}
export type AudienceComparison={areaId:string;venue:string;shared:string[];referenceTags:string[];venueTags:string[];trace:Trace[]};
export async function compareAreaAudience(references:{id:string}[],area:{id:string;venues:{id:string;name:string}[]}):Promise<AudienceComparison>{
 const venue=area.venues[0];if(!venue)throw new Error('No returned venue is available for audience comparison.');
 const trace:Trace[]=[];const raw=await createReader(trace)('Compare reference and nearby-venue tags','/v2/analysis/compare',{'a.signal.interests.entities':references.map(r=>r.id).join(','),'b.signal.interests.entities':venue.id},'tags');
 const result=record(record(raw).results);const names=(value:unknown)=>Array.isArray(value)?value.map(record).filter(t=>typeof t.name==='string').slice(0,8).map(t=>String(t.name)):[];
 return {areaId:area.id,venue:venue.name,shared:names(result.tags),referenceTags:names(result.a),venueTags:names(result.b),trace};
}
