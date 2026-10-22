/** Narrative summaries must not introduce unverified numeric research claims.
 * Verified Qloo numbers remain in their deterministic evidence panels. */
export function assertNarrativeEvidence(text:string,verifiedLabels:string[]=[]){
 // A verified entity identifier is not a numerical research claim.
 for(const label of verifiedLabels){if(!label)continue;const escaped=label.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');text=text.replace(new RegExp(escaped,'gi'),'verified place');}
 if(/\d/.test(text))throw new Error('Narrative includes a numeric claim. Keep quantities, prices, street numbers and demographic statistics out of narrative; use source links and the verified evidence panels.');
 if(/(?:demographic\s+(?:fit|match|sweet spot)|target demographic|(?:famil(?:y|ies)|parents?)\s+(?:demand|fit|match))/i.test(text))throw new Error('Narrative implies a family or demographic fit that café taste references do not establish. Describe it as an unanswered question.');
}
