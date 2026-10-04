/** Original continuous-flow groom.
 * The part-to-temple region follows curved scalp coordinates; the lower lengths
 * counter the head tilt to hang in world gravity. Fine fibers remain genuine 3D geometry.
 */
import * as THREE from 'three';
import fit from './portrait-fit.json' with {type:'json'};
import {applyHairShading} from './hair-shading.js';
import {builder,finish,ribbon,roundLock,fiberMaps,setGroomSeed} from './hair-primitives.js';
const PI=Math.PI,TAU=2*PI,V=(x,y,z)=>new THREE.Vector3(x,y,z),mix=THREE.MathUtils.lerp,clamp=THREE.MathUtils.clamp,smooth=THREE.MathUtils.smoothstep;
const hash=(a,b=0)=>{const h=Math.sin(a*127.1+b*311.7+52.7)*43758.5453123;return h-Math.floor(h);};
const RX=.695,RY=.973,RZ=.643,CY=2.60;
let activeFaceZ=null;
function clearScalp(p){if(activeFaceZ&&p.z>0&&p.y>2.65&&p.y<3.47&&Math.abs(p.x)<.575){p.z=Math.max(p.z,activeFaceZ(p.x,p.y)+.027);}return p;}
const headTilt=fit.roll,cosTilt=Math.cos(headTilt),sinTilt=Math.sin(headTilt);
function scalpNormal(p){return V(p.x/(RX*RX),(p.y-CY)/(RY*RY),p.z/(RZ*RZ)).normalize();}
function partPoint(u,side){const x=.075+.018*Math.sin(PI*u)+side*-.0015,z=mix(-.49,.587,u),q=Math.sqrt(Math.max(.001,1-(x/RX)**2-(z/RZ)**2));return V(x,CY+RY*q,z);}
function endAngle(side,u){return side*mix(PI,side<0?1.14:.87,Math.pow(u,.86));}
function rootPoint(side,u,t){
 const root=partPoint(u,side),a=endAngle(side,u),yEnd=2.54+.15*smooth(u,.20,1),qY=(yEnd-CY)/RY,qR=Math.sqrt(1-qY*qY);
 const A=V(root.x/RX,(root.y-CY)/RY,root.z/RZ).normalize(),B=V(qR*Math.sin(a),qY,qR*Math.cos(a)).normalize(),angle=Math.acos(clamp(A.dot(B),-.99999,.99999)),den=Math.sin(angle);
 const n=A.multiplyScalar(Math.sin((1-t)*angle)/den).addScaledVector(B,Math.sin(t*angle)/den).normalize();
 const p=V(n.x*RX,CY+n.y*RY,n.z*RZ),ripple=(.008*Math.sin(u*41+t*7)+.0048*Math.cos(u*91-t*8)+.0024*Math.sin(u*177+t*12))*Math.sin(PI*t);
 return clearScalp(p.addScaledVector(scalpNormal(p),ripple));
}
function gravityAligned(p){
 const w=1-smooth(p.y,1.25,2.47),x=(cosTilt*(p.x-fit.headX)+sinTilt*(p.y-fit.headY))/fit.scale,y=(-sinTilt*(p.x-fit.headX)+cosTilt*(p.y-fit.headY))/fit.scale+2.46;
 return V(mix(p.x,x,w),mix(p.y,y,w),p.z);
}
function bodyPoint(side,u,y,row){
 const a=endAngle(side,u),s=Math.sin(a),c=Math.cos(a),front=smooth(u,.42,.76),layer=clamp((1-u)/.27,0,1),wave=Math.sin(y*4.6+u*8.7);
 const [backWidth,backDepth,leftIn,leftSpan,rightIn,rightSpan,zFront]=row;
 const xBack=(backWidth+.027*wave)*s,zBack=(backDepth+.023*Math.cos(y*4.4+u*6))*c;
 let xFront=side*((side<0?leftIn:rightIn)+(side<0?leftSpan:rightSpan)*layer+.018*Math.sin(u*17+y*5.5));
 let zFrontActual=zFront+.045*Math.sin(PI*layer)+.014*Math.sin(u*19+y*4.5);
 if(y>2.05)zFrontActual=side<0?-.135:.355;
 let x=mix(xBack,xFront,front),z=mix(zBack,zFrontActual,front);
 // A loose clothing envelope prevents strands from cutting through the shirt.
 if(y<1.32){const bx=.965,bz=.441,q=(x/bx)**2+(z/bz)**2;
  if(q<1.08){const scale=Math.sqrt(1.08/Math.max(.0001,q));x*=scale;z*=scale;}}
 return gravityAligned(V(x,y,z));
}
const rows=[
 [2.38,.643,.590,.615,.090,.515,.165,.35],
 [1.99,.653,.590,.585,.175,.500,.205,.40],
 [1.52,.692,.596,.478,.376,.422,.485,.48],
 [.98,.758,.594,.448,.424,.452,.531,.57],
 [.51,.811,.607,.735,.390,.544,.532,.60],
 [.09,.802,.574,.794,.308,.569,.472,.58]
];
function makeGuide(side,u){
 const roots=[];for(let i=0;i<=42;i++)roots.push(rootPoint(side,u,i/42));
 const end=roots.at(-1),backTip=-.275+.17*Math.sin(endAngle(side,u))**2,frontTip=-.165-.15*smooth(u,.73,1)+.062*Math.sin(u*31+side),front=smooth(u,.42,.76),tipY=mix(backTip,frontTip,front);
 const body=[roots.at(-3),end,...rows.map(([y,...row])=>bodyPoint(side,u,y,row)),bodyPoint(side,u,tipY,[.70,.51,.571,.271,.491,.405,.51])];
 const lower=new THREE.CatmullRomCurve3(body,false,'centripetal'),lowerPoints=[];
 for(let i=0;i<=180;i++){const t=mix(1/(body.length-1),1,i/180);lowerPoints.push(lower.getPoint(t));}
 const spline=new THREE.CatmullRomCurve3([...roots.slice(0,-1),...lowerPoints],false,'centripetal');spline.arcLengthDivisions=420;spline.updateArcLengths();
 const curve=new THREE.Curve();curve.getPoint=t=>spline.getPointAt(t);curve.getTangent=t=>spline.getTangentAt(t);return curve;
}
function normalField(side,u){
 const a=endAngle(side,u),front=smooth(u,.42,.76),body=V(mix(Math.sin(a),side*.20,front),0,mix(Math.cos(a),1,front)).normalize();
 return(t,p)=>body.clone().lerp(scalpNormal(p),smooth(p.y,2.40,2.96)).normalize();
}
function cuticleMask(){
 const w=512,h=1024,d=new Uint8Array(w*h*4);
 for(let y=0;y<h;y++)for(let x=0;x<w;x++){
  const u=x/(w-1),v=y/(h-1),tip=.965+.030*hash(Math.floor(x*2.2),9),front=.9995+.0003*Math.sin(v*137),a=(1-smooth(v,tip-.009,tip))*(1-smooth(u,front-.001,front)),k=(y*w+x)*4;
  d[k]=d[k+1]=d[k+2]=255;d[k+3]=Math.round(a*255);
 }
 const t=new THREE.DataTexture(d,w,h);t.channel=1;t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.needsUpdate=true;return t;
}
function cloneRepeat(t){const c=t.clone();c.wrapS=c.wrapT=THREE.RepeatWrapping;c.needsUpdate=true;return c;}
export function buildGroom({parent,skinMaterial,mobile=false,faceZ}){
 activeFaceZ=faceZ;setGroomSeed(81883);const maps=fiberMaps(),fine=builder(),cores=builder(),cards=builder();
 const normal=cloneRepeat(maps.normal),rough=cloneRepeat(maps.rough);
 const baseMat=new THREE.MeshPhysicalMaterial({color:'#ffffff',vertexColors:true,roughness:.73,normalMap:normal,normalScale:new THREE.Vector2(.15,.045),roughnessMap:rough,anisotropy:.90,anisotropyRotation:PI/2,specularIntensity:.45,sheen:.09,sheenColor:new THREE.Color('#69585e'),sheenRoughness:.46,side:THREE.DoubleSide,map:cuticleMask(),alphaTest:.18,alphaToCoverage:true});
 const coreMat=baseMat.clone();coreMat.alphaMap=null;coreMat.map=null;coreMat.alphaTest=0;coreMat.side=THREE.FrontSide;coreMat.normalScale.set(.13,.04);
 const cardMat=new THREE.MeshPhysicalMaterial({map:maps.map,normalMap:maps.normal,normalScale:new THREE.Vector2(.17,.07),roughnessMap:maps.rough,roughness:.66,anisotropy:.92,anisotropyRotation:PI/2,specularIntensity:.65,sheen:.13,sheenColor:new THREE.Color('#69565d'),sheenRoughness:.4,side:THREE.DoubleSide,alphaTest:.20,alphaToCoverage:true});
 const fineMat=new THREE.MeshPhysicalMaterial({color:'#ffffff',vertexColors:true,roughness:.43,anisotropy:.92,anisotropyRotation:PI/2,specularIntensity:.58,side:THREE.DoubleSide});
 applyHairShading(coreMat,{strength:.26});applyHairShading(cardMat,{strength:.27});applyHairShading(fineMat,{strength:.26});
 function clumpGuide(base,field,id){
  const points=[],phase=hash(id,713)*TAU,end=.89+.11*hash(id,617);
  for(let i=0;i<=150;i++){
   const t=i/150,q=t*end,p=base.getPoint(q),T=base.getTangent(q).normalize(),N=field(q,p),S=T.clone().cross(N).normalize(),rootFade=smooth(t,.015,.20),lower=1-smooth(p.y,1.35,2.72);
   const lift=(.003+.011*hash(id,923)+.005*Math.sin(t*13+phase))*rootFade;
   const lateral=(.005*Math.sin(t*19+phase)+lower*.031*Math.sin(t*15+phase*2))*rootFade;
   p.addScaledVector(N,lift+lower*.015*Math.sin(t*21+phase)).addScaledVector(S,lateral);points.push(p);
  }
  const spline=new THREE.CatmullRomCurve3(points,false,'centripetal');spline.arcLengthDivisions=380;spline.updateArcLengths();const curve=new THREE.Curve();curve.getPoint=t=>spline.getPointAt(t);curve.getTangent=t=>spline.getTangentAt(t);return curve;
 }
 const guideCache=new Map(),guide=(side,u)=>{const key=side+':'+u.toFixed(7);if(!guideCache.has(key))guideCache.set(key,makeGuide(side,u));return guideCache.get(key);};
 // Filled, coherent underlayers follow precisely the same root/length flow as the surface fibers.
 for(const side of[-1,1]){
  const b=builder(),uv1=[],nu=mobile?96:120,nt=mobile?154:184;
  for(let j=0;j<=nt;j++)for(let i=0;i<=nu;i++){
   const u=i/nu,t=j/nt,curve=guide(side,u),p=curve.getPoint(t),out=normalField(side,u)(t,p);p.addScaledVector(out,-.006);
   b.p.push(p.x,p.y,p.z);b.uv.push(u*8,t);uv1.push(u,t);const c=new THREE.Color('#281e20').multiplyScalar(.90+.065*Math.sin(u*57)+.045*Math.sin(u*147+t*5));b.color.push(c.r,c.g,c.b);
   if(j<nt&&i<nu){const k=j*(nu+1)+i;if(side>0)b.idx.push(k,k+1,k+nu+1,k+1,k+nu+2,k+nu+1);else b.idx.push(k,k+nu+1,k+1,k+1,k+nu+1,k+nu+2);}
  }
  const under=finish(b,baseMat,parent,'Continuous scalp-to-tip hair underlayer '+side);under.geometry.setAttribute('uv1',new THREE.Float32BufferAttribute(uv1,2));
 }
 // Original root-only scalp sheets fill the crown continuously before the long guide family.
 // This support uses scalp coordinates directly, avoiding normalized-length foldovers near the part.
 for(const side of[-1,1]){
  const b=builder(),nu=100,nt=70;
  for(let j=0;j<=nt;j++)for(let i=0;i<=nu;i++){
   const u=i/nu,t=j/nt,p=rootPoint(side,u,t);p.addScaledVector(scalpNormal(p),-.003);
   b.p.push(p.x,p.y,p.z);b.uv.push(u*9,t*.27);
   const c=new THREE.Color('#292022').multiplyScalar(.94+.035*Math.sin(u*117));b.color.push(c.r,c.g,c.b);
   if(j<nt&&i<nu){const k=j*(nu+1)+i;if(side>0)b.idx.push(k,k+1,k+nu+1,k+1,k+nu+2,k+nu+1);else b.idx.push(k,k+nu+1,k+1,k+1,k+nu+1,k+nu+2);}
  }
  const scalpMat=coreMat.clone();scalpMat.side=THREE.DoubleSide;scalpMat.roughness=.78;
  finish(b,scalpMat,parent,'Continuous root-coordinate crown support '+side,false);
 }
 // Close the narrow central rear seam; the forehead side intentionally remains open.
 {
  const b=builder(),uv1=[],nt=140,nu=12,left=guide(-1,0),right=guide(1,0);
  for(let j=0;j<=nt;j++)for(let i=0;i<=nu;i++){
   const t=j/nt,u=i/nu,p=left.getPoint(t).lerp(right.getPoint(t),u);p.z+=.004;b.p.push(p.x,p.y,p.z);b.uv.push(u,t);uv1.push(u*.8,t);const c=new THREE.Color('#211a1c');b.color.push(c.r,c.g,c.b);
   if(j<nt&&i<nu){const k=j*(nu+1)+i;b.idx.push(k,k+1,k+nu+1,k+1,k+nu+2,k+nu+1);}
  }const m=finish(b,baseMat,parent,'Continuous rear part bridge');m.geometry.setAttribute('uv1',new THREE.Float32BufferAttribute(uv1,2));
 }
 let strandCount=0,cardCount=0,lockCount=0;
 function addFine(curve,field,count,spread,id,flyaway=false){
  const segments=mobile?62:86,frames=[];
  for(let j=0;j<=segments;j++){const t=j/segments,p=curve.getPoint(t),T=curve.getTangent(t).normalize(),N=field(t,p),S=T.clone().cross(N).normalize(),O=S.clone().cross(T).normalize();frames.push({t,p,T,S,O});}
  for(let k=0;k<count;k++){
   const a=hash(id*199+k,3),phase=hash(id*197+k,21)*TAU,offset=(a-.5)*spread*2,base=fine.p.length/3,width=flyaway?.00034+.00020*hash(id,k):.00043+.00027*hash(id,k);
   const color=new THREE.Color(flyaway?'#493e39':'#352b29').multiplyScalar(.59+.73*hash(k,id));
   const end=(id>=59000&&id<60000?.81:.95)+(id>=59000&&id<60000?.19:.05)*hash(id,k+931);
   for(let frameIndex=0;frameIndex<=segments;frameIndex++){
    const q=frameIndex*end,index=Math.floor(q),blend=q-index,A=frames[index],B=frames[Math.min(segments,index+1)];
    const f={t:frameIndex/segments,p:A.p.clone().lerp(B.p,blend),S:A.S.clone().lerp(B.S,blend).normalize(),O:A.O.clone().lerp(B.O,blend).normalize()};
    const taper=Math.pow(Math.max(.0001,1-smooth(f.t,.91,1)),.75),curl=(.0028*Math.sin(f.t*16+phase)+.0014*Math.sin(f.t*39+phase*3))*Math.sin(PI*f.t),lift=flyaway?.018+.035*Math.sin(PI*f.t)**2:.014+.010*hash(id,k+18);
    const p=f.p.clone().addScaledVector(f.S,offset*(.7+.3*Math.sin(PI*f.t))*smooth(f.t,0,.042)+curl).addScaledVector(f.O,mix(.002,lift,smooth(f.t,0,.045)));
    for(let a=0;a<2;a++){const q=p.clone().addScaledVector(f.S,(a?1:-1)*width*taper),n=f.O.clone().multiplyScalar(.92).addScaledVector(f.S,(a?1:-1)*.392).normalize();fine.p.push(q.x,q.y,q.z);fine.n.push(n.x,n.y,n.z);fine.uv.push(a,f.t);fine.color.push(color.r,color.g,color.b);}
   }
   for(let j=0;j<segments;j++){const i=base+j*2;fine.idx.push(i,i+1,i+2,i+1,i+3,i+2);}strandCount++;
  }
 }
 const count=mobile?52:68;
 for(const side of[-1,1])for(let i=0;i<count;i++){
  // The same continuous family is used at both quality levels; LOD never changes the silhouette.
  const u=(i+.48)/count,field=normalField(side,u),id=(side+1)*977+i,curve=clumpGuide(guide(side,u),field,id),front=smooth(u,.42,.76),width=mix(.020,.032,front)*(.67+.62*hash(id,227)),color=new THREE.Color('#291e21').multiplyScalar(.86+.25*hash(i,side));
  roundLock(cores,curve,width,.010,field,color,mobile?94:116);lockCount++;
  for(let j=0;j<(mobile?1:2);j++){ribbon(cards,curve,width*1.35,.004,field,null,{segments:mobile?94:116,across:4,offset:.010+j*.005,tip:.66});cardCount++;}
  addFine(curve,field,mobile?30:40,width*.92,id);
  if(i%2===0)addFine(curve,field,3,width*1.7,id+7401,true);
 }
 for(const side of[-1,1])for(let k=0;k<90;k++){
  const u=(k+.33)/90,points=[];for(let j=0;j<=48;j++)points.push(rootPoint(side,u,j/48));
  const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
  addFine(curve,(t,p)=>scalpNormal(p),mobile?5:8,.006,82000+(side+1)*500+k);
 }
 // Separate tapered hairline wisps feather the front edge into visible skin.
 for(const side of[-1,1])for(let i=0;i<38;i++){
  const r=hash(i,side),points=[];
  for(let j=0;j<=32;j++){
   const t=j/32,p=rootPoint(side,.991,t),inward=(.008+.024*r)*Math.sin(PI*t);
   p.x-=side*inward;p.y-=.008+.018*r*Math.sin(PI*t);p.z+=.008;
   points.push(p);
  }
  const curve=new THREE.CatmullRomCurve3(points,false,'centripetal'),field=(t,p)=>scalpNormal(p);
  ribbon(fine,curve,.00030+.00038*r,0,field,new THREE.Color('#48372d').multiplyScalar(.7+.3*r),{segments:66,across:1,offset:.009,tip:.9,endStart:.6});strandCount++;
 }
 // A fine scalp-colored part is visible below the growing roots, not a hard central seam.
 if(false&&skinMaterial){
  const points=[];for(let i=0;i<=80;i++){const p=partPoint(.06+.87*i/80,1);p.x-=.0035;p.addScaledVector(scalpNormal(p),-.012);points.push(p);}
  const m=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),100,.0008,5,false),new THREE.MeshStandardMaterial({color:'#49342f',roughness:.85}));m.name='Subtle visible scalp part';m.castShadow=false;parent.add(m);
 }
 const bangPaths=[
 [[.087,3.13],[-.025,3.015],[-.205,2.815],[-.370,2.53],[-.490,2.22]],
 [[.120,3.17],[.040,3.010],[-.078,2.835],[-.200,2.625],[-.315,2.440]],
 [[.139,3.15],[.130,2.990],[.066,2.810],[-.023,2.630],[-.095,2.555]],
 [[.154,3.17],[.170,3.010],[.137,2.830],[.077,2.667],[.008,2.580]],
 [[.106,3.14],[.062,2.99],[-.027,2.82],[-.140,2.639],[-.205,2.502]],
 [[.191,3.18],[.250,3.014],[.256,2.840],[.217,2.698],[.163,2.616]],
 [[.082,3.14],[-.089,3.025],[-.277,2.828],[-.416,2.610],[-.512,2.427]],
 [[.168,3.15],[.176,2.960],[.13,2.800],[.091,2.664],[.055,2.598]],
 [[.130,3.15],[.021,2.990],[-.121,2.809],[-.244,2.593],[-.349,2.394]]];
 for(let i=0;i<bangPaths.length;i++){
  const points=bangPaths[i].map(([x,y],j)=>{if(j===0)y+=.115;const skin=faceZ(x,y)+.029,cap=RZ*Math.sqrt(Math.max(0,1-(x/RX)**2-((y-CY)/RY)**2))+.028;return V(x,y,mix(skin,Math.max(skin,cap),smooth(y,2.91,3.16))-(j===0?.060:0));}),curve=new THREE.CatmullRomCurve3(points,false,'centripetal'),field=(t,p)=>V(p.x*.28,.03,1).normalize(),width=[.029,.020,.014,.012,.008,.007,.016,.006,.008][i];
  ribbon(cards,curve,width,.001,field,null,{segments:84,across:4,offset:.003,tip:.85,endStart:.05});cardCount++;
  addFine(curve,field,mobile?30:48,width*.82,59001+i);
 }
 finish(cores,coreMat,parent,'Continuous-flow volumetric locks',false);
 finish(cards,cardMat,parent,'Original layered flow-following fiber cards',false);
 finish(fine,fineMat,parent,'Individually swept gravity-aligned hair fibers',false);
 return{hairCards:cardCount,solidHairLocks:lockCount,fineHairStrands:strandCount,proceduralFibersPerCard:40,rootFlow:'continuous curved scalp',seed:81883};
}
