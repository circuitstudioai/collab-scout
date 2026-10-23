import {z} from 'zod';
export const decisionChoiceSchema=z.object({visitFirst:z.string().nullable(),reasonCode:z.enum(['taste-evidence','practical-follow-up']),checkFocus:z.enum(['space-access','permissions','menus','general'])}).strict();
export type DecisionChoice=z.infer<typeof decisionChoiceSchema>;
type RankedArea={id:string;name:string;affinity:number;contrast?:number};
type Evidence={areas:RankedArea[];rankingMethod:'contrast'|'affinity'};
/** Only deterministic evidence can produce comparative claims. A model chooses IDs/codes, never these facts. */
export function rankingFact(evidence:Evidence,id:string){
 const area=evidence.areas.find(a=>a.id===id);if(!area)throw new Error('Choose a returned eligible area.');
 const score=(a:RankedArea)=>evidence.rankingMethod==='contrast'?a.contrast:a.affinity;
 const value=score(area);if(value===undefined||!Number.isFinite(value))throw new Error('The ranking value is unavailable.');
 const values=evidence.areas.map(score).filter((v):v is number=>v!==undefined&&Number.isFinite(v));
 const rank=1+values.filter(v=>v>value+1e-9).length;const tied=values.filter(v=>Math.abs(v-value)<=1e-9).length;
 return {rank,tied,total:values.length,metric:evidence.rankingMethod==='contrast'?'local rank contrast':'audience affinity'};
}
export function renderDecision(choice:DecisionChoice,evidence:Evidence){
 if(choice.visitFirst===null){return {visitFirst:null,reason:evidence.areas.length?'The agent did not select a visit-first point. The verified shortlist remains available.':'No returned point met all current selection rules.',tradeOff:'The selection rules were not relaxed and no point was invented.',nextAction:'Review the radius, audience references and displayed selection rules before trying again.'};}
 const fact=rankingFact(evidence,choice.visitFirst);
 const rankText=fact.tied>1?`jointly ranked ${fact.rank} of ${fact.total} by ${fact.metric}; ${fact.tied} shortlisted points share that score`:`ranked ${fact.rank} of ${fact.total} by ${fact.metric}`;
 const reason=`This point is ${rankText}. ${choice.reasonCode==='practical-follow-up'?'The agent selected practical checks as the next step for this point.':'The agent selected it using the returned taste evidence.'} This is a comparison among shortlisted points, not a business-success forecast.`;
 const checks={
  'space-access':{tradeOff:'Taste evidence does not establish usable floor area, access or an available commercial unit.',nextAction:'Scout nearby commercial streets. Check usable space, accessibility and the proposed layout, then read the cited research.'},
  permissions:{tradeOff:'Taste evidence does not establish zoning, permits, lease terms or permission for the proposed use.',nextAction:'Confirm the proposed use with the city and property owner. Do not treat a map point as an approved unit.'},
  menus:{tradeOff:'Nearby dining is a ranked sample, not a competitor census or evidence of unmet demand.',nextAction:'Check current local menus, observe the area in person and compare the concept with the actual nearby businesses.'},
  general:{tradeOff:'Taste evidence does not establish demand, rents, available units or commercial suitability.',nextAction:'Read the cited research and verify premises, access, permissions and operating conditions during a scouting visit.'},
 };
 return {visitFirst:choice.visitFirst,reason,...checks[choice.checkFocus]};
}
