/** Continuous original facial relief with exact eye boundaries.
 * Delaunay triangulation is an algorithmic dependency, not a visual asset.
 */
import * as THREE from 'three';
import Delaunator from 'delaunator';
const PI=Math.PI,TAU=2*PI,clamp=THREE.MathUtils.clamp;
const G=(x,s)=>Math.exp(-((x/s)**2));
export const eyeY=2.419,eyeX=.243,eyeW=.128;
export function eyeEdge(side,t,upper){
 const x=side*eyeX+eyeW*t,y=eyeY+side*t*.009+(upper?.061:-.043)*Math.pow(Math.max(0,1-t*t),.72);
 return new THREE.Vector3(x,y,eyeSurface(side,x,y));
}
export function eyeSurface(side,x,y){return .212+Math.sqrt(Math.max(.00001,.18**2-(x-side*eyeX)**2-(y-eyeY)**2));}
function inEye(x,y,margin=0){
 for(const s of[-1,1]){const t=(x-s*eyeX)/eyeW;if(Math.abs(t)>1)continue;
 const lo=eyeEdge(s,t,false).y,hi=eyeEdge(s,t,true).y;
 if(y>lo-margin&&y<hi+margin)return true;}
 return false;
}
function nearestEdge(side,x,y){
 const dx=x-side*eyeX,dy=y-eyeY-side*dx/eyeW*.009,upper=dy>=0,h=upper?.061:-.043;
 let t=clamp(Math.cos(Math.atan2(dy/Math.abs(h),dx/eyeW)),-.9998,.9998);
 for(let k=0;k<5;k++){
  const f=Math.max(.00004,1-t*t),ey=eyeY+side*.009*t+h*Math.pow(f,.72),ex=side*eyeX+eyeW*t;
  const d1=side*.009-1.44*h*t*Math.pow(f,-.28),d2=-1.44*h*(Math.pow(f,-.28)+.56*t*t*Math.pow(f,-1.28));
  const den=eyeW*eyeW+d1*d1+(ey-y)*d2;
  if(den<=.00001)break;
  t=clamp(t-clamp(((ex-x)*eyeW+(ey-y)*d1)/den,-.14,.14),-.99999,.99999);
 }
 return {edge:eyeEdge(side,t,upper),vertical:Math.pow(Math.max(0,1-t*t),.70),upper};
}
export const seamY=t=>1.949-.007*(1-t*t)+.003*Math.cos(t*PI);
function lipShape(x,y){
 const t=x/.172;if(Math.abs(t)>=1.04)return null;
 const f=Math.max(0,1-t*t),s=seamY(t),upper=y>=s;
 const h=(upper?(.040+.013*G(Math.abs(t)-.29,.18)-.003*G(t,.10)):.061)*Math.pow(f,.70);
 if(h<.0001)return null;
 return {t,upper,v:Math.abs(y-s)/h,f,h,s};
}
export function buildContinuousFace({parent,material,faceZ,headWidth,backDepth,chinCenter,skinColor,mobile}){
 const zAt=(x,y)=>{
  let z=faceZ(x,y);
  // An orbital transition with compact support, continuous with the surrounding face.
  for(const s of[-1,1]){
   const dx=x-s*eyeX,dy=y-eyeY-s*dx/eyeW*.009;
   const {edge,vertical,upper}=nearestEdge(s,x,y);
   const dist=Math.hypot((x-edge.x),y-edge.y);
   if(dist<.155&&Math.abs(dx)<.27&&Math.abs(dy)<.22){
    const delta=edge.z-faceZ(edge.x,edge.y);
    const fade=1-THREE.MathUtils.smoothstep(dist,0,.14);
    z+=delta*fade*fade;

    z+=.0032*G(dist-.012,.012)*vertical;
    if(upper)z-=.0038*G(dist-.033,.0075)*vertical;
    else z+=.004*G(dist-.030,.015)*vertical;
   }
  }
  // Recessed nasal apertures remain part of the same mesh.
  const cavity=Math.max(G(x-.065,.018)*G(y-2.117,.009),G(x+.065,.018)*G(y-2.117,.009));
  z-=.012*cavity;
  const lip=lipShape(x,y);
  if(lip&&lip.v<1.45){const {v,f,upper}=lip;
   const shape=v<1?(.017*(1-v*v*(3-2*v))+(upper?.017:.024)*Math.sin(PI*v)**2):0;
   z+=shape*Math.pow(f,.7);
   z-=.0018*G(y-lip.s,.0018)*Math.pow(f,.7);
  }
  return z;
 };
 const colorAt=(x,y)=>{
  const c=skinColor(x,y,1);
  // Soft tonal transitions: no pasted-on orbital or lip patches.
  for(const s of[-1,1]){
   const t=(x-s*eyeX)/eyeW;
   if(Math.abs(t)<1.15){const e=eyeEdge(s,clamp(t,-.998,.998),true),f=G(y-e.y-.020,.023)*Math.pow(Math.max(0,1-t*t),.55);
    c.lerp(new THREE.Color('#bc8d80'),.12*f);
    c.lerp(new THREE.Color('#ae7a71'),.11*G(y-e.y-.035,.008)*Math.max(0,1-t*t));}
  }
  const cavity=Math.max(G(x-.065,.018)*G(y-2.117,.007),G(x+.065,.018)*G(y-2.117,.007));
  c.lerp(new THREE.Color('#7d4a41'),.73*Math.pow(cavity,.8));
  const lip=lipShape(x,y);
  if(lip&&lip.v<1.4){
   const f=(1-THREE.MathUtils.smoothstep(lip.v,.79,1.21))*THREE.MathUtils.smoothstep(lip.f,0,.15);
   c.lerp(new THREE.Color(lip.upper?'#c47f7e':'#d9918b'),f*.85);
   c.lerp(new THREE.Color('#773e40'),.74*(.45+.55*lip.t*lip.t)*G(y-lip.s,.0023)*Math.pow(lip.f,.5));
   const grain=.002*Math.sin(x*310+Math.sin(y*79))*f;
   c.r+=grain;c.g+=grain*.4;c.b+=grain*.3;
  }
  return c;
 };
 const pts=[],xyz=[],seen=new Set();
 function add(x,y,exact=false){if(y<1.65||y>3.474||Math.abs(x)>headWidth(y)+1e-5)return;
  if(!exact&&inEye(x,y,.0018))return;
  const a=Math.asin(clamp(x/headWidth(y),-1,1)),key=Math.round(a*1e6)+','+Math.round(y*1e6);
  if(seen.has(key))return;seen.add(key);pts.push([a,y]);xyz.push([x,y]);
 }
 const ny=mobile?230:280,na=mobile?170:210;
 for(let j=0;j<=ny;j++){const y=THREE.MathUtils.lerp(1.65,3.474,j/ny),w=headWidth(y);
  for(let i=0;i<=na;i++){const a=-PI/2+PI*i/na;add(w*Math.sin(a),y);}}
 // Local adaptive density gives the nose and vermilion fine topology without oversampling the whole skull.
 for(let y=1.880;y<=2.406;y+=.0035)for(let x=-.184;x<=.184;x+=.0035){add(x,y);}
 for(const s of[-1,1])for(const upper of[true,false])for(let i=0;i<=150;i++){
  const t=-1+2*i/150,e=eyeEdge(s,t,upper);add(e.x,e.y,true);
  for(const d of[.0025,.006,.010,.016,.024,.034,.046,.063,.085]){
   const a=Math.acos(t)*(upper?1:-1);add(e.x+d*Math.cos(a),e.y+d*Math.sin(a));
  }
 }
 for(let i=0;i<=180;i++){
  const t=-.999+1.998*i/180,x=t*.172,sy=seamY(t),f=1-t*t;
  const hu=(.040+.013*G(Math.abs(t)-.29,.18)-.003*G(t,.10))*Math.pow(f,.70),hl=.061*Math.pow(f,.70);
  for(let j=-18;j<=18;j++)add(x,sy+(j>=0?hu:hl)*j/18);
 }
 const tri=Delaunator.from(pts).triangles,p=[],uv=[],c=[],idx=[],norm=[];
 for(const [x,y]of xyz){p.push(x,y,zAt(x,y));uv.push((Math.asin(clamp(x/headWidth(y),-1,1))+PI)/TAU,(y-1.65)/1.824);const col=colorAt(x,y);c.push(col.r,col.g,col.b);
 const e=.0005,dx=(zAt(x+e,y)-zAt(x-e,y))/(2*e),dy=(zAt(x,y+e)-zAt(x,y-e))/(2*e),stretch=1+.07*6*clamp((y-2.13)/.30,0,1)*(1-clamp((y-2.13)/.30,0,1))/.30;
 const n=new THREE.Vector3(-dx,-dy/stretch,1).normalize();norm.push(n.x,n.y,n.z);}
 for(let i=0;i<tri.length;i+=3){const a=tri[i],b=tri[i+1],d=tri[i+2];const x=(xyz[a][0]+xyz[b][0]+xyz[d][0])/3,y=(xyz[a][1]+xyz[b][1]+xyz[d][1])/3;
  if(inEye(x,y,-.00015))continue;
  const cross=(p[b*3]-p[a*3])*(p[d*3+1]-p[a*3+1])-(p[b*3+1]-p[a*3+1])*(p[d*3]-p[a*3]);
  if(cross>0)idx.push(a,b,d);else idx.push(a,d,b);
 }
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geo.setAttribute('color',new THREE.Float32BufferAttribute(c,3));geo.setIndex(idx);geo.setAttribute("normal",new THREE.Float32BufferAttribute(norm,3));
 const mesh=new THREE.Mesh(geo,material);mesh.name='Continuous facial sculpt — exact eye rims and integrated lips';mesh.castShadow=mesh.receiveShadow=true;parent.add(mesh);
 // Anatomical posterior volume; no image plane or view-dependent texture.
 const bp=[],bu=[],bc=[],bi=[],bn=120;
 for(let j=0;j<=ny;j++){const y=THREE.MathUtils.lerp(1.65,3.474,j/ny);for(let i=0;i<=bn;i++){
  const a=PI/2+PI*i/bn,x=headWidth(y)*Math.sin(a),z=-backDepth(y)*Math.pow(Math.max(0,-Math.cos(a)),.85)+chinCenter(y);
  bp.push(x,y,z);bu.push((a+PI)/TAU,(y-1.65)/1.824);const col=skinColor(x,y,0);bc.push(col.r,col.g,col.b);
  if(i<bn&&j<ny){const k=j*(bn+1)+i;bi.push(k,k+1,k+bn+1,k+1,k+bn+2,k+bn+1);}
 }}
 const bg=new THREE.BufferGeometry();bg.setAttribute('position',new THREE.Float32BufferAttribute(bp,3));bg.setAttribute('uv',new THREE.Float32BufferAttribute(bu,2));bg.setAttribute('color',new THREE.Float32BufferAttribute(bc,3));bg.setIndex(bi);bg.computeVertexNormals();const back=new THREE.Mesh(bg,material);back.name='Anatomical posterior skull';back.castShadow=back.receiveShadow=true;parent.add(back);
 return {zAt,colorAt};
}
