import {assertNarrativeEvidence} from '../lib/sites/evidence-guards';
it('rejects numerical web claims and unsupported audience-to-family matching',()=>{
 expect(()=>assertNarrativeEvidence('The local child share is 6.8%.')).toThrow('numeric');
 expect(()=>assertNarrativeEvidence('Coffee is A$15.')).toThrow('numeric');
 expect(()=>assertNarrativeEvidence('This is a demographic fit.')).toThrow('demographic fit');
 expect(()=>assertNarrativeEvidence('The audience is a target demographic.')).toThrow('demographic fit');
});
it('allows a cautious visit question while keeping quantities in the deterministic panels',()=>{
 expect(()=>assertNarrativeEvidence('Scout nearby commercial streets. Check usable indoor space, stroller access and permissions; café taste does not establish parental demand.')).not.toThrow();
});
