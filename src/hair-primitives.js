/** Shared original hair geometry and procedural-fiber utilities. No external visual assets. */
import * as THREE from 'three';
const PI=Math.PI,TAU=PI*2,V=(x,y,z)=>new THREE.Vector3(x,y,z),lerp=THREE.MathUtils.lerp;
let state=81883;
function random(){state=(Math.imul(state,1664525)+1013904223)|0;return(state>>>0)/4294967296;}
const g=(x,s)=>Math.exp(-(x*x)/(s*s));
function texture(data,w,h,color=false){const t=new THREE.DataTexture(data,w,h);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=THREE.ClampToEdgeWrapping;t.wrapT=THREE.ClampToEdgeWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t;}
export function fiberMaps(){
 const w=512,h=1024,n=40,strands=[];
 for(let i=0;i<n;i++)strands.push({x:(i+.12+.76*random())/n,width:.0035+random()*.005,end:.93+random()*.07,bend:(random()-.5)*.012,phase:random()*TAU,tone:.68+random()*.68});
 const rgba=new Uint8Array(w*h*4),normal=new Uint8Array(w*h*4),rough=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/(w-1),v=y/(h-1);let coverage=0,tone=0,slope=0;
  for(const strand of strands){const xx=strand.x+strand.bend*Math.sin(v*5+strand.phase)*Math.pow(v,.7),ww=strand.width*Math.pow(Math.max(.001,1-v/strand.end),.27),d=(u-xx)/ww;
   if(Math.abs(d)>2.8||v>strand.end)continue;
   const a=Math.exp(-d*d*2)*(1-THREE.MathUtils.smoothstep(v,strand.end-.055,strand.end));
   if(a>coverage){coverage=a;tone=strand.tone*(.92+.08*Math.sin(v*83+strand.phase));slope=d*.48;}
  }
  const k=(y*w+x)*4;
  rgba[k]=Math.round(39*tone);rgba[k+1]=Math.round(31*tone);rgba[k+2]=Math.round(31*tone);rgba[k+3]=Math.round(255*Math.min(1,coverage*1.7));
  normal[k]=Math.round(127.5+Math.max(-.7,Math.min(.7,slope))*120);normal[k+1]=128;normal[k+2]=244;normal[k+3]=255;
  rough[k]=rough[k+1]=rough[k+2]=Math.round(255*(.66+.10*(1-coverage)));rough[k+3]=255;
 }
 return {map:texture(rgba,w,h,true),normal:texture(normal,w,h),rough:texture(rough,w,h)};
}
export function builder(){return{p:[],n:[],uv:[],color:[],idx:[]};}
export function finish(b,mat,parent,name,shadow=true){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));if(b.color.length)geo.setAttribute('color',new THREE.Float32BufferAttribute(b.color,3));if(b.n.length)geo.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));geo.setIndex(b.idx);if(!b.n.length)geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.name=name;m.castShadow=shadow;m.receiveShadow=true;parent.add(m);return m;}
export function ribbon(b,curve,width,depth,radial,color,{segments=90,across=6,offset=0,tip=.65,endStart=.80}={}){
 const base=b.p.length/3;
 for(let j=0;j<=segments;j++){
  const t=j/segments,p=curve.getPoint(t),tan=curve.getTangent(t).normalize(),out=frameNormal(radial,t,p);
  const side=tan.clone().cross(out).normalize(),normal=side.clone().cross(tan).normalize();
  const taper=Math.pow(Math.max(.00001,1-THREE.MathUtils.smoothstep(t,endStart,1)),tip)*(.70+.30*Math.min(1,t*12));
  for(let i=0;i<=across;i++){
   const u=i/across,q=u*2-1,bulge=depth*(1-q*q),pos=p.clone().addScaledVector(side,q*width*taper).addScaledVector(normal,offset+bulge*taper);
   b.p.push(pos.x,pos.y,pos.z);b.uv.push(u,t);if(color)b.color.push(color.r,color.g,color.b);
   const no=normal.clone().addScaledVector(side,q*.22).normalize();b.n.push(no.x,no.y,no.z);
   if(j<segments&&i<across){const k=base+j*(across+1)+i;b.idx.push(k,k+1,k+across+1,k+1,k+across+2,k+across+1);}
  }
 }
}
export function roundLock(b,curve,width,depth,radial,color,segments=85){
 const base=b.p.length/3,around=12;
 for(let j=0;j<=segments;j++){
  const t=j/segments,p=curve.getPoint(t),tan=curve.getTangent(t).normalize(),out=frameNormal(radial,t,p),side=tan.clone().cross(out).normalize(),normal=side.clone().cross(tan).normalize();
  const taper=Math.pow(Math.max(.0001,1-THREE.MathUtils.smoothstep(t,.80,1)),.62)*(.6+.4*Math.min(1,t*14));
  for(let i=0;i<=around;i++){
   const a=TAU*i/around,pp=p.clone().addScaledVector(side,Math.cos(a)*width*taper).addScaledVector(normal,Math.sin(a)*depth*taper);
   b.p.push(pp.x,pp.y,pp.z);b.uv.push(i/around,t);b.color.push(color.r,color.g,color.b);
   const no=side.clone().multiplyScalar(Math.cos(a)/width).addScaledVector(normal,Math.sin(a)/depth).normalize();b.n.push(no.x,no.y,no.z);
   if(j<segments&&i<around){const k=base+j*(around+1)+i;b.idx.push(k,k+around+1,k+1,k+1,k+around+1,k+around+2);}
  }
 }
}

export function setGroomSeed(value){state=value|0;}
function frameNormal(radial,t,p){
 if(typeof radial==='function')return radial(t,p).normalize();
 return radial.clone().normalize();
}
