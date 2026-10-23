import {extractGroundedFields} from '../lib/sites/research-extraction';
import type {GenerateContentResponse} from '@google/genai';
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
