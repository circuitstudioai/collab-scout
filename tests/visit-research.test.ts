import {reportMatchesArea,researchForVisit,hasCitedVisitResearch,visibleResearchSources} from '../lib/sites/visit-research';
import type {ResearchReport} from '../lib/sites/research-report';
const area={id:'area-1',latitude:43.65,longitude:-79.4};
const report:ResearchReport={text:'Menu.',createdAt:'2026-10-23',sources:[{title:'Menu',url:'https://example.test/menu'}],citations:[{end:5,sourceIndices:[0]}],queries:[],searchSuggestionsHtml:'',target:{areaId:area.id,latitude:area.latitude,longitude:area.longitude}};
const run={assessment:{visitFirst:area.id},exploration:{areas:[area]},research:{[area.id]:report}};
it('counts cited research only when the visit ID and coordinates match',()=>{
 expect(hasCitedVisitResearch(run)).toBe(true);expect(researchForVisit(run)).toBe(report);
 for(const target of [undefined,{...report.target!,areaId:'area-3'},{...report.target!,latitude:43.73}]){
  expect(reportMatchesArea({...report,target},area)).toBe(false);
  expect(hasCitedVisitResearch({...run,research:{[area.id]:{...report,target}}})).toBe(false);
 }
 expect(hasCitedVisitResearch({...run,research:{'area-3':report}})).toBe(false);
 expect(hasCitedVisitResearch({...run,research:{[area.id]:{...report,text:'',citations:[],status:'sources-only'}}})).toBe(false);
});
it('exports only sources attached to retained citations, but preserves labelled sources-only inspection links',()=>{
 const withExtra={...report,sources:[...report.sources,{title:'Uncited foreign page',url:'https://example.test/elsewhere'}]};
 expect(visibleResearchSources(withExtra).map(s=>s.source.title)).toEqual(['Menu']);
 expect(visibleResearchSources({...withExtra,status:'sources-only',text:'',citations:[]}).map(s=>s.source.title)).toEqual(['Menu','Uncited foreign page']);
});
