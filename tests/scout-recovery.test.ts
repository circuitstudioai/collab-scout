import {runScout} from '../lib/sites/scout-agent';
import {exploreCity,type Exploration} from '../lib/sites/explore';
import {profileAudience,compareAreaAudience} from '../lib/sites/profile';
import {researchArea} from '../lib/sites/research';
import type {GenerateContentResponse} from '@google/genai';
jest.mock('../lib/sites/explore',()=>({exploreCity:jest.fn()}));
jest.mock('../lib/sites/profile',()=>({profileAudience:jest.fn(),compareAreaAudience:jest.fn()}));
jest.mock('../lib/sites/research',()=>({researchArea:jest.fn()}));
const brief={city:'Toronto',center:{latitude:43.65,longitude:-79.38},radiusKm:10 as const,concept:'Cafe',references:['Local cafe']};
const evidence={brief,rankingMethod:'contrast',areas:[{id:'area-1',name:'A',affinity:.9,contrast:50},{id:'area-2',name:'B',affinity:.8,contrast:40}]} as unknown as Exploration;
beforeEach(()=>{jest.mocked(exploreCity).mockResolvedValue(evidence);jest.mocked(profileAudience).mockResolvedValue({tags:[],ageSignals:[],relatedBrands:[],trace:[],unavailable:[]});jest.mocked(compareAreaAudience).mockResolvedValue({areaId:'area-1',venue:'Cafe',shared:[],referenceTags:[],venueTags:[],trace:[]});jest.mocked(researchArea).mockRejectedValue(new Error('Research unavailable'));});
function generator(final:object|Error){let turn=0;return async()=>{const names=['explore_areas','audience_profile','compare_audiences','research_area'];if(turn<names.length){const name=names[turn++];const args=turn>2?{areaId:'area-1'}:{};return {functionCalls:[{name,args}],candidates:[{content:{role:'model',parts:[{functionCall:{name,args}}]}}]} as GenerateContentResponse;}if(final instanceof Error)throw final;return {text:JSON.stringify(final)} as GenerateContentResponse;};}
it('keeps the verified top-ranked visit when research fails and Gemini returns null',async()=>{
 const run=await runScout(brief,()=>{},generator({visitFirst:null,reasonCode:'taste-evidence',checkFocus:'general'}));
 expect(run.assessment?.visitFirst).toBe('area-1');expect(run).toMatchObject({decisionOrigin:'ranking-fallback',decisionNotice:expect.stringMatching(/research.*unavailable/i)});expect(run.steps.find(s=>s.tool==='research_area')?.status).toBe('unavailable');expect(run.research).toEqual({});
});
it('preserves gathered ranking evidence if the final model request fails',async()=>{
 const run=await runScout(brief,()=>{},generator(new Error('Model timed out')));expect(run.assessment?.visitFirst).toBe('area-1');expect(run).toMatchObject({decisionOrigin:'ranking-fallback'});
});
it('does not invent an area if no point survives the selection rules',async()=>{
 jest.mocked(exploreCity).mockResolvedValue({...evidence,areas:[]});let turn=0;const run=await runScout(brief,()=>{},async()=> (++turn===1?{functionCalls:[{name:'explore_areas',args:{}}]}:{text:JSON.stringify({visitFirst:null,reasonCode:'taste-evidence',checkFocus:'general'})}) as GenerateContentResponse);
 expect(run.assessment?.visitFirst).toBeNull();
});
