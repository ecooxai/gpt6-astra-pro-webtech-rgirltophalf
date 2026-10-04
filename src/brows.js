/** Original tapered eyebrow fibers rooted directly in the continuous facial surface. */
import * as THREE from 'three';
const hash=(a,b)=>{const h=Math.sin(a*127.1+b*311.7+391.77)*43758.5453;return h-Math.floor(h);};
export function buildBrows(parent,faceZ){
 const p=[],n=[],uv=[],c=[],idx=[],segments=7,around=4;
 const material=new THREE.MeshStandardMaterial({color:'#ffffff',vertexColors:true,roughness:.82});
 for(const side of[-1,1])for(let i=0;i<250;i++){
  const t=(i+.55*hash(i,side))/250,x=side*(.100+.303*t),y0=2.557+.025*Math.sin(Math.PI*t*.94)-.022*t;
  const width=.009*(.60+.40*Math.sin(Math.PI*t)),y=y0+(hash(i,9)-.48)*width*2;
  const root=new THREE.Vector3(x,y,faceZ(x,y)+.0012),dx=side*(.010+.013*t)*( .72+.40*hash(i,31)),dy=(.015*(1-t)**2-.0025*t)*(.68+.5*hash(i,19));
  const mid=new THREE.Vector3(x+dx*.42,y+dy*.75,faceZ(x+dx*.42,y+dy*.75)+.0030),end=new THREE.Vector3(x+dx,y+dy,faceZ(x+dx,y+dy)+.0018);
  const curve=new THREE.CatmullRomCurve3([root,mid,end],false,'centripetal'),base=p.length/3,r=.00031+.00025*hash(i,21),color=new THREE.Color('#66483c').multiplyScalar(.58+.58*hash(i,47));
  for(let j=0;j<=segments;j++){
   const q=j/segments,point=curve.getPoint(q),T=curve.getTangent(q).normalize(),S=T.clone().cross(new THREE.Vector3(0,0,1)).normalize(),N=S.clone().cross(T).normalize(),radius=r*(.30+.70*Math.sin(Math.PI*Math.min(.5,q+.10)))*(1-.93*q);
   for(let k=0;k<=around;k++){const a=2*Math.PI*k/around,no=S.clone().multiplyScalar(Math.cos(a)).addScaledVector(N,Math.sin(a)),pp=point.clone().addScaledVector(no,radius);p.push(pp.x,pp.y,pp.z);n.push(no.x,no.y,no.z);uv.push(k/around,q);c.push(color.r,color.g,color.b);if(j<segments&&k<around){const ii=base+j*(around+1)+k;idx.push(ii,ii+around+1,ii+1,ii+1,ii+around+1,ii+around+2);}}
  }
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.setIndex(idx);
 const brows=new THREE.Mesh(geo,material);brows.name='Individually tapered growing eyebrows';brows.castShadow=false;brows.receiveShadow=true;parent.add(brows);return brows;
}
