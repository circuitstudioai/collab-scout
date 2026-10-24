import {releaseResearch} from './research-release';
import type {Area, Exploration} from './explore';
import type {ResearchReport} from './research-report';
import {hasResearchQuality} from './structured-research';
import {rankingFact} from './decision';
import {reportMatchesArea,visibleResearchSources} from './visit-research';
export type Verdict = {label:'Scout'|'Maybe'; reasons:string[]; sources:{title:string;url:string}[]};
/** Scouting priority only. Store density and prose never change eligibility or rank. */
export function areaVerdict(result:Exploration,area:Area,reports:Record<string,ResearchReport>):Verdict {
 const rank=rankingFact(result,area.id);const report=reports[area.id]?releaseResearch(reports[area.id]):undefined;
 const cited=report&&reportMatchesArea(report,area)&&Boolean(report.text.trim())&&report.citations.some(c=>c.end>0&&c.end<=report.text.length&&c.sourceIndices.some(i=>/^https?:\/\//.test(report.sources[i]?.url??'')));
 const sources=cited?visibleResearchSources(report).map(({source})=>source):[];
 return {label:rank.rank===1&&cited&&hasResearchQuality(report)?'Scout':'Maybe',reasons:[
  `${rank.tied>1?'Joint rank':'Rank'} ${rank.rank} of ${rank.total} eligible highlights${rank.tied>1?'; equal scores':''}.`,
  `Popularity ${area.popularityPercentile?.toFixed(0)??'unknown'}th percentile; passes the ${result.brief.minimumPopularityPercentile??20}th-percentile floor.`,
  cited?`${report.fields?.filter(f=>f.status==='found').length??report.citations.length} cited local finding${report.citations.length===1?'':'s'}; premises still need checking.`:'Local research incomplete; check premises, access and permissions.'
 ],sources};
}
