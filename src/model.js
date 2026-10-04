/**
 * Original reference-led upper-body portrait by GPT-6 Astra Pro.
 * All geometry, vertex colors and procedural maps are authored here.
 * No reference pixels, stock meshes, character packages or generated images are used.
 */
import * as THREE from 'three';
import fit from './portrait-fit.json' with {type:'json'};
import {createFaceDefinition} from './facial-definition.js';
import { buildGroom } from './groom-flow.js';
import { buildBlouse } from './garment.js';
import { buildEar } from './ear.js';
import { buildIrisTexture } from './iris.js';
import { buildSkinAtlas } from './skin-atlas.js';
import { buildBrows } from './brows.js';
import { buildEyes } from './eyes.js';
import { buildContinuousFace, eyeEdge, eyeSurface, eyeY, eyeX, eyeW } from './face-surface.js';
import { skinMicrostructure, hairSurfaceMaps, hairlineMask, scleraPigment } from './surfaces.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
const PI=Math.PI, TAU=PI*2;
const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z);
const clamp=THREE.MathUtils.clamp, mix=THREE.MathUtils.lerp;
const g=(v,s)=>Math.exp(-v*v/(s*s));
let seed=220901;
function rnd(){seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;}
function interp(rows,y,k){let i=0;while(i<rows.length-2&&y>rows[i+1][0])i++;const r0=rows[Math.max(0,i-1)],r1=rows[i],r2=rows[i+1],r3=rows[Math.min(rows.length-1,i+2)],h=r2[0]-r1[0],t=clamp((y-r1[0])/h,0,1);const m1=(r2[k]-r0[k])/(r2[0]-r0[0]),m2=(r3[k]-r1[k])/(r3[0]-r1[0]);return (2*t*t*t-3*t*t+1)*r1[k]+(t*t*t-2*t*t+t)*h*m1+(-2*t*t*t+3*t*t)*r2[k]+(t*t*t-t*t)*h*m2;}

function makeGeometry(p,idx,uv,c,n){const b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute(p,3));b.setIndex(idx);if(uv)b.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));if(c)b.setAttribute('color',new THREE.Float32BufferAttribute(c,3));if(n)b.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));else b.computeVertexNormals();return b;}
function mesh(geo,mat,parent,name){const o=new THREE.Mesh(geo,mat);o.name=name||'Original procedural surface';parent.add(o);o.castShadow=true;o.receiveShadow=true;return o;}
function ball(parent,name,mat,xyz,scale,segments=40){const o=mesh(new THREE.SphereGeometry(1,segments,Math.floor(segments*.7)),mat,parent,name);o.position.set(...xyz);o.scale.set(...scale);return o;}
function line(parent,name,points,r,mat,seg=35,rad=5){const curve=new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?V(...p):p));return mesh(new THREE.TubeGeometry(curve,seg,r,rad,false),mat,parent,name);}
function noiseTexture(size=256){const data=new Uint8Array(size*size*4);for(let i=0;i<size*size;i++){const v=115+Math.floor(rnd()*40);data[i*4]=v;data[i*4+1]=v;data[i*4+2]=v;data[i*4+3]=255;}const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12,12);t.needsUpdate=true;return t;}
function strandTexture(){const size=512,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/size,v=y/size,w=.50+.20*Math.sin(u*940+.6*Math.sin(v*16+u*5))+.14*Math.sin(u*2104-.3*Math.cos(v*39))+.04*(rnd()-.5),i=(y*size+x)*4;data[i]=data[i+1]=data[i+2]=Math.floor(255*clamp(w,.12,.91));data[i+3]=255;}const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;}
function lipTintTexture(upper){const w=256,h=96,d=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/(w-1)*2-1,v=y/(h-1),f=1-THREE.MathUtils.smoothstep(v,.58,1),t=f*Math.pow(Math.max(0,1-u*u),.18),c=new THREE.Color('#f0caba').lerp(new THREE.Color(upper?'#cd8a86':'#dc9a95'),t),grain=.008*Math.sin(u*370+v*3)*Math.sin(PI*v);c.r+=grain;c.g+=grain*.5;c.b+=grain*.5;c.convertLinearToSRGB();const i=(y*w+x)*4;d[i]=clamp(c.r*255,0,255);d[i+1]=clamp(c.g*255,0,255);d[i+2]=clamp(c.b*255,0,255);d[i+3]=255;}const t=new THREE.DataTexture(d,w,h);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearFilter;t.needsUpdate=true;return t;}
function irisTexture(){const size=256,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const dx=(x-size/2)/(size/2),dy=(y-size/2)/(size/2),r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);const fibers=Math.sin(a*153+Math.sin(r*20)*2.5)*.12+Math.sin(a*279-r*48)*.09+Math.sin(a*67+r*39)*.1;const edge=1-.66*Math.pow(clamp((r-.70)/.29,0,1),2);const ring=1+.17*Math.sin(r*34+a*7);const f=edge*ring*(1+fibers)*(1-.24*g(r-.44,.12));const i=(y*size+x)*4;data[i]=clamp(68*f,0,255);data[i+1]=clamp(40*f,0,255);data[i+2]=clamp(28*f,0,255);data[i+3]=255;}const t=new THREE.DataTexture(data,size,size);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;}
const {headWidth,frontDepth,backDepth,chinCenter,faceZ}=createFaceDefinition(fit);
export {faceZ};
function skinColor(x,y,front){const base=new THREE.Color('#efc6b6');let blush=(g(Math.abs(x)-.39,.16)*g(y-2.25,.16)*.44+g(x,.115)*g(y-2.14-fit.noseShift,.09)*.16)*front;base.lerp(new THREE.Color('#d98684'),blush);const under=g(Math.abs(x)-.23,.16)*g(y-2.355,.035)*front*.12;base.lerp(new THREE.Color('#bc8988'),under);const lids=g(Math.abs(x)-.23,.18)*g(y-2.495,.025)*front*.12;base.lerp(new THREE.Color('#bd8b7a'),lids);const light=g(x+.28,.24)*g(y-2.24,.30)*front*.075;base.lerp(new THREE.Color('#ffe1c7'),light);const grain=(rnd()-.5)*.003;base.r+=grain;base.g+=grain;base.b+=grain;return base;}
function shirtCenter(y){return -.065-.139*y+.097*y*y-.05*THREE.MathUtils.smoothstep(y,.70,.88);}
export function buildPortrait({mobile=false}={}){
 seed=220901;
 const root=new THREE.Group();root.name='GPT-6 Astra Pro — original WebGL upper-body portrait';
 const pivot=new THREE.Group();pivot.name='Natural head tilt';pivot.position.set(fit.headX,fit.headY,0);pivot.scale.setScalar(fit.scale);root.add(pivot);
 const head=new THREE.Group();head.position.y=-2.46;pivot.add(head);pivot.rotation.z=fit.roll;pivot.rotation.y=fit.yaw;
 const hairGroup=new THREE.Group();hairGroup.name='Original dimensional strand hair';head.add(hairGroup);
 const pore=noiseTexture();
 const skin=new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.48,metalness:0,specularIntensity:.30,specularColor:new THREE.Color('#fff1e4'),sheen:.15,sheenRoughness:.8,sheenColor:new THREE.Color('#e5a387'),bumpMap:pore,bumpScale:.00055});
 const micro=skinMicrostructure();skin.map=micro.albedo;skin.normalMap=micro.normal;skin.normalScale.set(.18,.18);skin.roughnessMap=micro.roughness;skin.roughness=.68;skin.specularIntensity=.48;skin.sheen=.12;skin.clearcoat=.035;skin.clearcoatRoughness=.55;skin.bumpMap=null;
 const skinPlain=skin.clone();skinPlain.vertexColors=false;skinPlain.color.set('#efc6b6');
 const innerEar=new THREE.MeshStandardMaterial({color:'#c98c7a',roughness:.63});
 const dark=new THREE.MeshStandardMaterial({color:'#70473b',roughness:.85});
 const browMat=new THREE.MeshStandardMaterial({color:'#44302a',roughness:.79});
 const browBase=new THREE.MeshStandardMaterial({color:'#957064',roughness:.9});
 const lashMat=new THREE.MeshStandardMaterial({color:'#39241f',roughness:.63});
 // Anatomically placed, original skin maps distinguish matte skin from hydrated lip relief.
 const atlas=buildSkinAtlas(headWidth);skin.map=atlas.color;skin.normalMap=atlas.normal;skin.normalScale.set(.56,.56);skin.roughnessMap=atlas.roughness;skin.roughness=1;skin.aoMap=atlas.occlusion;skin.aoMapIntensity=.5;skin.sheen=.045;skin.specularIntensity=.64;
 // Seamless face with precise curved eye boundaries and embedded nasal/lip relief.
 const faceSculpt=buildContinuousFace({parent:head,material:skin,faceZ,skinColor,headWidth,backDepth,chinCenter,mobile});
 // Neck and upper sternum taper into the blouse, not a floating head.
 {
  const rows=[[.81,.34,.235],[1.05,.37,.25],[1.30,.282,.236],[1.58,.229,.207],[1.91,.229,.214]];const p=[],idx=[],uv=[];const ny=64,na=80;
  for(let j=0;j<=ny;j++){const y=mix(.81,1.91,j/ny);for(let i=0;i<=na;i++){const a=TAU*i/na;const x=interp(rows,y,1)*Math.sin(a)-.033*(y-1.1),z=interp(rows,y,2)*Math.cos(a)+.012;const tendon=.01*g(Math.abs(x)-.14,.04)*g(y-1.4,.3)*Math.max(0,Math.cos(a));p.push(x,y,z+tendon);uv.push(i/na,j/ny);if(j<ny&&i<na){let k=j*(na+1)+i;idx.push(k,k+1,k+na+1,k+1,k+na+2,k+na+1);}}}
  const ng=makeGeometry(p,idx,uv);mesh(ng,skinPlain,root,'Sculpted neck and clavicle transition');
 }
 // Both ears are continuous sculpted volumes, not stacked torus primitives.
 for(const side of[-1,1])buildEar(head,side,skinPlain);
 const eyeMaterials=buildEyes(head,{skinMaterial:skinPlain,faceSculpt});
 buildBrows(head,faceSculpt.zAt);

 for(const o of head.children)if(o.isMesh&&eyeMaterials.includes(o.material))o.castShadow=false;
 const groomStats=buildGroom({parent:hairGroup,skinMaterial:skinPlain,mobile,headWidth,faceZ,backDepth});
 // Tailored blouse is a separately batched collection of original sewn panels.
 const blouse=buildBlouse(root,{mobile});
 root.userData={author:'GPT-6 Astra Pro',tools:'Three.js / WebGL / JavaScript / Headless Chrome',source:'Original procedural geometry and maps authored in src/; no reference pixels or external visual assets',seed:220901};


 function bakeAndWarp(o,hair=false,body=false){o.updateMatrix();o.geometry.applyMatrix4(o.matrix);o.position.set(0,0,0);o.quaternion.identity();o.scale.set(1,1,1);o.updateMatrix();const a=o.geometry.getAttribute('position');for(let i=0;i<a.count;i++){let x=a.getX(i),y=a.getY(i);if(body)y-=.12*(1-THREE.MathUtils.smoothstep(y,-.44,-.30));else if(!hair)y-=fit.lowerWarp*(1-THREE.MathUtils.smoothstep(y,2.13,2.43));a.setXY(i,x,y);}a.needsUpdate=true;if(!hair&&!o.name.includes("Continuous facial sculpt"))o.geometry.computeVertexNormals();}
 head.traverse(o=>{if(o.isMesh)bakeAndWarp(o,o.parent===hairGroup,false);});
 for(const o of root.children)if(o.isMesh)bakeAndWarp(o,false,true);
 // Consolidate meshes by material inside each transform/layer group to keep mobile draw calls low.
 for(const parent of [head,hairGroup,root]){
  const batches=new Map();
  for(const o of [...parent.children])if(o.isMesh){const key=o.material.uuid+'_'+Object.keys(o.geometry.attributes).sort().join(',');if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);}
  for(const batch of batches.values())if(batch.length>1){const gs=batch.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix);});const geo=mergeGeometries(gs,false);if(geo){const joined=mesh(geo,batch[0].material,parent,'Batched original surfaces — '+batch[0].name);joined.castShadow=batch.some(o=>o.castShadow);joined.userData.components=batch.map(o=>o.name);for(const o of batch){parent.remove(o);o.geometry.dispose();}}for(const geo of gs)geo.dispose();}
 }
 for(const o of root.children)if(o.isMesh)o.scale.x=1.27;
 const originalMaterials=new Map();root.traverse(o=>{if(o.isMesh)originalMaterials.set(o,o.material);});
 root.traverse(o=>{if(o.isMesh&&eyeMaterials.includes(o.material))o.castShadow=false;});
 const clayMat=new THREE.MeshStandardMaterial({color:'#bda18d',roughness:.85,side:THREE.DoubleSide});
 return {root,hairGroup,originalMaterials,clayMat,stats:{...groomStats,seed:220901},setClay(on){root.traverse(o=>{if(o.isMesh)o.material=on?clayMat:originalMaterials.get(o);});},setWire(on){const mats=new Set();root.traverse(o=>{if(o.isMesh)mats.add(o.material);});for(const m of mats)m.wireframe=on;}};
}
