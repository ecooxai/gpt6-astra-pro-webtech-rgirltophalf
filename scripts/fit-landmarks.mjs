/** Reproducible procedural head-build / landmark-fit study.
 * Every candidate creates a new closed 3D head mesh, computes its normals and
 * bounds, checks finite geometry, then projects authored anatomical landmarks.
 * No source image is opened by this script. These are not full-scene renders.
 */
import * as T from 'three';
import fs from 'node:fs/promises';
import {createWriteStream} from 'node:fs';
import {createGzip} from 'node:zlib';
import {once} from 'node:events';
import {createFaceDefinition,faceRows} from '../src/facial-definition.js';
const TOTAL=20000,POP=48,root=process.cwd(),started=Date.now();
const guide=JSON.parse(await fs.readFile('studies/visual-landmark-guides.json','utf8'));
const targets=Object.fromEntries(Object.entries(guide.landmarks).map(([k,p])=>[k,[p[0]*720/1024,p[1]*1080/1536]]));
const keys=['headX','headY','roll','yaw','scale','lowerWarp','noseShift','mouthShift','eyeSpacing','eyeAsymmetry'];
const ranges=[[.035,.12],[2.40,2.525],[-.235,-.100],[-.12,.12],[.97,1.055],[0,.135],[-.03,.075],[-.045,.045],[.234,.253],[-.024,.024]];
const baseline={headX:.075,headY:2.438,roll:-.135,yaw:.035,scale:1,lowerWarp:.02,noseShift:0,mouthShift:0,eyeSpacing:.243,eyeAsymmetry:0};
const cam=new T.PerspectiveCamera(32,720/1080,.1,80);cam.position.set(0,2.42,7.6);cam.lookAt(0,1.53,0);cam.updateMatrixWorld();
const levels=[...new Set([...faceRows.map(r=>r[0]),1.905,1.939,1.949,2.111,2.13,2.15,2.174,2.195,2.419,2.455])].sort((a,b)=>a-b);
const NA=40,COLS=NA+1,vertexCount=levels.length*COLS+2,indices=[];
for(let j=0;j<levels.length-1;j++)for(let i=0;i<NA;i++){const k=j*COLS+i;indices.push(k,k+1,k+COLS,k+1,k+COLS+1,k+COLS);}
for(let i=0;i<NA;i++){indices.push(vertexCount-2,i+1,i);const k=(levels.length-1)*COLS+i;indices.push(vertexCount-1,k,k+1);}
const index=new T.BufferAttribute(new Uint32Array(indices),1),triangles=indices.length/3;
let seed=0x41c79021;function random(){seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296;}
function transform(x,y,z,p){
 y-=p.lowerWarp*(1-T.MathUtils.smoothstep(y,2.13,2.43));
 x*=p.scale;y=(y-2.46)*p.scale;z*=p.scale;
 const cr=Math.cos(p.roll),sr=Math.sin(p.roll),cy=Math.cos(p.yaw),sy=Math.sin(p.yaw),xx=cr*x-sr*y,yy=sr*x+cr*y;
 return [cy*xx+sy*z+p.headX,yy+p.headY,-sy*xx+cy*z];
}
function project(x,y,z,p){const a=transform(x,y,z,p),q=new T.Vector3(...a).project(cam);return [(q.x+1)*360,(1-q.y)*540];}
function evaluate(p){
 const f=createFaceDefinition(p),pos=new Float32Array(vertexCount*3);let offset=0;
 for(const y of levels){const w=f.headWidth(y);for(let i=0;i<=NA;i++){
  const a=2*Math.PI*i/NA,x=w*Math.sin(a),z=Math.cos(a)>=0?f.faceZ(x,y):-f.backDepth(y)*Math.pow(-Math.cos(a),.85)+f.chinCenter(y),q=transform(x,y,z,p);pos.set(q,offset);offset+=3;
 }}
 pos.set(transform(0,levels[0],f.chinCenter(levels[0]),p),offset);offset+=3;
 pos.set(transform(0,levels.at(-1),f.chinCenter(levels.at(-1)),p),offset);
 const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.BufferAttribute(pos,3));geometry.setIndex(index);geometry.computeVertexNormals();geometry.computeBoundingBox();
 const normals=geometry.attributes.normal.array;let valid=true,checksum=2166136261;
 const bitView=new Uint32Array(pos.buffer);
 for(let i=0;i<pos.length;i++){if(!Number.isFinite(pos[i])||!Number.isFinite(normals[i]))valid=false;checksum=Math.imul(checksum^bitView[i],16777619);}
 const size=new T.Vector3();geometry.boundingBox.getSize(size);valid=valid&&size.x>.85&&size.x<1.7&&size.y>1.5&&size.y<2.4&&size.z>.65&&size.z<1.55;
 const bounds={min:geometry.boundingBox.min.toArray(),max:geometry.boundingBox.max.toArray()};geometry.dispose();
 const coords={};for(const side of[-1,1]){
  const x=side*p.eyeSpacing-.0015,y=2.419-side*p.eyeAsymmetry+.0035,z=.212+Math.sqrt(.18*.18-.0015*.0015-.0035*.0035)+.0018;
  coords[side<0?'leftPupil':'rightPupil']=project(x,y,z,p);
 }
 const ny=2.174+p.noseShift;coords.noseTip=project(0,ny,f.faceZ(0,ny),p);
 const my=1.945+p.mouthShift;coords.mouthSeam=project(0,my,f.faceZ(0,my)+.0152,p);
 coords.chin=project(0,1.65,f.faceZ(0,1.65),p);
 let sum=0;const errors={};for(const name of Object.keys(targets)){const dx=coords[name][0]-targets[name][0],dy=coords[name][1]-targets[name][1];errors[name]=Math.hypot(dx,dy);sum+=dx*dx+dy*dy;}
 const rmse=Math.sqrt(sum/Object.keys(targets).length);
 const prior=.45*(p.eyeAsymmetry/.024)**2+.48*(p.yaw/.12)**2+.22*((p.scale-1)/.055)**2+.18*((p.eyeSpacing-.243)/.010)**2;
 const objective=valid?rmse*rmse+prior:1e9;
 return {objective,rmse,valid,checksum:(checksum>>>0).toString(16).padStart(8,'0'),coords,errors,bounds};
}
const stream=createWriteStream('public/process/head-fit-candidates.ndjson.gz'),gzip=createGzip({level:6});gzip.pipe(stream);
let count=0,invalid=0,best=null,unique=new Set(),baselineResult=null;
async function record(p,result,accepted){
 count++;if(!result.valid)invalid++;unique.add(result.checksum);
 const record={candidate:count,score:-result.objective,scoreMeaning:'negative regularized landmark objective; not a visual likeness score',landmarkRmsePx:result.rmse,geometryValid:result.valid,vertices:vertexCount,triangles,meshChecksum:result.checksum,accepted,parameters:p};
 if(!gzip.write(JSON.stringify(record)+'\n'))await once(gzip,'drain');
 if(count%250===0||count===1){await fs.writeFile('public/process/head-fit-progress.json',JSON.stringify({status:count===TOTAL?'completed':'running',completed:count,total:TOTAL,uniqueMeshes:unique.size,invalidMeshes:invalid,bestLandmarkRmsePx:best?.result.rmse??result.rmse,elapsedMs:Date.now()-started,scope:'coarse head-build and landmark-fit tests; not full-scene visual reviews'},null,2));if(count%2000===0)console.log('CANDIDATES',count,'BEST_RMSE_PX',best.result.rmse.toFixed(4),'UNIQUE_MESHES',unique.size);}
}
const population=[];
for(let i=0;i<POP;i++){
 const p=i===0?{...baseline}:Object.fromEntries(keys.map((k,j)=>[k,T.MathUtils.clamp(baseline[k]+(random()-.5)*(ranges[j][1]-ranges[j][0])*.9,...ranges[j])]));
 const result=evaluate(p);if(i===0)baselineResult=result;
 if(!best||result.objective<best.result.objective)best={p:{...p},result};population.push({p,result});await record(p,result,true);
}
while(count<TOTAL){
 const targetIndex=(count-POP)%POP,target=population[targetIndex];let ia,ib,ic;
 do{ia=Math.floor(random()*POP);}while(ia===targetIndex);do{ib=Math.floor(random()*POP);}while(ib===targetIndex||ib===ia);do{ic=Math.floor(random()*POP);}while(ic===targetIndex||ic===ia||ic===ib);
 const forced=Math.floor(random()*keys.length),p={};
 for(let j=0;j<keys.length;j++){
  const k=keys[j],lo=ranges[j][0],hi=ranges[j][1];let value=target.p[k];
  if(random()<.82||j===forced)value=population[ia].p[k]+.62*(population[ib].p[k]-population[ic].p[k]);
  // Retain a small, explicit perturbation floor to test local stability instead of repeating an identical converged mesh.
  value+=(random()-.5)*(hi-lo)*(count>11000?.0004:.00008);
  p[k]=T.MathUtils.clamp(value,lo,hi);
 }
 const result=evaluate(p),accepted=result.objective<=target.result.objective;if(accepted)population[targetIndex]={p,result};
 if(result.objective<best.result.objective)best={p:{...p},result};await record(p,result,accepted);
}
gzip.end();await once(stream,'finish');
const report={schemaVersion:1,author:'GPT-6 Astra Pro',tools:'JavaScript · Three.js · deterministic procedural geometry tests',scope:'20,000 coarse head mesh builds and landmark-fit tests. This is not 20,000 full-scene rendered visual reviews.',guideMethod:guide.method,guideUncertaintyPx:guide.uncertaintyPixelsAtEvaluationSize,guideTargetsAt720x1080:targets,candidateBuilds:count,uniqueMeshes:unique.size,invalidMeshes:invalid,verticesPerCandidate:vertexCount,trianglesPerCandidate:triangles,baseline:{parameters:baseline,landmarkRmsePx:baselineResult.rmse,projected:baselineResult.coords},best:{parameters:best.p,landmarkRmsePx:best.result.rmse,individualErrorsPx:best.result.errors,projected:best.result.coords,regularizedObjective:best.result.objective},visualReviewRequired:true,elapsedMs:Date.now()-started,finishedAt:new Date().toISOString(),projectAbsolutePath:root,logAbsolutePath:root+'/public/process/head-fit-candidates.ndjson.gz'};
await fs.writeFile('public/process/head-fit-report.json',JSON.stringify(report,null,2));await fs.writeFile('.review/fit-candidate.json',JSON.stringify({...best.p,fitStudy:{candidateBuilds:count,landmarkRmsePx:best.result.rmse,guideMethod:guide.method}},null,2));
console.log(JSON.stringify({completed:count,uniqueMeshes:unique.size,invalid,baselineRmsePx:baselineResult.rmse,bestRmsePx:best.result.rmse,parameters:best.p,elapsedMs:report.elapsedMs},null,2));
