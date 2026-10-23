import {blueBottleBrief,demoBrief} from './demo';
import {createReader,record,rows,SiteError} from './qloo';
import {distanceKm} from './compare';
import type {Trace} from './schema';
import type {Exploration} from './explore';
export async function buildDemoBrief(blue=false){
 if(blue)return {brief:blueBottleBrief,evidence:undefined};
 const trace:Trace[]=[];const get=createReader(trace);
 const raw=await get('Find café-tagged Toronto places; select distinct names by returned popularity','/v2/insights',{'filter.type':'urn:entity:place','filter.location.query':'Toronto','filter.tags':'urn:tag:genre:place:restaurant:cafe','signal.interests.tags':'urn:tag:genre:place:restaurant:cafe',take:'30'},'entities');
 const references=selectDemoReferences(rows(raw,'entities'));
 if(references.length<3)throw new SiteError('Qloo did not return three distinct local café references for this example. No audience references have been invented.',502);
 return {brief:{...demoBrief,references:references.map(r=>r.name)},evidence:{references,trace}};
}
/** A ranked returned sample, NOT a complete city popularity leaderboard. */
export function selectDemoReferences(candidates:Record<string,unknown>[]):Exploration['references']{
 const valid=candidates.filter(r=>{
  const loc=record(r.location);const props=record(r.properties);
  return typeof r.entity_id==='string'&&typeof r.name==='string'&&typeof r.popularity==='number'&&Number.isFinite(r.popularity)&&r.popularity>0&&props.is_closed!==true&&typeof loc.lat==='number'&&typeof loc.lon==='number'&&distanceKm(demoBrief.center,{latitude:loc.lat,longitude:loc.lon})<=demoBrief.radiusKm;
 }).sort((a,b)=>Number(b.popularity)-Number(a.popularity)||String(a.entity_id).localeCompare(String(b.entity_id)));
 const seen=new Set<string>();const selected:Exploration['references']=[];
 for(const row of valid){const key=String(row.name).trim().toLowerCase();if(seen.has(key))continue;seen.add(key);selected.push({id:String(row.entity_id),name:String(row.name),resolution:'local-cafe',address:typeof record(row.properties).address==='string'?String(record(row.properties).address):undefined});if(selected.length===3)break;}
 return selected;
}
