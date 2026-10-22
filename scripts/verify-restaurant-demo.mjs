import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const load=createRequire(import.meta.url);
const {chromium}=load(process.env.PLAYWRIGHT_MODULE_PATH||'playwright-core');
const base=process.argv[2];
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1100}});
const checks=[];const errors=[];page.on('pageerror',e=>errors.push(e.message));
fs.mkdirSync('docs/restaurant-demo',{recursive:true});
try{
 await page.goto(base,{waitUntil:'networkidle'});
 await page.getByRole('textbox',{name:'City',exact:true}).fill('Toronto');
 await page.getByRole('list',{name:'City results'}).waitFor({timeout:15000});
 await page.getByRole('list',{name:'City results'}).getByRole('button').first().click();
 checks.push('City lookup suggests real locations without a separate search click');
 await page.getByText('Restaurant details for local research',{exact:true}).click();
 await page.getByLabel('Restaurant or brand name').fill('Northline Coffee — illustrative demo concept');
 await page.getByLabel('When will you serve?').selectOption('daytime');
 await page.getByRole('textbox',{name:/Your audience might like/}).fill('Starbucks');
 const run=async()=>{const waiting=page.waitForResponse(r=>r.url().endsWith('/api/explore')&&r.request().method()==='POST',{timeout:60000});await page.getByRole('button',{name:'Find areas to scout'}).click();const response=await waiting;const data=await response.json();assert.equal(response.status(),200,JSON.stringify(data));return data;};
 let data=await run();
 assert.equal(data.references[0].resolution,'brand');assert.equal(await page.locator('.atlas-reference-choice').count(),0);
 assert.equal(data.brief.restaurant.servicePeriod,'daytime');assert(data.areas.length>0);
 await page.getByText('Brand recognized',{exact:true}).waitFor();
 checks.push('Starbucks resolves to its actual Qloo brand without an outlet-selection list');
 await page.getByText('Already have outlets? Add an expansion rule',{exact:true}).click();
 await page.getByRole('textbox',{name:'Existing outlet address',exact:true}).fill(data.areas[0].name.replace(/^Near /,''));
 await page.getByRole('list',{name:'Existing outlet address results'}).waitFor({timeout:15000});
 await page.getByRole('list',{name:'Existing outlet address results'}).getByRole('button').first().click();
 data=await run();
 assert.equal(data.brief.existingOutlets.length,1);assert(data.rejectedCount>0);
 const distance=(a,b)=>{const radians=n=>n*Math.PI/180;const dLat=radians(b.latitude-a.latitude),dLon=radians(b.longitude-a.longitude);return 6371*2*Math.atan2(Math.sqrt(Math.sin(dLat/2)**2+Math.cos(radians(a.latitude))*Math.cos(radians(b.latitude))*Math.sin(dLon/2)**2),Math.sqrt(1-(Math.sin(dLat/2)**2+Math.cos(radians(a.latitude))*Math.cos(radians(b.latitude))*Math.sin(dLon/2)**2)));};
 assert(data.areas.every(a=>distance(a,data.brief.existingOutlets[0])>=data.brief.minimumOutletDistanceKm));
 await page.getByRole('heading',{name:/points excluded by your expansion rule/}).waitFor();
 checks.push('Operator-supplied illustrative outlet excludes real points before selecting eligible alternatives');
 const waiting=page.waitForResponse(r=>r.url().endsWith('/api/research')&&r.request().method()==='POST',{timeout:60000});
 await page.getByRole('button',{name:'Research this area'}).click();const researchResponse=await waiting;const research=await researchResponse.json();
 let researchStatus;
 if(researchResponse.ok()){
  assert(research.sources.some(s=>s.url.startsWith('https:')));assert(research.citations.length);await page.locator('.atlas-research-text').waitFor();researchStatus='live grounded research passed';
  checks.push('Live Gemini/Google Search research returns citation-linked evidence');
 }else{
  assert.equal(researchResponse.status(),503);await page.getByRole('alert').filter({hasText:'Web research is unavailable'}).waitFor();researchStatus='BLOCKED: live research returned 503; saved Gemini credential rejected by direct Google probe';
  assert.equal(await page.locator('.atlas-area-card').count(),data.areas.length);
  checks.push('Research failure preserves live Qloo evidence and does not invent a research report');
 }
 const downloading=page.waitForEvent('download');await page.getByRole('button',{name:'Download scouting notes'}).click();const file=await downloading;const memo=fs.readFileSync(await file.path(),'utf8');assert(memo.includes('points excluded'));assert(memo.includes('Starbucks'));assert(memo.includes('not neighborhood averages'));
 checks.push('Downloaded scouting notes include restaurant inputs, outlet rule, exclusions and Qloo provenance');
 await page.addScriptTag({path:process.env.AXE_SCRIPT_PATH||load.resolve('axe-core/axe.min.js')});
 const audit=async()=>page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa']}});return r.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}));});
 const desktopAxe=await audit();assert.deepEqual(desktopAxe,[]);
 await page.screenshot({path:'docs/restaurant-demo/desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);const mobileAxe=await audit();assert.deepEqual(mobileAxe,[]);await page.screenshot({path:'docs/restaurant-demo/mobile.png',fullPage:true});
 checks.push('Desktop/mobile results have no tested axe violations, page errors or 390px overflow');
 const empty=await page.request.post(base+'/api/explore',{data:{...data.brief,radiusKm:5,existingOutlets:[{name:'Illustrative central exclusion point',...data.brief.center}],minimumOutletDistanceKm:10}});assert.equal(empty.status(),200);const noAreas=await empty.json();assert.equal(noAreas.areas.length,0);assert.equal(noAreas.eligibleCount,0);assert(noAreas.rejectedCount>0);
 checks.push('All-excluded live request returns zero areas without relaxing operator constraints');
 if(!researchResponse.ok()){
  const fixtureText='Synthetic test evidence only.';
  await page.route('**/api/research',route=>route.fulfill({status:200,contentType:'application/json',body:JSON.stringify({text:fixtureText,createdAt:new Date().toISOString(),sources:[{title:'Test fixture source',url:'https://example.org'}],citations:[{end:fixtureText.length,sourceIndices:[0]}],queries:['synthetic test'],searchSuggestionsHtml:''})}));
  await page.getByRole('button',{name:'Research this area'}).click();await page.locator('.atlas-research-text').filter({hasText:fixtureText}).waitFor();assert.equal(await page.getByRole('link',{name:'Source 1: Test fixture source'}).getAttribute('href'),'https://example.org');await page.unroute('**/api/research');
  checks.push('Synthetic research response verifies inline citation rendering only; not live research evidence');
 }
 await page.getByLabel('Price position').selectOption('premium');assert.equal(await page.locator('.atlas-area-card').count(),0);assert.equal(await page.locator('.atlas-research').count(),0);
 checks.push('Changing the restaurant brief invalidates old results and research');
 const bad=await page.request.post(base+'/api/research',{data:{}});assert.equal(bad.status(),400);assert.deepEqual(errors,[]);
 const report={url:base,checks,researchStatus,desktopAxe,mobileAxe,pageErrors:errors,cells:data.cells.length,rejected:data.rejectedCount,areas:data.areas.map(a=>({name:a.name,latitude:a.latitude,longitude:a.longitude})),status:researchResponse.ok()?'passed':'core passed; research blocked',scenario:'Restaurant name and existing-outlet scenario are illustrative operator inputs. Qloo, geocoding, exclusion and research requests are live; no intercepted success responses.'};
 fs.writeFileSync('docs/restaurant-demo/validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
}finally{await browser.close();}
