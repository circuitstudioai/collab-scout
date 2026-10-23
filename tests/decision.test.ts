import {renderDecision,rankingFact,decisionChoiceSchema} from '../lib/sites/decision';
const evidence={rankingMethod:'contrast' as const,areas:[{id:'a',name:'A',affinity:.99,contrast:50},{id:'b',name:'B',affinity:.98,contrast:50},{id:'c',name:'C',affinity:.97,contrast:40}]};
it('reports actual equal ranks instead of inventing a unique winner',()=>{
 expect(rankingFact(evidence,'b')).toMatchObject({rank:1,tied:2,total:3});
 expect(renderDecision({visitFirst:'b',reasonCode:'taste-evidence',checkFocus:'general'},evidence).reason).toContain('jointly ranked 1 of 3');
});
it('rejects free-text assertions and invented IDs rather than trusting a schema-valid claim',()=>{
 expect(decisionChoiceSchema.safeParse({visitFirst:'c',reasonCode:'taste-evidence',checkFocus:'general',reason:'Highest contrast and a market gap'}).success).toBe(false);
 expect(()=>renderDecision({visitFirst:'invented',reasonCode:'taste-evidence',checkFocus:'general'},evidence)).toThrow('returned eligible');
});
