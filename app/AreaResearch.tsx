'use client';
import {releaseResearch} from '@/lib/sites/research-release';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Area, Exploration } from '@/lib/sites/explore';
import {reportMatchesArea,visibleResearchSources} from '@/lib/sites/visit-research';
import {CITY_QUESTIONS} from '@/lib/sites/structured-research';
import type { ResearchReport } from '@/lib/sites/research';
function CitedText({report}:{report:ResearchReport}){
 const clean=(text:string)=>text.replace(/\*\*|__/g,'');
 function renderRange(start:number,end:number){
  let cursor=start;const parts:ReactNode[]=[];
  for(const [index,citation] of report.citations.entries()){
   if(citation.end<=start||citation.end>end||citation.end<cursor)continue;
   parts.push(<span key={`text-${index}`}>{clean(report.text.slice(cursor,citation.end))}</span>);
   parts.push(<sup key={`cite-${index}`}>{citation.sourceIndices.map(i=><a key={i} href={report.sources[i].url} target="_blank" rel="noreferrer" aria-label={`Source ${i+1}: ${report.sources[i].title}`}>[{i+1}]</a>)}</sup>);
   cursor=citation.end;
  }
  parts.push(<span key="end">{clean(report.text.slice(cursor,end))}</span>);return parts;
 }
 const blocks:ReactNode[]=[];let cursor=0;
 for(const [index,block] of report.text.split(/\n\s*\n/).entries()){
  const start=report.text.indexOf(block,cursor);cursor=start+block.length;
  const firstLine=block.split('\n')[0];const heading=firstLine.match(/^#{1,6}\s+/);
  const knownHeading=/^(Why scout here|Reasons to hesitate|Nearby concepts and published menu prices|Nearby concepts and menu checks|Access and local context|What to check on a visit):?$/i.test(clean(firstLine).trim());
  if(heading||knownHeading||/^\*\*[^*\n]{1,90}\*\*$/.test(firstLine.trim())){
   blocks.push(<h3 key={`heading-${index}`}>{renderRange(start+(heading?.[0].length??0),start+firstLine.length)}</h3>);
   if(firstLine.length<block.length)blocks.push(<p key={`body-${index}`}>{renderRange(start+firstLine.length+1,cursor)}</p>);
   continue;
  }
  if(/^[-*]\s/.test(block)){
   let lineStart=start;const lines:ReactNode[]=[];
   for(const [i,line] of block.split('\n').entries()){
    const begin=lineStart;lineStart+=line.length+1;const prefix=line.match(/^[-*]\s+/)?.[0].length??0;
    lines.push(<li key={i}>{renderRange(begin+prefix,begin+line.length)}</li>);
   }
   blocks.push(<ul key={index}>{lines}</ul>);continue;
  }
  blocks.push(<p key={index}>{renderRange(start,cursor)}</p>);
 }
 return <div className="atlas-research-text">{blocks}</div>;
}

export default function AreaResearch({result,area,reports,onReport,headingId="research-title"}:{result:Exploration;area:Area;reports:Record<string,ResearchReport>;onReport:(id:string,report:ResearchReport)=>void;headingId?:string}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const controller=useRef<AbortController|null>(null);
 const candidate=reports[area.id];const report=reportMatchesArea(candidate,area)?releaseResearch(candidate):undefined;
 useEffect(()=>()=>{controller.current?.abort();controller.current=null;},[]);
 async function research(){
  controller.current?.abort();const request=new AbortController();controller.current=request;setBusy(true);setError('');
  const timer=setTimeout(()=>request.abort(),48000);
  try{
   const response=await fetch('/api/research',{method:'POST',headers:{'Content-Type':'application/json'},signal:request.signal,body:JSON.stringify({brief:result.brief,mapEvidence:{affinity:area.affinity,popularity:area.popularity,audiencePercentile:area.audiencePercentile,popularityPercentile:area.popularityPercentile,contrast:area.contrast},area:{id:area.id,name:area.name,address:area.address,latitude:area.latitude,longitude:area.longitude,venues:area.venues.map(v=>({name:v.name,address:v.address}))}})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'Research could not finish.');
   if(!reportMatchesArea(data,area))throw new Error('Research did not match this map point and was not used.');
   if(!request.signal.aborted)onReport(area.id,releaseResearch(data));
  }catch(e){if(!request.signal.aborted)setError(e instanceof Error?e.message:'Research could not finish.');else if(controller.current===request)setError('Research took too long. Your map is unchanged. Try again.');}
  finally{clearTimeout(timer);if(controller.current===request)setBusy(false);}
 }
 return <section className="atlas-research" aria-labelledby={headingId}><div className="atlas-research-heading"><div><p className="atlas-eyebrow">04 / LOOK BEYOND THE TASTE MAP</p><h2 id={headingId}>Should you scout {area.name.replace(/^Near /,'')}?</h2><p>Research for your {result.brief.restaurant?.format.replace('-',' ')??'restaurant'} · {!result.brief.restaurant?.pricePosition||result.brief.restaurant.pricePosition==='unspecified'?'Price not set':result.brief.restaurant.pricePosition} · {!result.brief.restaurant?.servicePeriod||result.brief.restaurant.servicePeriod==='unspecified'?'Hours not set':`${result.brief.restaurant.servicePeriod} service`}</p></div>{!report&&<button type="button" className="atlas-go" disabled={busy} onClick={research}>{busy?'Researching the area…':'Research this area ↗'}</button>}</div>
 <p className="atlas-help">AI-assisted web research, separate from Qloo taste evidence. Source links are for inspection. Local summaries are withheld until proximity can be verified.</p>
 {candidate&&!report&&<p role="status" className="atlas-help">Research for this map point is unavailable. A mismatched report was not used.</p>}
 {busy&&<p role="status" className="atlas-working">Retrieving source links for this map point. This can take up to 48 seconds.</p>}
 {error&&<p role="alert" className="atlas-error">{error}</p>}
 {!report&&!busy&&!error&&<div className="atlas-research-empty"><strong>From a map point to a useful scouting brief.</strong><p>Inspect source links and use the City and landlord questions below. Local findings are not verified.</p></div>}
 {report&&<><p className="atlas-research-date">{report.status==='sources-only'?'SOURCES RETRIEVED':'RESEARCHED'} {new Date(report.createdAt).toLocaleString()} · CHECK SOURCE DATES</p><>{report.notice&&<p role="status" className="atlas-help">{report.notice}</p>}{report.fields?<div className="atlas-research-fields">{report.fields.map(field=><section key={field.key}><h3>{field.label}</h3>{field.status==='found'?<p>{field.text} <sup>{field.sourceIndices.slice(0,2).map(i=><a key={i} href={report.sources[i].url} target="_blank" rel="noreferrer" aria-label={`Source: ${report.sources[i].title}`}>[{i+1}]</a>)}</sup></p>:<p className="atlas-help">Local evidence unavailable; summary withheld.</p>}</section>)}</div>:report.text&&<><h3>Cited local context</h3><CitedText report={report}/></>}</><details className="atlas-source-log" open={report.status==='sources-only'}><summary>{report.status==='sources-only'?'Sources to inspect & search queries':'Sources & search queries'}</summary><ol>{visibleResearchSources(report).map(({source:s,index:i})=><li key={i}><a href={s.url} target="_blank" rel="noreferrer">{i+1}. {s.title}</a></li>)}</ol><p>{report.queries.join(' · ')}</p></details>{report.searchSuggestionsHtml&&<iframe title="Google Search suggestions" className="atlas-search-suggestions" srcDoc={report.searchSuggestionsHtml} sandbox="allow-popups allow-popups-to-escape-sandbox"/>}</>}
 <div className="atlas-city-questions"><h3>Questions for the City and landlord</h3><ul>{CITY_QUESTIONS.map(question=><li key={question}>{question}</li>)}</ul></div>
 </section>;
}
