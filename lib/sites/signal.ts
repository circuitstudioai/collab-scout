import type { Cell } from './schema';
/** Midrank percentiles preserve ties. Difference is a rank contrast, never a probability ratio. */
function percentiles(values:number[]){
 const ordered=[...values].sort((a,b)=>a-b);const rank=new Map<number,number>();
 for(let i=0;i<ordered.length;){let j=i+1;while(j<ordered.length&&ordered[j]===ordered[i])j++;rank.set(ordered[i],100*(i+(j-i)/2)/ordered.length);i=j;}
 return rank;
}
export function scoreSignal(cells:Cell[]){
 const measured=cells.filter(c=>typeof c.popularity==='number'&&Number.isFinite(c.popularity)&&c.popularity>0);
 if(!cells.length||measured.length/cells.length<.8)return {cells,rankingMethod:'affinity' as const,popularityCoverage:cells.length?measured.length/cells.length:0};
 const affinity=percentiles(measured.map(c=>c.affinity));const popularity=percentiles(measured.map(c=>c.popularity!));
 const scored=cells.map(c=>c.popularity===undefined||c.popularity<=0?c:{...c,audiencePercentile:affinity.get(c.affinity)!,popularityPercentile:popularity.get(c.popularity)!,contrast:affinity.get(c.affinity)!-popularity.get(c.popularity)!});
 return {cells:scored,rankingMethod:'contrast' as const,popularityCoverage:measured.length/cells.length};
}
