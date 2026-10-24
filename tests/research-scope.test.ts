import {localResearchScope} from '../lib/sites/structured-research';

it('keeps disjoint street addresses tied to their venues instead of inventing a continuous local range',()=>{
 const area={latitude:43.67546,longitude:-79.30824,venues:[{name:'Eastern Cafe',address:'1801 Gerrard St E Toronto'},{name:'Western Cafe',address:'953 Gerrard St E Toronto'},{name:'Queen Cafe',address:'1968 Queen St E Toronto'}]};
 const scope=localResearchScope(area);
 expect(scope.venueAddressHints).toEqual([
  {name:'Eastern Cafe',address:'1801 Gerrard St E Toronto',street:'Gerrard St E'},
  {name:'Western Cafe',address:'953 Gerrard St E Toronto',street:'Gerrard St E'},
  {name:'Queen Cafe',address:'1968 Queen St E Toronto',street:'Queen St E'}
 ]);
 expect(scope.center).toEqual({latitude:43.67546,longitude:-79.30824});
 expect(scope.radiusMeters).toBe(1000);
 expect(scope.instructions).toContain('Do not infer a continuous street range');
});

it('never turns the reverse-geocoded home into a search premises, even without nearby commercial addresses',()=>{
 const area={latitude:43.67546,longitude:-79.30824,name:'Near East End-Danforth',address:'2 Heyworth Crescent, Toronto',venues:[{name:'Cafe with no address'}]};
 const scope=localResearchScope(area);
 expect(JSON.stringify(scope)).not.toContain('Heyworth');
 expect(scope.venueAddressHints).toEqual([{name:'Cafe with no address',street:null}]);
 expect(scope.instructions).toContain('if proximity cannot be established, return not found');
});
