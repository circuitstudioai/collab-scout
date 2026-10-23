import type {Exploration} from '@/lib/sites/explore';
import type {ScoutRun} from '@/lib/sites/scout-agent';
import {researchForVisit,reportMatchesArea} from '@/lib/sites/visit-research';
import type {ResearchReport} from '@/lib/sites/research';
/** A one-page scouting artifact; complete research stays in the text export. */
export async function downloadExpansionPdf(result:Exploration,run:ScoutRun|null,reports:Record<string,ResearchReport>){
 const {jsPDF}=await import('jspdf');const pdf=new jsPDF({unit:'mm',format:'a4'});let y=20;
 const clean=(text:string)=>text.replace(/[–—]/g,'-').replace(/[“”]/g,'"').replace(/[’]/g,"'");
 function block(text:string,size=10,limit=600){pdf.setFontSize(size);const shortened=text.length>limit?text.slice(0,limit-1)+'…':text;const lines=pdf.splitTextToSize(clean(shortened),170);pdf.text(lines,20,y);y+=lines.length*Math.max(4.4,size*.44)+4;}
 pdf.setTextColor(32,60,54);block('SITEBRIEF / EXPANSION BRIEF',11);block(result.brief.city,22);block(`${result.brief.concept}\n${run?.savedDemo?"SAVED DEMO / recorded":"Retrieved"} ${new Date(result.createdAt).toISOString()}`,10,380);
 block(`Audience references: ${result.references.map(r=>r.name).join(', ')}`,9,250);
 const assessment=run?.assessment;
 if(assessment){block('FIRST SCOUTING VISIT',11);block(`${result.areas.find(a=>a.id===assessment.visitFirst)?.name??'More evidence needed'}: ${assessment.reason}`,10,480);if(assessment.practicalEvidence)block(`Cited practical detail: ${assessment.practicalEvidence.quote}`,9,210);block(`Trade-off: ${assessment.tradeOff}`,10,280);block(`Next action: ${assessment.nextAction}`,10,200);}
 block('AREAS TO INVESTIGATE',11);
 for(const area of result.areas){block(`${area.name} | ${area.latitude.toFixed(4)}, ${area.longitude.toFixed(4)}\nAffinity ${area.affinity.toFixed(3)} | Popularity ${area.popularity?.toFixed(3)??'unavailable'} | Contrast ${area.contrast===undefined?'unavailable':area.contrast.toFixed(1)+' percentile points'}`,9,260);}
 block(`${result.brief.existingOutlets?.length?`Operator rule: ${result.brief.minimumOutletDistanceKm??0} km from supplied outlets; ${result.rejectedCount} points excluded.`:'No existing outlets supplied.'} ${run?.savedDemo?'Saved demo: live retrieval unavailable/incomplete; highlights only.':run?.cached?'Reused real run, not a new live request.':''} ${run?.decisionOrigin==='ranking-fallback'?'Ranking-only fallback; research or agent decision incomplete.':''}`,9,200);
 const report=run?researchForVisit({...run,research:reports}):Object.entries(reports).find(([id,r])=>reportMatchesArea(r,result.areas.find(a=>a.id===id)))?.[1];
 if(report&&y<235){block(`Research point: ${report.target?.latitude}, ${report.target?.longitude}`,8,100);block(report.status==='sources-only'?'SOURCES TO INSPECT / SUMMARY UNAVAILABLE':'RESEARCH SOURCES (FULL REPORT IN SCOUTING NOTES)',10);if(report.notice)block(report.notice,8,180);for(const source of report.sources.filter(s=>s.url).slice(0,3)){if(y>254)break;pdf.setFontSize(8);pdf.textWithLink(clean(source.title.slice(0,80)),20,y,{url:source.url});y+=6;}}
 pdf.setFontSize(8);pdf.setTextColor(80);pdf.text(pdf.splitTextToSize('Method: local affinity-minus-popularity percentile contrast, not probability lift. The displayed minimum popularity floor is mandatory. Taste is not demand, foot traffic, rent, availability or business success. Nearby dining is a ranked sample. Verify leases, permits and operating economics before committing.',170),20,271);
 if(pdf.getNumberOfPages()!==1)throw new Error('The PDF exceeded one page. Download complete scouting notes instead.');
 pdf.save('sitebrief-expansion-brief.pdf');
}
