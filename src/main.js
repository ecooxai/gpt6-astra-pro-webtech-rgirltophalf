import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js';
import { exportPortrait, validateExport } from './export-portrait.js';
import { buildPortrait } from './model.js';
import { createStudioEnvironment } from './studio.js';
const $=s=>document.querySelector(s);
const params=new URLSearchParams(location.search);
if(params.has('capture'))document.body.classList.add('capture');
const host=$('#canvas-host'),mobile=innerWidth<761;
const toast=text=>{const e=$('#toast');e.textContent=text;e.style.opacity='1';setTimeout(()=>e.style.opacity='0',4500);};
function download(blob,name){const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),60000);}
let renderer,scene,camera,controls,portrait;
let needsFrames=1,activeView='portrait',clay=false;
const invalidate=()=>{needsFrames=Math.max(needsFrames,1);};
const presets={portrait:{pos:[0,2.42,7.6],target:[0,1.53,0]},front:{pos:[0,1.55,7.6],target:[0,1.53,0]},left:{pos:[-4.9,2.35,5.8],target:[0,1.53,0]},right:{pos:[4.9,2.35,5.8],target:[0,1.53,0]},back:{pos:[0,1.7,-7.6],target:[0,1.53,0]},detail:{pos:[0,2.63,3.55],target:[.015,2.62,.03]}};
function setView(name){const p=presets[name]||presets.portrait;activeView=name;camera.position.set(...p.pos);controls.target.set(...p.target);controls.update();document.querySelectorAll('[data-view]').forEach(el=>{el.classList.toggle('active',el.dataset.view===name);el.setAttribute('aria-pressed',String(el.dataset.view===name));});invalidate();}
async function init(){
 try{
  renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,preserveDrawingBuffer:true,powerPreference:'high-performance'});
  renderer.setPixelRatio(params.has('capture')?1.5:Math.min(Math.max(1.25,devicePixelRatio),mobile?1.5:1.75));renderer.setClearColor(0x000000,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;
  host.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','Interactive original 3D upper-body portrait. Drag to rotate.');
  scene=new THREE.Scene();const studioEnvironment=createStudioEnvironment(renderer);scene.environment=studioEnvironment.texture;scene.environmentIntensity=.24;camera=new THREE.PerspectiveCamera(32,1,.1,50);
  controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=!params.has("capture");controls.dampingFactor=.10;controls.enablePan=false;controls.minDistance=2.2;controls.maxDistance=13;controls.minPolarAngle=.25;controls.maxPolarAngle=2.72;controls.autoRotateSpeed=.48;controls.addEventListener('change',invalidate);
  // Procedural studio lighting: no HDRI/environment/image assets.
  scene.add(new THREE.HemisphereLight('#fff2e6','#b48e83',.40));
  scene.add(new THREE.AmbientLight('#f6d9c9',.04));
  RectAreaLightUniformsLib.init();
  function area(color,intensity,x,y,z,w,h,tx=0,ty=2,tz=0){const l=new THREE.RectAreaLight(color,intensity,w,h);l.position.set(x,y,z);l.lookAt(tx,ty,tz);scene.add(l);return l;}
  area('#fff5ef',4.2,-3.5,4.6,4,3.4,5);
  area('#e3e9ff',1.0,3.5,3.1,2.5,3,4);
  area('#f0d5c3',2.7,1.5,4.2,-2.2,2.2,3.5);
  const key=new THREE.DirectionalLight('#fff4ed',.40);key.position.set(-3,4.9,4.7);key.castShadow=true;key.shadow.mapSize.set(mobile?1024:2048,mobile?1024:2048);Object.assign(key.shadow.camera,{left:-3,right:3,top:4,bottom:-2,near:.5,far:15});key.shadow.bias=-.00012;key.shadow.normalBias=.015;key.shadow.radius=6;key.target.position.set(0,2,0);scene.add(key,key.target);
  portrait=buildPortrait({mobile});scene.add(portrait.root);
  new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();invalidate();}).observe(host);
  setView(params.get('view')||'portrait');
  $('#loading').style.display='none';$('#render-status').textContent='ORIGINAL GEOMETRY / LIVE';
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  $('#reset').onclick=()=>{controls.autoRotate=false;$('#rotate').checked=false;setView('portrait');};
  $('#rotate').onchange=e=>{controls.autoRotate=e.target.checked;invalidate();};
  $('#wire').onchange=e=>{portrait.setWire(e.target.checked);invalidate();};
  $('#hair').onchange=e=>{portrait.hairGroup.visible=e.target.checked;renderer.shadowMap.needsUpdate=true;invalidate();};
  $('#exposure').oninput=e=>{renderer.toneMappingExposure=Number(e.target.value);$('#exposure-value').textContent=Number(e.target.value).toFixed(2);invalidate();};
  function setClay(on){clay=on;portrait.setClay(on);portrait.setWire($('#wire').checked);$('#clay').classList.toggle('active',on);$('#studio').classList.toggle('active',!on);$('#mode-name').textContent=on?'CLAY STUDY':'LIVE 3D';invalidate();}
  $('#studio').onclick=()=>setClay(false);$('#clay').onclick=()=>setClay(true);
  $('#export-png').onclick=()=>{renderer.render(scene,camera);renderer.domElement.toBlob(b=>{if(b)download(b,`gpt6_astra_pro_webtech_rgirltophalf_${activeView}.png`);});toast('Current WebGL view saved as a transparent PNG.');};
  async function exportGLB(){const button=$('#export-glb');button.disabled=true;$('#export-status').textContent='Packaging original geometry and portable PBR materials…';try{const out=await exportPortrait(portrait);download(new Blob([out],{type:'model/gltf-binary'}),'gpt6-astra-pro_chatgpt_webtech_rgirltophalf.glb');$('#export-status').textContent='GLB exported with embedded original geometry and maps. Corneas use portable transmission; hair uses its standard PBR fallback.';return out.byteLength;}catch(e){$('#export-status').textContent='Export failed: '+e.message;throw e;}finally{button.disabled=false;}}
  $('#export-glb').onclick=()=>exportGLB().catch(e=>toast(e.message));
  renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();toast('WebGL paused. Reload the page to restore the graphics context.');});
  function animate(){requestAnimationFrame(animate);controls.update();if(controls.autoRotate||needsFrames>0){renderer.render(scene,camera);needsFrames--;}}animate();
  window.__portrait={ready:true,renderer,scene,camera,controls,model:portrait,setView,setClay,exportGLB,validateExport,render:()=>renderer.render(scene,camera),stats:()=>({triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,geometries:renderer.info.memory.geometries,textures:renderer.info.memory.textures,...portrait.stats})};
  await refreshJournal();
 }catch(err){console.error(err);$('#loading').innerHTML='<p>Unable to start the 3D studio.</p><small></small>';$('#loading small').textContent=err.message;$('#render-status').textContent='GRAPHICS ERROR';window.__portrait={ready:false,error:err.message};}
}
let lastRevision='';
async function refreshJournal(){try{const res=await fetch('./process/manifest.json?t='+Date.now(),{cache:'no-store'});if(!res.ok)return;const m=await res.json();if(m.revision===lastRevision)return;lastRevision=m.revision;$('#quality').textContent=m.score??'—';$('#iterations').textContent=m.iterations??0;$('#latest-note').textContent=m.note||'Manual visual review pending.';const grid=$('#process-grid');grid.replaceChildren();for(const r of(m.reviews||[])){const card=document.createElement('article');card.className='review-card';const img=document.createElement('img');img.src='./'+r.image+'?r='+m.revision;img.alt=r.title;img.loading='lazy';const content=document.createElement('div');content.className='review-content';const head=document.createElement('div');head.className='review-heading';const title=document.createElement('span');title.textContent=r.title;const score=document.createElement('span');score.className='review-score';score.textContent=r.score+' / 100';head.append(title,score);const p=document.createElement('p');p.textContent=r.note;const path=document.createElement('code');path.className='file-path';path.textContent=r.path;content.append(head,p,path);card.append(img,content);grid.append(card);}const arts=$('#artifacts');arts.replaceChildren();for(const f of m.artifacts||[]){const a=document.createElement('a');a.className='artifact';a.href='./'+f.url;a.download='';const b=document.createElement('b');b.textContent=f.label+' ↗';const code=document.createElement('code');code.className='file-path';code.textContent=f.path;a.append(b,code);arts.append(a);}}catch(e){console.debug('Journal update unavailable',e.message);}}
setInterval(refreshJournal,8000);
setTimeout(init,60);
