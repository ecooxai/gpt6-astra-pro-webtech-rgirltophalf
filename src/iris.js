/** Deterministic original iris pigment: irregular radial stroma, collarette, limbus and pupil. */
import * as THREE from 'three';
const G=(x,s)=>Math.exp(-x*x/(s*s));
function hash(x,y){const v=Math.sin(x*127.1+y*311.7+91.4)*43758.5453123;return v-Math.floor(v);}
function noise(x,y){const a=Math.floor(x),b=Math.floor(y),u=x-a,v=y-b,uu=u*u*(3-2*u),vv=v*v*(3-2*v);return THREE.MathUtils.lerp(THREE.MathUtils.lerp(hash(a,b),hash(a+1,b),uu),THREE.MathUtils.lerp(hash(a,b+1),hash(a+1,b+1),uu),vv);}
export function buildIrisTexture(){
 const n=512,d=new Uint8Array(n*n*4);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){
  const dx=(x+.5)/n*2-1,dy=(y+.5)/n*2-1,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx),k=(y*n+x)*4;
  const pupil=.386+.006*Math.sin(a*31)+.004*Math.sin(a*57),pupilBlend=THREE.MathUtils.smoothstep(r,pupil-.007,pupil+.013);
  const fibers=.14*Math.sin(a*103+Math.sin(a*17)*2.1+Math.sin(r*11)*1.7)+.095*Math.sin(a*241+r*8+Math.sin(a*31));
  const cellular=(noise(a*51+170,r*18)-.5)*.33,collarette=G(r-.55-.026*Math.sin(a*19),.037);
  let tone=.76+fibers+cellular+.15*collarette;
  tone*=1-.52*THREE.MathUtils.smoothstep(r,.81,1.0);
  tone*=1-.23*THREE.MathUtils.smoothstep(dy,-.10,.53);
  tone*=1-.11*G(r-.415,.024);
  let red=77*tone,green=49*tone,blue=37*tone;
  const crypts=G(r-.67-.036*Math.sin(a*23),.026)*Math.pow(Math.max(0,Math.sin(a*69+Math.sin(a*13))),6);
  red*=1-crypts*.30;green*=1-crypts*.34;blue*=1-crypts*.30;
  d[k]=Math.round(THREE.MathUtils.lerp(7,red,pupilBlend));d[k+1]=Math.round(THREE.MathUtils.lerp(6,green,pupilBlend));d[k+2]=Math.round(THREE.MathUtils.lerp(8,blue,pupilBlend));d[k+3]=255;
 }
 const t=new THREE.DataTexture(d,n,n);t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t;
}
