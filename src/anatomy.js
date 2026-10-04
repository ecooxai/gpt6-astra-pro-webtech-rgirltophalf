/** Original soft-tissue surface geometry. */
import * as THREE from "three";
const mix=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp;
const gaussian=(x,s)=>Math.exp(-x*x/(s*s));
function surface(p,idx,uv,c,material,parent,name){const g=new THREE.BufferGeometry();g.setAttribute("position",new THREE.Float32BufferAttribute(p,3));g.setAttribute("uv",new THREE.Float32BufferAttribute(uv,2));g.setAttribute("color",new THREE.Float32BufferAttribute(c,3));g.setIndex(idx);g.computeVertexNormals();const mesh=new THREE.Mesh(g,material);mesh.name=name;mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
function faceUV(x,y,width){return[(Math.asin(clamp(x/width(y),-.9999,.9999))+Math.PI)/(2*Math.PI),(y-1.65)/(3.474-1.65)];}
export function buildOrbitalSkin({parent,material,side,eyeX,eyeY,eyeEdge,faceZ,skinColor,headWidth}){
 const p=[],idx=[],uv=[],col=[],na=180,nr=28;
 for(let j=0;j<=nr;j++)for(let i=0;i<=na;i++){
  const a=2*Math.PI*i/na,v=j/nr,c=Math.cos(a),s=Math.sin(a),upper=s>=0,e=eyeEdge(side,c,upper);
  const x=mix(e.x,side*eyeX+.218*c,v),y=mix(e.y,eyeY+.150*s+side*c*.011,v),delta=e.z-faceZ(e.x,e.y);
  let z=faceZ(x,y)+delta*Math.pow(1-v,3)+.0045*Math.pow(Math.sin(Math.PI*v),2);
  const fold=upper?gaussian(v-.27,.074)*Math.pow(Math.max(0,s),.65):0;
  z-=.0028*fold;z+=.00035;
  p.push(x,y,z);uv.push(...faceUV(x,y,headWidth));const color=skinColor(x,y,1);
  color.lerp(new THREE.Color("#c39080"),.14*fold+.09*Math.pow(1-v,4));
  if(upper)color.lerp(new THREE.Color("#b48b7e"),.09*Math.max(0,s)*Math.pow(1-v,2));
  col.push(color.r,color.g,color.b);
  if(j<nr&&i<na){const k=j*(na+1)+i;idx.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}
 }
 return surface(p,idx,uv,col,material,parent,"Continuous orbital skin "+side);
}
export function buildNoseSkin({parent,material,faceZ,skinColor,headWidth}){
 const p=[],idx=[],uv=[],col=[],nx=116,ny=142;
 for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++){
  const x=mix(-.150,.150,i/nx),y=mix(2.057,2.408,j/ny);
  const left=gaussian(x+.064,.021)*gaussian(y-2.113,.0105),right=gaussian(x-.064,.021)*gaussian(y-2.113,.0105),cavity=Math.max(left,right);
  const z=faceZ(x,y)-.030*Math.pow(cavity,1.25)+.00045;
  p.push(x,y,z);uv.push(...faceUV(x,y,headWidth));const color=skinColor(x,y,1);
  color.lerp(new THREE.Color("#663b32"),.86*Math.pow(cavity,.7));col.push(color.r,color.g,color.b);
  if(j<ny&&i<nx){const k=j*(nx+1)+i;idx.push(k,k+1,k+nx+1,k+1,k+nx+2,k+nx+1);}
 }
 return surface(p,idx,uv,col,material,parent,"Sculpted nasal wings and recessed nostrils");
}
