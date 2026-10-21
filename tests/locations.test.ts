import { parseLocations } from '../lib/sites/locations';
import { GET } from '../app/api/locations/route';
const fixture={features:[{geometry:{coordinates:[-79.38,43.65]},properties:{name:'Toronto',state:'Ontario',country:'Canada',type:'city'}},{geometry:{coordinates:[500,90]},properties:{name:'Invalid'}}]};
it('parses longitude/latitude correctly and discards invalid coordinates',()=>{
 expect(parseLocations(fixture)).toEqual([expect.objectContaining({name:'Toronto',label:'Toronto, Ontario, Canada',latitude:43.65,longitude:-79.38,kind:'city'})]);
});
it('rejects blank, excessive and invalid focus input without contacting a provider',async()=>{
 const spy=jest.spyOn(globalThis,'fetch');
 for(const url of ['?q=x','?q='+('a'.repeat(301)),'?q=Toronto&lat=999&lon=0'])expect((await GET(new Request('http://localhost/api/locations'+url))).status).toBe(400);
 expect(spy).not.toHaveBeenCalled();spy.mockRestore();
});
it('uses a fixed provider, bounded results and selected city focus',async()=>{
 const spy=jest.spyOn(globalThis,'fetch').mockResolvedValue(new Response(JSON.stringify(fixture)));
 const r=await GET(new Request('http://localhost/api/locations?q=Kensington%20Market%20Toronto&lat=43.65&lon=-79.38'));
 expect(r.status).toBe(200);const url=new URL(String(spy.mock.calls[0][0]));expect(url.origin).toBe('https://photon.komoot.io');expect(url.searchParams.get('limit')).toBe('5');expect(url.searchParams.get('lat')).toBe('43.65');
 expect((await r.json()).locations[0].latitude).toBe(43.65);spy.mockRestore();
});
it('returns a recoverable provider error instead of inventing locations',async()=>{
 const spy=jest.spyOn(globalThis,'fetch').mockResolvedValue(new Response('{}',{status:503}));
 const r=await GET(new Request('http://localhost/api/locations?q=Failtown'));expect(r.status).toBe(502);expect((await r.json()).error).toContain('map');spy.mockRestore();
});
