import {releaseScoutRun} from './research-release';
import snapshot from './data/playground-demo.json';
import {demoBrief} from './demo';
import {renderDecision,highestRanked} from './decision';
import type {Exploration} from './explore';
import {recheckRecordedReport} from './research-report';
import {reportMatchesArea} from './visit-research';
import type {ScoutRun} from './scout-agent';
/** Compact derived reference artifact, not a stored/reconstructed city heatmap. No provider call or timestamp refresh. */
export function savedPlaygroundDemo(reason:'live-unavailable'|'live-incomplete'):ScoutRun{
 const saved=structuredClone(snapshot) as unknown as Omit<ScoutRun,'exploration'> & {exploration:Omit<Exploration,'cells'> & {cellCount:number}};
 const {cellCount,...evidence}=saved.exploration;
 if(JSON.stringify({...evidence.brief,references:[]})!==JSON.stringify({...demoBrief,references:[]}))throw new Error('Saved demo no longer matches the canonical constraints.');
 if(!evidence.areas.length||evidence.areas.some(a=>(a.popularityPercentile??0)<(demoBrief.minimumPopularityPercentile??20)))throw new Error('Saved demo does not meet the popularity floor.');
 const exploration={...evidence,cells:evidence.areas.map(({latitude,longitude,affinity,popularity,affinityRank,audiencePercentile,popularityPercentile,contrast})=>({latitude,longitude,affinity,popularity,affinityRank,audiencePercentile,popularityPercentile,contrast}))};
 const area=highestRanked(exploration)!;const selection={visitFirst:area.id,reasonCode:'taste-evidence' as const,checkFocus:'general' as const};
 const research:ScoutRun['research']={};const stored=saved.research[area.id];
 if(stored&&(!stored.target||reportMatchesArea(stored,area))){try{research[area.id]=recheckRecordedReport(stored,{areaId:area.id,latitude:area.latitude,longitude:area.longitude},area.venues.map(v=>v.name));}catch{/* An unusable historical report is not evidence for the saved visit. */}}
 const run={...saved,research,exploration,assessment:renderDecision(selection,exploration,'ranking-default'),selection,decisionOrigin:'ranking-default',cached:true,savedDemo:{recordedAt:saved.createdAt,originalPointCount:cellCount,reason}} as ScoutRun;
 return releaseScoutRun(run);
}
