import { createReader, resolveReferences } from '../lib/sites/qloo';
import { qlooGet } from '../lib/qloo/http';
jest.mock('../lib/qloo/http',()=>({qlooGet:jest.fn()}));
const get=jest.mocked(qlooGet);
beforeEach(()=>{get.mockReset();process.env.QLOO_API_KEY='offline';});
afterEach(()=>{delete process.env.QLOO_API_KEY;});
it('resolves Starbucks to its exact brand rather than asking users to choose an outlet',async()=>{
 get.mockResolvedValue({results:[{name:'Starbucks',entity_id:'brand',types:['urn:entity:brand']},{name:'Starbucks',entity_id:'outlet',types:['urn:entity:place']}]});
 const resolved=await resolveReferences({references:['Starbucks']},createReader([]));
 expect(resolved[0]).toMatchObject({id:'brand',name:'Starbucks',resolution:'brand'});
});
it('looks beyond same-name outlets to find an exact brand, without choosing the first outlet',async()=>{
 get.mockImplementation(async o=>({results:o.params?.types?[{name:'Blue Bottle Coffee',entity_id:'brand',types:['urn:entity:brand']}]:[{name:'Blue Bottle Coffee',entity_id:'outlet-1',types:['urn:entity:place']},{name:'Blue Bottle Coffee',entity_id:'outlet-2',types:['urn:entity:place']}]}));
 expect((await resolveReferences({references:['Blue Bottle Coffee']},createReader([])))[0]).toMatchObject({id:'brand',resolution:'brand'});
});
