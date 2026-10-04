/** Original eyes: curved sclera/iris, contact-shaded lid margins and tapered lashes.
 * The live cornea uses a low-cost reflective layer; export replaces it with a
 * standard transmissive glTF material. No highlight is painted into the iris.
 */
import * as THREE from 'three';
import {eyeX,eyeY,eyeW,eyeEdge,eyeSurface,eyeCenterY} from './face-surface.js';
import {buildIrisTexture} from './iris.js';
import {scleraPigment} from './surfaces.js';
const PI=Math.PI,TAU=2*PI,V=(x,y,z)=>new THREE.Vector3(x,y,z),clamp=THREE.MathUtils.clamp;
const hash=(a,b)=>{const h=Math.sin(a*127.1+b*311.7+712.31)*43758.5453;return h-Math.floor(h);};
function innerEdge(side,t,upper){const e=eyeEdge(side,t,upper),f=Math.sqrt(Math.max(0,1-t*t));e.y+=(upper?-.0062:.0070)*f;e.z=eyeSurface(side,e.x,e.y)+.0038;return e;}
function geometry(p,idx,uv,c){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));if(c?.length)g.setAttribute('color',new THREE.Float32BufferAttribute(c,3));g.setIndex(idx);g.computeVertexNormals();return g;}
function add(parent,g,m,name){const mesh=new THREE.Mesh(g,m);mesh.name=name;mesh.castShadow=false;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function orientFront(p,idx){for(let i=0;i<idx.length;i+=3){const a=idx[i]*3,b=idx[i+1]*3,c=idx[i+2]*3;if((p[b]-p[a])*(p[c+1]-p[a+1])-(p[b+1]-p[a+1])*(p[c]-p[a])<0){const k=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=k;}}}
export function buildEyes(parent,{skinMaterial,faceSculpt}){
 const white=new THREE.MeshPhysicalMaterial({color:'#e2d6ce',map:scleraPigment(),vertexColors:true,roughness:.37,specularIntensity:.34});white.name='Living sclera';
 const iris=new THREE.MeshPhysicalMaterial({color:'#ffffff',map:buildIrisTexture(),vertexColors:true,roughness:.43,specularIntensity:.13});iris.name='Original brown iris pigment';
 const cornea=new THREE.MeshPhysicalMaterial({color:'#000000',transparent:true,blending:THREE.AdditiveBlending,opacity:1,ior:1.376,roughness:.078,specularIntensity:1,envMapIntensity:2.6,depthWrite:false});cornea.name='Optical cornea';cornea.userData.exportTransmission=true;
 const rim=skinMaterial.clone();rim.name='Anatomical eyelid margin';rim.color.set('#ffffff');rim.vertexColors=true;rim.map=null;rim.normalMap=null;rim.roughnessMap=null;rim.bumpMap=null;rim.aoMap=null;rim.roughness=.65;rim.specularIntensity=.14;rim.clearcoat=0;rim.sheen=0;
 const lash=new THREE.MeshPhysicalMaterial({color:'#211813',roughness:.92,specularIntensity:0});lash.name='Tapered eyelash fiber';
 const tear=new THREE.MeshPhysicalMaterial({color:'#c38c86',roughness:.32,specularIntensity:.36});tear.name='Lacrimal tissue';
 const lp=[],ln=[],luv=[],li=[];
 function eyelash(points,radius){
  const curve=new THREE.CatmullRomCurve3(points,false,'centripetal'),segments=8,around=4,base=lp.length/3;
  for(let j=0;j<=segments;j++){
   const t=j/segments,p=curve.getPoint(t),T=curve.getTangent(t).normalize(),S=T.clone().cross(V(0,0,1)).normalize(),N=S.clone().cross(T).normalize(),r=radius*Math.pow(1-t*.98,.8);
   for(let k=0;k<=around;k++){const a=TAU*k/around,n=S.clone().multiplyScalar(Math.cos(a)).addScaledVector(N,Math.sin(a)),q=p.clone().addScaledVector(n,r);lp.push(q.x,q.y,q.z);ln.push(n.x,n.y,n.z);luv.push(k/around,t);if(j<segments&&k<around){const i=base+j*(around+1)+k;li.push(i,i+around+1,i+1,i+1,i+around+1,i+around+2);}}
  }
 }
 for(const side of[-1,1]){
  // The white is genuinely curved and bounded by the visible inner lid edge.
  const p=[],uv=[],idx=[],colors=[],nx=132,ny=30;
  for(let i=0;i<=nx;i++){
   const t=-1+2*i/nx,x=side*eyeX+eyeW*t,lo=innerEdge(side,t,false).y,hi=innerEdge(side,t,true).y;
   for(let j=0;j<=ny;j++){
    const v=j/ny,y=THREE.MathUtils.lerp(lo,hi,v),z=eyeSurface(side,x,y);p.push(x,y,z);uv.push((t+1)/2,v);
    const corner=Math.pow(Math.abs(t),7),contact=.29*Math.exp(-(hi-y)/.010)+.075*Math.exp(-(y-lo)/.009),col=new THREE.Color('#ffffff');col.lerp(new THREE.Color('#d7a6a1'),corner*.34);col.multiplyScalar(1-contact);colors.push(col.r,col.g,col.b);
    if(i<nx&&j<ny){const k=i*(ny+1)+j;idx.push(k,k+ny+1,k+1,k+1,k+ny+1,k+ny+2);}
   }
  }
  orientFront(p,idx);add(parent,geometry(p,idx,uv,colors),white,'Curved bounded sclera '+side);
  // Embedded iris disk; its upper and lower edges are cropped by the true lid boundary.
  const ip=[],iu=[],ic=[],ii=[],nr=18,na=112,radius=.0605,ix=side*eyeX-.0015,iy=eyeCenterY(side)+.0035;
  for(let j=0;j<=nr;j++)for(let i=0;i<=na;i++){
   const r=radius*j/nr,a=TAU*i/na,x=ix+r*Math.cos(a),rawY=iy+r*Math.sin(a),t=clamp((x-side*eyeX)/eyeW,-.9999,.9999),lo=innerEdge(side,t,false).y,hi=innerEdge(side,t,true).y,y=clamp(rawY,lo+.0002,hi-.0002);
   ip.push(x,y,eyeSurface(side,x,y)+.0018);iu.push(.5+(x-ix)/(radius*2),.5+(y-iy)/(radius*2));const shade=1-.25*Math.exp(-(hi-y)/.010);ic.push(shade,shade,shade);
   if(j<nr&&i<na){const k=j*(na+1)+i;ii.push(k,k+1,k+na+1,k+1,k+na+2,k+na+1);}
  }
  orientFront(ip,ii);add(parent,geometry(ip,ii,iu,ic),iris,'Contact-shaded original iris '+side);
  const cp=ip.slice(),curveRadius=.090,edgeHeight=Math.sqrt(curveRadius*curveRadius-radius*radius);
  for(let i=0;i<cp.length;i+=3){const x=cp[i],y=cp[i+1],r2=Math.min(radius*radius,(x-ix)**2+(y-iy)**2),t=clamp((x-side*eyeX)/eyeW,-.9999,.9999),margin=Math.min(y-innerEdge(side,t,false).y,innerEdge(side,t,true).y-y),bulge=Math.sqrt(Math.max(.0001,curveRadius*curveRadius-r2))-edgeHeight;
   cp[i+2]=eyeSurface(side,x,y)+.0024+bulge*.78*Math.pow(THREE.MathUtils.smoothstep(margin,0,.014),2);
  }
  add(parent,geometry(cp,ii,iu),cornea,'Reflective corneal dome '+side);
  // Rounded skin thickness bridges the face opening and the curved ocular surface.
  for(const upper of[true,false]){
   const rp=[],ruv=[],rc=[],ri=[],ns=144,nv=6;
   for(let i=0;i<=ns;i++)for(let j=0;j<=nv;j++){
    const t=-.99999+1.99998*i/ns,v=j/nv,outer=eyeEdge(side,t,upper),inner=innerEdge(side,t,upper),x=outer.x,y=THREE.MathUtils.lerp(outer.y,inner.y,v),z=THREE.MathUtils.lerp(faceSculpt.zAt(x,outer.y)+.0001,inner.z,v)+.0036*Math.sin(PI*v)*Math.sqrt(1-t*t);
    rp.push(x,y,z);ruv.push(i/ns,v);const color=faceSculpt.colorAt(x,outer.y);color.lerp(new THREE.Color(upper?'#be8d80':'#d4a09a'),v*.48);rc.push(color.r,color.g,color.b);
    if(i<ns&&j<nv){const k=i*(nv+1)+j;ri.push(k,k+nv+1,k+1,k+1,k+nv+1,k+nv+2);}
   }
   orientFront(rp,ri);add(parent,geometry(rp,ri,ruv,rc),rim,'Rounded dimensional eyelid '+side+' '+upper);
   if(upper){const points=[];for(let i=0;i<=100;i++){const p=innerEdge(side,-.98+1.96*i/100,true);p.z+=.0008;points.push(p);}add(parent,new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),110,.00085,4,false),lash,'Subtle upper lash line '+side);}
  }
  const inner=innerEdge(side,-side*.984,false),caruncle=add(parent,new THREE.SphereGeometry(1,20,12),tear,'Small lacrimal tissue '+side);caruncle.position.copy(inner).add(V(side*.0027,.003,.0008));caruncle.scale.set(.0061,.0035,.0020);
  for(let i=0;i<54;i++){
   const r=hash(i,side),t=-.94+1.88*(i+.50*r)/54,p=innerEdge(side,t,true),outer=(side*t+1)*.5,L=.009+.010*outer**1.4+.007*hash(i,39),splay=side*(.003+.008*outer)+(hash(i,51)-.5)*.005;
   p.z+=.0013;eyelash([p,p.clone().add(V(splay*.4,L*.10,.009)),p.clone().add(V(splay*.9,L*.59,.014)),p.clone().add(V(splay*1.2,L,.011))],.00033+.00031*hash(i,61));
  }
  for(let i=0;i<15;i++){
   const t=-.85+1.70*(i+.35*hash(i,side+41))/15,p=innerEdge(side,t,false),L=.003+.005*hash(i,17);eyelash([p,p.clone().add(V(side*.001,-L*.6,.0045)),p.clone().add(V(side*.004,-L,.004))],.00016+.00013*hash(i,81));
  }
 }
 const lashGeometry=geometry(lp,li,luv);lashGeometry.setAttribute('normal',new THREE.Float32BufferAttribute(ln,3));add(parent,lashGeometry,lash,'Irregular curved tapered eyelashes');
 return [white,iris,cornea,rim,lash,tear];
}
