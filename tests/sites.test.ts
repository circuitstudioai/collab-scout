import { briefSchema, sampleBrief, type Cell } from '../lib/sites/schema';
import { compareSites, distanceKm, evaluateSites, matchCell, parseCells, recommend } from '../lib/sites/compare';
import { qlooGet } from '../lib/qloo/http';
jest.mock('../lib/qloo/http', () => ({ qlooGet: jest.fn() }));
const mockedGet = jest.mocked(qlooGet);
const brief = () => briefSchema.parse(structuredClone(sampleBrief));
const cells: Cell[] = [{ latitude: 40.7336, longitude: -74.003, affinity: .8 },{ latitude: 40.7185, longitude: -73.988, affinity: .6 },{ latitude: 40.714, longitude: -73.961, affinity: .95 }];
beforeEach(() => { mockedGet.mockReset(); process.env.QLOO_API_KEY = 'test-key'; });
afterAll(() => { delete process.env.QLOO_API_KEY; });
it('keeps the highest signal out of the shortlist when rent is over budget', () => {
  const result=evaluateSites(brief(),cells,[]); expect(recommend(result)).toContain('West Village'); expect(result[2].budget).toBe('over');
});
it('does not infer affordability when rent is missing', () => {
  const b=brief();b.sites.forEach(s=>s.rent=null);expect(recommend(evaluateSites(b,cells,[]))).toContain('No location can be shortlisted');
});
it('does not attach distant or missing evidence to a site', () => {
  expect(matchCell(brief().sites[0], [{latitude:0,longitude:0,affinity:.9}]).cell).toBeNull();expect(matchCell(brief().sites[0],[]).cell).toBeNull();
});
it('selects the nearest point, not the highest-affinity point',()=>{
  expect(matchCell(brief().sites[0],cells).cell?.affinity).toBe(.8);
});
it('handles tied signals without inventing a winner',()=>{
  const result=evaluateSites(brief(),cells.map(c=>({...c,affinity:.5})),[]);expect(recommend(result)).toContain('have the same taste score');
});
it('uses geographic distance with longitude and latitude in the correct order',()=>{
  expect(distanceKm(brief().sites[0],brief().sites[0])).toBe(0);expect(distanceKm(brief().sites[0],brief().sites[1])).toBeGreaterThan(1);
});
it('rejects malformed heatmap evidence instead of manufacturing a score',()=>{
  expect(parseCells({results:{heatmap:[{location:{latitude:40,longitude:-74},query:{}},{location:{latitude:40,longitude:-74},query:{affinity:.71}}]}})).toEqual([{latitude:40,longitude:-74,affinity:.71}]);
});
it('rejects duplicate site IDs and invalid coordinates',()=>{
  const b=brief();b.sites[1].id=b.sites[0].id;expect(briefSchema.safeParse(b).success).toBe(false);b.sites[0].latitude=100;expect(briefSchema.safeParse(b).success).toBe(false);
});
it('returns clearly disclosed sample data without a network call',async()=>{
  const r=await compareSites(brief());expect(r.mode).toBe('sample');expect(r.trace[0].path).toContain('no Qloo calls');expect(mockedGet).not.toHaveBeenCalled();
});
it('refuses to fabricate sample evidence for a custom location',async()=>{
  const b=brief();b.sites[0].latitude=30;await expect(compareSites(b)).rejects.toThrow('fixed New York');
});
it('never silently falls back when live credentials are missing',async()=>{
  delete process.env.QLOO_API_KEY;await expect(compareSites({...brief(),mode:'live'})).rejects.toThrow('not configured');
});
it('never substitutes fixtures for an upstream failure',async()=>{
  mockedGet.mockRejectedValue(new Error('upstream failed'));await expect(compareSites({...brief(),mode:'live'})).rejects.toThrow('Qloo did not return');
});
it('rejects ambiguous entity resolution',async()=>{
  mockedGet.mockResolvedValue({results:[{entity_id:'1',name:'Blue Bottle Coffee'},{entity_id:'2',name:'Blue Bottle Coffee'}]});await expect(compareSites({...brief(),mode:'live'})).rejects.toThrow('Choose the specific');
});
it('uses a single common heatmap and preserves partial context failures',async()=>{
  mockedGet.mockImplementation(async options=>{
    if(options.path==='/search')return {results:[{entity_id:'seed-1',name:'Blue Bottle Coffee'}]};
    if(options.params?.['filter.type']==='urn:heatmap')return {results:{heatmap:cells.map(c=>({location:c,query:{affinity:c.affinity}}))}};
    throw new Error('dining unavailable');
  });
  const r=await compareSites({...brief(),mode:'live'});expect(r.mode).toBe('live');expect(r.sites.every(s=>!s.contextAvailable)).toBe(true);expect(r.trace.filter(t=>t.step==='Get taste scores for the area')).toHaveLength(1);expect(r.recommendation).toContain('West Village');
});
it('returns choices for ambiguous names before fetching geographic evidence',async()=>{
  mockedGet.mockResolvedValue({results:[{entity_id:'1',name:'Blue Bottle Coffee',properties:{address:'1 Main St'}},{entity_id:'2',name:'Blue Bottle Coffee',properties:{address:'2 Main St'}}]});
  await expect(compareSites({...brief(),mode:'live'})).rejects.toMatchObject({status:409,referenceChoice:{query:'Blue Bottle Coffee',options:[expect.objectContaining({id:'1',address:'1 Main St'}),expect.objectContaining({id:'2'})]}});
  expect(mockedGet).toHaveBeenCalledTimes(1);
});
it('uses the explicitly selected ID instead of the first same-name record',async()=>{
  mockedGet.mockImplementation(async options=>{
    if(options.path==='/search')return {results:[{entity_id:'1',name:'Blue Bottle Coffee'},{entity_id:'2',name:'Blue Bottle Coffee'}]};
    if(options.params?.['filter.type']==='urn:heatmap')return {results:{heatmap:cells.map(c=>({location:c,query:{affinity:c.affinity}}))}};
    return {results:{entities:[]}};
  });
  const b=briefSchema.parse({...brief(),mode:'live',referenceSelections:[{query:'Blue Bottle Coffee',id:'2'}]});
  const r=await compareSites(b);expect(r.references[0].id).toBe('2');
  expect(mockedGet.mock.calls.filter(([o])=>o.path==='/v2/insights').every(([o])=>o.params?.['signal.interests.entities']==='2')).toBe(true);
});
it('rejects forged or stale reference IDs instead of forwarding them to insights',async()=>{
  mockedGet.mockResolvedValue({results:[{entity_id:'1',name:'Blue Bottle Coffee'}]});
  const b=briefSchema.parse({...brief(),mode:'live',referenceSelections:[{query:'Blue Bottle Coffee',id:'not-returned'}]});
  await expect(compareSites(b)).rejects.toMatchObject({status:409});expect(mockedGet).toHaveBeenCalledTimes(1);
});
