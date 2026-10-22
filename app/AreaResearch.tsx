'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Area, Exploration } from '@/lib/sites/explore';
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
  const heading=block.match(/^#{1,6}\s+/);
  if(heading){blocks.push(<h3 key={index}>{renderRange(start+heading[0].length,cursor)}</h3>);continue;}
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

export default function AreaResearch({result,area,reports,onReport}:{result:Exploration;area:Area;reports:Record<string,ResearchReport>;onReport:(id:string,report:ResearchReport)=>void}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');const controller=useRef<AbortController|null>(null);
 const report=reports[area.id];
 useEffect(()=>()=>{controller.current?.abort();controller.current=null;},[]);
 async function research(){
  controller.current?.abort();const request=new AbortController();controller.current=request;setBusy(true);setError('');
  const timer=setTimeout(()=>request.abort(),48000);
  try{
   const response=await fetch('/api/research',{method:'POST',headers:{'Content-Type':'application/json'},signal:request.signal,body:JSON.stringify({brief:result.brief,area:{name:area.name,address:area.address,latitude:area.latitude,longitude:area.longitude,venues:area.venues.map(v=>({name:v.name}))}})});
   const data=await response.json();if(!response.ok)throw new Error(data.error||'Research could not finish.');
   if(!request.signal.aborted)onReport(area.id,data);
  }catch(e){if(!request.signal.aborted)setError(e instanceof Error?e.message:'Research could not finish.');else if(controller.current===request)setError('Research took too long. Your map is unchanged. Try again.');}
  finally{clearTimeout(timer);if(controller.current===request)setBusy(false);}
 }
 return <section className="atlas-research" aria-labelledby="research-title"><div className="atlas-research-heading"><div><p className="atlas-eyebrow">04 / LOOK BEYOND THE TASTE MAP</p><h2 id="research-title">Should you scout {area.name.replace(/^Near /,'')}?</h2><p>Research for your {result.brief.restaurant?.format.replace('-',' ')??'restaurant'} · {result.brief.restaurant?.pricePosition??'mid-range'} · {result.brief.restaurant?.servicePeriod??'all-day'} service</p></div>{!report&&<button type="button" className="atlas-go" disabled={busy} onClick={research}>{busy?'Researching the area…':'Research this area ↗'}</button>}</div>
 <p className="atlas-help">AI-assisted web research, separate from Qloo taste evidence. Facts link to retrieved sources; interpretation is not a site approval.</p>
 {busy&&<p role="status" className="atlas-working">Searching menus, local context and practical trade-offs. This can take up to 48 seconds.</p>}
 {error&&<p role="alert" className="atlas-error">{error}</p>}
 {!report&&!busy&&!error&&<div className="atlas-research-empty"><strong>From a map point to a useful scouting brief.</strong><p>Investigate nearby concepts, published prices, access, reasons to hesitate, and what to verify in person.</p></div>}
 {report&&<><p className="atlas-research-date">RESEARCHED {new Date(report.createdAt).toLocaleString()} · CHECK SOURCE DATES</p><CitedText report={report}/><details className="atlas-source-log"><summary>Sources & search queries</summary><ol>{report.sources.map((s,i)=>s.url?<li key={i}><a href={s.url} target="_blank" rel="noreferrer">{i+1}. {s.title}</a></li>:null)}</ol><p>{report.queries.join(' · ')}</p></details>{report.searchSuggestionsHtml&&<iframe title="Google Search suggestions" className="atlas-search-suggestions" srcDoc={report.searchSuggestionsHtml} sandbox="allow-popups allow-popups-to-escape-sandbox"/>}</>}
 </section>;
}
