/** Continuous original ear relief: helix, concha, antihelix and earlobe share a closed volume. */
import * as THREE from 'three';
const G=(x,s)=>Math.exp(-x*x/(s*s));
export function buildEar(parent,side,baseMaterial){
 const p=[],uv=[],col=[],idx=[],na=128,nr=54;
 const material=baseMaterial.clone();material.vertexColors=true;material.color.set('#ffffff');material.roughness=.57;material.normalMap=null;material.bumpMap=null;material.map=null;material.roughnessMap=null;material.aoMap=null;
 for(let back=0;back<2;back++)for(let j=0;j<=nr;j++)for(let i=0;i<=na;i++){
  const r=j/nr,a=2*Math.PI*i/na,c=Math.cos(a),s=Math.sin(a),lx=.069*r*c*(1+.10*s),ly=.179*r*s-.012*G(s+.7,.35)*r;
  const x=side*(.591+lx+.010*r*s),y=2.420+ly;
  const rim=G(r-.89,.075),bowl=G(lx-.006,.042)*G(ly-.018,.083),anti=G(r-.59,.075)*Math.max(0,.4+.6*c)*(.4+.6*G(ly-.044,.104));
  let z=back?-.030-.014*Math.sqrt(Math.max(0,1-r*r)):.040+.024*Math.sqrt(Math.max(0,1-r*r))+.034*rim-.037*bowl+.028*anti;
  if(!back){z+=.033*G(lx+.037,.014)*G(ly+.016,.025);z+=.016*G(lx,.047)*G(ly+.122,.039);}
  // The outer rim closes to the posterior volume with a rounded edge.
  z=THREE.MathUtils.lerp(z,.007,THREE.MathUtils.smoothstep(r,.96,1));
  p.push(x,y,z);uv.push(i/na,j/nr);
  const color=new THREE.Color('#ebbdab');if(!back)color.lerp(new THREE.Color('#ba7567'),.29*bowl+.10*G(r-.72,.06));
  else color.lerp(new THREE.Color('#ce927d'),.16);
  col.push(color.r,color.g,color.b);
  if(j<nr&&i<na){const k=back*(nr+1)*(na+1)+j*(na+1)+i;let tri=[k,k+1,k+na+1,k+1,k+na+2,k+na+1];if((side>0)!==Boolean(back))tri=[k,k+na+1,k+1,k+1,k+na+1,k+na+2];idx.push(...tri);}
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,3));geo.setIndex(idx);geo.computeVertexNormals();
 const ear=new THREE.Mesh(geo,material);ear.name='Continuous sculpted ear '+side;ear.castShadow=ear.receiveShadow=true;parent.add(ear);return ear;
}
