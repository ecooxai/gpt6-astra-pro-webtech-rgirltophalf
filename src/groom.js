/** Original dimensional hair groom: smooth core locks, layered fiber cards and separate flyaway filaments. */
import * as THREE from 'three';
const PI=Math.PI,TAU=PI*2,V=(x,y,z)=>new THREE.Vector3(x,y,z),lerp=THREE.MathUtils.lerp;
let state=81883;
function random(){state=(Math.imul(state,1664525)+1013904223)|0;return(state>>>0)/4294967296;}
const g=(x,s)=>Math.exp(-(x*x)/(s*s));
function texture(data,w,h,color=false){const t=new THREE.DataTexture(data,w,h);t.colorSpace=color?THREE.SRGBColorSpace:THREE.NoColorSpace;t.wrapS=THREE.ClampToEdgeWrapping;t.wrapT=THREE.ClampToEdgeWrapping;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;t.needsUpdate=true;return t;}
function fiberMaps(){
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
function builder(){return{p:[],n:[],uv:[],color:[],idx:[]};}
function finish(b,mat,parent,name,shadow=true){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(b.uv,2));if(b.color.length)geo.setAttribute('color',new THREE.Float32BufferAttribute(b.color,3));if(b.n.length)geo.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));geo.setIndex(b.idx);if(!b.n.length)geo.computeVertexNormals();const m=new THREE.Mesh(geo,mat);m.name=name;m.castShadow=shadow;m.receiveShadow=true;parent.add(m);return m;}
function ribbon(b,curve,width,depth,radial,color,{segments=90,across=6,offset=0,tip=.65}={}){
 const base=b.p.length/3;
 for(let j=0;j<=segments;j++){
  const t=j/segments,p=curve.getPoint(t),tan=curve.getTangent(t).normalize(),out=radial.clone().add(V(0,.45*Math.pow(1-t,5),0)).normalize();
  const side=tan.clone().cross(out).normalize(),normal=side.clone().cross(tan).normalize();
  const taper=Math.pow(Math.max(.00001,1-t),tip)*(.70+.30*Math.min(1,t*12));
  for(let i=0;i<=across;i++){
   const u=i/across,q=u*2-1,bulge=depth*(1-q*q),pos=p.clone().addScaledVector(side,q*width*taper).addScaledVector(normal,offset+bulge*taper);
   b.p.push(pos.x,pos.y,pos.z);b.uv.push(u,t);if(color)b.color.push(color.r,color.g,color.b);
   const no=normal.clone().addScaledVector(side,q*.22).normalize();b.n.push(no.x,no.y,no.z);
   if(j<segments&&i<across){const k=base+j*(across+1)+i;b.idx.push(k,k+1,k+across+1,k+1,k+across+2,k+across+1);}
  }
 }
}
function roundLock(b,curve,width,depth,radial,color,segments=85){
 const base=b.p.length/3,around=12;
 for(let j=0;j<=segments;j++){
  const t=j/segments,p=curve.getPoint(t),tan=curve.getTangent(t).normalize(),out=radial.clone().add(V(0,.35*Math.pow(1-t,5),0)).normalize(),side=tan.clone().cross(out).normalize(),normal=side.clone().cross(tan).normalize();
  const taper=Math.pow(Math.max(.0001,1-t),.62)*(.6+.4*Math.min(1,t*14));
  for(let i=0;i<=around;i++){
   const a=TAU*i/around,pp=p.clone().addScaledVector(side,Math.cos(a)*width*taper).addScaledVector(normal,Math.sin(a)*depth*taper);
   b.p.push(pp.x,pp.y,pp.z);b.uv.push(i/around,t);b.color.push(color.r,color.g,color.b);
   const no=side.clone().multiplyScalar(Math.cos(a)/width).addScaledVector(normal,Math.sin(a)/depth).normalize();b.n.push(no.x,no.y,no.z);
   if(j<segments&&i<around){const k=base+j*(around+1)+i;b.idx.push(k,k+around+1,k+1,k+1,k+around+1,k+around+2);}
  }
 }
}
export function buildGroom({parent,skinMaterial,mobile=false,headWidth,faceZ,backDepth}){
 state=81883;
 const maps=fiberMaps();
 const cardMat=new THREE.MeshPhysicalMaterial({map:maps.map,normalMap:maps.normal,normalScale:new THREE.Vector2(.24,.08),roughnessMap:maps.rough,roughness:.57,metalness:0,anisotropy:.95,anisotropyRotation:PI/2,specularIntensity:.85,sheen:.30,sheenColor:new THREE.Color('#5c5155'),sheenRoughness:.33,side:THREE.DoubleSide,alphaTest:.23,alphaToCoverage:true,depthWrite:true});
 const coreMat=new THREE.MeshPhysicalMaterial({color:'#ffffff',vertexColors:true,normalMap:maps.normal,normalScale:new THREE.Vector2(.12,.03),roughnessMap:maps.rough,roughness:.57,anisotropy:.85,anisotropyRotation:PI/2,specularIntensity:.30,sheen:.08,sheenColor:new THREE.Color('#5c4747'),sheenRoughness:.38});
 const fiberMat=new THREE.MeshPhysicalMaterial({color:'#ffffff',vertexColors:true,roughness:.39,anisotropy:.95,anisotropyRotation:PI/2,specularIntensity:.9,side:THREE.DoubleSide});
 const cores=builder(),cards=builder(),wisps=builder();let lockCount=0,cardCount=0,filaments=0;
 function liftFront(curve){
  const points=curve.getPoints(180).map(p=>{
   const blend=THREE.MathUtils.smoothstep(p.y,2.65,3.10);
   if(blend>0&&p.z>-.18){
    const sy=Math.max(1.80,Math.min(3.472,p.y-.065));
    const scalp=faceZ(p.x/1.115,sy)*1.085+.043;
    const skin=faceZ(p.x,Math.min(3.472,p.y))+.031;
    const minZ=lerp(skin,scalp,THREE.MathUtils.smoothstep(p.y,2.75,3.14));
    const difference=p.z-minZ,raised=(p.z+minZ+Math.sqrt(difference*difference+.00007))*.5;
    p.z=lerp(p.z,raised,blend);
   }
   return p;
  });return new THREE.CatmullRomCurve3(points,false,'centripetal');
 }
 function fineFibers(curve,radial,spread,count){
  const segments=mobile?52:76;
  for(let k=0;k<count;k++){
   const offset=(random()-.5)*spread*2,phase=random()*TAU,depth=.030+random()*.010,color=new THREE.Color('#342b2b').multiplyScalar(.65+random()*.65),base=wisps.p.length/3,width=.00035+random()*.00025;
   for(let j=0;j<=segments;j++){
    const t=j/segments,p=curve.getPoint(t),tan=curve.getTangent(t).normalize(),out=radial.clone().add(V(0,.40*Math.pow(1-t,5),0)).normalize(),side=tan.clone().cross(out).normalize(),normal=side.clone().cross(tan).normalize();
    const taper=Math.pow(Math.max(.0001,1-t),.65);p.addScaledVector(side,offset*(.35+.65*taper)+.0013*Math.sin(t*13+phase));p.addScaledVector(normal,depth);
    for(let a=0;a<2;a++){const pp=p.clone().addScaledVector(side,(a?1:-1)*width*taper),n=normal.clone().multiplyScalar(.90).addScaledVector(side,(a?1:-1)*.44).normalize();wisps.p.push(pp.x,pp.y,pp.z);wisps.n.push(n.x,n.y,n.z);wisps.uv.push(a,t);wisps.color.push(color.r,color.g,color.b);}
    if(j<segments){const i=base+j*2;wisps.idx.push(i,i+1,i+2,i+1,i+3,i+2);}
   }filaments++;
  }
 }

 // Rounded scalp core follows the skull; its front boundary is hidden by swept growing roots.
 const cap=builder(),ny=100,na=180;
 for(let j=0;j<=ny;j++)for(let i=0;i<=na;i++){
  const a=-PI+TAU*i/na,front=Math.max(0,Math.cos(a));const bottom=2.19+.89*Math.pow(front,1.2)+.15*g(a+1.2,.30);
  const y=lerp(3.535,bottom,j/ny),sy=Math.max(1.80,Math.min(3.472,y-.065)),x=headWidth(sy)*1.115*Math.sin(a),z=Math.cos(a)>=0?faceZ(x/1.115,sy)*1.085+.022:-backDepth(sy)*Math.pow(-Math.cos(a),.85)*1.1;
  cap.p.push(x,y,z);cap.uv.push(i/na,j/ny);const c=new THREE.Color('#211919');cap.color.push(c.r,c.g,c.b);
  if(j<ny&&i<na){const k=j*(na+1)+i;cap.idx.push(k,k+na+1,k+1,k+1,k+na+1,k+na+2);}
 }
 finish(cap,coreMat,parent,'Rounded scalp undercoat');
 // Continuous rear locks form a natural solid silhouette from every orbit angle.
 for(let i=0;i<64;i++){
  state=93163+i*2719;
  const a=.92+(TAU-1.84)*(i+.5)/64,s=Math.sin(a),c=Math.cos(a),j=random(),phase=random()*TAU;
  let curve=new THREE.CatmullRomCurve3([
   V(.055+(.5-j)*.03,3.52-.10*c*c,.37*c),V(.36*s+.025,3.42-.06*c,.47*c),V(.60*s,3.10,.61*c),
   V(.665*s,2.65,s<0&&c>.15?-.11:.625*c),V(.67*s,2.1,s<0&&c>.15?-.13:.61*c),V(.71*s,1.52,.60*c),V(.78*s,.91,.60*c),
   V((.82+.04*Math.sin(phase))*s,.38,.59*c),V((.69+.07*Math.sin(phase))*s,-.23+random()*.20,.53*c)
  ],false,'catmullrom',.35);
  if(c>.1)curve=liftFront(curve);
  const radial=V(s,.03,c).normalize(),col=new THREE.Color('#241c1d').multiplyScalar(.75+random()*.6);
  roundLock(cores,curve,.048+random()*.019,.020,radial,col,90);lockCount++;fineFibers(curve,radial,.042,mobile?12:24);
  for(let k=0;k<(mobile?2:3);k++){ribbon(cards,curve,.060+random()*.008,.014,radial,null,{segments:90,across:4,offset:.022+k*.003});cardCount++;}
 }
 // Front masses: the left passes behind the ear; the right remains face-framing.
 for(const side of[-1,1])for(let i=0;i<30;i++){
  state=182911+(side+1)*7879+i*13337;
  const layer=i/29,r=random(),theta=.28+.69*layer;
  const root=V(.074+side*(.008+.01*r),2.64+.90*Math.cos(theta),.635*Math.sin(theta));
  const x2=side*(.30+.08*layer),y2=3.37-.14*layer,z2=Math.max(.15,faceZ(x2/1.08,y2-.035)*1.09+.024);
  const endY=-.37+.37*r+.10*layer,phase=r*6.283;
  let curve=new THREE.CatmullRomCurve3([
   root,V(x2,y2,z2),V(side*(.54+.035*layer),2.99,.37+.06*layer),
   V(side*(.59+.025*layer),2.60,side<0?-.10:.34+.055*layer),
   V(side*(.60+.055*layer),2.18,side<0?-.14:.34+.055*layer),
   V(side*(.52+(side<0?.30:.39)*layer),1.58,.40+.085*layer),
   V(side*(.42+(side<0?.43:.55)*layer+.024*Math.sin(phase)),1.00,.51+.12*layer+.022*Math.sin(phase+layer)),
   V(side*(.53+(side<0?.43:.53)*layer+.038*Math.sin(phase+1)),.52,.63+.052*Math.sin(phase+layer*3)),
   V(side*(.57+(side<0?.35:.43)*layer+.047*Math.sin(phase+2)),.13,.57+.07*layer+.027*Math.sin(phase)),
   V(side*((side<0?.29:.41)+.37*layer+.04*Math.sin(phase+3)),endY,.49+.08*layer)
  ],false,'catmullrom',.45);
  curve=liftFront(curve);
  const radial=V(side*.21,.0,1).normalize(),col=new THREE.Color('#241c1d').multiplyScalar(.75+.4*r);
  roundLock(cores,curve,.036+random()*.015,.016,radial,col,110);lockCount++;fineFibers(curve,radial,.038,mobile?38:62);
  for(let k=0;k<(mobile?3:4);k++){ribbon(cards,curve,.042+random()*.017,.008,radial,null,{segments:110,across:4,offset:.018+k*.0035,tip:.48});cardCount++;}
 }
 // Fine swept roots curve across the forehead instead of ending in a helmet-like hairline.
 for(const side of[-1,1])for(let i=0;i<40;i++){
  state=263239+(side+1)*4919+i*3191;
  const f=i/39,r=random(),theta=.32+.73*f,rx=.077+side*(.011+.018*r),ry=2.64+.90*Math.cos(theta),rz=.635*Math.sin(theta);
  const pts=[];
  for(let k=0;k<=30;k++){
   const t=k/30,q=1-t,x=q*q*rx+2*q*t*(side*(.24+.06*f))+t*t*side*(.555+.025*f),y=q*q*ry+2*q*t*(3.26-.19*f)+t*t*(2.79+.05*f);
   pts.push(V(x,y,faceZ(x/1.10,Math.min(3.46,y-.030))*1.06+.034));
  }
  const curve=liftFront(new THREE.CatmullRomCurve3(pts,false,'catmullrom',.40)),radial=V(0,.04,1);
  ribbon(cards,curve,.015+.008*r,.002,radial,null,{segments:75,across:4,offset:.003,tip:.5});cardCount++;fineFibers(curve,radial,.013,mobile?20:30);
 }
 // Delicate asymmetrical fringe; separate cards and hairs, with tapered ends.
 const bangPaths=[
 [[.12,3.34],[-.01,3.16],[-.20,2.92],[-.35,2.65],[-.47,2.23]],
 [[.14,3.35],[.065,3.12],[-.075,2.86],[-.20,2.61],[-.32,2.38]],
 [[.17,3.33],[.145,3.10],[.065,2.88],[-.035,2.67],[-.13,2.53]],
 [[.195,3.33],[.23,3.09],[.20,2.84],[.13,2.66],[.07,2.57]],
 [[.14,3.33],[.095,3.08],[-.005,2.85],[-.12,2.66],[-.21,2.49]],
 [[.205,3.34],[.28,3.08],[.27,2.86],[.23,2.72],[.18,2.62]],
 [[.11,3.31],[-.06,3.13],[-.29,2.88],[-.44,2.64],[-.50,2.42]]];
 for(let i=0;i<bangPaths.length;i++){
  const pts=bangPaths[i].map(([x,y])=>V(x,y,faceZ(x,y)+.031)),curve=liftFront(new THREE.CatmullRomCurve3(pts,false,'catmullrom',.35)),radial=V(0,0,1),width=[.033,.027,.023,.015,.012,.010,.017][i];
  ribbon(cards,curve,width,.001,radial,null,{segments:85,across:4,offset:.003,tip:.62});cardCount++;
  for(let j=0;j<(mobile?42:65);j++){
   const offset=(random()-.5)*width*1.9,pp=pts.map((p,k)=>p.clone().add(V(offset*(1-.14*k),.003*Math.sin(j+k),.008))),cv=new THREE.CatmullRomCurve3(pp,false,'catmullrom',.4),color=new THREE.Color('#362b2b').multiplyScalar(.7+random()*.5);
   ribbon(wisps,liftFront(cv),.00038+random()*.00024,0,radial,color,{segments:50,across:1,offset:0,tip:.80});filaments++;
  }
 }
 // Independent flyaways break the silhouette, without fuzzy bands or shared pointed tips.
 for(let i=0;i<(mobile?150:260);i++){
  const side=random()<.5?-1:1,r=random(),y=2.4+random()*.9,pts=[V(side*(.56+r*.07),y,.15+r*.24),V(side*(.64+r*.08),y-.45,.25+r*.27),V(side*(.60+r*.17),y-1.15,.40+r*.19),V(side*(.61+r*.21),y-1.90,.53),V(side*(.40+r*.30),y-2.43,.45)];
  const curve=new THREE.CatmullRomCurve3(pts,false,'catmullrom',.45),color=new THREE.Color('#3b3030').multiplyScalar(.7+random()*.5);
  ribbon(wisps,curve,.00023+random()*.00021,0,V(side*.3,0,1),color,{segments:65,across:1,tip:.9});filaments++;
 }
 finish(cores,coreMat,parent,'Smooth dimensional groom core locks');
 finish(cards,cardMat,parent,'Layered growing fiber cards',false);
 finish(wisps,fiberMat,parent,'Independent fine flyaway filaments',false);
 return {hairCards:cardCount,fineHairStrands:filaments,solidHairLocks:lockCount,proceduralFibersPerCard:40};
}
