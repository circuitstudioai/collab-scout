import {releaseScoutRun} from './research-release';
import snapshot from './data/blue-bottle-demo.json';
import {blueBottleBrief} from './demo';
import {exploreSchema,type Exploration} from './explore';
import {hasResearchQuality} from './structured-research';
import {researchForVisit} from './visit-research';
import type {ScoutRun} from './scout-agent';
/** A recorded, compact, quality-qualified scenario. Never supplies evidence for a custom brief. */
export function savedBlueBottleDemo(reason:'live-unavailable'|'live-incomplete'):ScoutRun{
 const saved=structuredClone(snapshot) as unknown as Omit<ScoutRun,'exploration'> & {exploration:Omit<Exploration,'cells'> & {cellCount:number}};
 if(JSON.stringify(exploreSchema.parse(saved.exploration.brief))!==JSON.stringify(exploreSchema.parse(blueBottleBrief)))throw new Error('Saved scenario constraints changed.');
 const {cellCount,...evidence}=saved.exploration;
 if(evidence.areas.some(a=>(a.popularityPercentile??0)<(blueBottleBrief.minimumPopularityPercentile??20)))throw new Error('Saved demo no longer meets the floor.');
 const run:ScoutRun={...saved,exploration:{...evidence,cells:evidence.areas.map(a=>({latitude:a.latitude,longitude:a.longitude,affinity:a.affinity,popularity:a.popularity,audiencePercentile:a.audiencePercentile,popularityPercentile:a.popularityPercentile,contrast:a.contrast}))},cached:true,savedDemo:{recordedAt:saved.createdAt,originalPointCount:cellCount,reason}};
 if(!hasResearchQuality(researchForVisit(run)))throw new Error('Saved research does not meet the current quality standard.');
 return releaseScoutRun(run);
}
