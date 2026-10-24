import {streetFromAddress} from './locations';
import type {GroundingMetadata} from '@google/genai';
import {ResearchError,type ResearchReport} from './research-report';
import {assertNarrativeEvidence} from './evidence-guards';
export const RESEARCH_FIELDS=[['SPACE','Space and rent signals'],['ACCESS','Access and transit'],['VENUES','Competitors and complements'],['ACTIVITY','Local activity anchors']] as const;
export type FieldKey=typeof RESEARCH_FIELDS[number][0];
export type ResearchField={key:FieldKey;label:string;status:'found'|'not-found';text:string;sourceIndices:number[]};
export const CITY_QUESTIONS=[
 'Ask the City: is the proposed restaurant use permitted at the specific premises, and which permits apply?',
 'Ask the City: which business and activity licences apply to this concept?',
 'Ask the City and operator: which supervision and safeguarding arrangements apply if a play area is included?',
 'Ask the landlord and City: can the premises support the proposed layout, accessibility and safe exits?'
];
const normalize=(s:string)=>s.normalize('NFKC').replace(/[’‘]/g,"'").toLowerCase().replace(/\bst\.?\b/g,'street').replace(/\bave\.?\b/g,'avenue').replace(/\brd\.?\b/g,'road').replace(/\bblvd\.?\b/g,'boulevard').replace(/\bw\b/g,'west').replace(/\be\b/g,'east').replace(/\bn\b/g,'north').replace(/\bs\b/g,'south').replace(/[-–—]/g,' ').replace(/\s+/g,' ').trim();
export function localResearchAnchors(area:{name:string;address:string|null;venues:{name:string;address?:string}[]}){
 const streets=[area.address,...area.venues.map(v=>v.address)].flatMap(address=>{const street=streetFromAddress(address);return street?[street]:[];});
 return [...new Set([area.name.replace(/^Near /,''),...area.venues.map(v=>v.name),...streets])].filter(a=>a&&!/Unnamed map point/.test(a));
}
/** Fixed section protocol supports Search on the current model without assuming tools + JSON-schema support.
 * Validate complete fields, never delete sentences and splice a different claim together. */
export function buildStructuredResearch(response:{text?:string;metadata?:GroundingMetadata},anchors:string[]):ResearchReport{
 const raw=response.text??'';const metadata=response.metadata;
 const sources=(metadata?.groundingChunks??[]).map(chunk=>{let url='';try{const value=new URL(chunk.web?.uri??'');if(value.protocol==='https:')url=value.href;}catch{}return {title:chunk.web?.title??'Web source',url};});
 if(!sources.some(s=>s.url))throw new ResearchError('missing-grounding');
 const spans=(metadata?.groundingSupports??[]).flatMap(s=>{
  const segment=s.segment?.text;if(!segment)return [];
  const start=raw.indexOf(segment);if(start<0||raw.indexOf(segment,start+1)>=0)return [];
  const indices=[...new Set((s.groundingChunkIndices??[]).filter(i=>Boolean(sources[i]?.url)))];
  return indices.length?[{start,end:start+segment.length,indices}]:[];
 });
 const diagnostics:string[]=[];
 const sections=[...raw.matchAll(/\[(SPACE|ACCESS|VENUES|ACTIVITY)\]/g)];
 const fields:ResearchField[]=RESEARCH_FIELDS.map(([key,label])=>{
  const empty:ResearchField={key,label,status:'not-found',text:'',sourceIndices:[]};
  const matches=sections.filter(m=>m[1]===key);if(matches.length!==1){diagnostics.push(`${key}:section-count-${matches.length}`);return empty;}
  const match=matches[0];const begin=match.index!+match[0].length;const next=sections.find(m=>m.index!>match.index!);
  const body=raw.slice(begin,next?.index??raw.length);const original=body.trim();const text=original.replace(/\[\d+(?:\s*,\s*\d+)*\]/g,'').replace(/\*\*/g,'').trim();
  if(!text||/^not found[.!]?$/i.test(text)||text.length>1000){diagnostics.push(`${key}:missing-or-length-${text.length}`);return empty;}
  try{assertNarrativeEvidence(text,anchors);}catch(error){diagnostics.push(`${key}:evidence-${error instanceof Error?error.message.slice(0,90)+(text.match(/\d+(?:[.,]\d+)*/g)?.slice(0,5).join(',')??''):'invalid'}`);return empty;}
  if(!anchors.some(a=>a.length>3&&normalize(text).includes(normalize(a)))){diagnostics.push(`${key}:local-anchor`);return empty;}
  // Every non-punctuation character must be covered by an exact provider-grounded span.
  const start=begin+body.indexOf(original);const end=start+original.length;
  const covering=spans.filter(s=>s.start<end&&s.end>start);let cursor=start;
  for(const span of [...covering].sort((a,b)=>a.start-b.start)){
   if(span.start>cursor&&/[\p{L}\p{N}]/u.test(raw.slice(cursor,span.start).replace(/\[\d+(?:\s*,\s*\d+)*\]/g,''))){diagnostics.push(`${key}:grounding-gap`);return empty;}
   cursor=Math.max(cursor,span.end);
  }
  if(cursor<end&&/[\p{L}\p{N}]/u.test(raw.slice(cursor,end).replace(/\[\d+(?:\s*,\s*\d+)*\]/g,''))){diagnostics.push(`${key}:grounding-tail`);return empty;}
  const sourceIndices=[...new Set(covering.flatMap(s=>s.indices))];
  return sourceIndices.length?{key,label,status:'found',text,sourceIndices}:empty;
 });
 let text='';const citations:ResearchReport['citations']=[];
 for(const f of fields){if(f.status!=='found')continue;text+=(text?'\n\n':'')+f.text;citations.push({end:text.length,sourceIndices:f.sourceIndices});}
 const count=fields.filter(f=>f.status==='found').length;
 return {validationRules:diagnostics,fields,text,sources,citations,createdAt:new Date().toISOString(),queries:metadata?.webSearchQueries??[],searchSuggestionsHtml:metadata?.searchEntryPoint?.renderedContent??'',status:count===4?'cited':count?'partial':'sources-only',notice:count===4?undefined:'Missing or unsupported fields are marked “not found”. Other cited fields are retained.'};
}
function citedUrls(fields:ResearchField[],sources:ResearchReport['sources']){
 return new Set(fields.filter(f=>f.status==='found').flatMap(f=>f.sourceIndices.map(i=>sources[i]?.url).filter(Boolean)));
}
export function hasResearchQuality(report:ResearchReport|undefined){
 if(!report?.fields)return false;
 const filled=report.fields.filter(f=>f.status==='found'&&f.text.trim()&&f.sourceIndices.length);
 return new Set(filled.map(f=>f.key)).size>=3&&citedUrls(filled,report.sources).size>=2;
}
/** Missing fields normally suffice; insufficient source diversity needs new evidence, not more of the same. */
export function researchRecoveryFields(report:ResearchReport):FieldKey[]{
 return RESEARCH_FIELDS.filter(([key])=>citedUrls(report.fields??[],report.sources).size<2||report.fields?.find(f=>f.key===key)?.status!=='found').map(([key])=>key);
}
/** Retry can fill missing fields without dropping prior grounded findings for the same target. */
export function mergeResearchFields(first:ResearchReport|undefined,second:ResearchReport):ResearchReport{
 if(!first?.fields||!second.fields)return second;
 if(JSON.stringify(first.target)!==JSON.stringify(second.target))throw new ResearchError('area-mismatch');
 const sources=[...first.sources];const remap=new Map<number,number>();
 for(const [i,source] of second.sources.entries()){let index=sources.findIndex(s=>s.url===source.url);if(index<0){index=sources.length;sources.push(source);}remap.set(i,index);}
 let fields=second.fields.map(f=>first.fields!.find(old=>old.key===f.key&&old.status==='found')??(f.status==='found'?{...f,sourceIndices:f.sourceIndices.map(i=>remap.get(i)!)}:f));
 // Retaining old findings must not prevent recovery from a single-source response.
 if(citedUrls(fields,sources).size<2){
  const refreshed=second.fields.map(f=>f.status==='found'?{...f,sourceIndices:f.sourceIndices.map(i=>remap.get(i)!)}:first.fields!.find(old=>old.key===f.key&&old.status==='found')??f);
  if(citedUrls(refreshed,sources).size>=2)fields=refreshed;
 }
 let text='';const citations:ResearchReport['citations']=[];
 for(const field of fields){if(field.status!=='found')continue;text+=(text?'\n\n':'')+field.text;citations.push({end:text.length,sourceIndices:field.sourceIndices});}
 const count=fields.filter(f=>f.status==='found').length;
 return {...second,fields,sources,text,citations,queries:[...new Set([...first.queries,...second.queries])],status:count===4?'cited':count?'partial':'sources-only',notice:count===4?undefined:second.notice};
}
