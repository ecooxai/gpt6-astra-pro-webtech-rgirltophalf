/** Original face-specific PBR atlas. Coordinates are anatomical, never sampled from the reference image. */
import * as THREE from 'three';
const PI=Math.PI,TAU=2*PI,G=(x,s)=>Math.exp(-x*x/(s*s));
const hash=(x,y)=>{const h=Math.sin(x*127.1+y*311.7+63.1)*43758.5453;return h-Math.floor(h);};
function makeTexture(d,n,color=false){const t=new THREE.DataTexture(d,n,n);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t;}
export function buildSkinAtlas(headWidth){
 const n=1024,h=new Float32Array(n*n),normal=new Uint8Array(n*n*4),rough=new Uint8Array(n*n*4),color=new Uint8Array(n*n*4),ao=new Uint8Array(n*n*4);
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){
  const u=(i+.5)/n,v=(j+.5)/n,a=u*TAU-PI,y=1.65+1.824*v,x=headWidth(y)*Math.sin(a),front=Math.pow(Math.max(0,Math.cos(a)),5),r=Math.min(1,Math.abs(x/.172)),f=Math.pow(Math.max(0,1-r*r),.70),seam=1.949-.007*(1-r*r)+.003*Math.cos(r*PI),lipHeight=(y>=seam?.045:.061)*f;
  const lip=lipHeight>.0001?(1-THREE.MathUtils.smoothstep(Math.abs(y-seam)/lipHeight,.68,1.18))*front:0;
  const cx=Math.floor(i/3.6),cy=Math.floor(j/3.6),px=i/3.6-cx-.22-.55*hash(cx,cy),py=j/3.6-cy-.22-.55*hash(cx+23,cy+51),pore=G(Math.hypot(px,py),.12+.035*hash(cx+41,cy-17));
  const grain=hash(i,j)-.5,k=(j*n+i)*4;
  h[j*n+i]=.5-.026*pore+.007*grain+.034*lip*Math.sin(x*930+1.7*Math.sin(x*137)+y*22)*(1-.5*G(y-seam,.006));
  const tzone=(.5*G(x,.13)*G(y-2.2,.27)+.18*G(x,.22)*G(y-2.95,.32))*front;
  const rgh=THREE.MathUtils.lerp(.53-.08*tzone+.025*grain,.305+.023*Math.sin(x*1030),lip);
  rough[k]=rough[k+1]=rough[k+2]=Math.round(255*THREE.MathUtils.clamp(rgh,.25,.65));rough[k+3]=255;
  const freckles=front*.5*Math.pow(Math.max(0,hash(cx-42,cy+37)-.985)*66,2)*G(y-2.22,.23)*G(Math.abs(x)-.35,.2);
  color[k]=Math.round(251+grain*4-freckles*8);color[k+1]=Math.round(250+grain*4-freckles*11);color[k+2]=Math.round(250+grain*4-freckles*12);color[k+3]=255;
  const mouthAO=.085*G(y-seam+.066,.027)*G(x,.13)*front,nostrilAO=.08*G(y-2.104,.018)*G(x,.08)*front;
  ao[k]=ao[k+1]=ao[k+2]=Math.round(255*(1-mouthAO-nostrilAO));ao[k+3]=255;
 }
 for(let j=0;j<n;j++)for(let i=0;i<n;i++){
  const dx=(h[j*n+(i+1)%n]-h[j*n+(i+n-1)%n])*2.5,dy=(h[((j+1)%n)*n+i]-h[((j+n-1)%n)*n+i])*2.5,k=(j*n+i)*4,len=Math.hypot(dx,dy,1);
  normal[k]=Math.round(127.5-127.5*dx/len);normal[k+1]=Math.round(127.5-127.5*dy/len);normal[k+2]=Math.round(127.5+127.5/len);normal[k+3]=255;
 }
 const occlusion=makeTexture(ao,n);occlusion.channel=0;
 return{normal:makeTexture(normal,n),roughness:makeTexture(rough,n),color:makeTexture(color,n,true),occlusion};
}
