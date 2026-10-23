import {renderDecision,rankingFact,decisionChoiceSchema,resolveVisit} from '../lib/sites/decision';
import {buildResearchReport} from '../lib/sites/research-report';
const evidence={rankingMethod:'contrast' as const,areas:[{id:'a',name:'A',affinity:.99,contrast:50},{id:'b',name:'B',affinity:.98,contrast:50},{id:'c',name:'Near Ossington',affinity:.97,contrast:40}]};
it('reports actual equal ranks instead of inventing a unique winner',()=>{
 expect(rankingFact(evidence,'b')).toMatchObject({rank:1,tied:2,total:3});
 expect(renderDecision({visitFirst:'b',reasonCode:'taste-evidence',checkFocus:'general'},evidence).reason).toContain('jointly ranked 1 of 3');
});
const quote='The Ossington café menu lists a coffee tasting selection.';
const research={c:buildResearchReport({text:quote,metadata:{groundingChunks:[{web:{title:'Local menu',uri:'https://example.com/menu'}}],groundingSupports:[{segment:{text:quote},groundingChunkIndices:[0]}]}})};
it('allows a lower-ranked practical visit only with an exact retained citation for that area',()=>{
 const choice={visitFirst:'c',reasonCode:'practical-follow-up' as const,checkFocus:'menus' as const,practicalEvidence:{quote,sourceIndex:0}};
 const resolved=resolveVisit(choice,evidence,research);
 expect(resolved.defaulted).toBe(false);expect(resolved.selection.visitFirst).toBe('c');
 const decision=renderDecision(resolved.selection,evidence,'agent',resolved.proof);
 expect(decision.reason).toContain('ranked 3 of 3');expect(decision.practicalEvidence).toMatchObject({quote,url:'https://example.com/menu'});
});
it('rejects invented, wrong-source and wrong-area practical rationales',()=>{
 for(const [proof,reports] of [[{quote:'Invented menu claim about the area.',sourceIndex:0},research],[{quote,sourceIndex:5},research],[{quote,sourceIndex:0},{b:research.c}]] as const){
  expect(resolveVisit({visitFirst:'c',reasonCode:'practical-follow-up',checkFocus:'menus',practicalEvidence:proof},evidence,reports).selection.visitFirst).toBe('a');
 }
});
it('does not break an actual top-score tie or demand a rationale for equal scores',()=>{
 expect(resolveVisit({visitFirst:'b',reasonCode:'taste-evidence',checkFocus:'general'},evidence,{})).toMatchObject({selection:{visitFirst:'b'},defaulted:false});
});
it('does not treat a cited city-wide permit checklist as an area-specific reason to override rank',()=>{
 const generic='Inquire about the process for obtaining a change-of-use permit, a building permit for any alterations, and a business license from the City of Toronto.';
 const report=buildResearchReport({text:generic,metadata:{groundingChunks:[{web:{uri:'https://example.com/permits'}}],groundingSupports:[{segment:{text:generic},groundingChunkIndices:[0]}]}});
 expect(resolveVisit({visitFirst:'c',reasonCode:'practical-follow-up',checkFocus:'permissions',practicalEvidence:{quote:generic,sourceIndex:0}},evidence,{c:report}).selection.visitFirst).toBe('a');
});
it('rejects free-text assertions and invented IDs rather than trusting a schema-valid claim',()=>{
 expect(decisionChoiceSchema.safeParse({visitFirst:'c',reasonCode:'taste-evidence',checkFocus:'general',reason:'Highest contrast and a market gap'}).success).toBe(false);
 expect(()=>renderDecision({visitFirst:'invented',reasonCode:'taste-evidence',checkFocus:'general'},evidence)).toThrow('returned eligible');
});
