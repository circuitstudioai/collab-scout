import snapshot from './data/playground-demo.json';
import {demoBrief} from './demo';
import {decisionChoiceSchema,renderDecision} from './decision';
import type {Exploration} from './explore';
import type {ScoutRun} from './scout-agent';
/** Compact derived reference artifact, not a stored/reconstructed city heatmap. No provider call or timestamp refresh. */
export function savedPlaygroundDemo(reason:'live-unavailable'|'live-incomplete'):ScoutRun{
 const saved=structuredClone(snapshot) as unknown as Omit<ScoutRun,'exploration'> & {exploration:Omit<Exploration,'cells'> & {cellCount:number}};
 const {cellCount,...evidence}=saved.exploration;
 if(JSON.stringify({...evidence.brief,references:[]})!==JSON.stringify({...demoBrief,references:[]}))throw new Error('Saved demo no longer matches the canonical constraints.');
 if(!evidence.areas.length||evidence.areas.some(a=>(a.popularityPercentile??0)<(demoBrief.minimumPopularityPercentile??20)))throw new Error('Saved demo does not meet the popularity floor.');
 const selection=decisionChoiceSchema.parse(saved.selection);
 const exploration={...evidence,cells:evidence.areas.map(({latitude,longitude,affinity,popularity,affinityRank,audiencePercentile,popularityPercentile,contrast})=>({latitude,longitude,affinity,popularity,affinityRank,audiencePercentile,popularityPercentile,contrast}))};
 const run={...saved,exploration,assessment:renderDecision(selection,exploration),selection,decisionOrigin:'agent',cached:true,savedDemo:{recordedAt:saved.createdAt,originalPointCount:cellCount,reason}} as ScoutRun;
 return run;
}
