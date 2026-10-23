import {selectDemoReferences} from '../lib/sites/demo-server';
import {demoBrief} from '../lib/sites/demo';
const cafe=(id:string,name:string,popularity:number,extra={})=>({entity_id:id,name,popularity,location:{lat:43.65,lon:-79.38},properties:{address:'Toronto'},...extra});
it('selects three distinct local café names by returned popularity without inventing a city leaderboard',()=>{
 const refs=selectDemoReferences([cafe('a','Cafe A',.8),cafe('a2','Cafe A',.99),cafe('b','Cafe B',.9),cafe('closed','Closed Cafe',1,{properties:{is_closed:true}}),cafe('far','Distant',1,{location:{lat:0,lon:0}}),cafe('c','Cafe C',.7)]);
 expect(refs.map(r=>r.id)).toEqual(['a2','b','c']);expect(refs.every(r=>r.resolution==='local-cafe')).toBe(true);
});
it('keeps the new playground concept free of fabricated outlets, hours and prices',()=>{
 expect(demoBrief.concept).toContain('indoor playground');expect(demoBrief.existingOutlets).toEqual([]);expect(demoBrief.restaurant).toMatchObject({servicePeriod:'unspecified',pricePosition:'unspecified'});expect(selectDemoReferences([])).toEqual([]);
});
