import {chromium} from 'playwright';
import fs from 'node:fs/promises';
const n=String(process.argv[2]||'03').padStart(2,'0');const views=process.argv.slice(3);if(!views.length)views.push('portrait');
const browser=await chromium.launch({executablePath:'/home/dev/.local/bin/chromium',headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--enable-unsafe-swiftshader','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:720,height:1080},deviceScaleFactor:1});page.setDefaultTimeout(150000);const errors=[];page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});
 await page.goto('http://127.0.0.1:48763/?capture=1',{waitUntil:'networkidle',timeout:150000});await page.waitForFunction(()=>window.__portrait?.ready,null,{timeout:150000});
 for(const view of views){await page.evaluate(v=>window.__portrait.setView(v),view);await page.waitForTimeout(500);await page.screenshot({path:`public/process/iteration-${n}-${view}.png`});console.log('CAPTURED',n,view);}
 console.log('STATS',JSON.stringify(await page.evaluate(()=>window.__portrait.stats())));
 await fs.writeFile(`public/process/test-${n}.json`,JSON.stringify({iteration:n,views,errors,stats:await page.evaluate(()=>window.__portrait.stats()),time:new Date().toISOString()},null,2));if(errors.length)process.exitCode=1;
}finally{await browser.close();}
