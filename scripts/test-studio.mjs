/** Browser acceptance tests. These are functional checks, not visual-quality scores. */
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'http://127.0.0.1:48763/';
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||'/home/dev/.local/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
const report={time:new Date().toISOString(),url:base,checks:[],errors:[],stats:{},timings:{},exports:{}};
await fs.mkdir('public/latest',{recursive:true});
const check=(name,ok,detail)=>{assert.ok(ok,name+': '+JSON.stringify(detail));report.checks.push({name,passed:true,detail});console.log('PASS',name);};
async function ready(page){const t=Date.now();await page.goto(base,{waitUntil:'networkidle',timeout:240000});await page.waitForFunction(()=>window.__portrait?.ready,null,{timeout:240000});return Date.now()-t;}
function errors(page){page.on('pageerror',e=>report.errors.push(e.message));page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('favicon'))report.errors.push(m.text());});}
try{
 const desktop=await browser.newContext({viewport:{width:1440,height:1080},deviceScaleFactor:1,reducedMotion:'reduce',acceptDownloads:true});
 const page=await desktop.newPage();page.setDefaultTimeout(240000);errors(page);report.timings.desktopReadyMs=await ready(page);
 const layout=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth-innerWidth,title:document.querySelector('h1').textContent,tools:document.querySelector('.tool-line').textContent,titleBottom:document.querySelector('.viewer-top').getBoundingClientRect().bottom,canvasTop:document.querySelector('#stage').getBoundingClientRect().top}));
 check('desktop layout has no horizontal overflow',layout.overflow<=1,layout.overflow);
 check('model and tool names are above the character',layout.title.includes('GPT-6 Astra Pro')&&layout.tools.includes('Headless Chrome')&&layout.titleBottom<=layout.canvasTop,layout);
 report.stats.desktop=await page.evaluate(()=>window.__portrait.stats());
 await page.screenshot({path:'public/latest/gpt6-astra-pro_chatgpt_webtech_desktop.png',timeout:240000});
 check('desktop WebGL render',report.stats.desktop.drawCalls>0&&report.stats.desktop.triangles>100000,report.stats.desktop);
 await page.evaluate(()=>{window.__portrait.setRendering(false);window.__portrait.controls.enableDamping=false;});report.stateChecksUsePausedRendering=true;
 for(const view of ['front','left','right','back','detail','portrait']){
  await page.locator(`[data-view="${view}"]`).click();
  const active=await page.locator(`[data-view="${view}"]`).getAttribute('aria-pressed');check('camera preset '+view,active==='true',active);
 }
 await page.locator('#clay').click();check('clay mode',await page.evaluate(()=>document.querySelector('#mode-name').textContent==='CLAY STUDY'));
 await page.locator('#wire').check();check('wireframe mode',await page.evaluate(()=>{let ok=true;window.__portrait.model.root.traverse(o=>{if(o.isMesh&&!o.material.wireframe)ok=false;});return ok;}));
 await page.locator('#wire').uncheck();await page.locator('#studio').click();
 await page.locator('#hair').uncheck();check('hair toggle off',await page.evaluate(()=>!window.__portrait.model.hairGroup.visible));await page.locator('#hair').check();
 await page.locator('#rotate').check();check('turntable on',await page.evaluate(()=>window.__portrait.controls.autoRotate));await page.locator('#rotate').uncheck();
 await page.locator('#exposure').fill('1.15');check('exposure control',await page.evaluate(()=>Math.abs(window.__portrait.renderer.toneMappingExposure-1.15)<.001));await page.locator('#exposure').fill('1');
 check('journal is newest first',await page.evaluate(()=>document.querySelector('.review-heading span')?.textContent.startsWith(String(document.querySelector('#iterations').textContent))));
 const links=await page.locator('#artifacts a').count();check('artifact links visible',links>=5,links);
 await page.evaluate(()=>window.__portrait.setRendering(true));await desktop.close();
 const mobile=await browser.newContext({viewport:{width:390,height:1000},deviceScaleFactor:1,isMobile:true,hasTouch:true,reducedMotion:'reduce',acceptDownloads:true});
 const phone=await mobile.newPage();phone.setDefaultTimeout(240000);errors(phone);report.timings.mobileReadyMs=await ready(phone);
 check('mobile layout has no horizontal overflow',await phone.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 report.stats.mobile=await phone.evaluate(()=>window.__portrait.stats());
 await phone.screenshot({path:'public/latest/gpt6-astra-pro_chatgpt_webtech_mobile.png',timeout:240000});
 const pngWait=phone.waitForEvent('download',{timeout:240000});await phone.locator('#export-png').click();const png=await pngWait;await png.saveAs('public/latest/gpt6-astra-pro_chatgpt_webtech_view-export.png');const pngBytes=await fs.readFile('public/latest/gpt6-astra-pro_chatgpt_webtech_view-export.png');check('PNG export signature',pngBytes.subarray(1,4).toString()==='PNG',pngBytes.length);report.exports.pngBytes=pngBytes.length;
 const t=Date.now(),glbWait=phone.waitForEvent('download',{timeout:300000});await phone.locator('#export-glb').click();const glb=await glbWait;
 const modelName='gpt6-astra-pro_chatgpt_webtech_rgirltophalf.glb';await glb.saveAs('public/latest/'+modelName);report.timings.glbExportMs=Date.now()-t;
 const data=await fs.readFile('public/latest/'+modelName);check('GLB binary header',data.readUInt32LE(0)===0x46546c67&&data.readUInt32LE(4)===2&&data.readUInt32LE(8)===data.length,data.length);
 const json=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString().trim());
 check('GLB embeds all images',json.images?.every(i=>i.bufferView!==undefined),json.images?.length);
 check('GLB preserves transmissive corneas',json.materials.some(m=>m.extensions?.KHR_materials_transmission?.transmissionFactor>.9));
 check('GLB under GitHub individual file limit',data.length<100*1024*1024,data.length);
 report.exports.glb={bytes:data.length,meshes:json.meshes.length,materials:json.materials.length,images:json.images.length};
 const roundtrip=await phone.evaluate(async name=>{const response=await fetch('./latest/'+name);const buffer=await response.arrayBuffer();return await window.__portrait.validateExport(buffer);},modelName);
 check('GLB browser round-trip',roundtrip.meshes>10&&roundtrip.validBounds,roundtrip);
 check('no browser errors',report.errors.length===0,report.errors);
 await mobile.close();report.passed=true;
}catch(e){report.passed=false;report.failure=e.message;console.error(e);process.exitCode=1;}
finally{await fs.writeFile('public/process/acceptance-latest.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report));}
