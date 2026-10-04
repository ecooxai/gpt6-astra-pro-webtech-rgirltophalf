/**
 * Original reference-led upper-body portrait by GPT-6 Astra Pro.
 * All geometry, vertex colors and procedural maps are authored here.
 * No reference pixels, stock meshes, character packages or generated images are used.
 */
import * as THREE from 'three';
import { buildGroom } from './groom.js';
import { buildBlouse } from './garment.js';
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
const faceRows=[
[1.65,.001,.180,-.180,.180],[1.665,.068,.247,-.138,.150],[1.695,.138,.300,-.075,.110],[1.74,.211,.346,.035,.070],[1.80,.275,.383,.180,.030],[1.88,.336,.410,.300,.008],[1.98,.411,.419,.395,0],[2.10,.466,.422,.450,0],[2.22,.510,.421,.490,0],[2.38,.549,.430,.519,0],[2.56,.555,.433,.538,0],[2.76,.553,.451,.542,0],[2.96,.550,.468,.530,0],[3.13,.510,.449,.480,0],[3.26,.438,.389,.419,0],[3.35,.345,.308,.330,0],[3.41,.244,.219,.235,0],[3.455,.137,.124,.133,0],[3.474,.001,.001,.001,0]
];
const chinCenter=y=>interp(faceRows,y,4);
const headWidth=y=>interp(faceRows,y,1);
const frontDepth=y=>interp(faceRows,y,2)-chinCenter(y);
const backDepth=y=>interp(faceRows,y,3)+chinCenter(y);
function scalpFront(x,y){const sy=clamp(y-.066,1.8,3.473);return faceZ(x/1.12,sy)*1.075+.028;}
function eyeOpening(x,y){return [-1,1].some(side=>((x-side*.243)/.183)**2+((y-2.419)/.117)**2<1);}
export function faceZ(x,y){const w=Math.max(.008,headWidth(y)),d=frontDepth(y),u=clamp(x/w,-.9999,.9999);let z=d*Math.pow(Math.sqrt(Math.max(0,1-u*u)),.85)+chinCenter(y);z+=.030*g(Math.abs(x)-.34,.115)*g(y-2.25,.16);z-=.037*g(Math.abs(x)-.233,.155)*g(y-2.419,.093);z+=.021*g(Math.abs(x)-.22,.17)*g(y-2.55,.065);z+=.054*g(x,.078)*g(y-2.38,.235);z+=.113*g(x,.090)*g(y-2.172,.078)+.017*g(x,.033)*g(y-2.111,.031);z+=.037*g(Math.abs(x)-.078,.044)*g(y-2.139,.053);z-=.003*g(x,.023)*g(y-2.035,.054);z+=.003*g(Math.abs(x)-.028,.016)*g(y-2.035,.05);z+=.009*g(x,.20)*g(y-1.950,.10);z-=.01*g(x,.11)*g(y-1.86,.035);z+=.01*g(x,.19)*g(y-1.83,.06);z+=.015*g(Math.abs(x)-.26,.15)*g(y-2.325,.07);z-=.018*g(Math.abs(x)-.12,.05)*g(y-2.419,.10);return z;}
function skinColor(x,y,front){const base=new THREE.Color('#efc6b6');let blush=(g(Math.abs(x)-.36,.13)*g(y-2.25,.14)*.51+g(x,.115)*g(y-2.14,.09)*.16)*front;base.lerp(new THREE.Color('#d98684'),blush);const under=g(Math.abs(x)-.23,.16)*g(y-2.355,.035)*front*.12;base.lerp(new THREE.Color('#bc8988'),under);const lids=g(Math.abs(x)-.23,.18)*g(y-2.495,.025)*front*.12;base.lerp(new THREE.Color('#bd8b7a'),lids);const light=g(x+.28,.24)*g(y-2.24,.30)*front*.075;base.lerp(new THREE.Color('#ffe1c7'),light);const grain=(rnd()-.5)*.003;base.r+=grain;base.g+=grain;base.b+=grain;return base;}
function shirtCenter(y){return -.065-.139*y+.097*y*y-.05*THREE.MathUtils.smoothstep(y,.70,.88);}
export function buildPortrait({mobile=false}={}){
 seed=220901;
 const root=new THREE.Group();root.name='GPT-6 Astra Pro — original WebGL upper-body portrait';
 const pivot=new THREE.Group();pivot.name='Natural head tilt';pivot.position.set(.075,2.438,0);root.add(pivot);
 const head=new THREE.Group();head.position.y=-2.46;pivot.add(head);pivot.rotation.z=-.135;pivot.rotation.y=-.025;
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
 // Seamless face with precise curved eye boundaries and embedded nasal/lip relief.
 buildContinuousFace({parent:head,material:skin,faceZ,skinColor,headWidth,backDepth,chinCenter,mobile});
 // Neck and upper sternum taper into the blouse, not a floating head.
 {
  const rows=[[.81,.34,.235],[1.05,.37,.25],[1.30,.282,.236],[1.58,.229,.207],[1.91,.229,.214]];const p=[],idx=[],uv=[];const ny=64,na=80;
  for(let j=0;j<=ny;j++){const y=mix(.81,1.91,j/ny);for(let i=0;i<=na;i++){const a=TAU*i/na;const x=interp(rows,y,1)*Math.sin(a)-.033*(y-1.1),z=interp(rows,y,2)*Math.cos(a)+.012;const tendon=.01*g(Math.abs(x)-.14,.04)*g(y-1.4,.3)*Math.max(0,Math.cos(a));p.push(x,y,z+tendon);uv.push(i/na,j/ny);if(j<ny&&i<na){let k=j*(na+1)+i;idx.push(k,k+1,k+na+1,k+1,k+na+2,k+na+1);}}}
  const ng=makeGeometry(p,idx,uv);mesh(ng,skinPlain,root,'Sculpted neck and clavicle transition');
 }
 // Ears with helix, concha, antihelix and tragus, visible from side views.
 for(const s of[-1,1]){
  ball(head,'Ear pinna '+s,skinPlain,[s*.538,2.435,.004],[.10,.206,.090]);
  ball(head,'Ear concha '+s,innerEar,[s*.575,2.435,.071],[.046,.124,.030]);
  let pts=[];for(let i=0;i<=40;i++){const a=TAU*i/40;pts.push([s*(.552+.063*Math.cos(a)),2.448+.176*Math.sin(a),.078+.014*Math.cos(a)]);}line(head,'Rolled ear helix '+s,pts,.012,skinPlain,64,7);
  line(head,'Ear antihelix '+s,[[s*.55,2.315,.10],[s*.57,2.37,.119],[s*.548,2.465,.114],[s*.57,2.535,.103]],.009,skinPlain,28,7);
  ball(head,'Tragus '+s,skinPlain,[s*.51,2.423,.104],[.018,.040,.024]);
 }
 const sclera=new THREE.MeshPhysicalMaterial({color:'#e8e1dc',map:scleraPigment(),roughness:.20,specularIntensity:.4});
 const rimMat=new THREE.MeshPhysicalMaterial({color:'#c8897a',roughness:.36,specularIntensity:.32});
 const irisMat=new THREE.MeshPhysicalMaterial({map:irisTexture(),roughness:.65,specularIntensity:.13});
 const pupilMat=new THREE.MeshPhysicalMaterial({color:'#130f10',roughness:.08,specularIntensity:.65});
 const creaseMat=new THREE.MeshStandardMaterial({color:'#c29481',roughness:.95});
 for(const s of[-1,1]){
  // Almond-shaped sclera is a curved surface, with dimensional skin margins (no floating white spheres).
  const p=[],idx=[],uv=[];const nx=70,ny=20;
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const t=-1+2*i/nx,v=j/ny,lo=eyeEdge(s,t,false),hi=eyeEdge(s,t,true),x=lo.x,y=mix(lo.y,hi.y,v),z=eyeSurface(s,x,y);p.push(x,y,z);uv.push(i/nx,v);if(j<ny&&i<nx){const k=j*(nx+1)+i;idx.push(k,k+1,k+nx+1,k+1,k+nx+2,k+nx+1);}}
  mesh(makeGeometry(p,idx,uv),sclera,head,'Curved almond sclera '+s);
  const ix=s*eyeX-.002,iy=eyeY+.001,iz=eyeSurface(s,ix,iy)+.002;
  // Convex radial iris with an individually synthesized radial-fiber texture.
  const ip=[ix,iy,iz+.003],iu=[.5,.5],ii=[];const nr=14,na=96,ir=.058;
  for(let r=1;r<=nr;r++)for(let a=0;a<=na;a++){const rr=ir*r/nr,an=TAU*a/na;ip.push(ix+rr*Math.cos(an),iy+rr*Math.sin(an),iz+.003-.012*Math.pow(r/nr,2));iu.push(.5+.5*r/nr*Math.cos(an),.5+.5*r/nr*Math.sin(an));}
  for(let a=0;a<na;a++)ii.push(0,1+a,2+a);
  for(let r=1;r<nr;r++)for(let a=0;a<na;a++){const k=1+(r-1)*(na+1)+a;ii.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}
  for(let k=0;k<ip.length;k+=3){const t=clamp((ip[k]-s*eyeX)/eyeW,-.999,.999);ip[k+1]=clamp(ip[k+1],eyeEdge(s,t,false).y+.001,eyeEdge(s,t,true).y-.001);}
  for(let k=0;k<ip.length;k+=3){const r=((ip[k]-ix)**2+(ip[k+1]-iy)**2)/(.058*.058);ip[k+2]=eyeSurface(s,ip[k],ip[k+1])+.002+.003*Math.max(0,1-r);}
  mesh(makeGeometry(ip,ii,iu),irisMat,head,'Brown radial iris '+s);
  ball(head,'Pupil '+s,pupilMat,[ix,iy,iz+.005],[.023,.023,.004],40);
  const wet=new THREE.MeshPhysicalMaterial({color:'#ffffff',transparent:true,opacity:.045,roughness:.055,clearcoat:1,clearcoatRoughness:.025,depthWrite:false});
  const corneal=mesh(makeGeometry(ip,ii,iu),wet,head,'Clipped corneal surface '+s);corneal.position.z=.0015;
  const catchMat=new THREE.MeshBasicMaterial({color:'#fff7ed'});
  ball(head,'Softbox catchlight '+s,catchMat,[ix-.017,iy+.024,iz+.011],[.006,.008,.0020],24);
  ball(head,'Secondary eye glint '+s,catchMat,[ix+.014,iy-.013,iz+.010],[.0025,.0035,.0012],16);

  for(const upper of[true,false]){
   let edgePts=[];for(let i=0;i<=55;i++){const t=-.99+1.98*i/55,e=eyeEdge(s,t,upper);e.z+=.0015;edgePts.push(e);}line(head,'Wet eyelid margin '+s+' '+upper,edgePts,upper?.0020:.0012,upper?lashMat:rimMat,60,5);
  }
  for(let i=0;i<32;i++){const t=-.95+1.9*(i+.2*rnd())/32,e=eyeEdge(s,t,true);e.z+=.003;const L=.012+.011*Math.pow((s*t+1)/2,1.5);line(head,'Upper eyelash '+s+' '+i,[e,e.clone().add(V(s*.004,L*.35,.009)),e.clone().add(V(s*(.007+.006*rnd()),L*.65,.016))],.0009+(.0004*rnd()),lashMat,7,4);}
  for(let i=0;i<14;i++){const t=-.78+1.63*i/14,e=eyeEdge(s,t,false);line(head,'Fine lower eyelash '+s+' '+i,[e,e.clone().add(V(s*.003,-.008,.008)),e.clone().add(V(s*.006,-.012-.004*rnd(),.010))],.00032,lashMat,5,3);}
  // Small tear duct integrated at the nasal corner.
  const inner=eyeEdge(s,-s*.965,false);ball(head,'Lacrimal corner '+s,rimMat,[inner.x,inner.y+.006,inner.z],[.011,.01,.005],20);
  // Eyebrow base is subdued; individual growing hairs define its upper silhouette.
  let browPts=[];for(let i=0;i<=30;i++){let t=i/30,x=s*(.098+.307*t),y=2.548+.026*Math.sin(PI*t*.92)-.026*t;browPts.push([x,y,faceZ(x,y)+.004]);}
  line(head,'Soft brow foundation '+s,browPts,.007,browBase,40,5);
  for(let i=0;i<128;i++){let t=(i+rnd())/128,x=s*(.10+.303*t),y=2.545+.026*Math.sin(PI*t*.92)-.026*t+(rnd()-.5)*.023,zz=faceZ(x,y)+.013;let l=.015*(1-.7*t)+rnd()*.008;line(head,'Brow hair '+s+' '+i,[[x,y,zz],[x+s*.006,y+l*.66,zz+.001],[x+s*(.007+t*.013),y+l,faceZ(x+s*.01,y+l)+.012]],.00045+(.00025*rnd()),browMat,5,3);}
 }
 const groomStats=buildGroom({parent:hairGroup,skinMaterial:skinPlain,mobile,headWidth,faceZ,backDepth});
 // Tailored blouse is a separately batched collection of original sewn panels.
 const blouse=buildBlouse(root,{mobile});
 root.userData={author:'GPT-6 Astra Pro',tools:'Three.js / WebGL / JavaScript / Headless Chrome',source:'Original procedural geometry and maps in src/model.js, face-surface.js, groom.js, garment.js and surfaces.js',seed:220901};


 function bakeAndWarp(o,hair=false,body=false){o.updateMatrix();o.geometry.applyMatrix4(o.matrix);o.position.set(0,0,0);o.quaternion.identity();o.scale.set(1,1,1);o.updateMatrix();const a=o.geometry.getAttribute('position');for(let i=0;i<a.count;i++){let x=a.getX(i),y=a.getY(i);if(body)y-=.12*(1-THREE.MathUtils.smoothstep(y,-.44,-.30));else y-=.07*(1-THREE.MathUtils.smoothstep(y,2.13,2.43));a.setXY(i,x,y);}a.needsUpdate=true;if(!hair&&!o.name.includes("Continuous facial sculpt"))o.geometry.computeVertexNormals();}
 head.traverse(o=>{if(o.isMesh)bakeAndWarp(o,o.parent===hairGroup,false);});
 for(const o of root.children)if(o.isMesh)bakeAndWarp(o,false,true);
 // Consolidate meshes by material inside each transform/layer group to keep mobile draw calls low.
 for(const parent of [head,hairGroup,root]){
  const batches=new Map();
  for(const o of [...parent.children])if(o.isMesh){const key=o.material.uuid+'_'+Object.keys(o.geometry.attributes).sort().join(',');if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);}
  for(const batch of batches.values())if(batch.length>1){const gs=batch.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix);});const geo=mergeGeometries(gs,false);if(geo){const joined=mesh(geo,batch[0].material,parent,'Batched original surfaces — '+batch[0].name);joined.userData.components=batch.map(o=>o.name);for(const o of batch){parent.remove(o);o.geometry.dispose();}}for(const geo of gs)geo.dispose();}
 }
 for(const o of root.children)if(o.isMesh)o.scale.x=1.27;
 const originalMaterials=new Map();root.traverse(o=>{if(o.isMesh)originalMaterials.set(o,o.material);});
 const clayMat=new THREE.MeshStandardMaterial({color:'#bda18d',roughness:.85,side:THREE.DoubleSide});
 return {root,hairGroup,originalMaterials,clayMat,stats:{...groomStats,seed:220901},setClay(on){root.traverse(o=>{if(o.isMesh)o.material=on?clayMat:originalMaterials.get(o);});},setWire(on){const mats=new Set();root.traverse(o=>{if(o.isMesh)mats.add(o.material);});for(const m of mats)m.wireframe=on;}};
}
