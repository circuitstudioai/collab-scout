import {runScout} from '../lib/sites/scout-agent';
import {qlooGet} from '../lib/qloo/http';
import type {GenerateContentResponse} from '@google/genai';
jest.mock('../lib/qloo/http',()=>({qlooGet:jest.fn()}));
jest.mock('@google/genai',()=>({GoogleGenAI:jest.fn(()=>({models:{generateContent:async()=>({text:'Check commercial space and permissions before visiting.',candidates:[{groundingMetadata:{groundingChunks:[{web:{title:'City guidance',uri:'https://example.test/city'}}],groundingSupports:[{segment:{text:'Check commercial space and permissions before visiting.'},groundingChunkIndices:[0]}]}}]})}}))}));
const get=jest.mocked(qlooGet);
beforeEach(()=>{
 process.env.QLOO_API_KEY='offline-test';process.env.GEMINI_API_KEY='offline-test';
 jest.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{}',{status:503}));
 get.mockImplementation(async request=>{
  if(request.path==='/search')return {results:[{entity_id:'brand',name:'Blue Bottle Coffee'}]};
  if(request.params?.['filter.type']==='urn:heatmap')return {results:{heatmap:Array.from({length:10},(_,i)=>({location:{latitude:43.65+i*.025,longitude:-79.38},query:{affinity:1-i*.05,popularity:[.7,.4,.6,.45,.3,.2,.9,1,.8,.5][i]}}))}};
  if(request.path==='/v2/analysis/compare')return {results:{tags:[],a:[],b:[]}};
  return {results:{entities:[{entity_id:'venue',name:'Nearby Cafe',properties:{address:'Toronto'},query:{affinity:.7}}],tags:[],demographics:[]}};
 });
});
afterEach(()=>{jest.restoreAllMocks();delete process.env.QLOO_API_KEY;delete process.env.GEMINI_API_KEY;});
const brief={city:'Toronto',center:{latitude:43.65,longitude:-79.38},radiusKm:20 as const,concept:'Coffee bar',references:['Blue Bottle Coffee']};
function generator(final:object){let turn=0;return async()=>{
 const names=['explore_areas','audience_profile','compare_audiences','research_area'];
 if(turn<names.length){const name=names[turn++];const args=name.includes('audiences')||name==='research_area'?{areaId:'area-2'}:{};return {functionCalls:[{name,args}],candidates:[{content:{role:'model',parts:[{functionCall:{name,args}}]}}]} as GenerateContentResponse;}
 return {text:JSON.stringify(final)} as GenerateContentResponse;
};}
it('does not publish a lower-ranked selection falsely called highest contrast or a market gap',async()=>{
 const run=await runScout(brief,()=>{},generator({visitFirst:'area-2',reason:'This has the highest contrast and a market gap.',tradeOff:'Check permissions.',nextAction:'Visit the area.'}));
 expect(run.exploration.areas.length).toBeGreaterThan(1);
 expect(run.assessment?.reason??'').not.toMatch(/highest contrast|market gap/i);
});
it('renders the actual rank when the agent chooses a lower-ranked point for practical follow-up',async()=>{
 const run=await runScout(brief,()=>{},generator({visitFirst:'area-2',reasonCode:'practical-follow-up',checkFocus:'space-access'}));
 expect(run.assessment).not.toBeNull();expect(run.assessment?.visitFirst).toBe('area-2');expect(run.assessment?.reason).toMatch(/ranked 2 of 2/);expect(run.assessment?.reason).not.toMatch(/highest contrast|market gap/i);
});
