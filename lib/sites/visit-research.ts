import type {Area} from './explore';
import type {ResearchReport} from './research-report';
type Point=Pick<Area,'id'|'latitude'|'longitude'>;
export function reportMatchesArea(report:ResearchReport|undefined,area:Point|undefined){
 return Boolean(report&&area&&report.target?.areaId===area.id&&report.target.latitude===area.latitude&&report.target.longitude===area.longitude);
}
type Visit={assessment:{visitFirst:string|null}|null;exploration:{areas:Point[]};research:Record<string,ResearchReport>};
/** Presence elsewhere in the run is never evidence for the visit-first point. */
export function researchForVisit(run:Visit){
 const id=run.assessment?.visitFirst;if(!id)return;
 const area=run.exploration.areas.find(a=>a.id===id);const report=run.research[id];
 return reportMatchesArea(report,area)?report:undefined;
}
export function hasCitedVisitResearch(run:Visit){return Boolean(researchForVisit(run)?.citations.length);}
/** Unused search chunks are not cited evidence. Sources-only links remain explicitly for inspection. */
export function visibleResearchSources(report:ResearchReport){
 const used=new Set(report.citations.flatMap(c=>c.sourceIndices));
 const inspectOnly=report.status==='sources-only'||!report.citations.length;
 return report.sources.map((source,index)=>({source,index})).filter(({source,index})=>Boolean(source.url)&&(inspectOnly||used.has(index)));
}
