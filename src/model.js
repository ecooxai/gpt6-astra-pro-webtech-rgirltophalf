/**
 * Original reference-led upper-body portrait by GPT-6 Astra Pro.
 * All geometry, vertex colors and procedural maps are authored here.
 * No reference pixels, stock meshes, character packages or generated images are used.
 */
import * as THREE from 'three';
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
function lipTintTexture(upper){const w=256,h=96,d=new Uint8Array(w*h*4);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/(w-1)*2-1,v=y/(h-1),f=1-THREE.MathUtils.smoothstep(v,.76,1),t=f*Math.pow(Math.max(0,1-u*u),.18),c=new THREE.Color('#f0caba').lerp(new THREE.Color(upper?'#cd8a86':'#dc9a95'),t),grain=.008*Math.sin(u*370+v*3)*Math.sin(PI*v);c.r+=grain;c.g+=grain*.5;c.b+=grain*.5;c.convertLinearToSRGB();const i=(y*w+x)*4;d[i]=clamp(c.r*255,0,255);d[i+1]=clamp(c.g*255,0,255);d[i+2]=clamp(c.b*255,0,255);d[i+3]=255;}const t=new THREE.DataTexture(d,w,h);t.colorSpace=THREE.SRGBColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearFilter;t.needsUpdate=true;return t;}
function irisTexture(){const size=256,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const dx=(x-size/2)/(size/2),dy=(y-size/2)/(size/2),r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);const fibers=Math.sin(a*153+Math.sin(r*20)*2.5)*.12+Math.sin(a*279-r*48)*.09+Math.sin(a*67+r*39)*.1;const edge=1-.66*Math.pow(clamp((r-.70)/.29,0,1),2);const ring=1+.17*Math.sin(r*34+a*7);const f=edge*ring*(1+fibers)*(1-.24*g(r-.44,.12));const i=(y*size+x)*4;data[i]=clamp(88*f,0,255);data[i+1]=clamp(47*f,0,255);data[i+2]=clamp(29*f,0,255);data[i+3]=255;}const t=new THREE.DataTexture(data,size,size);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;}
const faceRows=[
[1.65,.001,.180,-.180,.180],[1.665,.068,.247,-.138,.150],[1.695,.138,.300,-.075,.110],[1.74,.211,.346,.035,.070],[1.80,.275,.383,.180,.030],[1.88,.336,.410,.300,.008],[1.98,.411,.419,.395,0],[2.10,.466,.422,.450,0],[2.22,.510,.421,.490,0],[2.38,.549,.430,.519,0],[2.56,.555,.433,.538,0],[2.76,.553,.451,.542,0],[2.96,.550,.468,.530,0],[3.13,.510,.449,.480,0],[3.26,.438,.389,.419,0],[3.35,.345,.308,.330,0],[3.41,.244,.219,.235,0],[3.455,.137,.124,.133,0],[3.474,.001,.001,.001,0]
];
const chinCenter=y=>interp(faceRows,y,4);
const headWidth=y=>interp(faceRows,y,1);
const frontDepth=y=>interp(faceRows,y,2)-chinCenter(y);
const backDepth=y=>interp(faceRows,y,3)+chinCenter(y);
function scalpFront(x,y){const sy=clamp(y-.066,1.8,3.473);return faceZ(x/1.12,sy)*1.075+.028;}
function eyeOpening(x,y){for(const side of[-1,1]){const t=(x-side*.243)/.139;if(Math.abs(t)<.996){const c=2.419+side*t*.009,b=Math.pow(Math.max(0,1-t*t),.72);if(y>c-.050*b-.022*Math.sqrt(b)&&y<c+.076*b+.027*Math.sqrt(b))return true;}}return false;}
export function faceZ(x,y){const w=Math.max(.008,headWidth(y)),d=frontDepth(y),u=clamp(x/w,-.9999,.9999);let z=d*Math.pow(Math.sqrt(Math.max(0,1-u*u)),.85)+chinCenter(y);z+=.030*g(Math.abs(x)-.34,.115)*g(y-2.25,.16);z-=.037*g(Math.abs(x)-.233,.155)*g(y-2.419,.093);z+=.021*g(Math.abs(x)-.22,.17)*g(y-2.55,.065);z+=.065*g(x,.066)*g(y-2.38,.23);z+=.141*g(x,.086)*g(y-2.170,.070)+.018*g(x,.025)*g(y-2.108,.030);z+=.052*g(Math.abs(x)-.075,.040)*g(y-2.130,.055);z-=.009*g(x,.018)*g(y-2.035,.066);z+=.007*g(Math.abs(x)-.03,.013)*g(y-2.035,.06);z+=.009*g(x,.20)*g(y-1.950,.10);z-=.01*g(x,.11)*g(y-1.86,.035);z+=.01*g(x,.19)*g(y-1.83,.06);z+=.015*g(Math.abs(x)-.26,.15)*g(y-2.325,.07);z-=.018*g(Math.abs(x)-.12,.05)*g(y-2.419,.10);return z;}
function skinColor(x,y,front){const base=new THREE.Color('#f0caba');let blush=(g(Math.abs(x)-.36,.13)*g(y-2.25,.14)*.51+g(x,.115)*g(y-2.14,.09)*.16)*front;base.lerp(new THREE.Color('#d88d89'),blush);const under=g(Math.abs(x)-.23,.16)*g(y-2.355,.035)*front*.12;base.lerp(new THREE.Color('#bc8988'),under);const lids=g(Math.abs(x)-.23,.18)*g(y-2.495,.025)*front*.12;base.lerp(new THREE.Color('#bd8b7a'),lids);const light=g(x+.28,.24)*g(y-2.24,.30)*front*.075;base.lerp(new THREE.Color('#ffe1c7'),light);const grain=(rnd()-.5)*.003;base.r+=grain;base.g+=grain;base.b+=grain;return base;}
export function buildPortrait({mobile=false}={}){
 seed=220901;
 const root=new THREE.Group();root.name='GPT-6 Astra Pro — original WebGL upper-body portrait';
 const pivot=new THREE.Group();pivot.name='Natural head tilt';pivot.position.set(.075,2.438,0);root.add(pivot);
 const head=new THREE.Group();head.position.y=-2.46;pivot.add(head);pivot.rotation.z=-.095;pivot.rotation.y=-.025;
 const hairGroup=new THREE.Group();hairGroup.name='Original dimensional strand hair';head.add(hairGroup);
 const pore=noiseTexture();
 const skin=new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.48,metalness:0,specularIntensity:.30,specularColor:new THREE.Color('#fff1e4'),sheen:.15,sheenRoughness:.8,sheenColor:new THREE.Color('#e5a387'),bumpMap:pore,bumpScale:.00055});
 const skinPlain=skin.clone();skinPlain.vertexColors=false;skinPlain.color.set('#efcbb9');
 const innerEar=new THREE.MeshStandardMaterial({color:'#c98c7a',roughness:.63});
 const dark=new THREE.MeshStandardMaterial({color:'#70473b',roughness:.85});
 const hairmat=new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.36,metalness:0,specularIntensity:.45,sheen:.45,sheenColor:new THREE.Color('#5b4033'),sheenRoughness:.48});
 const haircapmat=new THREE.MeshPhysicalMaterial({color:'#241917',roughness:.40,specularIntensity:.35,sheen:.35,sheenColor:new THREE.Color('#4c3630')});
 const hairThin=new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.40,specularIntensity:.48,sheen:.5,sheenRoughness:.35,sheenColor:new THREE.Color('#856552'),side:THREE.DoubleSide});
 const strandMap=strandTexture();
 for(const mat of [hairmat,haircapmat]){mat.map=strandMap;mat.color.multiplyScalar(1.7);mat.bumpMap=strandMap;mat.bumpScale=.0024;mat.roughnessMap=strandMap;mat.roughness=.68;mat.anisotropy=.72;mat.anisotropyRotation=Math.PI/2;}
 const browMat=new THREE.MeshStandardMaterial({color:'#44302a',roughness:.79});
 const browBase=new THREE.MeshStandardMaterial({color:'#957064',roughness:.9});
 const lashMat=new THREE.MeshStandardMaterial({color:'#39241f',roughness:.63});
 const white=new THREE.MeshPhysicalMaterial({color:'#ecebf1',roughness:.66,sheen:.7,sheenColor:new THREE.Color('#fffaf4'),sheenRoughness:.84,bumpMap:pore,bumpScale:.00032,side:THREE.DoubleSide});
 const stitch=new THREE.MeshStandardMaterial({color:'#cccbd4',roughness:.92});
 const buttonMat=new THREE.MeshPhysicalMaterial({color:'#f4eee1',roughness:.29,specularIntensity:.5});
 // One continuous closed head; cheek, orbital socket, nose, philtrum and chin relief share its topology.
 {
  const p=[],idx=[],uv=[],col=[];const ny=190,na=224;
  for(let j=0;j<=ny;j++){const y=mix(1.65,3.474,j/ny),w=Math.max(.001,headWidth(y)),back=backDepth(y);for(let i=0;i<=na;i++){const a=-PI+TAU*i/na,x=w*Math.sin(a),front=Math.cos(a)>0;const z=front?faceZ(x,y):-back*Math.pow(-Math.cos(a),.85)+chinCenter(y);p.push(x,y,z);uv.push(i/na,j/ny);const c=skinColor(x,y,front?Math.pow(Math.cos(a),2):0);col.push(c.r,c.g,c.b);if(j<ny&&i<na){const k=j*(na+1)+i;idx.push(k,k+1,k+na+1,k+1,k+na+2,k+na+1);}}}
  const openIdx=[];for(let k=0;k<idx.length;k+=3){const a=idx[k]*3,b=idx[k+1]*3,c=idx[k+2]*3,x=(p[a]+p[b]+p[c])/3,y=(p[a+1]+p[b+1]+p[c+1])/3,z=(p[a+2]+p[b+2]+p[c+2])/3;if(z<0||!eyeOpening(x,y))openIdx.push(idx[k],idx[k+1],idx[k+2]);}
  mesh(makeGeometry(p,openIdx,uv,col),skin,head,'Sculpted head with anatomical eye openings');
 }
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
 const eyeY=2.419,eyeX=.243,eyeW=.139;
 const eyeEdge=(s,t,upper)=>{const x=s*eyeX+eyeW*t;const tilt=s*t*.009;const y=eyeY+tilt+(upper?.076:-.050)*Math.pow(Math.max(0,1-t*t),.72);const z=.212+Math.sqrt(Math.max(.0001,.18*.18-(x-s*eyeX)**2-(y-eyeY)**2));return V(x,y,z);};
 const eyeSurface=(s,x,y)=>.212+Math.sqrt(Math.max(.0001,.18*.18-(x-s*eyeX)**2-(y-eyeY)**2));
 const sclera=new THREE.MeshPhysicalMaterial({color:'#ede0d6',roughness:.19,specularIntensity:.55});
 const rimMat=new THREE.MeshPhysicalMaterial({color:'#c8897a',roughness:.36,specularIntensity:.32});
 const irisMat=new THREE.MeshPhysicalMaterial({map:irisTexture(),roughness:.2,specularIntensity:.52});
 const pupilMat=new THREE.MeshPhysicalMaterial({color:'#130f10',roughness:.08,specularIntensity:.65});
 const creaseMat=new THREE.MeshStandardMaterial({color:'#c29481',roughness:.95});
 for(const s of[-1,1]){
  // Almond-shaped sclera is a curved surface, with dimensional skin margins (no floating white spheres).
  const p=[],idx=[],uv=[];const nx=70,ny=20;
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const t=-1+2*i/nx,v=j/ny,lo=eyeEdge(s,t,false),hi=eyeEdge(s,t,true),x=lo.x,y=mix(lo.y,hi.y,v),z=eyeSurface(s,x,y);p.push(x,y,z);uv.push(i/nx,v);if(j<ny&&i<nx){const k=j*(nx+1)+i;idx.push(k,k+1,k+nx+1,k+1,k+nx+2,k+nx+1);}}
  mesh(makeGeometry(p,idx,uv),sclera,head,'Curved almond sclera '+s);
  const ix=s*eyeX-.002,iy=eyeY+.001,iz=eyeSurface(s,ix,iy)+.002;
  // Convex radial iris with an individually synthesized radial-fiber texture.
  const ip=[ix,iy,iz+.003],iu=[.5,.5],ii=[];const nr=14,na=96,ir=.064;
  for(let r=1;r<=nr;r++)for(let a=0;a<=na;a++){const rr=ir*r/nr,an=TAU*a/na;ip.push(ix+rr*Math.cos(an),iy+rr*Math.sin(an),iz+.003-.012*Math.pow(r/nr,2));iu.push(.5+.5*r/nr*Math.cos(an),.5+.5*r/nr*Math.sin(an));}
  for(let a=0;a<na;a++)ii.push(0,1+a,2+a);
  for(let r=1;r<nr;r++)for(let a=0;a<na;a++){const k=1+(r-1)*(na+1)+a;ii.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}
  for(let k=0;k<ip.length;k+=3){const t=clamp((ip[k]-s*eyeX)/eyeW,-.999,.999);ip[k+1]=clamp(ip[k+1],eyeEdge(s,t,false).y+.001,eyeEdge(s,t,true).y-.001);}
  for(let k=0;k<ip.length;k+=3){const r=((ip[k]-ix)**2+(ip[k+1]-iy)**2)/(.064*.064);ip[k+2]=eyeSurface(s,ip[k],ip[k+1])+.002+.003*Math.max(0,1-r);}
  mesh(makeGeometry(ip,ii,iu),irisMat,head,'Brown radial iris '+s);
  ball(head,'Pupil '+s,pupilMat,[ix,iy,iz+.005],[.026,.026,.004],40);
  const wet=new THREE.MeshPhysicalMaterial({color:'#ffffff',transparent:true,opacity:.11,roughness:.055,clearcoat:1,clearcoatRoughness:.025,depthWrite:false});
  const corneal=mesh(makeGeometry(ip,ii,iu),wet,head,'Clipped corneal surface '+s);corneal.position.z=.0015;
  const catchMat=new THREE.MeshBasicMaterial({color:'#fff7ed'});
  ball(head,'Softbox catchlight '+s,catchMat,[ix-.017,iy+.024,iz+.011],[.006,.008,.0020],24);
  ball(head,'Secondary eye glint '+s,catchMat,[ix+.014,iy-.013,iz+.010],[.0025,.0035,.0012],16);
  for(const upper of[true,false]){
   const pp=[],ind=[],uu=[],cc=[];const n=80,m=8;
   for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){const t=-1+2*i/n,v=j/m,e=eyeEdge(s,t,upper);const fade=Math.pow(Math.max(0,1-t*t),.32);const y=e.y+(upper?1:-1)*v*(upper?.051:.036)*fade,x=e.x;const z=mix(e.z,faceZ(x,y)+.001,v*v*(3-2*v))+.003*Math.sin(PI*v)**2;pp.push(x,y,z);uu.push(i/n,j/m);const c=skinColor(x,y,1);if(j<2)c.lerp(new THREE.Color('#d09887'),.18);cc.push(c.r,c.g,c.b);if(j<m&&i<n){const k=j*(n+1)+i;ind.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}
   const gm=makeGeometry(pp,ind,uu,cc);if(upper===false){gm.setIndex(ind.flatMap((_,i)=>[]));gm.setIndex(ind.map((_,i)=>ind[i-i%3+(2-i%3)]));gm.computeVertexNormals();}
   mesh(gm,skin,head,(upper?'Upper':'Lower')+' sculpted eyelid '+s);
   let edgePts=[];for(let i=0;i<=55;i++){const t=-.99+1.98*i/55,e=eyeEdge(s,t,upper);e.z+=.0015;edgePts.push(e);}line(head,'Wet eyelid margin '+s+' '+upper,edgePts,upper?.0020:.0012,upper?lashMat:rimMat,60,5);
  }
  let fold=[];for(let i=0;i<=45;i++){const t=-.94+1.88*i/45,e=eyeEdge(s,t,true);e.y+=.027*Math.pow(1-t*t,.4);e.z=faceZ(e.x,e.y)+.006;fold.push(e);}line(head,'Soft upper eyelid crease '+s,fold,.0008,creaseMat,50,4);
  for(let i=0;i<32;i++){const t=-.95+1.9*(i+.2*rnd())/32,e=eyeEdge(s,t,true);e.z+=.003;const L=.012+.011*Math.pow((s*t+1)/2,1.5);line(head,'Upper eyelash '+s+' '+i,[e,e.clone().add(V(s*.004,L*.35,.009)),e.clone().add(V(s*(.007+.006*rnd()),L*.65,.016))],.0009+(.0004*rnd()),lashMat,7,4);}
  for(let i=0;i<14;i++){const t=-.78+1.63*i/14,e=eyeEdge(s,t,false);line(head,'Fine lower eyelash '+s+' '+i,[e,e.clone().add(V(s*.003,-.008,.008)),e.clone().add(V(s*.006,-.012-.004*rnd(),.010))],.00048,lashMat,5,3);}
  // Small tear duct integrated at the nasal corner.
  const inner=eyeEdge(s,-s*.965,false);ball(head,'Lacrimal corner '+s,rimMat,[inner.x,inner.y+.006,inner.z],[.011,.01,.005],20);
  // Eyebrow base is subdued; individual growing hairs define its upper silhouette.
  let browPts=[];for(let i=0;i<=30;i++){let t=i/30,x=s*(.098+.307*t),y=2.548+.026*Math.sin(PI*t*.92)-.026*t;browPts.push([x,y,faceZ(x,y)+.004]);}
  line(head,'Soft brow foundation '+s,browPts,.007,browBase,40,5);
  for(let i=0;i<128;i++){let t=(i+rnd())/128,x=s*(.10+.303*t),y=2.545+.026*Math.sin(PI*t*.92)-.026*t+(rnd()-.5)*.023,zz=faceZ(x,y)+.013;let l=.015*(1-.7*t)+rnd()*.008;line(head,'Brow hair '+s+' '+i,[[x,y,zz],[x+s*.006,y+l*.66,zz+.001],[x+s*(.007+t*.013),y+l,faceZ(x+s*.01,y+l)+.012]],.00045+(.00025*rnd()),browMat,5,3);}
 }
 // Nostrils are inset underneath the continuous nasal wings, not black holes on the bridge.
 for(const s of[-1,1]){const n=ball(head,'Recessed nostril '+s,dark,[s*.065,2.120,faceZ(s*.065,2.120)+.0005],[.020,.009,.0045],28);n.rotation.z=s*.19;n.rotation.x=.65;}
 // Closed neutral mouth: separate upper/lower vermilion meshes with a real curved seam.
 const lipUpper=new THREE.MeshPhysicalMaterial({color:'#ffffff',map:lipTintTexture(true),roughness:.43,specularIntensity:.28,bumpMap:pore,bumpScale:.00028});
 const lipLower=new THREE.MeshPhysicalMaterial({color:'#ffffff',map:lipTintTexture(false),roughness:.36,specularIntensity:.4,bumpMap:pore,bumpScale:.00035});
 const lipLine=new THREE.MeshStandardMaterial({color:'#784342',roughness:.83});
 const seamY=t=>1.949-.007*(1-t*t)+.003*Math.cos(t*PI);
 for(const upper of[true,false]){const p=[],idx=[],uv=[];const n=100,m=16;for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){const t=-1+2*i/n,v=j/m,x=.160*t,ys=seamY(t);let edge=upper?ys+(.033+.014*g(Math.abs(t)-.32,.19))*Math.pow(Math.max(0,1-t*t),.75):ys-.047*Math.pow(Math.max(0,1-t*t),.78);const y=mix(ys,edge,v),z=faceZ(x,y)+.002+(.020*(1-v*v*(3-2*v))+.018*Math.sin(PI*v)**2)*Math.pow(Math.max(0,1-t*t),.55);p.push(x,y,z);uv.push(i/n,j/m);if(j<m&&i<n){const k=j*(n+1)+i;if(upper)idx.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);else idx.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);}}mesh(makeGeometry(p,idx,uv),upper?lipUpper:lipLower,head,(upper?'Upper':'Lower')+' shaped lip');}
 let seam=[];for(let i=0;i<=60;i++){const t=-1+2*i/60,x=.160*t,y=seamY(t);seam.push([x,y,faceZ(x,y)+.003+.020*Math.pow(Math.max(0,1-t*t),.55)]);}line(head,'Delicate closed mouth line',seam,.0010,lipLine,70,5);
 // Scalp undercoat is closed at the crown and follows an anatomical hairline.
 {
 const p=[],idx=[],uv=[];const nr=85,na=180;
 for(let j=0;j<=nr;j++)for(let i=0;i<=na;i++){const a=-PI+TAU*i/na,front=Math.max(0,Math.cos(a)),bottom=2.17+.91*Math.pow(front,1.3)+.28*g(a+1.25,.30),y=mix(3.539,bottom,j/nr),sy=clamp(y-.066,1.8,3.473),w=headWidth(sy)*1.12+.008*Math.sin(PI*j/nr),x=w*Math.sin(a);const z=Math.cos(a)>=0?faceZ(x/1.12,sy)*1.075+.022*Math.sin(PI*j/nr):-backDepth(sy)*Math.pow(-Math.cos(a),.85)*1.12;p.push(x,y,z);uv.push(i/na,j/nr);if(j<nr&&i<na){const k=j*(na+1)+i;idx.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}}
 mesh(makeGeometry(p,idx,uv),haircapmat,hairGroup,'Hairline and closed scalp undercoat');
 }
 // Coherent clump guides run from an off-center part, over the skull, around the shoulders and into curled tips.
 function guide(a,jitter=0,phase=0){const s=Math.sin(a),c=Math.cos(a),fr=Math.max(c,0);const end=-.19+.23*Math.pow(Math.abs(c),2)+jitter*.13;
 return new THREE.CatmullRomCurve3([
 V(.105+jitter*.018,3.507-.13*Math.pow(c,2),.37*c),
 V(.44*s+.032,3.335-.035*c,.606*c),
 V(.665*s+.012,2.97-.025*c,.672*c),
 V((fr>.4?Math.sign(s)*Math.max(.57,Math.abs(.67*s)):.67*s),2.42,(s<0&&c>.18?-.08:.607*c)),
 V((.72+.032*Math.sin(phase))*s,1.79,.62*c+.05*fr),
 V((.79+.04*Math.sin(phase+1))*s,1.16,.60*c+.11*fr),
 V((.94+.065*Math.sin(phase))*s,.65,.60*c+.17*fr),
 V((.96+.08*Math.sin(phase+1.5))*s,.16,.56*c+.19*fr),
 V((.71+.08*Math.sin(phase+2))*s,end,.48*c+.14*fr)
 ],false,'catmullrom',.35);}
 const hp=[],hi=[],hu=[],hc=[];
 function solidLock(curve,width,thick,color,radial,segments=48){const base=hp.length/3,around=7;for(let j=0;j<=segments;j++){const t=j/segments,p=curve.getPoint(t),tan=curve.getTangent(t).normalize();const no=radial.clone().add(V(0,.12*(1-t),0)).normalize();const side=tan.clone().cross(no).normalize();const normal=side.clone().cross(tan).normalize();let taper=Math.pow(Math.max(.001,Math.sin(PI*.5*(1-t))),.7)*Math.pow(Math.min(1,t*16),.45);for(let i=0;i<=around;i++){let a=TAU*i/around;const pp=p.clone().addScaledVector(side,Math.cos(a)*width*taper).addScaledVector(normal,Math.sin(a)*thick*taper);hp.push(pp.x,pp.y,pp.z);hu.push(i/around,t);hc.push(color.r,color.g,color.b);if(j<segments&&i<around){const k=base+j*(around+1)+i;hi.push(k,k+around+1,k+1,k+1,k+around+1,k+around+2);}}}}
 for(let i=0;i<122;i++){const a=.70+(TAU-1.40)*(i+.5)/122,phase=rnd()*TAU,col=new THREE.Color().setHSL(.025+rnd()*.016,.16+rnd()*.12,.082+rnd()*.035,THREE.SRGBColorSpace);solidLock(guide(a,rnd()*2-1,phase),.062+rnd()*.025,.029+rnd()*.013,col,V(Math.sin(a),0,Math.cos(a)),46);}

 const frontGuides=[];
 for(const side of [-1,1])for(let j=0;j<(side===1?38:30);j++){
  const t=j/(side===1?37:29),r=rnd(),z=.49+.13*t;
  const curve=new THREE.CatmullRomCurve3([
   V(.10+(t-.5)*.025,3.46-.10*t,scalpFront(.10+(t-.5)*.025,3.46-.10*t)+.020),
   V(side*(.35+.13*t),3.25-.12*t,scalpFront(side*(.35+.13*t),3.25-.12*t)+.035),
   V(side*(.57+.09*t),2.80,side<0?.15:.47-.08*t),
   V(side*(.57+.10*t),2.12,side<0?-.07:.43-.03*t),
   V(side*(.58+.20*t),1.45,.48+.04*t),
   V(side*(.52+.32*t),.92,z+.055*Math.sin(t*5)),
   V(side*(.77+.25*t),.37,z-.05),
   V(side*(.69+.24*t),.05,.49-.02*t),
   V(side*(.39+.39*t),-.23+.22*t+.08*r,.46)
  ],false,'catmullrom',.35);
  const radial=V(side*.22,0,1).normalize();
  solidLock(curve,.030+.013*r,.021+.006*r,new THREE.Color().setHSL(.032,.18,.09+.037*r,THREE.SRGBColorSpace),radial,52);
  frontGuides.push({curve,radial});
 }

 const sp=[],si=[],su=[],sc=[],sn=[];
 function filament(curve,width,col,radial,offset=0,phase=0,segments=40){const base=sp.length/3;for(let j=0;j<=segments;j++){const t=j/segments,p=curve.getPoint(t),tan=curve.getTangent(t).normalize();const side=tan.clone().cross(radial).normalize(),normal=side.clone().cross(tan).normalize();const taper=Math.pow(Math.max(.0001,1-t),.60),off=offset*(.05+.95*Math.pow(1-t,.45))+.0025*Math.sin(t*18+phase);p.addScaledVector(side,off);p.addScaledVector(normal,.038+.0018*Math.sin(t*37+phase));for(let k=0;k<2;k++){const pp=p.clone().addScaledVector(side,(k?1:-1)*width*taper);sp.push(pp.x,pp.y,pp.z);su.push(k,t);sc.push(col.r,col.g,col.b);sn.push(normal.x,normal.y,normal.z);}if(j<segments){const k=base+j*2;si.push(k,k+1,k+2,k+1,k+3,k+2);}}}
 const strandCount=mobile?1100:2000;
 for(let i=0;i<strandCount;i++){const a=.70+(TAU-1.40)*rnd(),phase=rnd()*TAU;const color=new THREE.Color().setHSL(.03+rnd()*.018,.14+rnd()*.14,.10+rnd()*.062,THREE.SRGBColorSpace);filament(guide(a,rnd()*2-1,phase),.00075+rnd()*.00105,color,V(Math.sin(a),.03,Math.cos(a)).normalize(),(rnd()-.5)*.068,phase,40);}

 for(const {curve,radial} of frontGuides)for(let i=0;i<(mobile?12:24);i++)filament(curve,.00065+rnd()*.0005,new THREE.Color().setHSL(.032,.15,.11+rnd()*.07,THREE.SRGBColorSpace),radial,(rnd()-.5)*.050,rnd()*TAU,46);

 const scalpFibers=mobile?600:1100;
 for(const side of[-1,1])for(let j=0;j<scalpFibers/2;j++){
 const r=rnd(),ry=3.515-.15*r,rx=.09+(rnd()-.5)*.018,ex=side*(.54+.035*r),ey=2.80+.19*r,pts=[];
 for(let k=0;k<=22;k++){const t=k/22,q=1-t,x=q*q*rx+2*q*t*side*.23+t*t*ex,y=q*q*ry+2*q*t*(3.37-.10*r)+t*t*ey;pts.push(V(x,y,scalpFront(x,y)+.009));}
 filament(new THREE.CatmullRomCurve3(pts),.0006+rnd()*.00045,new THREE.Color().setHSL(.025,.13,.105+rnd()*.08,THREE.SRGBColorSpace),V(0,0,1),(rnd()-.5)*.005,rnd()*TAU,34);
 }
 // Sparse fringes are individual tapered locks; the forehead remains visible between wisps.
 const bangs=[];
 const fringePaths=[
 [[.10,3.43],[-.08,3.23],[-.28,2.98],[-.44,2.61],[-.51,2.15]],
 [[.13,3.42],[.025,3.19],[-.13,2.88],[-.26,2.61],[-.37,2.39]],
 [[.15,3.41],[.095,3.17],[.02,2.88],[-.07,2.65],[-.14,2.54]],
 [[.18,3.40],[.18,3.15],[.145,2.91],[.09,2.67],[.03,2.53]],
 [[.19,3.38],[.24,3.12],[.235,2.9],[.18,2.72],[.12,2.57]],
 [[.16,3.40],[.10,3.18],[-.035,2.90],[-.19,2.68],[-.29,2.51]]];
 for(let b=0;b<fringePaths.length;b++){
 const pts=fringePaths[b].map(([x,y])=>V(x,y,y>3.04?scalpFront(x,y)+.015:faceZ(x,y)+.028));const curve=new THREE.CatmullRomCurve3(pts,false,'catmullrom',.4);bangs.push(curve);
 const width=[.014,.010,.007,.006,.004,.005][b];solidLock(curve,width,.003,new THREE.Color('#29201e'),V(0,0,1),42);
 for(let k=0;k<48;k++){const c=new THREE.Color().setHSL(.025,.14,.09+rnd()*.06,THREE.SRGBColorSpace);filament(curve,.0004+rnd()*.0004,c,V(0,0,1),(rnd()-.5)*width*2.3,rnd()*TAU,40);}
 }
 // Side-swept hero strands help the front silhouette remain asymmetric and natural.
 for(const s of[-1,1])for(let i=0;i<42;i++){const o=(rnd()-.5)*.03;const curve=new THREE.CatmullRomCurve3([V(.07+o,3.48,.34),V(s*.29,3.29,.54),V(s*(.51+o),2.81,.47),V(s*(.49+o),2.35,.45),V(s*(.57+o),1.82,.39),V(s*(.61+o),1.11,.41)]);filament(curve,.0006+rnd()*.0008,new THREE.Color('#48332a'),V(s*.4,0,1).normalize(),o,0,42);}
 mesh(makeGeometry(hp,hi,hu,hc),hairmat,hairGroup,'Layered volumetric hair clumps');
 const fineHair=mesh(makeGeometry(sp,si,su,sc,sn),hairThin,hairGroup,'Individually swept fine hair strands');fineHair.castShadow=false;
 // A subtly visible scalp part: short, narrow and naturally interrupted by crossing roots.
 line(hairGroup,'Off-center scalp part',[[.105,3.519,-.25],[.108,3.546,-.09],[.107,3.548,.06],[.104,3.512,.23]],.0027,skinPlain,40,5);
 // Tailored blouse with a true V opening, radial shoulder construction and geometric wrinkles.
 const shirtRows=[[-.43,.80,.365],[-.22,.79,.377],[0,.76,.39],[.46,.79,.402],[.82,.86,.36],[1.03,.965,.294],[1.20,.74,.244],[1.43,.264,.205]];
 function shirtFront(x,y){const w=Math.max(.26,interp(shirtRows,y,1)),d=interp(shirtRows,y,2),u=clamp(x/w,-.999,.999);let z=d*Math.sqrt(Math.max(0,1-u*u));z+=.003*Math.sin(y*15+x*5)*g(x,.29);z+=.006*Math.sin(y*16+Math.abs(x)*11)*g(Math.abs(x)-.56,.23);z+=.003*Math.sin(y*31-x*6)*g(y-.55,.38);return z;}
 {
 const p=[],idx=[],uv=[];const ny=128,na=180;
 for(let j=0;j<=ny;j++){const y=mix(-.43,1.43,j/ny),w=interp(shirtRows,y,1),d=interp(shirtRows,y,2),open=y>.97?Math.min(.99,(y-.97)*.70/w):0;const a0=Math.asin(open);for(let i=0;i<=na;i++){const a=a0+(TAU-2*a0)*i/na,x=w*Math.sin(a),front=Math.cos(a)>0;let z=front?shirtFront(x,y):d*Math.cos(a);const xfold=.004*Math.sin(a*12+y*3)*g(y-.85,.4);p.push(x+xfold,y,z);uv.push(i/na,j/ny);if(j<ny&&i<na){const k=j*(na+1)+i;idx.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}}}
 mesh(makeGeometry(p,idx.map((_,i)=>idx[i-i%3+2-i%3]),uv),white,root,'Tailored white blouse with open neckline');
 }
 // Sleeves are tapered volumetric surfaces with soft elbow/arm folds, not cylinders.
 for(const s of[-1,1]){
 const p=[],idx=[],uv=[];const ny=85,na=64;
 const center=t=>V(s*(.735+.19*Math.sin(t*PI*.5)),mix(1.18,-.435,t),-.025+.012*Math.sin(t*PI));
 for(let j=0;j<=ny;j++){const t=j/ny,c=center(t),w=.238*(1-.19*t)*Math.min(1,.13+t*11),d=.265*(1-.19*t)*Math.min(1,.13+t*11);for(let i=0;i<=na;i++){const a=TAU*i/na;const fold=.010*Math.sin(17*t+5*a)*Math.pow(Math.sin(PI*t),2)+.010*g(t-.27,.17)*Math.sin(27*t+3*a);p.push(c.x+s*(w+fold)*Math.sin(a),c.y+.026*Math.sin(a),c.z+(d+fold)*Math.cos(a));uv.push(i/na,t);if(j<ny&&i<na){const k=j*(na+1)+i;if(s===1)idx.push(k,k+1,k+na+1,k+1,k+na+2,k+na+1);else idx.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}}}
 mesh(makeGeometry(p,idx.map((_,i)=>idx[i-i%3+2-i%3]),uv),white,root,'Sculpted long sleeve '+s);
 let seams=[];for(let i=0;i<=45;i++){const a=-PI*.4+PI*.8*i/45;seams.push([s*(.805+.232*Math.sin(a)),1.005+.026*Math.sin(a),-.025+.268*Math.cos(a)]);}line(root,'Shoulder seam '+s,seams,.0016,stitch,50,4);
 }
 // Folded collar wings are doubly curved, thickened patches, with a visible stitched outer edge.
 function collarPoint(s,u,v){const A=V(s*.236,1.458,.209),B=V(s*.515,1.122,.277),C=V(s*.365,.858,.438),D=V(s*.032,.993,.437);const top=A.clone().lerp(B,u),bottom=D.clone().lerp(C,u);const p=top.lerp(bottom,v);p.z+=.066*Math.sin(PI*u)*Math.sin(PI*v)+.039*Math.sin(PI*v)*(1-u);return p;}
 for(const s of[-1,1]){const p=[],idx=[],uv=[];const n=40,m=30;for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){const q=collarPoint(s,i/n,j/m);p.push(q.x,q.y,q.z);uv.push(i/n,j/m);if(j<m&&i<n){const k=j*(n+1)+i;if(s===1)idx.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);else idx.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}mesh(makeGeometry(p,idx,uv),white,root,'Folded collar wing '+s);const edge=[];for(let i=0;i<=24;i++)edge.push(collarPoint(s,i/24,1));line(root,'Collar rolled hem '+s,edge,.0023,white,28,5);const seam=[];for(let i=0;i<=24;i++)seam.push(collarPoint(s,i/24,.984).add(V(0,0,.001)));line(root,'Collar fine stitching '+s,seam,.0008,stitch,28,4);}
 // Raised central button placket follows the blouse surface all the way down the crop.
 const placketX=y=>.015+.018*Math.sin(y*2.1);
 {const p=[],idx=[],uv=[];const nx=16,ny=96;for(let j=0;j<=ny;j++){const y=mix(-.43,.99,j/ny),cx=placketX(y);for(let i=0;i<=nx;i++){const t=i/nx,x=cx+(t-.5)*.14;let z=shirtFront(x,y)+.009+.009*Math.sin(PI*t);p.push(x,y,z);uv.push(t,j/ny);if(j<ny&&i<nx){const k=j*(nx+1)+i;idx.push(k,k+1,k+nx+1,k+1,k+nx+2,k+nx+1);}}}mesh(makeGeometry(p,idx,uv),white,root,'Raised curved button placket');}
 for(const s of[-1,1]){let pts=[];for(let i=0;i<=70;i++){const y=mix(-.425,.97,i/70),x=placketX(y)+s*.066;pts.push([x,y,shirtFront(x,y)+.011]);}line(root,'Placket stitching '+s,pts,.0011,stitch,75,4);}
 for(const y of[.69,.24,-.23]){const x=placketX(y),z=shirtFront(x,y)+.030;ball(root,'Pearlescent shirt button',buttonMat,[x,y,z],[.030,.030,.009],36);const rim=mesh(new THREE.TorusGeometry(.024,.0021,7,36),buttonMat,root,'Raised button rim');rim.position.set(x,y,z+.0065);for(const dx of[-.006,.006])for(const dy of[-.006,.006])ball(root,'Button stitch hole',stitch,[x+dx,y+dy,z+.0092],[.0025,.0025,.0008],12);line(root,'Crossed button thread',[[x-.006,y-.006,z+.01],[x+.006,y+.006,z+.011]],.0009,white,2,4);}
 // Finish the lower crop with a closed, understated cut surface.
 const cap=mesh(new THREE.CylinderGeometry(.81,.81,.012,90,1,false),white,root,'Finished lower torso crop');cap.position.set(0,-.434,0);cap.scale.z=.456;
 root.userData={author:'GPT-6 Astra Pro',tools:'Three.js / WebGL / JavaScript / Headless Chrome',source:'All visual assets procedurally authored in src/model.js',seed:220901};


 for(const side of[-1,1]){const cap=mesh(new THREE.CircleGeometry(1,64),white,root,'Closed sleeve crop '+side);cap.rotation.x=PI/2;cap.position.set(side*.925,-.440,-.025);cap.scale.set(.193,.215,1);}
 function bakeAndWarp(o,hair=false,body=false){o.updateMatrix();o.geometry.applyMatrix4(o.matrix);o.position.set(0,0,0);o.quaternion.identity();o.scale.set(1,1,1);o.updateMatrix();const a=o.geometry.getAttribute('position');for(let i=0;i<a.count;i++){let x=a.getX(i),y=a.getY(i);if(body)y-=.12*(1-THREE.MathUtils.smoothstep(y,-.44,-.30));else y-=.07*(1-THREE.MathUtils.smoothstep(y,2.13,2.43));if(hair){x*=1.05;y+=.08*THREE.MathUtils.smoothstep(y,3.1,3.5);}a.setXY(i,x,y);}a.needsUpdate=true;o.geometry.computeVertexNormals();}
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
 return {root,hairGroup,originalMaterials,clayMat,stats:{fineHairStrands:strandCount+372+scalpFibers+frontGuides.length*(mobile?12:24),solidHairLocks:122+frontGuides.length+bangs.length,seed:220901},setClay(on){root.traverse(o=>{if(o.isMesh)o.material=on?clayMat:originalMaterials.get(o);});},setWire(on){const mats=new Set();root.traverse(o=>{if(o.isMesh)mats.add(o.material);});for(const m of mats)m.wireframe=on;}};
}
