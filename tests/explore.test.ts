import { selectAreas, exploreCity, exploreSchema } from '../lib/sites/explore';
import { qlooGet } from '../lib/qloo/http';
jest.mock('../lib/qloo/http',()=>({qlooGet:jest.fn()}));
const get=jest.mocked(qlooGet);
const center={latitude:43.65,longitude:-79.38};
const brief=()=>exploreSchema.parse({city:'Toronto',center,radiusKm:10,concept:'Coffee bar',references:['Blue Bottle Coffee']});
beforeEach(()=>{get.mockReset();process.env.QLOO_API_KEY='offline-key';});
afterEach(()=>{jest.restoreAllMocks();delete process.env.QLOO_API_KEY;});
it('discovers spaced map points without user-supplied candidate locations',()=>{
 const baseline=Array.from({length:7},(_,i)=>({...center,latitude:center.latitude+.0002+i*.0001,affinity:.7-i*.08,popularity:1}));
 const result=selectAreas([{...center,affinity:.9,popularity:1},{latitude:43.6501,longitude:-79.38,affinity:.89,popularity:1},{latitude:43.68,longitude:-79.38,affinity:.8,popularity:1},...baseline,{latitude:40,longitude:-74,affinity:1,popularity:1}],center,10);
 expect(result.cells).toHaveLength(10);expect(result.selected).toHaveLength(2);expect(result.selected[0].affinity).toBe(.9);
});
it('deduplicates points and retains ties without implying a distinct winner',()=>{
 const c={...center,affinity:.9,popularity:1};const result=selectAreas([c,c,{latitude:43.68,longitude:-79.38,affinity:.9,popularity:1},{latitude:43.71,longitude:-79.38,affinity:.9,popularity:1},{latitude:43.6502,longitude:-79.38,affinity:.3,popularity:1},{latitude:43.6503,longitude:-79.38,affinity:.1,popularity:1}],center,10);expect(result.cells).toHaveLength(5);expect(result.selected).toHaveLength(3);expect(result.allTied).toBe(true);
});
it('does not invent areas for an unsupported radius',()=>{expect(selectAreas([{latitude:0,longitude:0,affinity:.99}],center,10).selected).toEqual([]);});
it('requires audience references and a bounded explicit search radius',()=>{expect(exploreSchema.safeParse({...brief(),references:[]}).success).toBe(false);expect(exploreSchema.safeParse({...brief(),radiusKm:500}).success).toBe(false);});
it('preserves explicit audience disambiguation before collecting evidence',async()=>{get.mockResolvedValue({results:[{name:'Blue Bottle Coffee',entity_id:'1'},{name:'Blue Bottle Coffee',entity_id:'2'}]});await expect(exploreCity(brief())).rejects.toMatchObject({status:409});expect(get).toHaveBeenCalledTimes(1);});
it('returns actual points with named-place and dining failures visible',async()=>{
 jest.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{}',{status:503}));get.mockImplementation(async o=>{if(o.path==='/search')return {results:[{entity_id:'one',name:'Blue Bottle Coffee'}]};if(o.params?.['filter.type']==='urn:heatmap')return {results:{heatmap:Array.from({length:5},(_,i)=>({location:{...center,latitude:center.latitude+i*.0001},query:{affinity:.9-i*.15,popularity:1}}))}};throw new Error('Dining down');});
 const result=await exploreCity(brief());expect(result.areas[0]).toMatchObject({name:'Unnamed map point (43.6500, -79.3800)',nameAvailable:false,contextAvailable:false,lowerCount:4});expect(result.allTied).toBe(false);expect(result.trace.filter(t=>t.step==='Map audience taste across the city')).toHaveLength(1);
});
it('fails honestly when no city-local map evidence is available',async()=>{get.mockImplementation(async o=>o.path==='/search'?{results:[{entity_id:'one',name:'Blue Bottle Coffee'}]}:{results:{heatmap:[{location:{latitude:0,longitude:0},query:{affinity:1}}]}});await expect(exploreCity(brief())).rejects.toThrow('No areas have been invented');});
it('rejects a top taste point inside the operator outlet buffer and selects an eligible alternative',()=>{
 const outlet={name:'Our existing cafe',...center};
 const top={...center,affinity:.99,popularity:1};const alternative={latitude:43.69,longitude:-79.38,affinity:.9,popularity:1};
 const baseline=Array.from({length:3},(_,i)=>({...center,latitude:center.latitude+.0001+i*.0001,affinity:.5-i*.1,popularity:1}));
 const result=selectAreas([top,alternative,...baseline],center,10,{existingOutlets:[outlet],minimumOutletDistanceKm:2});
 expect(result.selected).toEqual([expect.objectContaining(alternative)]);
 expect(result.rejected[0]).toMatchObject({...top,outletName:'Our existing cafe',distanceKm:0});
 expect(result.cells).toHaveLength(5);
});
it('returns an honest empty shortlist when every returned point breaks the outlet rule',async()=>{
 jest.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{}',{status:503}));
 get.mockImplementation(async o=>o.path==='/search'?{results:[{entity_id:'one',name:'Blue Bottle Coffee'}]}:{results:{heatmap:[{location:center,query:{affinity:.9}}]}});
 const result=await exploreCity({...brief(),existingOutlets:[{name:'Existing restaurant',...center}],minimumOutletDistanceKm:2});
 expect(result.areas).toEqual([]);expect(result.rejectedCount).toBe(1);expect(result.eligibleCount).toBe(0);
});
it('prefers a strong taste match that outranks its popularity instead of merely the busiest point',()=>{
 const cells=[{latitude:43.65,longitude:-79.38,affinity:.99,popularity:1},{latitude:43.69,longitude:-79.38,affinity:.8,popularity:.1},{latitude:43.73,longitude:-79.38,affinity:.6,popularity:.8},{latitude:43.77,longitude:-79.38,affinity:.4,popularity:.4},{latitude:43.81,longitude:-79.38,affinity:.1,popularity:.01}];
 const result=selectAreas(cells,center,20);
 expect(result.selected[0]).toMatchObject({affinity:.8,popularity:.1,contrast:40});
 expect(result.rankingMethod).toBe('contrast');
});
it('does not call a zero-popularity point a contrast opportunity',()=>{
 const cells=Array.from({length:10},(_,i)=>({latitude:43.65+i*.01,longitude:-79.38,affinity:1-i*.05,popularity:i===0?0:.1+i*.03}));
 expect(selectAreas(cells,center,20).selected.every(c=>c.popularity!==0)).toBe(true);
});
it('excludes the low-popularity tail before choosing high-contrast points',()=>{
 const cells=Array.from({length:10},(_,i)=>({latitude:43.65+i*.015,longitude:-79.38,affinity:1-i*.02,popularity:[.001,.002,.5,.6,.7,.8,.9,1,.3,.4][i]}));
 const result=selectAreas(cells,center,20);
 expect(result.selected.length).toBeGreaterThan(0);expect(result.selected.every(c=>(c.popularityPercentile??0)>=20)).toBe(true);
 expect(result.selected.some(c=>c.popularity===.001||c.popularity===.002)).toBe(false);
});
it('does not silently waive the popularity floor when popularity coverage is unavailable',()=>{
 const result=selectAreas([{...center,affinity:.99}],center,10);
 expect(result.selected).toEqual([]);
});
it('supports a disclosed median floor and refuses a public request to disable the floor',()=>{
 expect(exploreSchema.safeParse({...brief(),minimumPopularityPercentile:0}).success).toBe(false);
 const cells=Array.from({length:10},(_,i)=>({latitude:43.65+i*.015,longitude:-79.38,affinity:1-i*.02,popularity:[.01,.4,.7,.8,.9,1,.2,.3,.5,.6][i]}));
 const result=selectAreas(cells,center,20,{minimumPopularityPercentile:50});
 expect(result.selected.length).toBeGreaterThan(0);expect(result.selected.every(c=>(c.popularityPercentile??0)>=50)).toBe(true);
});
it('uses a verified nearby Qloo street when both reverse lookups fail',async()=>{
 const fetcher=jest.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{}',{status:503}));
 get.mockImplementation(async o=>{if(o.path==='/search')return {results:[{entity_id:'fallback-brand',name:'Blue Bottle Coffee'}]};if(o.params?.['filter.type']==='urn:heatmap')return {results:{heatmap:Array.from({length:5},(_,i)=>({location:{latitude:43.66+i*.0001,longitude:-79.37},query:{affinity:.9-i*.15,popularity:1}}))}};return {results:{entities:[{entity_id:'nearby-cafe',name:'Local cafe',properties:{address:'123 Dundas St W Toronto, ON Canada'}}]}};});
 const result=await exploreCity(brief());expect(result.areas[0].name).toBe('Near Dundas St W');expect(result.areas[0].address).toContain('nearby Qloo venue');expect(fetcher).toHaveBeenCalledTimes(2);
});
