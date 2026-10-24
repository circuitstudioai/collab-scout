import {buildStructuredResearch,hasResearchQuality,mergeResearchFields,researchRecoveryFields} from '../lib/sites/structured-research';
const fields=['SPACE','ACCESS','VENUES','ACTIVITY'];
const facts=['Dundas Street West has a commercial leasing listing.','Dundas Street West is served by the streetcar.','Cafe Local publishes a menu on Dundas Street West.','A public library on Dundas Street West hosts events.'];
const text=fields.map((f,i)=>`[${f}]\n${facts[i]}`).join('\n\n');
const metadata={groundingChunks:[{web:{uri:'https://city.test/transit',title:'City'}},{web:{uri:'https://local.test/listing',title:'Listing'}}],groundingSupports:facts.map((fact,i)=>({segment:{text:fact},groundingChunkIndices:[i%2]}))};
it('retains distinct grounded fields with street anchors without requiring venue names',()=>{
 const report=buildStructuredResearch({text,metadata},['Dundas Street West']);
 expect(report.fields?.filter(f=>f.status==='found')).toHaveLength(4);expect(hasResearchQuality(report)).toBe(true);
 expect(report.text).toContain(facts[1]);expect(report.citations).toHaveLength(4);
});
it('marks only the unsupported field not found; a model-written URL is not evidence',()=>{
 const report=buildStructuredResearch({text,metadata:{...metadata,groundingSupports:metadata.groundingSupports.slice(1)}},['Dundas Street West']);
 expect(report.fields?.[0]).toMatchObject({status:'not-found',text:'',sourceIndices:[]});expect(hasResearchQuality(report)).toBe(true);
});
it('rejects unsupported quantities at field level without deleting other fields',()=>{
 const claim='Dundas Street West has two available units.';
 const report=buildStructuredResearch({text:text.replace(facts[0],claim),metadata:{...metadata,groundingSupports:[{segment:{text:claim},groundingChunkIndices:[0]},...metadata.groundingSupports.slice(1)]}},['Dundas Street West']);
 expect(report.fields?.[0].status).toBe('not-found');expect(report.fields?.[1].status).toBe('found');
});
it('does not qualify repeated sources or a legacy one-sentence report for caching',()=>{
 const report=buildStructuredResearch({text,metadata:{...metadata,groundingChunks:[metadata.groundingChunks[0]],groundingSupports:facts.map(f=>({segment:{text:f},groundingChunkIndices:[0]}))}},['Dundas Street West']);
 expect(hasResearchQuality(report)).toBe(false);expect(hasResearchQuality({...report,fields:undefined})).toBe(false);
});
it('treats provider citation markers as formatting, not numerical research claims',()=>{
 const marked=text.replace(facts[0],facts[0]+' [1]');
 const report=buildStructuredResearch({text:marked,metadata},['Dundas Street West']);expect(report.fields?.[0].status).toBe('found');expect(report.fields?.[0].text).toBe(facts[0]);
});
it('keeps earlier fields when the one bounded retry fills different missing fields',()=>{
 const first=buildStructuredResearch({text,metadata:{...metadata,groundingSupports:metadata.groundingSupports.slice(0,2)}},['Dundas Street West']);
 const second=buildStructuredResearch({text,metadata:{...metadata,groundingSupports:metadata.groundingSupports.slice(2)}},['Dundas Street West']);
 const merged=mergeResearchFields(first,second);expect(merged.fields?.filter(f=>f.status==='found')).toHaveLength(4);expect(hasResearchQuality(merged)).toBe(true);expect(merged.citations).toHaveLength(4);
});
it('fills only missing fields on retry and keeps the first validated finding and source identity',()=>{
 const first=buildStructuredResearch({text,metadata:{...metadata,groundingSupports:metadata.groundingSupports.slice(0,2)}},['Dundas Street West']);
 const replacement='Dundas Street West has another commercial leasing listing.';
 const second=buildStructuredResearch({text:text.replace(facts[0],replacement),metadata:{...metadata,groundingChunks:[{web:{uri:'https://retry.test/listing'}},metadata.groundingChunks[1]],groundingSupports:[{segment:{text:replacement},groundingChunkIndices:[0]},...metadata.groundingSupports.slice(2)]}},['Dundas Street West']);
 const merged=mergeResearchFields(first,second);
 expect(merged.fields?.[0].text).toBe(facts[0]);
 expect(merged.fields?.[0].sourceIndices.map(i=>merged.sources[i].url)).toEqual(['https://city.test/transit']);
 expect(merged.fields?.filter(f=>f.status==='found')).toHaveLength(4);
});

it('can recover source diversity rather than permanently freezing a single-source report',()=>{
 const single={...metadata,groundingChunks:[metadata.groundingChunks[0]],groundingSupports:facts.map(text=>({segment:{text},groundingChunkIndices:[0]}))};
 const first=buildStructuredResearch({text,metadata:single},['Dundas Street West']);
 expect(hasResearchQuality(first)).toBe(false);expect(researchRecoveryFields(first)).toEqual(fields);
 const second=buildStructuredResearch({text,metadata},['Dundas Street West']);
 expect(hasResearchQuality(mergeResearchFields(first,second))).toBe(true);
});
