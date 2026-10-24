import {extractGroundedFields} from '../lib/sites/research-extraction';
import type {GenerateContentParameters,GenerateContentResponse} from '@google/genai';
const quote='Dundas Street West has streetcar service.';
const response={text:`[ACCESS]\n${quote} A generic ungrounded recommendation.`,metadata:{groundingChunks:[{web:{title:'Transit',uri:'https://city.test/transit'}}],groundingSupports:[{segment:{text:quote},groundingChunkIndices:[0]}]}};
it('accepts a structured exact grounded excerpt without promoting the uncited commentary',async()=>{
 const generate=async()=>({text:JSON.stringify({fields:[{key:'ACCESS',evidenceIndex:0,quote}]})}) as GenerateContentResponse;
 const r=await extractGroundedFields(response,['Dundas Street West'],generate,new AbortController().signal);expect(r?.fields?.[1]).toMatchObject({status:'found',text:quote,sourceIndices:[0]});expect(r?.text).not.toContain('recommendation');
});
it('does not accept a paraphrased or invented quote even if its source index is real',async()=>{
 const generate=async()=>({text:JSON.stringify({fields:[{key:'ACCESS',evidenceIndex:0,quote:'Dundas Street West has free parking.'}]})}) as GenerateContentResponse;
 const r=await extractGroundedFields(response,['Dundas Street West'],generate,new AbortController().signal);expect(r?.citations).toEqual([]);
});
it('requests and accepts only missing fields, not redundant replacements',async()=>{
 const redundant='Dundas Street West advertises commercial space.';
 const input={text:response.text+'\n'+redundant,metadata:{...response.metadata,groundingSupports:[...response.metadata.groundingSupports,{segment:{text:redundant},groundingChunkIndices:[0]}]}};
 const generate=jest.fn<Promise<GenerateContentResponse>,[GenerateContentParameters]>(async()=>({text:JSON.stringify({fields:[{key:'SPACE',evidenceIndex:1,quote:redundant},{key:'ACCESS',evidenceIndex:0,quote}]})}) as GenerateContentResponse);
 const r=await extractGroundedFields(input,['Dundas Street West'],generate,new AbortController().signal,['ACCESS']);
 expect(JSON.parse(generate.mock.calls[0][0].contents as string).fields).toEqual([['ACCESS','Access and transit']]);
 expect(r?.fields?.[0].status).toBe('not-found');expect(r?.fields?.[1].text).toBe(quote);
});
it('does no formatting work when there are no missing fields',async()=>{
 const generate=jest.fn();
 expect(await extractGroundedFields(response,['Dundas Street West'],generate,new AbortController().signal,[])).toBeUndefined();expect(generate).not.toHaveBeenCalled();
});
