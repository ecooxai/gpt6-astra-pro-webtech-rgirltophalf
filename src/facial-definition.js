/** Original continuous anatomical head definition; independent of camera and image pixels. */
import * as THREE from 'three';
const clamp=THREE.MathUtils.clamp,mix=THREE.MathUtils.lerp,g=(x,s)=>Math.exp(-x*x/(s*s));
function interp(rows,y,k){let i=0;while(i<rows.length-2&&y>rows[i+1][0])i++;const r0=rows[Math.max(0,i-1)],r1=rows[i],r2=rows[i+1],r3=rows[Math.min(rows.length-1,i+2)],h=r2[0]-r1[0],t=clamp((y-r1[0])/h,0,1);const m1=(r2[k]-r0[k])/(r2[0]-r0[0]),m2=(r3[k]-r1[k])/(r3[0]-r1[0]);return (2*t*t*t-3*t*t+1)*r1[k]+(t*t*t-2*t*t+t)*h*m1+(-2*t*t*t+3*t*t)*r2[k]+(t*t*t-t*t)*h*m2;}
const faceRows=[
[1.65,.001,.180,-.180,.180],[1.665,.068,.247,-.138,.150],[1.695,.138,.300,-.075,.110],[1.74,.211,.346,.035,.070],[1.80,.275,.383,.180,.030],[1.88,.336,.410,.300,.008],[1.98,.411,.419,.395,0],[2.10,.466,.422,.450,0],[2.22,.510,.421,.490,0],[2.38,.549,.430,.519,0],[2.56,.555,.433,.538,0],[2.76,.553,.451,.542,0],[2.96,.550,.468,.530,0],[3.13,.510,.449,.480,0],[3.26,.438,.389,.419,0],[3.35,.345,.308,.330,0],[3.41,.244,.219,.235,0],[3.455,.137,.124,.133,0],[3.474,.001,.001,.001,0]
];

export {faceRows};
export function createFaceDefinition({noseShift=0,mouthShift=0,eyeSpacing=.243,eyeAsymmetry=0}={}){
 const chinCenter=y=>interp(faceRows,y,4);
 const headWidth=y=>interp(faceRows,y,1)*(1+.070*g(y-2.26,.36)+.015*g(y-2.69,.30));
 const frontDepth=y=>interp(faceRows,y,2)-chinCenter(y);
 const backDepth=y=>interp(faceRows,y,3)+chinCenter(y);
 function faceZ(x,y){
  const w=Math.max(.008,headWidth(y)),d=frontDepth(y),u=clamp(x/w,-.9999,.9999),ny=y-noseShift,my=y-mouthShift,ey=y+eyeAsymmetry*Math.tanh(x/.10);
  let z=d*Math.pow(Math.sqrt(Math.max(0,1-u*u)),.85)+chinCenter(y);
  z+=.036*g(Math.abs(x)-.37,.14)*g(y-2.25,.18);
  z-=.037*g(Math.abs(x)-(eyeSpacing-.010),.155)*g(ey-2.419,.093);
  z+=.021*g(Math.abs(x)-.22,.17)*g(y-2.55,.065);
  // Nasal ridge, tip, alae and columella have separate, smooth anatomical supports.
  z+=.060*g(x,.064)*g(ny-2.365,.224)*THREE.MathUtils.smoothstep(ny,2.100,2.163);
  z+=.116*g(x,.094)*g(ny-2.174,.081)*THREE.MathUtils.smoothstep(ny,2.056,2.139);
  z+=.023*g(x,.030)*g(ny-2.111,.027);
  z+=.049*g(Math.abs(x)-.084,.041)*g(ny-2.142,.054)*THREE.MathUtils.smoothstep(ny,2.067,2.132);
  z-=.006*g(Math.abs(x)-.126,.013)*g(ny-2.143,.038);
  const py=y-(noseShift+mouthShift)*.5;
  z-=.003*g(x,.023)*g(py-2.035,.054);z+=.003*g(Math.abs(x)-.028,.016)*g(py-2.035,.050);
  z+=.009*g(x,.20)*g(my-1.950,.10);
  z-=.003*g(x,.11)*g(my-1.86,.041);z+=.004*g(x,.19)*g(y-1.83,.065);
  z+=.015*g(Math.abs(x)-.26,.15)*g(ey-2.325,.07);
  z-=.018*g(Math.abs(x)-.12,.05)*g(ey-2.419,.10);
  return z;
 }
 return{faceRows,chinCenter,headWidth,frontDepth,backDepth,faceZ};
}
