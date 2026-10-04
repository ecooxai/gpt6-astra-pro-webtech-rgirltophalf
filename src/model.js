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
function interp(rows,y,k){let i=0;while(i<rows.length-2&&y>rows[i+1][0])i++;let t=clamp((y-rows[i][0])/(rows[i+1][0]-rows[i][0]),0,1);let p0=rows[Math.max(0,i-1)][k],p1=rows[i][k],p2=rows[i+1][k],p3=rows[Math.min(rows.length-1,i+2)][k];return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t);}
function makeGeometry(p,idx,uv,c,n){const b=new THREE.BufferGeometry();b.setAttribute('position',new THREE.Float32BufferAttribute(p,3));b.setIndex(idx);if(uv)b.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));if(c)b.setAttribute('color',new THREE.Float32BufferAttribute(c,3));if(n)b.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));else b.computeVertexNormals();return b;}
function mesh(geo,mat,parent,name){const o=new THREE.Mesh(geo,mat);o.name=name||'Original procedural surface';parent.add(o);o.castShadow=true;o.receiveShadow=true;return o;}
function ball(parent,name,mat,xyz,scale,segments=40){const o=mesh(new THREE.SphereGeometry(1,segments,Math.floor(segments*.7)),mat,parent,name);o.position.set(...xyz);o.scale.set(...scale);return o;}
function line(parent,name,points,r,mat,seg=35,rad=5){const curve=new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?V(...p):p));return mesh(new THREE.TubeGeometry(curve,seg,r,rad,false),mat,parent,name);}
function noiseTexture(size=256){const data=new Uint8Array(size*size*4);for(let i=0;i<size*size;i++){const v=115+Math.floor(rnd()*40);data[i*4]=v;data[i*4+1]=v;data[i*4+2]=v;data[i*4+3]=255;}const t=new THREE.DataTexture(data,size,size);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(12,12);t.needsUpdate=true;return t;}
function irisTexture(){const size=256,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const dx=(x-size/2)/(size/2),dy=(y-size/2)/(size/2),r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);const fibers=Math.sin(a*153+Math.sin(r*20)*2.5)*.12+Math.sin(a*279-r*48)*.09+Math.sin(a*67+r*39)*.1;const edge=1-.66*Math.pow(clamp((r-.70)/.29,0,1),2);const ring=1+.17*Math.sin(r*34+a*7);const f=edge*ring*(1+fibers)*(1-.24*g(r-.44,.12));const i=(y*size+x)*4;data[i]=clamp(88*f,0,255);data[i+1]=clamp(47*f,0,255);data[i+2]=clamp(29*f,0,255);data[i+3]=255;}const t=new THREE.DataTexture(data,size,size);t.colorSpace=THREE.SRGBColorSpace;t.needsUpdate=true;return t;}
const faceRows=[
 [1.66,.008,.245,.015],[1.73,.16,.35,.17],[1.84,.282,.398,.29],[2.01,.405,.414,.40],[2.19,.492,.419,.47],[2.39,.547,.43,.508],[2.58,.549,.428,.532],[2.80,.547,.454,.531],[3.02,.539,.466,.512],[3.23,.464,.412,.448],[3.39,.285,.265,.296],[3.47,.004,.025,.02]
];
export function faceZ(x,y){const w=Math.max(.008,interp(faceRows,y,1)),d=interp(faceRows,y,2),u=clamp(x/w,-.9999,.9999);let z=d*Math.pow(Math.sqrt(Math.max(0,1-u*u)),.63);z+=.030*g(Math.abs(x)-.34,.115)*g(y-2.36,.16);z-=.037*g(Math.abs(x)-.233,.155)*g(y-2.595,.093);z+=.012*g(Math.abs(x)-.22,.17)*g(y-2.77,.065);z+=.088*g(x,.061)*g(y-2.54,.23);z+=.178*g(x,.077)*g(y-2.325,.080);z+=.052*g(Math.abs(x)-.075,.040)*g(y-2.285,.055);z-=.009*g(x,.018)*g(y-2.157,.066);z+=.007*g(Math.abs(x)-.03,.013)*g(y-2.155,.06);z+=.009*g(x,.20)*g(y-2.068,.10);z-=.01*g(x,.11)*g(y-1.97,.035);z+=.01*g(x,.19)*g(y-1.83,.06);return z;}
function skinColor(x,y,front){const base=new THREE.Color('#efc2ad');let blush=(g(Math.abs(x)-.36,.13)*g(y-2.37,.12)*.36+g(x,.115)*g(y-2.29,.09)*.16)*front;base.lerp(new THREE.Color('#d88d89'),blush);const under=g(Math.abs(x)-.23,.16)*g(y-2.535,.035)*front*.12;base.lerp(new THREE.Color('#bc8988'),under);const lids=g(Math.abs(x)-.23,.18)*g(y-2.675,.025)*front*.12;base.lerp(new THREE.Color('#bd8b7a'),lids);const light=g(x+.28,.24)*g(y-2.35,.30)*front*.075;base.lerp(new THREE.Color('#ffe1c7'),light);const grain=(rnd()-.5)*.003;base.r+=grain;base.g+=grain;base.b+=grain;return base;}
export function buildPortrait({mobile=false}={}){
 seed=220901;
 const root=new THREE.Group();root.name='GPT-6 Astra Pro — original WebGL upper-body portrait';
 const pivot=new THREE.Group();pivot.name='Natural head tilt';pivot.position.y=2.46;root.add(pivot);
 const head=new THREE.Group();head.position.y=-2.46;pivot.add(head);pivot.rotation.z=-.095;pivot.rotation.y=-.025;
 const hairGroup=new THREE.Group();hairGroup.name='Original dimensional strand hair';head.add(hairGroup);
 const pore=noiseTexture();
 const skin=new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.48,metalness:0,specularIntensity:.30,specularColor:new THREE.Color('#fff1e4'),sheen:.15,sheenRoughness:.8,sheenColor:new THREE.Color('#e5a387'),bumpMap:pore,bumpScale:.00055});
 const skinPlain=skin.clone();skinPlain.vertexColors=false;skinPlain.color.set('#edbfa9');
 const innerEar=new THREE.MeshStandardMaterial({color:'#c98c7a',roughness:.63});
 const dark=new THREE.MeshStandardMaterial({color:'#4e2521',roughness:.85});
 const hairmat=new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.36,metalness:0,specularIntensity:.45,sheen:.45,sheenColor:new THREE.Color('#5b4033'),sheenRoughness:.48});
 const haircapmat=new THREE.MeshPhysicalMaterial({color:'#241917',roughness:.40,specularIntensity:.35,sheen:.35,sheenColor:new THREE.Color('#4c3630')});
 const hairThin=new THREE.MeshPhysicalMaterial({color:0xffffff,vertexColors:true,roughness:.40,specularIntensity:.48,sheen:.5,sheenRoughness:.35,sheenColor:new THREE.Color('#856552'),side:THREE.DoubleSide});
 const browMat=new THREE.MeshStandardMaterial({color:'#44302a',roughness:.79});
 const browBase=new THREE.MeshStandardMaterial({color:'#957064',roughness:.9});
 const lashMat=new THREE.MeshStandardMaterial({color:'#39241f',roughness:.63});
 const white=new THREE.MeshPhysicalMaterial({color:'#ecebf1',roughness:.66,sheen:.7,sheenColor:new THREE.Color('#fffaf4'),sheenRoughness:.84,bumpMap:pore,bumpScale:.00032,side:THREE.DoubleSide});
 const stitch=new THREE.MeshStandardMaterial({color:'#cccbd4',roughness:.92});
 const buttonMat=new THREE.MeshPhysicalMaterial({color:'#f4eee1',roughness:.29,specularIntensity:.5});
 // One continuous closed head; cheek, orbital socket, nose, philtrum and chin relief share its topology.
 {
  const p=[],idx=[],uv=[],col=[];const ny=190,na=224;
  for(let j=0;j<=ny;j++){const y=mix(1.66,3.47,j/ny),w=Math.max(.001,interp(faceRows,y,1)),back=interp(faceRows,y,3);for(let i=0;i<=na;i++){const a=-PI+TAU*i/na,x=w*Math.sin(a),front=Math.cos(a)>0;const z=front?faceZ(x,y):-back*Math.pow(-Math.cos(a),.85);p.push(x,y,z);uv.push(i/na,j/ny);const c=skinColor(x,y,front?Math.pow(Math.cos(a),2):0);col.push(c.r,c.g,c.b);if(j<ny&&i<na){const k=j*(na+1)+i;idx.push(k,k+1,k+na+1,k+1,k+na+2,k+na+1);}}}
  mesh(makeGeometry(p,idx,uv,col),skin,head,'Continuous sculpted face and cranium');
 }
 // Neck and upper sternum taper into the blouse, not a floating head.
 {
  const rows=[[.81,.34,.235],[1.05,.37,.25],[1.30,.282,.236],[1.58,.205,.207],[1.91,.214,.214]];const p=[],idx=[],uv=[];const ny=64,na=80;
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
 const eyeY=2.599,eyeX=.235,eyeW=.146;
 const eyeEdge=(s,t,upper)=>{const x=s*eyeX+eyeW*t;const tilt=s*t*.009;const y=eyeY+tilt+(upper?.066:-.043)*Math.pow(Math.max(0,1-t*t),.72);const z=faceZ(x,y)+.015+.016*(1-t*t);return V(x,y,z);};
 const sclera=new THREE.MeshPhysicalMaterial({color:'#ede0d6',roughness:.19,specularIntensity:.55});
 const rimMat=new THREE.MeshPhysicalMaterial({color:'#c8897a',roughness:.36,specularIntensity:.32});
 const irisMat=new THREE.MeshPhysicalMaterial({map:irisTexture(),roughness:.2,specularIntensity:.52});
 const pupilMat=new THREE.MeshPhysicalMaterial({color:'#130f10',roughness:.08,specularIntensity:.65});
 const creaseMat=new THREE.MeshStandardMaterial({color:'#c29481',roughness:.95});
 for(const s of[-1,1]){
  // Almond-shaped sclera is a curved surface, with dimensional skin margins (no floating white spheres).
  const p=[],idx=[],uv=[];const nx=70,ny=20;
  for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){const t=-1+2*i/nx,v=j/ny,lo=eyeEdge(s,t,false),hi=eyeEdge(s,t,true),x=lo.x,y=mix(lo.y,hi.y,v),z=mix(lo.z,hi.z,v)+.018*Math.sin(PI*v)*(1-t*t);p.push(x,y,z);uv.push(i/nx,v);if(j<ny&&i<nx){const k=j*(nx+1)+i;idx.push(k,k+1,k+nx+1,k+1,k+nx+2,k+nx+1);}}
  mesh(makeGeometry(p,idx,uv),sclera,head,'Curved almond sclera '+s);
  const ix=s*eyeX-.002,iy=eyeY+.001,iz=faceZ(ix,iy)+.047;
  // Convex radial iris with an individually synthesized radial-fiber texture.
  const ip=[ix,iy,iz+.003],iu=[.5,.5],ii=[];const nr=14,na=96,ir=.056;
  for(let r=1;r<=nr;r++)for(let a=0;a<=na;a++){const rr=ir*r/nr,an=TAU*a/na;ip.push(ix+rr*Math.cos(an),iy+rr*Math.sin(an),iz+.003-.012*Math.pow(r/nr,2));iu.push(.5+.5*r/nr*Math.cos(an),.5+.5*r/nr*Math.sin(an));}
  for(let a=0;a<na;a++)ii.push(0,1+a,2+a);
  for(let r=1;r<nr;r++)for(let a=0;a<na;a++){const k=1+(r-1)*(na+1)+a;ii.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}
  mesh(makeGeometry(ip,ii,iu),irisMat,head,'Brown radial iris '+s);
  ball(head,'Pupil '+s,pupilMat,[ix,iy,iz+.005],[.024,.024,.004],40);
  const wet=new THREE.MeshPhysicalMaterial({color:'#ffffff',transparent:true,opacity:.11,roughness:.055,clearcoat:1,clearcoatRoughness:.025,depthWrite:false});
  ball(head,'Clear corneal lens '+s,wet,[ix,iy,iz+.004],[.057,.057,.007],48);
  const catchMat=new THREE.MeshBasicMaterial({color:'#fff7ed'});
  ball(head,'Softbox catchlight '+s,catchMat,[ix-.017,iy+.024,iz+.011],[.009,.013,.0025],24);
  ball(head,'Secondary eye glint '+s,catchMat,[ix+.014,iy-.013,iz+.010],[.0025,.0035,.0012],16);
  for(const upper of[true,false]){
   const pp=[],ind=[],uu=[],cc=[];const n=80,m=8;
   for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){const t=-1+2*i/n,v=j/m,e=eyeEdge(s,t,upper);const fade=Math.pow(Math.max(0,1-t*t),.32);const y=e.y+(upper?1:-1)*v*(upper?.051:.036)*fade,x=e.x;const z=mix(e.z,faceZ(x,y)+.002,v)+.006*Math.sin(PI*v);pp.push(x,y,z);uu.push(i/n,j/m);const c=skinColor(x,y,1);if(j<2)c.lerp(new THREE.Color('#d09887'),.18);cc.push(c.r,c.g,c.b);if(j<m&&i<n){const k=j*(n+1)+i;ind.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}
   const gm=makeGeometry(pp,ind,uu,cc);if(upper===false){gm.setIndex(ind.flatMap((_,i)=>[]));gm.setIndex(ind.map((_,i)=>ind[i-i%3+(2-i%3)]));gm.computeVertexNormals();}
   mesh(gm,skin,head,(upper?'Upper':'Lower')+' sculpted eyelid '+s);
   let edgePts=[];for(let i=0;i<=55;i++){const t=-.99+1.98*i/55,e=eyeEdge(s,t,upper);e.z+=.0015;edgePts.push(e);}line(head,'Wet eyelid margin '+s+' '+upper,edgePts,upper?.0024:.0019,upper?lashMat:rimMat,60,5);
  }
  let fold=[];for(let i=0;i<=45;i++){const t=-.94+1.88*i/45,e=eyeEdge(s,t,true);e.y+=.027*Math.pow(1-t*t,.4);e.z=faceZ(e.x,e.y)+.006;fold.push(e);}line(head,'Soft upper eyelid crease '+s,fold,.0015,creaseMat,50,4);
  for(let i=0;i<32;i++){const t=-.95+1.9*(i+.2*rnd())/32,e=eyeEdge(s,t,true);e.z+=.003;const L=.016+.018*Math.pow((s*t+1)/2,1.5);line(head,'Upper eyelash '+s+' '+i,[e,e.clone().add(V(s*.004,L*.42,.014)),e.clone().add(V(s*(.007+.006*rnd()),L,.023))],.0009+(.0004*rnd()),lashMat,7,4);}
  for(let i=0;i<14;i++){const t=-.78+1.63*i/14,e=eyeEdge(s,t,false);line(head,'Fine lower eyelash '+s+' '+i,[e,e.clone().add(V(s*.003,-.008,.008)),e.clone().add(V(s*.006,-.012-.004*rnd(),.010))],.00048,lashMat,5,3);}
  // Small tear duct integrated at the nasal corner.
  const inner=eyeEdge(s,-s*.965,false);ball(head,'Lacrimal corner '+s,rimMat,[inner.x,inner.y+.006,inner.z],[.011,.01,.005],20);
  // Eyebrow base is subdued; individual growing hairs define its upper silhouette.
  let browPts=[];for(let i=0;i<=30;i++){let t=i/30,x=s*(.098+.307*t),y=2.768+.039*Math.sin(PI*t*.92)-.026*t;browPts.push([x,y,faceZ(x,y)+.004]);}
  line(head,'Soft brow foundation '+s,browPts,.009,browBase,40,5);
  for(let i=0;i<128;i++){let t=(i+rnd())/128,x=s*(.10+.303*t),y=2.765+.038*Math.sin(PI*t*.92)-.026*t+(rnd()-.5)*.023,zz=faceZ(x,y)+.013;let l=.019*(1-.7*t)+rnd()*.011;line(head,'Brow hair '+s+' '+i,[[x,y,zz],[x+s*.006,y+l*.66,zz+.001],[x+s*(.007+t*.013),y+l,faceZ(x+s*.01,y+l)+.012]],.0007+(.00035*rnd()),browMat,5,3);}
 }
 // Nostrils are inset underneath the continuous nasal wings, not black holes on the bridge.
 for(const s of[-1,1]){const n=ball(head,'Recessed nostril '+s,dark,[s*.065,2.275,faceZ(s*.065,2.275)+.0005],[.020,.009,.0045],28);n.rotation.z=s*.19;n.rotation.x=.65;}
 // Closed neutral mouth: separate upper/lower vermilion meshes with a real curved seam.
 const lipUpper=new THREE.MeshPhysicalMaterial({color:'#be7b78',roughness:.43,specularIntensity:.28,bumpMap:pore,bumpScale:.00028});
 const lipLower=new THREE.MeshPhysicalMaterial({color:'#d58c85',roughness:.34,specularIntensity:.4,bumpMap:pore,bumpScale:.00035});
 const lipLine=new THREE.MeshStandardMaterial({color:'#784342',roughness:.83});
 const seamY=t=>2.064-.007*(1-t*t)+.003*Math.cos(t*PI);
 for(const upper of[true,false]){const p=[],idx=[],uv=[];const n=100,m=16;for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){const t=-1+2*i/n,v=j/m,x=.169*t,ys=seamY(t);let edge=upper?ys+(.027+.015*g(Math.abs(t)-.32,.19))*Math.pow(Math.max(0,1-t*t),.75):ys-.040*Math.pow(Math.max(0,1-t*t),.78);const y=mix(ys,edge,v),z=faceZ(x,y)+.002+(.020*(1-v)+.019*Math.sin(PI*v))*Math.pow(Math.max(0,1-t*t),.55);p.push(x,y,z);uv.push(i/n,j/m);if(j<m&&i<n){const k=j*(n+1)+i;if(upper)idx.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);else idx.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);}}mesh(makeGeometry(p,idx,uv),upper?lipUpper:lipLower,head,(upper?'Upper':'Lower')+' shaped lip');}
 let seam=[];for(let i=0;i<=60;i++){const t=-1+2*i/60,x=.169*t,y=seamY(t);seam.push([x,y,faceZ(x,y)+.003+.020*Math.pow(Math.max(0,1-t*t),.55)]);}line(head,'Delicate closed mouth line',seam,.0016,lipLine,70,5);
 // Scalp undercoat is closed at the crown and follows an anatomical hairline.
 {
 const p=[],idx=[],uv=[];const nr=65,na=150;
 for(let j=0;j<=nr;j++)for(let i=0;i<=na;i++){const a=-PI+TAU*i/na,front=Math.max(0,Math.cos(a)),maxPolar=2.20-.98*Math.pow(front,3),polar=.005+(maxPolar-.005)*j/nr;const x=.60*Math.sin(polar)*Math.sin(a)+.018,z=.565*Math.sin(polar)*Math.cos(a)-.007,y=2.72+.825*Math.cos(polar);p.push(x,y,z);uv.push(i/na,j/nr);if(j<nr&&i<na){const k=j*(na+1)+i;idx.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}}
 mesh(makeGeometry(p,idx,uv),haircapmat,hairGroup,'Hairline and closed scalp undercoat');
 }
 // Coherent clump guides run from an off-center part, over the skull, around the shoulders and into curled tips.
 function guide(a,jitter=0,phase=0){const s=Math.sin(a),c=Math.cos(a),fr=Math.max(c,0);const end=-.63+.30*Math.pow(Math.abs(c),2)+jitter*.15;
 return new THREE.CatmullRomCurve3([
 V(.105+jitter*.008,3.515-.11*Math.pow(c,2),.34*c),
 V(.40*s+.045,3.365-.03*c,.465*c),
 V(.607*s+.014,2.97-.055*c,.563*c),
 V(.655*s,2.42,.563*c),
 V((.67+.022*Math.sin(phase))*s,1.79,.55*c+.035*fr),
 V((.73+.028*Math.sin(phase+1))*s,1.10,.535*c+.10*fr),
 V((.855+.045*Math.sin(phase))*s,.38,.57*c+.15*fr),
 V((.88+.065*Math.sin(phase+1.5))*s,-.12,.53*c+.14*fr),
 V((.71+.055*Math.sin(phase+2))*s,end,.48*c+.09*fr)
 ],false,'catmullrom',.35);}
 const hp=[],hi=[],hu=[],hc=[];
 function solidLock(curve,width,thick,color,radial,segments=48){const base=hp.length/3,around=7;for(let j=0;j<=segments;j++){const t=j/segments,p=curve.getPoint(t),tan=curve.getTangent(t).normalize();const no=radial.clone().add(V(0,.12*(1-t),0)).normalize();const side=tan.clone().cross(no).normalize();const normal=side.clone().cross(tan).normalize();let taper=Math.pow(Math.max(.001,Math.sin(PI*.5*(1-t))),.7)*(.56+.44*Math.min(1,t*9));for(let i=0;i<=around;i++){let a=TAU*i/around;const pp=p.clone().addScaledVector(side,Math.cos(a)*width*taper).addScaledVector(normal,Math.sin(a)*thick*taper);hp.push(pp.x,pp.y,pp.z);hu.push(i/around,t);hc.push(color.r,color.g,color.b);if(j<segments&&i<around){const k=base+j*(around+1)+i;hi.push(k,k+around+1,k+1,k+1,k+around+1,k+around+2);}}}}
 for(let i=0;i<122;i++){const a=.91+(TAU-1.82)*(i+.5)/122,phase=rnd()*TAU,col=new THREE.Color().setHSL(.045+rnd()*.018,.16+rnd()*.12,.057+rnd()*.025);solidLock(guide(a,rnd()*2-1,phase),.043+rnd()*.016,.021+rnd()*.009,col,V(Math.sin(a),0,Math.cos(a)),46);}
 mesh(makeGeometry(hp,hi,hu,hc),hairmat,hairGroup,'Layered volumetric hair clumps');
 const sp=[],si=[],su=[],sc=[],sn=[];
 function filament(curve,width,col,radial,offset=0,phase=0,segments=40){const base=sp.length/3;for(let j=0;j<=segments;j++){const t=j/segments,p=curve.getPoint(t),tan=curve.getTangent(t).normalize();const side=tan.clone().cross(radial).normalize(),normal=side.clone().cross(tan).normalize();const taper=Math.pow(Math.max(.008,1-t),.45),off=offset*(.55+.45*Math.sin(PI*t))+.0025*Math.sin(t*18+phase);p.addScaledVector(side,off);p.addScaledVector(normal,.022+.0018*Math.sin(t*37+phase));for(let k=0;k<2;k++){const pp=p.clone().addScaledVector(side,(k?1:-1)*width*taper);sp.push(pp.x,pp.y,pp.z);su.push(k,t);sc.push(col.r,col.g,col.b);sn.push(normal.x,normal.y,normal.z);}if(j<segments){const k=base+j*2;si.push(k,k+1,k+2,k+1,k+3,k+2);}}}
 const strandCount=mobile?2050:3900;
 for(let i=0;i<strandCount;i++){const a=.90+(TAU-1.80)*rnd(),phase=rnd()*TAU;const color=new THREE.Color().setHSL(.047+rnd()*.025,.12+rnd()*.20,.065+rnd()*.065);filament(guide(a,rnd()*2-1,phase),.00075+rnd()*.00105,color,V(Math.sin(a),.03,Math.cos(a)).normalize(),(rnd()-.5)*.068,phase,40);}
 // Sparse fringes are individual tapered locks; the forehead remains visible between wisps.
 const bangs=[];
 for(let i=0;i<12;i++){const t=i/11,rx=.13-.08*t,tx=mix(-.48,.13,t),ty=2.52+.37*t+.06*Math.sin(t*7);const curve=new THREE.CatmullRomCurve3([V(rx,3.47,.34),V(.06-.11*t,3.28,.541),V(mix(-.23,.10,t),3.025,.571),V(mix(-.38,.12,t),2.79+.17*t,.544),V(tx,ty,.47+.026*t)],false,'catmullrom',.42);bangs.push(curve);}
 for(let b=0;b<bangs.length;b++){const curve=bangs[b];for(let k=0;k<32;k++){const c=new THREE.Color().setHSL(.047+rnd()*.012,.18,.08+rnd()*.06);filament(curve,.00058+rnd()*.00065,c,V(0,0,1),(rnd()-.5)*(.025+(b<3?.022:0)),rnd()*TAU,30);}}
 // Side-swept hero strands help the front silhouette remain asymmetric and natural.
 for(const s of[-1,1])for(let i=0;i<42;i++){const o=(rnd()-.5)*.03;const curve=new THREE.CatmullRomCurve3([V(.07+o,3.48,.34),V(s*.29,3.29,.54),V(s*(.51+o),2.81,.47),V(s*(.49+o),2.35,.45),V(s*(.57+o),1.82,.39),V(s*(.61+o),1.11,.41)]);filament(curve,.0006+rnd()*.0008,new THREE.Color('#48332a'),V(s*.4,0,1).normalize(),o,0,42);}
 mesh(makeGeometry(sp,si,su,sc,sn),hairThin,hairGroup,'Individually swept fine hair strands');
 // A subtly visible scalp part: short, narrow and naturally interrupted by crossing roots.
 line(hairGroup,'Off-center scalp part',[[.105,3.519,-.25],[.108,3.546,-.09],[.107,3.548,.06],[.104,3.512,.23]],.0027,skinPlain,40,5);
 // Tailored blouse with a true V opening, radial shoulder construction and geometric wrinkles.
 const shirtRows=[[-1.08,.81,.31],[-.6,.78,.35],[0,.76,.39],[.46,.79,.402],[.82,.86,.36],[1.03,.965,.294],[1.20,.74,.244],[1.43,.264,.205]];
 function shirtFront(x,y){const w=Math.max(.26,interp(shirtRows,y,1)),d=interp(shirtRows,y,2),u=clamp(x/w,-.999,.999);let z=d*Math.sqrt(Math.max(0,1-u*u));z+=.010*Math.sin(y*15+x*5)*g(x,.29);z+=.014*Math.sin(y*16+Math.abs(x)*11)*g(Math.abs(x)-.56,.23);z+=.008*Math.sin(y*31-x*6)*g(y-.55,.38);return z;}
 {
 const p=[],idx=[],uv=[];const ny=128,na=180;
 for(let j=0;j<=ny;j++){const y=mix(-1.08,1.43,j/ny),w=interp(shirtRows,y,1),d=interp(shirtRows,y,2),open=y>.85?Math.min(.99,(y-.85)*.60/w):0;const a0=Math.asin(open);for(let i=0;i<=na;i++){const a=a0+(TAU-2*a0)*i/na,x=w*Math.sin(a),front=Math.cos(a)>0;let z=front?shirtFront(x,y):d*Math.cos(a);const xfold=.004*Math.sin(a*12+y*3)*g(y-.85,.4);p.push(x+xfold,y,z);uv.push(i/na,j/ny);if(j<ny&&i<na){const k=j*(na+1)+i;idx.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}}}
 mesh(makeGeometry(p,idx.map((_,i)=>idx[i-i%3+2-i%3]),uv),white,root,'Tailored white blouse with open neckline');
 }
 // Sleeves are tapered volumetric surfaces with soft elbow/arm folds, not cylinders.
 for(const s of[-1,1]){
 const p=[],idx=[],uv=[];const ny=85,na=64;
 const center=t=>V(s*(.805+.255*Math.sin(t*PI*.5)),mix(1.005,-1.07,t),-.025+.012*Math.sin(t*PI));
 for(let j=0;j<=ny;j++){const t=j/ny,c=center(t),w=.238*(1-.30*t),d=.265*(1-.26*t);for(let i=0;i<=na;i++){const a=TAU*i/na;const fold=.010*Math.sin(17*t+5*a)*Math.pow(Math.sin(PI*t),2)+.010*g(t-.27,.17)*Math.sin(27*t+3*a);p.push(c.x+s*(w+fold)*Math.sin(a),c.y+.026*Math.sin(a),c.z+(d+fold)*Math.cos(a));uv.push(i/na,t);if(j<ny&&i<na){const k=j*(na+1)+i;if(s===1)idx.push(k,k+1,k+na+1,k+1,k+na+2,k+na+1);else idx.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}}}
 mesh(makeGeometry(p,idx.map((_,i)=>idx[i-i%3+2-i%3]),uv),white,root,'Sculpted long sleeve '+s);
 let seams=[];for(let i=0;i<=45;i++){const a=-PI*.4+PI*.8*i/45;seams.push([s*(.805+.232*Math.sin(a)),1.005+.026*Math.sin(a),-.025+.268*Math.cos(a)]);}line(root,'Shoulder seam '+s,seams,.0016,stitch,50,4);
 }
 // Folded collar wings are doubly curved, thickened patches, with a visible stitched outer edge.
 function collarPoint(s,u,v){const A=V(s*.236,1.458,.209),B=V(s*.515,1.122,.277),C=V(s*.361,.763,.438),D=V(s*.032,.871,.437);const top=A.clone().lerp(B,u),bottom=D.clone().lerp(C,u);const p=top.lerp(bottom,v);p.z+=.066*Math.sin(PI*u)*Math.sin(PI*v)+.039*Math.sin(PI*v)*(1-u);return p;}
 for(const s of[-1,1]){const p=[],idx=[],uv=[];const n=40,m=30;for(let j=0;j<=m;j++)for(let i=0;i<=n;i++){const q=collarPoint(s,i/n,j/m);p.push(q.x,q.y,q.z);uv.push(i/n,j/m);if(j<m&&i<n){const k=j*(n+1)+i;if(s===1)idx.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);else idx.push(k,k+1,k+n+1,k+1,k+n+2,k+n+1);}}mesh(makeGeometry(p,idx,uv),white,root,'Folded collar wing '+s);const edge=[];for(let i=0;i<=24;i++)edge.push(collarPoint(s,i/24,1));line(root,'Collar rolled hem '+s,edge,.0023,white,28,5);const seam=[];for(let i=0;i<=24;i++)seam.push(collarPoint(s,i/24,.984).add(V(0,0,.001)));line(root,'Collar fine stitching '+s,seam,.0008,stitch,28,4);}
 // Raised central button placket follows the blouse surface all the way down the crop.
 const placketX=y=>.015+.018*Math.sin(y*2.1);
 {const p=[],idx=[],uv=[];const nx=16,ny=96;for(let j=0;j<=ny;j++){const y=mix(-1.08,.88,j/ny),cx=placketX(y);for(let i=0;i<=nx;i++){const t=i/nx,x=cx+(t-.5)*.14;let z=shirtFront(x,y)+.009+.009*Math.sin(PI*t);p.push(x,y,z);uv.push(t,j/ny);if(j<ny&&i<nx){const k=j*(nx+1)+i;idx.push(k,k+1,k+nx+1,k+1,k+nx+2,k+nx+1);}}}mesh(makeGeometry(p,idx,uv),white,root,'Raised curved button placket');}
 for(const s of[-1,1]){let pts=[];for(let i=0;i<=70;i++){const y=mix(-1.07,.865,i/70),x=placketX(y)+s*.066;pts.push([x,y,shirtFront(x,y)+.011]);}line(root,'Placket stitching '+s,pts,.0011,stitch,75,4);}
 for(const y of[.63,.17,-.30,-.77]){const x=placketX(y),z=shirtFront(x,y)+.030;ball(root,'Pearlescent shirt button',buttonMat,[x,y,z],[.030,.030,.009],36);const rim=mesh(new THREE.TorusGeometry(.024,.0021,7,36),buttonMat,root,'Raised button rim');rim.position.set(x,y,z+.0065);for(const dx of[-.006,.006])for(const dy of[-.006,.006])ball(root,'Button stitch hole',stitch,[x+dx,y+dy,z+.0092],[.0025,.0025,.0008],12);line(root,'Crossed button thread',[[x-.006,y-.006,z+.01],[x+.006,y+.006,z+.011]],.0009,white,2,4);}
 // Finish the lower crop with a closed, understated cut surface.
 const cap=mesh(new THREE.CylinderGeometry(.81,.81,.012,90,1,false),white,root,'Finished lower torso crop');cap.position.set(0,-1.084,0);cap.scale.z=.39;
 root.userData={author:'GPT-6 Astra Pro',tools:'Three.js / WebGL / JavaScript / Headless Chrome',source:'All visual assets procedurally authored in src/model.js',seed:220901};

 // Consolidate meshes by material inside each transform/layer group to keep mobile draw calls low.
 for(const parent of [head,hairGroup,root]){
  const batches=new Map();
  for(const o of [...parent.children])if(o.isMesh){const key=o.material.uuid+'_'+Object.keys(o.geometry.attributes).sort().join(',');if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);}
  for(const batch of batches.values())if(batch.length>1){const gs=batch.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix);});const geo=mergeGeometries(gs,false);if(geo){const joined=mesh(geo,batch[0].material,parent,'Batched original surfaces — '+batch[0].name);joined.userData.components=batch.map(o=>o.name);for(const o of batch){parent.remove(o);o.geometry.dispose();}}for(const geo of gs)geo.dispose();}
 }
 const originalMaterials=new Map();root.traverse(o=>{if(o.isMesh)originalMaterials.set(o,o.material);});
 const clayMat=new THREE.MeshStandardMaterial({color:'#bda18d',roughness:.85,side:THREE.DoubleSide});
 return {root,hairGroup,originalMaterials,clayMat,stats:{fineHairStrands:strandCount+468,solidHairLocks:122,seed:220901},setClay(on){root.traverse(o=>{if(o.isMesh)o.material=on?clayMat:originalMaterials.get(o);});},setWire(on){const mats=new Set();root.traverse(o=>{if(o.isMesh)mats.add(o.material);});for(const m of mats)m.wireframe=on;}};
}
