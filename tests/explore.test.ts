import { selectAreas, exploreCity, exploreSchema } from '../lib/sites/explore';
import { qlooGet } from '../lib/qloo/http';
jest.mock('../lib/qloo/http',()=>({qlooGet:jest.fn()}));
const get=jest.mocked(qlooGet);
const center={latitude:43.65,longitude:-79.38};
const brief=()=>exploreSchema.parse({city:'Toronto',center,radiusKm:10,concept:'Coffee bar',references:['Blue Bottle Coffee']});
beforeEach(()=>{get.mockReset();process.env.QLOO_API_KEY='offline-key';});
afterEach(()=>{jest.restoreAllMocks();delete process.env.QLOO_API_KEY;});
it('discovers spaced map points without user-supplied candidate locations',()=>{
 const result=selectAreas([{...center,affinity:.9},{latitude:43.6501,longitude:-79.38,affinity:.89},{latitude:43.68,longitude:-79.38,affinity:.8},{latitude:40,longitude:-74,affinity:1}],center,10);
 expect(result.cells).toHaveLength(3);expect(result.selected).toHaveLength(2);expect(result.selected[0].affinity).toBe(.9);
});
it('deduplicates points and retains ties without implying a distinct winner',()=>{
 const c={...center,affinity:.5};const result=selectAreas([c,c,{latitude:43.68,longitude:-79.38,affinity:.5}],center,10);expect(result.cells).toHaveLength(2);expect(result.allTied).toBe(true);
});
it('does not invent areas for an unsupported radius',()=>{expect(selectAreas([{latitude:0,longitude:0,affinity:.99}],center,10).selected).toEqual([]);});
it('requires audience references and a bounded explicit search radius',()=>{expect(exploreSchema.safeParse({...brief(),references:[]}).success).toBe(false);expect(exploreSchema.safeParse({...brief(),radiusKm:500}).success).toBe(false);});
it('preserves explicit audience disambiguation before collecting evidence',async()=>{get.mockResolvedValue({results:[{name:'Blue Bottle Coffee',entity_id:'1'},{name:'Blue Bottle Coffee',entity_id:'2'}]});await expect(exploreCity(brief())).rejects.toMatchObject({status:409});expect(get).toHaveBeenCalledTimes(1);});
it('returns actual points with named-place and dining failures visible',async()=>{
 jest.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{}',{status:503}));get.mockImplementation(async o=>{if(o.path==='/search')return {results:[{entity_id:'one',name:'Blue Bottle Coffee'}]};if(o.params?.['filter.type']==='urn:heatmap')return {results:{heatmap:[{location:center,query:{affinity:.7}}]}};throw new Error('Dining down');});
 const result=await exploreCity(brief());expect(result.areas[0]).toMatchObject({name:'Area A',nameAvailable:false,contextAvailable:false,lowerCount:0});expect(result.allTied).toBe(true);expect(result.trace.filter(t=>t.step==='Map audience taste across the city')).toHaveLength(1);
});
it('fails honestly when no city-local map evidence is available',async()=>{get.mockImplementation(async o=>o.path==='/search'?{results:[{entity_id:'one',name:'Blue Bottle Coffee'}]}:{results:{heatmap:[{location:{latitude:0,longitude:0},query:{affinity:1}}]}});await expect(exploreCity(brief())).rejects.toThrow('No areas have been invented');});
it('rejects a top taste point inside the operator outlet buffer and selects an eligible alternative',()=>{
 const outlet={name:'Our existing cafe',...center};
 const top={...center,affinity:.99};const alternative={latitude:43.69,longitude:-79.38,affinity:.7};
 const result=selectAreas([top,alternative],center,10,{existingOutlets:[outlet],minimumOutletDistanceKm:2});
 expect(result.selected).toEqual([alternative]);
 expect(result.rejected[0]).toMatchObject({...top,outletName:'Our existing cafe',distanceKm:0});
 expect(result.cells).toHaveLength(2);
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
