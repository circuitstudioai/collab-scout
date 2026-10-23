import {retrieveStoreCounts,retrieveStoreCount,formatStoreCount} from '../lib/sites/store-counts';
const point={id:'pilot',latitude:43.6532,longitude:-79.3832};
const response=(elements:unknown[],extra={})=>({ok:true,json:async()=>({elements,...extra})}) as Response;
const node=(id:number,name='Coffee')=>({type:'node',id,lat:point.latitude,lon:point.longitude,tags:{amenity:'cafe',name}});
afterEach(()=>jest.restoreAllMocks());
it('counts mapped category proxies, not Qloo demand or exact competitors',async()=>{
 const fetcher=jest.spyOn(global,'fetch').mockResolvedValue(response([node(1),node(1),node(2,'Another'),{...node(3),tags:{amenity:'cafe',name:'Closed',disused:'yes'}}]));
 const result=await retrieveStoreCount({...point,id:'count'},'cafe');
 expect(result.status).toBe('available');expect(result.count).toBe(2);expect(result.radiusMeters).toBe(1000);
 expect(result.notice).toMatch(/not.*census/i);expect(formatStoreCount(result)).toMatch(/2 mapped cafés/);
 expect(String(fetcher.mock.calls[0][1]?.body)).toContain('1000');
});
it('deduplicates named node/way representations but preserves adjacent same-name branches',async()=>{
 jest.spyOn(global,'fetch').mockResolvedValue(response([node(11),node(12),{type:'way',id:22,nodes:[11],center:{lat:point.latitude,lon:point.longitude},tags:{amenity:'cafe',name:'Coffee'}}]));
 expect((await retrieveStoreCount({...point,latitude:43.654},'cafe')).count).toBe(2);
});
it.each([{remark:'runtime error: Query timed out'},{}])('does not call partial or malformed responses zero',async extra=>{
 jest.spyOn(global,'fetch').mockResolvedValue(extra.remark?response([],extra):({ok:true,json:async()=>({})} as Response));
 const result=await retrieveStoreCount({...point,latitude:43.655+Math.random()/100},'cafe');
 expect(result.status).toBe('unavailable');expect(result.count).toBeNull();
});
it('distinguishes a complete empty result from a failed provider',async()=>{
 const mock=jest.spyOn(global,'fetch').mockResolvedValueOnce(response([])).mockRejectedValueOnce(new Error('offline'));
 expect((await retrieveStoreCount({...point,latitude:43.66},'cafe')).count).toBe(0);
 expect((await retrieveStoreCount({...point,latitude:43.67},'cafe')).count).toBeNull();expect(mock).toHaveBeenCalledTimes(2);
});
it('keeps unsupported formats unavailable and honours caller abort',async()=>{
 const mock=jest.spyOn(global,'fetch');
 expect((await retrieveStoreCount(point,'indoor-playground')).count).toBeNull();
 expect((await retrieveStoreCount(point,'cafe',AbortSignal.abort())).count).toBeNull();expect(mock).not.toHaveBeenCalled();
});
it('caches complete responses without changing their original retrieval date',async()=>{
 const mock=jest.spyOn(global,'fetch').mockResolvedValue(response([node(33)]));
 const target={...point,latitude:43.68};const first=await retrieveStoreCount(target,'full-service');const second=await retrieveStoreCount(target,'full-service');
 expect(mock).toHaveBeenCalledTimes(1);expect(second.retrievedAt).toBe(first.retrievedAt);expect(second.cached).toBe(true);
});

it('queries a shortlist once and assigns only listings within each point radius',async()=>{
 const fetcher=jest.spyOn(global,'fetch').mockResolvedValue(response([{...node(100),lat:44,lon:-79},{...node(101),lat:45,lon:-79}]));
 const result=await retrieveStoreCounts([{id:'a',latitude:44,longitude:-79},{id:'b',latitude:45,longitude:-79}],'cafe');
 expect(fetcher).toHaveBeenCalledTimes(1);expect(result.a.count).toBe(1);expect(result.b.count).toBe(1);expect(result.a.target).toEqual({id:'a',latitude:44,longitude:-79});
});
