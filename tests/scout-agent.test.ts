import {runScout} from '../lib/sites/scout-agent';
import type {GenerateContentResponse} from '@google/genai';
import {qlooGet} from '../lib/qloo/http';
jest.mock('../lib/qloo/http',()=>({qlooGet:jest.fn()}));
const get=jest.mocked(qlooGet);
it('rejects model-invented tool execution and stops at the bounded model budget',async()=>{
 process.env.QLOO_API_KEY='offline-key';let calls=0;
 const generate=async()=>{calls++;return {functionCalls:[{name:'research_area',args:{areaId:'invented'}}],candidates:[{content:{role:'model',parts:[{functionCall:{name:'research_area',args:{areaId:'invented'}}}]}}]} as GenerateContentResponse;};
 await expect(runScout({city:'Toronto',center:{latitude:43.65,longitude:-79.38},radiusKm:10,concept:'Coffee bar',references:['Starbucks']},()=>{},generate)).rejects.toThrow('bounded tool budget');
 expect(calls).toBe(7);expect(get).not.toHaveBeenCalled();delete process.env.QLOO_API_KEY;
});
it('repairs a malformed final decision within the bounded budget without inventing an eligible area',async()=>{
 process.env.QLOO_API_KEY='offline-key';get.mockReset();
 get.mockImplementation(async request=>request.path==='/search'?{results:[{entity_id:'starbucks',name:'Starbucks'}]}:{results:{heatmap:[{location:{latitude:43.65,longitude:-79.38},query:{affinity:.9}}]}});
 let calls=0;const generate=async()=>{
  calls++;if(calls===1)return {functionCalls:[{name:'explore_areas',args:{}}],candidates:[{content:{role:'model',parts:[{functionCall:{name:'explore_areas',args:{}}}]}}]} as GenerateContentResponse;
  if(calls===2)return {text:'{"visitFirst":',candidates:[{finishReason:'MAX_TOKENS',content:{role:'model',parts:[{text:'{"visitFirst":'}]}}]} as GenerateContentResponse;
  return {text:JSON.stringify({visitFirst:null,reasonCode:'taste-evidence',checkFocus:'general'})} as GenerateContentResponse;
 };
 const run=await runScout({city:'Toronto',center:{latitude:43.65,longitude:-79.38},radiusKm:10,concept:'Coffee bar',references:['Starbucks'],existingOutlets:[{name:'Existing',latitude:43.65,longitude:-79.38}],minimumOutletDistanceKm:1},()=>{},generate);
 expect(run.assessment?.visitFirst).toBeNull();expect(run.exploration.areas).toEqual([]);expect(run.decisionIssues).toEqual(['Invalid JSON (MAX_TOKENS)']);expect(calls).toBe(3);delete process.env.QLOO_API_KEY;
});
