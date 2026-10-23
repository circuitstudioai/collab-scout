import {areaVerdict} from '../lib/sites/verdict';
import {savedPlaygroundDemo} from '../lib/sites/saved-demo';
import type {ResearchReport} from '../lib/sites/research-report';
const run=savedPlaygroundDemo('live-incomplete');
const area=run.exploration.areas[0];
const report:ResearchReport={text:'A locally cited menu.',createdAt:'2026-10-23',target:{areaId:area.id,latitude:area.latitude,longitude:area.longitude},sources:[{title:'Local menu',url:'https://example.test/menu'},{title:'Unused elsewhere',url:'https://example.test/elsewhere'}],citations:[{end:21,sourceIndices:[0]}],queries:[],searchSuggestionsHtml:''};
it('presents a highest-ranked, locally cited point as a scouting priority with only retained sources',()=>{
 const complete={...report,sources:[...report.sources,{title:'Transit',url:'https://city.test/transit'}],citations:[{end:21,sourceIndices:[0,2]}],fields:['SPACE','ACCESS','ACTIVITY'].map(key=>({key:key as 'SPACE'|'ACCESS'|'ACTIVITY',label:key,status:'found' as const,text:report.text,sourceIndices:[0,2]}))};
 const verdict=areaVerdict(run.exploration,area,{[area.id]:complete});
 expect(verdict.label).toBe('Scout');expect(verdict.reasons.join(' ')).toMatch(/rank 1/i);
 expect(verdict.sources).toEqual([report.sources[0],{title:'Transit',url:'https://city.test/transit'}]);expect(verdict.reasons).toHaveLength(3);
});

it('does not label a thin or mismatched first-ranked report Scout',()=>{expect(areaVerdict(run.exploration,area,{[area.id]:report}).label).toBe('Maybe');expect(areaVerdict(run.exploration,area,{[area.id]:{...report,target:{areaId:'elsewhere',latitude:0,longitude:0}}}).sources).toEqual([]);});
