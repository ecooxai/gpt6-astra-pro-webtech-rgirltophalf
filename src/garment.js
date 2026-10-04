/** Original tailored blouse. All panels, folds, weave, stitches and buttons are procedural. */
import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
const PI=Math.PI,TAU=2*PI,V=(x,y,z)=>new THREE.Vector3(x,y,z),mix=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp;
const G=(x,s)=>Math.exp(-x*x/(s*s));
function sample(rows,y,k){let i=0;while(i<rows.length-2&&y>rows[i+1][0])i++;const a=rows[Math.max(0,i-1)],b=rows[i],c=rows[i+1],d=rows[Math.min(rows.length-1,i+2)],h=c[0]-b[0],t=clamp((y-b[0])/h,0,1),m0=(c[k]-a[k])/(c[0]-a[0]),m1=(d[k]-b[k])/(d[0]-b[0]);return(2*t*t*t-3*t*t+1)*b[k]+(t*t*t-2*t*t+t)*h*m0+(-2*t*t*t+3*t*t)*c[k]+(t*t*t-t*t)*h*m1;}
function geo(p,idx,uv){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;}
function add(parent,geometry,material,name){const o=new THREE.Mesh(geometry,material);o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;}
function tube(parent,points,r,mat,name){return add(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),Math.max(8,points.length*2),r,5,false),mat,name);}
function weave(){const n=256,d=new Uint8Array(n*n*4);for(let y=0;y<n;y++)for(let x=0;x<n;x++){
 const u=x%8,v=y%8,over=((x>>3)+(y>>3))%2===0,a=Math.pow(Math.max(0,Math.sin(PI*(u+.5)/8)),.6),b=Math.pow(Math.max(0,Math.sin(PI*(v+.5)/8)),.6),value=.35+.25*(over?a:b)+.06*(over?b:a),i=(y*n+x)*4;d[i]=d[i+1]=d[i+2]=Math.round(value*255);d[i+3]=255;
 }const t=new THREE.DataTexture(d,n,n);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(22,22);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.needsUpdate=true;return t;}
const rows=[[-.55,.79,.369],[-.25,.79,.384],[0,.79,.405],[.34,.805,.423],[.68,.835,.404],[.88,.87,.360],[1.045,.883,.306],[1.17,.73,.258],[1.30,.49,.221],[1.45,.267,.205]];
const placketX=y=>-.048-.120*y+.080*y*y-.045*THREE.MathUtils.smoothstep(y,.64,.88);
function front(x,y){const w=sample(rows,y,1),d=sample(rows,y,2),u=clamp(x/w,-.99999,.99999),center=placketX(y),dx=x-center;
 let z=d*Math.pow(1-u*u,.52);
 z+=.016*G(Math.abs(x)-.31,.22)*G(y-.38,.43);
 z+=.009*Math.sin(y*21+Math.abs(dx)*13)*G(Math.abs(dx)-.12,.15)*G(y-.2,.8);
 z+=.010*Math.sin(x*18+y*5)*G(Math.abs(x)-.53,.20)*G(y-.15,.65);
 for(const s of[-1,1])z-=.013*G(x-s*(.65-.12*(.65-y)),.021)*G(y-.38,.48);
 return z;
}
export function buildBlouse(parent,{mobile=false}={}){
 const group=new THREE.Group();group.name='Tailored original white blouse';group.scale.x=1.18;parent.add(group);
 const cloth=new THREE.MeshPhysicalMaterial({color:'#eef0f6',roughness:.75,sheen:.55,sheenRoughness:.84,sheenColor:new THREE.Color('#fff8f4'),bumpMap:weave(),bumpScale:.0008,side:THREE.DoubleSide});
 const edgeMat=new THREE.MeshStandardMaterial({color:'#e6e7ed',roughness:.84});
 const thread=new THREE.MeshStandardMaterial({color:'#dddde4',roughness:.9});
 const button=new THREE.MeshPhysicalMaterial({color:'#f0ebdf',roughness:.34,specularIntensity:.4});
 const holes=new THREE.MeshStandardMaterial({color:'#b8b1a8',roughness:.75});
 // Continuous front/back garment shell with a real, slightly asymmetric open neckline.
 {
  const p=[],uv=[],idx=[],ny=140,na=176;
  for(let j=0;j<=ny;j++){
   const y=mix(-.55,1.45,j/ny),w=sample(rows,y,1),d=sample(rows,y,2),opening=clamp((y-.855)*.63,0,w*.995),a0=Math.asin(opening/w);
   for(let i=0;i<=na;i++){
    const a=a0+(TAU-2*a0)*i/na,fr=Math.max(0,Math.cos(a)),x=w*Math.sin(a)+placketX(y)*THREE.MathUtils.smoothstep(y,.70,.96)*Math.pow(fr,6),z=fr>0?front(x,y):d*Math.cos(a);
    p.push(x,y,z);uv.push(i/na,(y+.55)/2);
    if(j<ny&&i<na){const k=j*(na+1)+i;idx.push(k,k+1,k+na+1,k+1,k+na+2,k+na+1);}
   }
  }
  add(group,geo(p,idx,uv),cloth,'Continuous draped shirt shell');
 }
 // Rounded set-in sleeves. Their initial tips are buried within the shoulder shell.
 for(const side of[-1,1]){
  const center=new THREE.CatmullRomCurve3([V(side*.65,1.24,-.040),V(side*.83,1.04,-.030),V(side*.98,.63,-.025),V(side*1.01,.04,-.020),V(side*1.01,-.55,-.020)],false,'catmullrom',.35);
  const sleeve=(t,a)=>{
   const c=center.getPoint(t),tan=center.getTangent(t).normalize(),cross=V(-tan.y,tan.x,0).normalize(),start=Math.sqrt(Math.sin(PI/2*Math.min(1,t*5))),rx=.238*(1-.16*t)*start,rz=.271*(1-.18*t)*start;
   const f=.010*G(t-.21,.13)*Math.sin(t*27+a*3)+.011*G(t-.62,.20)*Math.sin(t*22-a*4)+.0035*Math.sin(a*9+t*4)*Math.sin(PI*t);
   const p=c.clone().addScaledVector(cross,(rx+f)*Math.sin(a));p.z+=(rz+f)*Math.cos(a);
   if(t===1)p.y=-.55;
   return p;
  };
  const p=[],uv=[],idx=[],ny=100,na=76;
  for(let j=0;j<=ny;j++)for(let i=0;i<=na;i++){
   const q=sleeve(j/ny,TAU*i/na);p.push(q.x,q.y,q.z);uv.push(i/na,j/ny);
   if(j<ny&&i<na){const k=j*(na+1)+i;idx.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}
  }
  add(group,geo(p,idx,uv),cloth,'Rounded sleeve '+side);
  const cap=add(group,new THREE.CircleGeometry(1,76),cloth,'Finished sleeve cross section '+side);cap.rotation.x=PI/2;cap.position.set(side*1.01,-.551,-.020);cap.scale.set(.238*.84,.271*.82,1);
  // Subtle dashed stitching along the upper sleeve attachment, never a floating line across the shoulder.
  for(let i=0;i<40;i++){
   const a=-1.05+2.1*i/40,b=a+.025,pts=[sleeve(.205,a),sleeve(.205,b)];pts.forEach(p=>p.z+=.001);tube(group,pts,.00065,thread,'Set-in sleeve stitch '+side);
  }
 }
 // Collar stand wraps around the back of the neck and terminates under the lapels.
 {
  const p=[],uv=[],idx=[],na=96,ny=14,a0=.85;
  for(let j=0;j<=ny;j++)for(let i=0;i<=na;i++){
   const t=j/ny,a=a0+(TAU-2*a0)*i/na,rx=mix(.302,.270,t),rz=mix(.231,.226,t),y=mix(1.25,1.455,t)+.012*Math.cos(a);
   p.push(rx*Math.sin(a),y,rz*Math.cos(a));uv.push(i/na,t);
   if(j<ny&&i<na){const k=j*(na+1)+i;idx.push(k,k+1,k+na+1,k+1,k+na+2,k+na+1);}
  }
  add(group,geo(p,idx,uv),cloth,'Soft collar stand');
 }
 function collar(s,u,v,depth=0){
  const A=V(s*.233,1.465,.220),B=V(s*.455,1.215,.282),C=V(s*.445,1.004,.397),D=V(placketX(.875)+s*.045,.875,.419);
  const p=A.lerp(B,u).lerp(D.lerp(C,u),v);
  p.z+=.047*Math.sin(PI*u)*Math.sin(PI*v)+.034*Math.sin(PI*v)*(1-u)+depth;
  return p;
 }
 for(const s of[-1,1]){
  const p=[],uv=[],idx=[],nx=42,ny=38,layerSize=(nx+1)*(ny+1);
  for(let layer=0;layer<2;layer++)for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
   const q=collar(s,i/nx,j/ny,layer?-.009:0);p.push(q.x,q.y,q.z);uv.push(i/nx,j/ny);
   if(j<ny&&i<nx){const k=layer*layerSize+j*(nx+1)+i,reverse=(s===1)!==Boolean(layer);if(reverse)idx.push(k,k+nx+1,k+1,k+1,k+nx+1,k+nx+2);else idx.push(k,k+1,k+nx+1,k+1,k+nx+2,k+nx+1);}
  }
  // Sew the visible boundary of the two layers to give the collar physical thickness.
  const boundary=[];for(let i=0;i<=nx;i++)boundary.push(i);for(let j=1;j<=ny;j++)boundary.push(j*(nx+1)+nx);for(let i=nx-1;i>=0;i--)boundary.push(ny*(nx+1)+i);for(let j=ny-1;j>0;j--)boundary.push(j*(nx+1));
  for(let i=0;i<boundary.length;i++){const a=boundary[i],b=boundary[(i+1)%boundary.length];idx.push(a,b,a+layerSize,b,b+layerSize,a+layerSize);}
  add(group,geo(p,idx,uv),cloth,'Thick rolled collar wing '+s);
  const hem=[];for(let i=0;i<=50;i++)hem.push(collar(s,i/50,1,.001));tube(group,hem,.0015,edgeMat,'Rolled collar edge '+s);
  for(let i=0;i<52;i++){const t=i/52;const pts=[collar(s,t,.981,.0012),collar(s,t+.010,.981,.0012)];tube(group,pts,.0005,thread,'Collar topstitch '+s);}
 }
 // Curved placket is a separate fabric thickness conforming to the underlying drape.
 {
  const p=[],uv=[],idx=[],nx=14,ny=120;
  for(let j=0;j<=ny;j++){const y=mix(-.55,.879,j/ny);for(let i=0;i<=nx;i++){
   const t=i/nx,x=placketX(y)+(t-.5)*.136,z=front(x,y)+.009+.006*Math.sin(PI*t);p.push(x,y,z);uv.push(t,j/ny);
   if(j<ny&&i<nx){const k=j*(nx+1)+i;idx.push(k,k+1,k+nx+1,k+1,k+nx+2,k+nx+1);}
  }}add(group,geo(p,idx,uv),cloth,'Conforming fabric button placket');
  for(const s of[-1,1])for(let i=0;i<108;i++){const y=-.54+1.40*i/108,pts=[];for(const dy of[0,.0058]){const yy=y+dy,x=placketX(yy)+s*.062;pts.push(V(x,yy,front(x,yy)+.010));}tube(group,pts,.00056,thread,'Placket topstitch');}
 }
 for(const y of[.695,.229,-.257]){
  const x=placketX(y),z=front(x,y)+.024;
  const disc=add(group,new THREE.SphereGeometry(1,36,18),button,'Pearlescent four-hole button');disc.position.set(x,y,z);disc.scale.set(.032,.032,.0068);
  const rim=add(group,new THREE.TorusGeometry(.025,.00165,6,40),button,'Button recessed rim');rim.position.set(x,y,z+.0067);
  for(const dx of[-.006,.006])for(const dy of[-.006,.006]){const o=add(group,new THREE.SphereGeometry(1,12,8),holes,'Button hole');o.position.set(x+dx,y+dy,z+.0074);o.scale.set(.0022,.0022,.0006);}
  for(const s of[-1,1])tube(group,[V(x-.006,y-s*.006,z+.0080),V(x+.006,y+s*.006,z+.0085)],.00065,thread,'Cotton button thread');
 }
 const cap=add(group,new THREE.CylinderGeometry(.79,.79,.009,96),cloth,'Finished torso cross section');cap.position.y=-.554;cap.scale.z=.369/.79;
 // Batch original components by material to keep the live viewport draw-call count low.
 const batches=new Map();for(const o of [...group.children]){const key=o.material.uuid+'|'+Object.keys(o.geometry.attributes).sort();if(!batches.has(key))batches.set(key,[]);batches.get(key).push(o);}
 for(const batch of batches.values())if(batch.length>1){const gs=batch.map(o=>{o.updateMatrix();return o.geometry.clone().applyMatrix4(o.matrix);}),combined=mergeGeometries(gs,false);if(combined){const joined=add(group,combined,batch[0].material,'Batched tailored blouse — '+batch[0].name);joined.userData.components=batch.map(o=>o.name);batch.forEach(o=>{group.remove(o);o.geometry.dispose();});}gs.forEach(g=>g.dispose());}
 return group;
}
