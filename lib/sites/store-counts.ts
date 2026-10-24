/** Descriptive OSM category listings. Never a demand, vacancy, or viability score. */
export type StoreCountPoint={id:string;latitude:number;longitude:number};
export type StoreCount={target:StoreCountPoint;category:'cafe'|'restaurant'|'restaurant-or-fast-food'|'unsupported';categoryLabel:string;radiusMeters:1000;status:'available'|'unavailable';retrievedAt:string;count:number|null;source:{name:'OpenStreetMap contributors / Overpass';url:string;query:string};notice:string;cached:boolean};
const ENDPOINT='https://overpass.private.coffee/api/interpreter';
const cache=new Map<string,{expires:number;value:StoreCount}>();
const COVERAGE='Mapped category listings, not an exhaustive census or exact competitors. Missing or stale mapping is possible. Counts do not measure unmet demand; operating status is not independently verified.';
type Element={type:'node'|'way'|'relation';id:number;lat?:number;lon?:number;center?:{lat:number;lon:number};nodes?:number[];tags:Record<string,string>};
function parseElements(raw:unknown):Element[]{
 if(!raw||typeof raw!=='object')throw Error('Invalid response');
 const data=raw as {remark?:unknown;elements?:unknown};
 if(data.remark||!Array.isArray(data.elements))throw Error('Incomplete response');
 return data.elements.map(value=>{
  if(!value||typeof value!=='object')throw Error('Invalid element');
  const row=value as Element;
  if(!['node','way','relation'].includes(row.type)||!Number.isSafeInteger(row.id)||!row.tags||typeof row.tags!=='object'||Array.isArray(row.tags)||!Object.values(row.tags).every(v=>typeof v==='string'))throw Error('Invalid element');
  const latitude=row.lat??row.center?.lat;const longitude=row.lon??row.center?.lon;
  if(!Number.isFinite(latitude)||!Number.isFinite(longitude))throw Error('Missing location');
  return row;
 });
}
function listedAsOpen(tags:Record<string,string>){
 return !['disused','abandoned','demolished','removed','construction'].some(key=>tags[key]&&tags[key]!=='no')&&tags.opening_hours!=='closed'&&tags.closed!=='yes'&&tags.access!=='private';
}
function normalizedName(element:Element){return (element.tags.name??'').trim().toLocaleLowerCase('en');}
function countListings(elements:Element[],categories:string[]){
 const unique=[...new Map(elements.filter(row=>categories.includes(row.tags.amenity)&&listedAsOpen(row.tags)).map(row=>[`${row.type}/${row.id}`,row])).values()];
 // Only collapse an explicitly member-linked node and way with the same name/category.
 // Proximity or shared chain name alone must not collapse neighbouring branches.
 return unique.filter(row=>row.type!=='node'||!normalizedName(row)||!unique.some(other=>other.type==='way'&&other.nodes?.includes(row.id)&&other.tags.amenity===row.tags.amenity&&normalizedName(other)===normalizedName(row))).length;
}
export async function retrieveStoreCount(point:StoreCountPoint,format:string,signal?:AbortSignal):Promise<StoreCount>{
 const valid=Number.isFinite(point.latitude)&&Number.isFinite(point.longitude)&&Math.abs(point.latitude)<=85&&Math.abs(point.longitude)<=180;
 const category=format==='cafe'?'cafe':format==='full-service'?'restaurant':format==='fast-casual'?'restaurant-or-fast-food':'unsupported';
 const categoryLabel=category==='cafe'?'cafés':category==='restaurant'?'restaurants':category==='restaurant-or-fast-food'?'restaurants / fast-food venues':'unsupported category';
 const categories=category==='cafe'?['cafe']:category==='restaurant'?['restaurant']:['restaurant','fast_food'];
 const query=valid&&category!=='unsupported'?`[out:json][timeout:5];nwr(around:1000,${point.latitude},${point.longitude})["amenity"~"^(${categories.join('|')})$"];out body center;`:'';
 const source:StoreCount['source']={name:'OpenStreetMap contributors / Overpass',url:query?`https://overpass-turbo.eu/?Q=${encodeURIComponent(query)}`:'https://www.openstreetmap.org/copyright',query};
 const base:StoreCount={target:{id:point.id,latitude:point.latitude,longitude:point.longitude},category,categoryLabel,radiusMeters:1000,status:'unavailable',retrievedAt:new Date().toISOString(),count:null,source,notice:COVERAGE,cached:false};
 if(!valid||category==='unsupported'||signal?.aborted)return {...base,notice:`No category count available. ${COVERAGE}`};
 const key=`${point.latitude},${point.longitude}:${category}`;const hit=cache.get(key);
 if(hit&&hit.expires>Date.now())return {...hit.value,target:{id:point.id,latitude:point.latitude,longitude:point.longitude},cached:true};
 try{
  const deadline=AbortSignal.timeout(7000);const requestSignal=signal?AbortSignal.any([signal,deadline]):deadline;
  const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Sitebrief/1.0 (https://github.com/circuitstudioai/sitebrief)'},body:new URLSearchParams({data:query}).toString(),signal:requestSignal,cache:'no-store'});
  if(!response.ok)throw Error('Provider unavailable');
  const elements=parseElements(await response.json());
  if(requestSignal.aborted)throw Error('Request cancelled');
  const value:StoreCount={...base,status:'available',count:countListings(elements,categories),retrievedAt:new Date().toISOString()};
  if(cache.size>=60)cache.delete(cache.keys().next().value!);
  cache.set(key,{expires:Date.now()+15*60*1000,value});return value;
 }catch{return {...base,notice:`Listing count unavailable; no zero count inferred. ${COVERAGE}`};}
}
/** One union query serves the whole shortlist; do not send parallel public-provider requests. */
export async function retrieveStoreCounts(points:StoreCountPoint[],format:string,signal?:AbortSignal):Promise<Record<string,StoreCount>>{
 const chosen=points.slice(0,3).map(p=>({id:p.id,latitude:p.latitude,longitude:p.longitude}));
 if(chosen.length===1)return {[chosen[0].id]:await retrieveStoreCount(chosen[0],format,signal)};
 const category=format==='cafe'?'cafe':format==='full-service'?'restaurant':format==='fast-casual'?'restaurant-or-fast-food':'unsupported';
 if(category==='unsupported'||chosen.some(p=>!Number.isFinite(p.latitude)||!Number.isFinite(p.longitude)||Math.abs(p.latitude)>85||Math.abs(p.longitude)>180))return {};
 const categories=category==='cafe'?['cafe']:category==='restaurant'?['restaurant']:['restaurant','fast_food'];
 const categoryLabel=category==='cafe'?'cafés':category==='restaurant'?'restaurants':'restaurants / fast-food venues';
 const query=`[out:json][timeout:10];(${chosen.map(p=>`nwr(around:1000,${p.latitude},${p.longitude})["amenity"~"^(${categories.join('|')})$"];`).join('')});out body center;`;
 const source:StoreCount['source']={name:'OpenStreetMap contributors / Overpass',url:`https://overpass-turbo.eu/?Q=${encodeURIComponent(query)}`,query};
 const result:Record<string,StoreCount>={};let missing=false;
 for(const p of chosen){const hit=cache.get(`${p.latitude},${p.longitude}:${category}`);if(hit&&hit.expires>Date.now())result[p.id]={...hit.value,target:p,cached:true};else missing=true;}
 if(!missing)return result;
 let elements:Element[]|undefined;
 try{signal?.throwIfAborted();const deadline=AbortSignal.timeout(12000);const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','User-Agent':'Sitebrief/1.0 (https://github.com/circuitstudioai/sitebrief)'},body:new URLSearchParams({data:query}).toString(),signal:signal?AbortSignal.any([signal,deadline]):deadline,cache:'no-store'});if(!response.ok)throw Error();elements=parseElements(await response.json());signal?.throwIfAborted();}catch{}
 const {distanceKm}=await import('./compare');
 for(const p of chosen){if(result[p.id])continue;const local=elements?.filter(e=>distanceKm(p,{latitude:e.lat??e.center!.lat,longitude:e.lon??e.center!.lon})<=1);
  const value:StoreCount={target:p,category,categoryLabel,radiusMeters:1000,status:local?'available':'unavailable',retrievedAt:new Date().toISOString(),count:local?countListings(local,categories):null,source,notice:local?COVERAGE:`Listing count unavailable; no zero count inferred. ${COVERAGE}`,cached:false};result[p.id]=value;
  if(local){if(cache.size>=60)cache.delete(cache.keys().next().value!);cache.set(`${p.latitude},${p.longitude}:${category}`,{expires:Date.now()+900000,value});}
 }
 return result;
}
/** Shared export/UI wording keeps listing counts separate from audience and ranking. */
export function formatStoreCount(value:StoreCount):string{
 const count=value.status==='available'&&value.count!==null?`${value.count} mapped ${value.categoryLabel} within 1 km`:'Mapped venue count unavailable';
 return `${count}. ${value.notice} Source: ${value.source.name} ${value.source.url}. Retrieved ${value.retrievedAt}${value.cached?' (reused count)':''}.`;
}
