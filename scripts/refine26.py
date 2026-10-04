from pathlib import Path
p=Path('src/face-surface.js');s=p.read_text().replace('return .212+Math.sqrt(Math.max(.00001,.18**2','return .204+Math.sqrt(Math.max(.00001,.225**2').replace(".43*Math.pow(cavity,.8)",".32*Math.pow(cavity,.8)").replace("new THREE.Color('#773e40'),.74", "new THREE.Color('#8b5050'),.61");p.write_text(s)
p=Path('src/eyes.js');s=p.read_text().replace('radius=.0585','radius=.0605');p.write_text(s)
p=Path('src/groom-flow.js');s=p.read_text().replace('return V(x,y,mix(skin,Math.max(skin,cap),smooth(y,2.91,3.16)));','return V(x,y,mix(skin,Math.max(skin,cap),smooth(y,2.91,3.16))-(j===0?.060:0));')
s=s.replace('width=[.022,.015,.014,.011,.008,.008,.014,.006,.007]', 'width=[.029,.020,.014,.012,.008,.007,.016,.006,.008]')
s=s.replace('for(const f of frames){', '''const end=(id>=59000&&id<60000?.81:.95)+(id>=59000&&id<60000?.19:.05)*hash(id,k+931);
   for(let frameIndex=0;frameIndex<=segments;frameIndex++){
    const q=frameIndex*end,index=Math.floor(q),blend=q-index,A=frames[index],B=frames[Math.min(segments,index+1)];
    const f={t:frameIndex/segments,p:A.p.clone().lerp(B.p,blend),S:A.S.clone().lerp(B.S,blend).normalize(),O:A.O.clone().lerp(B.O,blend).normalize()};''')
p.write_text(s)
p=Path('src/main.js');s=p.read_text().replace("import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';", "import { exportPortrait, validateExport } from './export-portrait.js';")
s=s.replace("document.querySelectorAll('[data-view]').forEach(el=>el.classList.toggle('active',el.dataset.view===name));", "document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===name);el.setAttribute('aria-pressed',String(el.dataset.view===name));});")
a=s.index('  async function exportGLB(){');b=s.index("  $('#export-glb').onclick",a)
s=s[:a]+'''  async function exportGLB(){const button=$('#export-glb');button.disabled=true;$('#export-status').textContent='Packaging original geometry and portable PBR materials…';try{const out=await exportPortrait(portrait);download(new Blob([out],{type:'model/gltf-binary'}),'gpt6-astra-pro_chatgpt_webtech_rgirltophalf.glb');$('#export-status').textContent='GLB exported with embedded original geometry and maps. Corneas use portable transmission; hair uses its standard PBR fallback.';return out.byteLength;}catch(e){$('#export-status').textContent='Export failed: '+e.message;throw e;}finally{button.disabled=false;}}
'''+s[b:]
s=s.replace('setView,setClay,exportGLB,render:', 'setView,setClay,exportGLB,validateExport,render:');p.write_text(s)
print('PASS26 eye, fringe and export changes saved')
