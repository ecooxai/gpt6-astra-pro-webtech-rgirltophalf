import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const n=String(process.argv[2]||'03').padStart(2,'0');const views=process.argv.slice(3);if(!views.length)views.push('portrait');
const browser=await chromium.launch({executablePath:'/home/dev/.local/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:720,height:1080},deviceScaleFactor:1});page.setDefaultTimeout(180000);const errors=[],timings=[],start=Date.now();
 page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 await page.goto('http://127.0.0.1:48763/?capture=1',{waitUntil:'networkidle',timeout:180000});await page.waitForFunction(()=>window.__portrait?.ready,null,{timeout:180000});
 console.log('READY_MS',Date.now()-start);
 for(const view of views){const frameStart=Date.now();await page.evaluate(v=>window.__portrait.setView(v),view);await page.waitForTimeout(500);await page.screenshot({path:`public/process/iteration-${n}-${view}.png`,animations:'disabled',timeout:180000});timings.push({view,elapsedMs:Date.now()-frameStart});console.log('CAPTURED',n,view,Date.now()-frameStart);}
 const stats=await page.evaluate(()=>window.__portrait.stats());console.log('STATS',JSON.stringify(stats));
 await fs.writeFile(`public/process/test-${n}.json`,JSON.stringify({iteration:n,views,errors,stats,timings,totalMs:Date.now()-start,time:new Date().toISOString()},null,2));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
