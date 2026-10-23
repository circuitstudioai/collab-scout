import {z} from 'zod';
import type {ResearchReport} from './research-report';
export const decisionChoiceSchema=z.object({visitFirst:z.string().nullable(),reasonCode:z.enum(['taste-evidence','practical-follow-up']),checkFocus:z.enum(['space-access','permissions','menus','general']),practicalEvidence:z.object({quote:z.string().min(20).max(350),sourceIndex:z.number().int().min(0)}).strict().optional()}).strict();
export type DecisionChoice=z.infer<typeof decisionChoiceSchema>;
type RankedArea={id:string;name:string;affinity:number;contrast?:number};
type Evidence={areas:RankedArea[];rankingMethod:'contrast'|'affinity'};
export type PracticalEvidence={quote:string;title:string;url:string};
export function highestRanked(evidence:Evidence){return evidence.areas.find(a=>rankingFact(evidence,a.id).rank===1);}
/** A lower score needs an exact retained cited passage for that same area, not model-authored rationale. */
export function practicalEvidence(choice:DecisionChoice,reports:Record<string,ResearchReport>):PracticalEvidence|undefined{
 const proof=choice.practicalEvidence;const report=choice.visitFirst?reports[choice.visitFirst]:undefined;
 if(choice.reasonCode!=='practical-follow-up'||!proof||!report||report.status==='sources-only')return;
 const source=report.sources[proof.sourceIndex];if(!source?.url)return;
 const topics={'space-access':/access|entrance|wheelchair|space|layout|floor|seating|pedestrian|transit|station/i,permissions:/permit|zoning|permission|planning/i,menus:/menu|coffee|food|café|cafe/i,general:/$^/};
 if(!topics[choice.checkFocus].test(proof.quote)||/\?|^(?:check|confirm|verify|ask)\b/i.test(proof.quote))return;
 let start=0;
 for(const citation of report.citations){
  const quote=report.text.slice(start,citation.end).trim();start=citation.end;
  if(quote===proof.quote&&citation.sourceIndices.includes(proof.sourceIndex))return {quote,title:source.title,url:source.url};
 }
}
export function resolveVisit(choice:DecisionChoice,evidence:Evidence,reports:Record<string,ResearchReport>){
 if(!choice.visitFirst)return {selection:choice,defaulted:false};
 const rank=rankingFact(evidence,choice.visitFirst).rank;
 const proof=practicalEvidence(choice,reports);
 if(rank>1&&!proof){const top=highestRanked(evidence)!;return {selection:{visitFirst:top.id,reasonCode:'taste-evidence' as const,checkFocus:choice.checkFocus},defaulted:true};}
 return {selection:choice,defaulted:false,proof};
}
/** Only deterministic evidence can produce comparative claims. A model chooses IDs/codes, never these facts. */
export function rankingFact(evidence:Evidence,id:string){
 const area=evidence.areas.find(a=>a.id===id);if(!area)throw new Error('Choose a returned eligible area.');
 const score=(a:RankedArea)=>evidence.rankingMethod==='contrast'?a.contrast:a.affinity;
 const value=score(area);if(value===undefined||!Number.isFinite(value))throw new Error('The ranking value is unavailable.');
 const values=evidence.areas.map(score).filter((v):v is number=>v!==undefined&&Number.isFinite(v));
 const rank=1+values.filter(v=>v>value+1e-9).length;const tied=values.filter(v=>Math.abs(v-value)<=1e-9).length;
 return {rank,tied,total:values.length,metric:evidence.rankingMethod==='contrast'?'local rank contrast':'audience affinity'};
}
export function renderDecision(choice:DecisionChoice,evidence:Evidence,origin:'agent'|'ranking-fallback'|'ranking-default'='agent',proof?:PracticalEvidence){
 if(choice.visitFirst===null){return {visitFirst:null,reason:evidence.areas.length?'The agent did not select a visit-first point. The verified shortlist remains available.':'No returned point met all current selection rules.',tradeOff:'The selection rules were not relaxed and no point was invented.',nextAction:'Review the radius, audience references and displayed selection rules before trying again.'};}
 const fact=rankingFact(evidence,choice.visitFirst);
 const rankText=fact.tied>1?`jointly ranked ${fact.rank} of ${fact.total} by ${fact.metric}; ${fact.tied} shortlisted points share that score`:`ranked ${fact.rank} of ${fact.total} by ${fact.metric}`;
 const area=evidence.areas.find(a=>a.id===choice.visitFirst)!;
 const reason=`${area.name} is ${rankText}. ${origin==='ranking-fallback'?'This is a deterministic ranking fallback, not an agent recommendation.':proof?'Visit to investigate the cited practical detail below; this does not change the taste ranking.':fact.rank===1?'Start with this highest-ranked eligible point; verify premises and practical constraints during the visit.':'The visit order differs from taste-score order.'} This is a shortlist comparison, not a business-success forecast.`;
 const checks={
  'space-access':{tradeOff:'Taste evidence does not establish usable floor area, access or an available commercial unit.',nextAction:'Scout nearby commercial streets. Check usable space, accessibility and the proposed layout, then read the cited research.'},
  permissions:{tradeOff:'Taste evidence does not establish zoning, permits, lease terms or permission for the proposed use.',nextAction:'Confirm the proposed use with the city and property owner. Do not treat a map point as an approved unit.'},
  menus:{tradeOff:'Nearby dining is a ranked sample, not a competitor census or evidence of unmet demand.',nextAction:'Check current local menus, observe the area in person and compare the concept with the actual nearby businesses.'},
  general:{tradeOff:'Taste evidence does not establish demand, rents, available units or commercial suitability.',nextAction:origin==='ranking-fallback'?'Use the verified map points to plan a scouting visit. Check premises, access and permissions; retry research for sourced local context.':'Read the cited research and verify premises, access, permissions and operating conditions during a scouting visit.'},
 };
 return {visitFirst:choice.visitFirst,reason,...checks[choice.checkFocus],...(proof?{practicalEvidence:proof}:{})};
}
