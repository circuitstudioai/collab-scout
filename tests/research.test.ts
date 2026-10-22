import { buildResearchReport } from '../lib/sites/research';
it('does not pass off uncited model text as researched evidence',()=>{
 expect(()=>buildResearchReport({text:'This area has lots of customers.'})).toThrow('sources');
});
it('links a researched statement only to its valid provider grounding source',()=>{
 const report=buildResearchReport({text:'Published menus list coffee.',metadata:{groundingChunks:[{web:{title:'Official menu',uri:'https://example.com/menu'}},{web:{title:'Unsafe',uri:'javascript:alert(1)'}}],groundingSupports:[{segment:{text:'Published menus list coffee.'},groundingChunkIndices:[0,1,99]}],webSearchQueries:['Toronto coffee menu']}});
 expect(report.citations).toEqual([{end:28,sourceIndices:[0]}]);
 expect(report.sources[0]).toEqual({title:'Official menu',url:'https://example.com/menu'});
});
