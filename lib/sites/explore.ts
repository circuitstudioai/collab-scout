import { z } from 'zod';
import {scoreSignal} from './signal';
import { distanceKm, parseCells } from './compare';
import { SiteError, createReader, resolveReferences, rows, record } from './qloo';
import { parseLocations } from './locations';
import type { Cell, Trace, Venue } from './schema';
export const exploreSchema = z.object({
  city: z.string().trim().min(2).max(100),
  center: z.object({ latitude: z.number().min(-85).max(85), longitude: z.number().min(-180).max(180) }),
  radiusKm: z.union([z.literal(5),z.literal(10),z.literal(20)]),
  minimumPopularityPercentile:z.union([z.literal(20),z.literal(50)]).optional(),
  concept: z.string().trim().min(3).max(300),
  references: z.array(z.string().trim().min(2).max(100)).min(1).max(3),
  restaurant: z.object({brandName:z.string().trim().max(100).default(''),format:z.enum(['cafe','fast-casual','full-service']).default('cafe'),servicePeriod:z.enum(['unspecified','daytime','evening','all-day']).default('unspecified'),pricePosition:z.enum(['unspecified','value','mid-range','premium']).default('unspecified')}).optional(),
  existingOutlets: z.array(z.object({name:z.string().trim().min(1).max(140),latitude:z.number().min(-85).max(85),longitude:z.number().min(-180).max(180)})).max(5).optional(),
  minimumOutletDistanceKm:z.number().min(0).max(10).optional(),
  referenceSelections: z.array(z.object({query:z.string().trim().min(2).max(100),id:z.string().trim().min(1).max(100)})).max(3).optional(),
});
export type ExploreBrief = z.infer<typeof exploreSchema>;
export type Area = Cell & { id:string; name:string; address:string|null; lowerCount:number; pointCount:number; distanceKm:number; venues:Venue[]; contextAvailable:boolean; nameAvailable:boolean };
export type RejectedPoint = Cell & {outletName:string; distanceKm:number};
export type OutletConstraints = Pick<ExploreBrief,'existingOutlets'|'minimumOutletDistanceKm'|'minimumPopularityPercentile'>;
export type Exploration = { createdAt:string; brief:ExploreBrief; references:{id:string;name:string;resolution?:'brand'|'exact'|'selected'|'local-cafe';address?:string}[]; cells:Cell[]; areas:Area[]; trace:Trace[]; separationKm:number; allTied:boolean; totalReturned:number; rejected:RejectedPoint[]; rejectedCount:number; eligibleCount:number;rankingMethod:'contrast'|'affinity';popularityCoverage:number;popularityRejectedCount:number;screenedCount:number };
export function selectAreas(cells:Cell[], center:ExploreBrief['center'], radiusKm:number, constraints:OutletConstraints={}) {
  const unique=[...new Map(cells.filter(c=>distanceKm(center,c)<=radiusKm).map(c=>[`${c.latitude},${c.longitude}`,c])).values()];
  const scored=scoreSignal(unique);const local=scored.cells;
  const ranked=[...local].sort((a,b)=>(scored.rankingMethod==='contrast'?((b.contrast??-Infinity)-(a.contrast??-Infinity)):0)||b.affinity-a.affinity||a.latitude-b.latitude||a.longitude-b.longitude);
  const separationKm=radiusKm===5?1:2;
  const rejected:RejectedPoint[]=[];
  const eligible=ranked.filter(cell=>{
    const closest=(constraints.existingOutlets??[]).map(outlet=>({outlet,distance:distanceKm(cell,outlet)})).sort((a,b)=>a.distance-b.distance)[0];
    if(closest&&closest.distance<(constraints.minimumOutletDistanceKm??0)){
      rejected.push({...cell,outletName:closest.outlet.name,distanceKm:closest.distance});return false;
    }
    return true;
  });
  const selected:Cell[]=[];
  const floor=constraints.minimumPopularityPercentile??20;
  const aboveFloor=eligible.filter(c=>(c.popularityPercentile??-1)>=floor);
  const candidates=scored.rankingMethod==='contrast'?aboveFloor.filter(c=>(c.audiencePercentile??0)>=70):[];
  for(const cell of candidates){if(selected.every(other=>distanceKm(cell,other)>=separationKm))selected.push(cell);if(selected.length===3)break;}
  return {cells:local,selected,separationKm,allTied:selected.length>1&&selected.every(c=>scored.rankingMethod==='contrast'?Math.abs(c.contrast!-selected[0].contrast!)<=1e-9:c.affinity===selected[0].affinity),rejected,eligibleCount:eligible.length,rankingMethod:scored.rankingMethod,popularityCoverage:scored.popularityCoverage,popularityRejectedCount:eligible.length-aboveFloor.length,screenedCount:candidates.length};
}
const labels=new Map<string,{name:string;address:string;expires:number}>();
async function nameArea(cell:Cell):Promise<{name:string;address:string}|null>{
  const key=`${cell.latitude},${cell.longitude}`;const cached=labels.get(key);if(cached&&cached.expires>Date.now())return cached;
  const url=new URL('https://photon.komoot.io/reverse');url.searchParams.set('lat',String(cell.latitude));url.searchParams.set('lon',String(cell.longitude));url.searchParams.set('radius','0.3');url.searchParams.set('limit','1');url.searchParams.set('lang','en');
  try{const r=await fetch(url,{headers:{'User-Agent':'Sitebrief/1.0 (https://github.com/circuitstudioai/collab-scout)'},signal:AbortSignal.timeout(6000)});if(!r.ok)return null;const match=parseLocations(await r.json())[0];if(!match||distanceKm(cell,match)>.3)return null;const label={name:`Near ${match.areaName??match.name}`.slice(0,110),address:match.label};if(labels.size>=100)labels.delete(labels.keys().next().value!);labels.set(key,{...label,expires:Date.now()+3600000});return label;}catch{return null;}
}
export async function exploreCity(brief:ExploreBrief,verified?:{references:Exploration['references'];trace:Trace[]}):Promise<Exploration>{
  brief={...brief,minimumPopularityPercentile:brief.minimumPopularityPercentile??20};
  const trace:Trace[]=[...(verified?.trace??[])];const get=createReader(trace);const references=verified?.references??await resolveReferences(brief,get);const interests=references.map(r=>r.id).join(',');
  const raw=await get('Map audience taste across the city','/v2/insights',{'filter.type':'urn:heatmap','filter.location.query':brief.city,'signal.interests.entities':interests,'signal.interests.tags':'urn:tag:genre:place:restaurant'},'heatmap');
  const returned=parseCells(raw);const selection=selectAreas(returned,brief.center,brief.radiusKm,brief);
  if(!selection.cells.length)throw new SiteError('Qloo returned no taste map points within this search radius. Try a wider radius, another city or different audience references. No areas have been invented.');
  const areas=await Promise.all(selection.selected.map(async(cell,index)=>{
    const [label,context]=await Promise.all([nameArea(cell), (async()=>{try{const raw=await get(`Nearby dining for area ${index+1}`,'/v2/insights',{'filter.type':'urn:entity:place','filter.location':`POINT(${cell.longitude} ${cell.latitude})`,'filter.location.radius':'1000','filter.tags':'urn:tag:genre:place:restaurant','signal.interests.entities':interests,take:'5'},'entities');return {available:true,venues:[...new Map(rows(raw,'entities').filter(v=>typeof v.entity_id==='string'&&typeof v.name==='string').map(v=>({id:String(v.entity_id),name:String(v.name),address:typeof record(v.properties).address==='string'?String(record(v.properties).address):undefined,affinity:typeof record(v.query).affinity==='number'?Number(record(v.query).affinity):null})).map(v=>[v.name.trim().toLowerCase(),v])).values()]};}catch{return {available:false,venues:[]};}})()]);
    trace.push({step:`Locate area ${index+1} on OpenStreetMap`,path:'Photon /reverse',params:{latitude:String(cell.latitude),longitude:String(cell.longitude)},status:label?'ok':'unavailable',count:label?1:0});
    return {...cell,id:`area-${index+1}`,name:label?.name??`Unnamed map point (${cell.latitude.toFixed(4)}, ${cell.longitude.toFixed(4)})`,address:label?.address??null,nameAvailable:Boolean(label),lowerCount:selection.cells.filter(c=>c.affinity<cell.affinity).length,pointCount:selection.cells.length,distanceKm:distanceKm(brief.center,cell),venues:context.venues,contextAvailable:context.available};
  }));
  return {createdAt:new Date().toISOString(),brief,references,cells:selection.cells,areas,trace,separationKm:selection.separationKm,allTied:selection.allTied,totalReturned:returned.length,rejected:selection.rejected.slice(0,3),rejectedCount:selection.rejected.length,eligibleCount:selection.eligibleCount,rankingMethod:selection.rankingMethod,popularityCoverage:selection.popularityCoverage,popularityRejectedCount:selection.popularityRejectedCount,screenedCount:selection.screenedCount};
}
