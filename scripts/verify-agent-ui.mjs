import {createRequire} from 'node:module';import fs from 'node:fs';import assert from 'node:assert/strict';
const load=createRequire(import.meta.url);const {chromium}=load(process.env.PLAYWRIGHT_MODULE_PATH||'playwright-core');
const {PDFDocument}=load(process.env.PDF_LIB_MODULE_PATH||'pdf-lib');
const base=process.argv[2];const replay=process.env.SCOUT_REPLAY==='1';const browser=await chromium.launch({headless:true,args:['--no-sandbox']});const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));const checks=[];
fs.mkdirSync('docs/agent',{recursive:true});
try{
 if(replay){const run=JSON.parse(fs.readFileSync('/tmp/sitebrief-scout-run.json','utf8'));await page.route('**/api/scout',r=>r.fulfill({status:200,contentType:'text/event-stream',body:'data: '+JSON.stringify({type:'complete',value:{...run,cached:true}})+'\n\n'}));}
 await page.goto(base,{waitUntil:'networkidle'});await page.screenshot({path:'docs/agent/start.png',fullPage:true});
 const waiting=page.waitForResponse(r=>r.url().endsWith('/api/scout')&&r.request().method()==='POST',{timeout:180000});
 await page.getByRole('button',{name:'Try the Toronto playground café'}).click();await waiting;
 await page.locator('.atlas-decision').waitFor({timeout:175000});await page.locator('.atlas-research-text').waitFor({timeout:10000});
 assert(await page.getByRole('heading',{name:'What connects your references?'}).isVisible());assert.equal(await page.locator('.atlas-area-card').count(),3);assert(await page.locator('.atlas-agent-log li.complete').count()>=4);assert(await page.locator('.atlas-research-text sup a').count()>0);assert(await page.locator('.atlas-research-text h3').count()>0);
 checks.push('One click produces an agent interpretation, contrast cards, Audience DNA, actual tool statuses and cited research');
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Download one-page expansion brief'}).click();const file=await downloading;const bytes=fs.readFileSync(await file.path());assert.equal(bytes.subarray(0,4).toString(),'%PDF');const pdf=await PDFDocument.load(bytes);assert.equal(pdf.getPageCount(),1);fs.writeFileSync('docs/agent/expansion-brief.pdf',bytes);checks.push('Downloaded Expansion Brief is a structurally valid one-page PDF');
 await page.addScriptTag({path:process.env.AXE_SCRIPT_PATH||load.resolve('axe-core/axe.min.js')});
 const audit=()=>page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});
 const desktopAxe=await audit();assert.deepEqual(desktopAxe,[]);await page.screenshot({path:'docs/agent/desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const mobileAxe=await audit();assert.deepEqual(mobileAxe,[]);await page.screenshot({path:'docs/agent/mobile.png',fullPage:true});checks.push('Rendered agent result passes tested desktop/mobile axe rules, with no overflow or page errors');
 await page.getByRole('button',{name:'20 km',exact:true}).click();assert.equal(await page.locator('.atlas-decision').count(),0);assert.equal(await page.locator('.atlas-area-card').count(),0);assert.equal(await page.locator('.atlas-dna').count(),0);checks.push('Changing a constraint invalidates the agent interpretation, audience panel and old areas');assert.deepEqual(errors,[]);
 const report={url:base,status:'passed',mode:replay?'Explicit UI transport replay of a previously saved real run; not a fresh live agent test':'Hosted end-to-end agent run (cache reuse, if returned by server, is visibly labelled)',checks,desktopAxe,mobileAxe,pageErrors:errors};fs.writeFileSync('docs/agent/ui-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
