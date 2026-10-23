import { buildResearchReport } from '../lib/sites/research';
it('does not pass off uncited model text as researched evidence',()=>{
 expect(()=>buildResearchReport({text:'This area has lots of customers.'})).toThrow('sources');
});
it('links a researched statement only to its valid provider grounding source',()=>{
 const report=buildResearchReport({text:'Published menus list coffee.',metadata:{groundingChunks:[{web:{title:'Official menu',uri:'https://example.com/menu'}},{web:{title:'Unsafe',uri:'javascript:alert(1)'}}],groundingSupports:[{segment:{text:'Published menus list coffee.'},groundingChunkIndices:[0,1,99]}],webSearchQueries:['Toronto coffee menu']}});
 expect(report.citations).toEqual([{end:28,sourceIndices:[0]}]);
 expect(report.sources[0]).toEqual({title:'Official menu',url:'https://example.com/menu'});
});
it('keeps a safe cited sentence when another sentence fails evidence checks, with rebuilt offsets',()=>{
 const unsafe='The playground needs two thousand square feet.';
 const safe='The official menu lists coffee.';
 const report=buildResearchReport({text:`${unsafe} ${safe}`,metadata:{groundingChunks:[{web:{title:'Menu',uri:'https://example.com/menu'}}],groundingSupports:[{segment:{text:`${unsafe} ${safe}`},groundingChunkIndices:[0]}]}});
 expect(report.text).toBe(safe);
 expect(report.citations).toEqual([{end:safe.length,sourceIndices:[0]}]);
});
it('retains links without presenting a rejected summary as cited findings',()=>{
 const report=buildResearchReport({text:'The city regulations require two floors.',metadata:{groundingChunks:[{web:{title:'City guidance',uri:'https://example.com/city'}}],groundingSupports:[{segment:{text:'The city regulations require two floors.'},groundingChunkIndices:[0]}]}});
 expect(report).toMatchObject({text:'',citations:[],status:'sources-only'});
 expect(report.notice).toContain('not validated findings');
});
it('never assigns a citation to ungrounded text or an ambiguous repeated segment',()=>{
 const report=buildResearchReport({text:'Coffee is served. Coffee is served.',metadata:{groundingChunks:[{web:{uri:'https://example.com/menu'}}],groundingSupports:[{segment:{text:'Coffee is served.'},groundingChunkIndices:[0]}]}});
 expect(report.status).toBe('sources-only');expect(report.citations).toEqual([]);
});
it('preserves unicode and citation alignment across removed sentences',()=>{
 const safe='Café Étoile publishes its menu.';
 const report=buildResearchReport({text:`Two units are required. ${safe}`,metadata:{groundingChunks:[{web:{uri:'https://example.com/menu'}}],groundingSupports:[{segment:{text:safe,startIndex:23},groundingChunkIndices:[0]}]}});
 expect(report.text).toBe(safe);expect(report.citations[0].end).toBe(safe.length);
});
