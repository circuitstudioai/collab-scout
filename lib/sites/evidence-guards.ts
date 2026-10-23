/** Narrative summaries must not introduce unverified numeric research claims.
 * Verified Qloo numbers remain in their deterministic evidence panels. */
export function assertNarrativeEvidence(text:string,verifiedLabels:string[]=[]){
 // A verified entity identifier is not a numerical research claim.
 for(const label of verifiedLabels){if(!label)continue;const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');text=text.replace(new RegExp(escaped,'gi'),'verified place');}
 if(/\b(?:market|commercial|competitive)\s+(?:gap|whitespace|white space)|\bunmet\s+(?:demand|need)|\black of competition|\buntapped\s+(?:market|opportunity)/i.test(text))throw new Error('Narrative claims a market gap or unmet demand that the returned sample cannot establish.');
 if(/\b(?:zero|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|million)\b/i.test(text))throw new Error('Narrative includes a numeric quantity written as words. Omit quantities rather than spelling them out.');
 if(/\b(?:regulations?|laws?|codes?)\b[^.!?]{0,80}\b(?:require|prohibit|mandate|minimum|maximum|at least|must)|\b(?:required|mandatory|prohibited)\b[^.!?]{0,50}\b(?:ceiling|floor|height|playground)/i.test(text))throw new Error('Narrative makes a regulatory prescription. State permissions as questions for the city rather than asserting requirements.');
 if(/\b(?:must|shall|required|mandatory|prohibited)\b|\b(?:need(?:s)?|require(?:s)?|unless|only if)\b[^.!?]{0,100}\b(?:licen[cs]\w*|permit\w*|parent\w*|supervis\w*|zoning|approval)\b|\b(?:unlicensed|unlicenced)\b[^.!?]{0,100}\b(?:cannot|can't|may not|not allowed)\b/i.test(text))throw new Error('Narrative makes a regulatory obligation or licensing prescription. Ask the City which rules apply instead.');
 if(/\d/.test(text))throw new Error('Narrative includes a numeric claim. Keep quantities, prices, street numbers and demographic statistics out of narrative; use source links and the verified evidence panels.');
 if(/(?:demographic\s+(?:fit|match|sweet spot)|target demographic|(?:famil(?:y|ies)|parents?)\s+(?:demand|fit|match))/i.test(text))throw new Error('Narrative implies a family or demographic fit that café taste references do not establish. Describe it as an unanswered question.');
}
