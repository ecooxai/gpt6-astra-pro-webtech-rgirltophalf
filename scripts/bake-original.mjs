/** Bake only the scratch-authored project model. No reference image or third-party mesh is read. */
import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const browser=await chromium.launch({executablePath:process.env.CHROME_BIN||'/home/dev/.local/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:720,height:1080},acceptDownloads:true});page.setDefaultTimeout(240000);
 page.on('pageerror',e=>console.error('PAGE_ERROR',e.message));page.on('console',m=>{if(['error','warning'].includes(m.type()))console.log('BROWSER',m.text().slice(0,700));});const start=Date.now();
 await page.goto('http://127.0.0.1:48763/?bake=1&procedural=1',{waitUntil:'networkidle',timeout:240000});await page.waitForFunction(()=>window.__portrait?.ready);
 const [download,bytes]=await Promise.all([page.waitForEvent('download'),page.evaluate(()=>window.__portrait.exportGLB())]);
 await fs.mkdir('public/latest',{recursive:true});const path='public/latest/gpt6-astra-pro_chatgpt_webtech_rgirltophalf.glb';await download.saveAs(path);
 const stats=await page.evaluate(()=>window.__portrait.model.stats);const report={source:'Original project procedural geometry; no imported visual assets',path,bytes,elapsedMs:Date.now()-start,stats,time:new Date().toISOString()};
 await fs.writeFile('public/process/bake-latest.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}catch(error){console.error('BAKE_FAILED',error.message);process.exitCode=1;}finally{await browser.close();}
