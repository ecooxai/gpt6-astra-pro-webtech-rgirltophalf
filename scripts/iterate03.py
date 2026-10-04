import json
p='public/process/manifest.json';m=json.load(open(p));m.update(revision='review-02',score=52,iterations=2,note='Review 2: 52/100. Eye visibility and coverage corrected. Remaining priorities: rounded crown and chin, integrated eyelids, broader asymmetric hair, softer fringe.');m['reviews'].insert(0,dict(title='02 · Eyes, coverage & crop',score=52,image='process/iteration-02-portrait.png',note='Fixed occluded irises and scalp intersections; darkened hair; shortened crop. Front hair, facial curvature and eyelids remain too stylized.',path='/home/dev/project/3d/gpt6_astra_pro_webtech_rgirltophalf/public/process/iteration-02-portrait.png'));json.dump(m,open(p,'w'),indent=2)
p='src/model.js';s=open(p).read();start=s.index('function interp(');end=s.index('\nfunction makeGeometry',start)
s=s[:start]+'''function interp(rows,y,k){let i=0;while(i<rows.length-2&&y>rows[i+1][0])i++;const r0=rows[Math.max(0,i-1)],r1=rows[i],r2=rows[i+1],r3=rows[Math.min(rows.length-1,i+2)],h=r2[0]-r1[0],t=clamp((y-r1[0])/h,0,1);const m1=(r2[k]-r0[k])/(r2[0]-r0[0]),m2=(r3[k]-r1[k])/(r3[0]-r1[0]);return (2*t*t*t-3*t*t+1)*r1[k]+(t*t*t-2*t*t+t)*h*m1+(-2*t*t*t+3*t*t)*r2[k]+(t*t*t-t*t)*h*m2;}
''' +s[end:]
insert=s.index('export function faceZ')
s=s[:insert]+'''const chinCenter=y=>.14*g(y-1.66,.105);
function headWidth(y){if(y<1.96)return .365*Math.sqrt(Math.max(.00002,1-Math.pow((y-1.97)/.31,2)));if(y>3.15)return .552*Math.sqrt(Math.max(.00002,1-Math.pow((y-2.92)/.553,2)));return interp(faceRows,y,1);}
function frontDepth(y){if(y<1.94)return .14+.28*Math.sqrt(Math.max(.00002,1-Math.pow((y-1.96)/.30,2)))-chinCenter(y);if(y>3.15)return .514*Math.sqrt(Math.max(.00002,1-Math.pow((y-2.92)/.553,2)));return interp(faceRows,y,2);}
function backDepth(y){if(y>3.15)return .536*Math.sqrt(Math.max(.00002,1-Math.pow((y-2.92)/.553,2)));return interp(faceRows,y,3);}
''' +s[insert:]
s=s.replace('Math.max(.008,interp(faceRows,y,1)),d=interp(faceRows,y,2)','Math.max(.008,headWidth(y)),d=frontDepth(y)').replace('+.25*g(y-1.66,.10)','+chinCenter(y)')
s=s.replace('w=Math.max(.001,interp(faceRows,y,1)),back=interp(faceRows,y,3)','w=Math.max(.001,headWidth(y)),back=backDepth(y)')
s=s.replace('bottom=2.12+.94*Math.pow(front,3),y=mix(3.535','bottom=2.17+.91*Math.pow(front,1.3),y=mix(3.539')
s=s.replace('sy=clamp(y-.066,1.8,3.469),w=interp(faceRows,sy,1)*1.12','sy=clamp(y-.066,1.8,3.473),w=headWidth(sy)*1.12').replace('-interp(faceRows,sy,3)*Math.pow','-backDepth(sy)*Math.pow')
s=s.replace('const eyeY=2.419,eyeX=.235,eyeW=.146','const eyeY=2.419,eyeX=.243,eyeW=.139')
s=s.replace('(upper?.066:-.043)','(upper?.069:-.046)').replace('faceZ(x,y)+.015+.016*(1-t*t)','faceZ(x,y)+.006+.005*(1-t*t)')
s=s.replace('.018*Math.sin(PI*v)*(1-t*t)','.013*Math.sin(PI*v)*(1-t*t)')
s=s.replace(')/2+.023',')/2+.018')
s=s.replace('const L=.016+.018*Math.pow','const L=.012+.011*Math.pow').replace('L*.42,.014','L*.35,.009').replace('L,.023','L*.65,.016')
s=s.replace('ir=.056','ir=.064').replace('[.024,.024,.004]','[.026,.026,.004]')
s=s.replace('[.057,.057,.007]','[.064,.064,.006]')
s=s.replace('const seamY=t=>1.949','const seamY=t=>1.949').replace('x=.169*t','x=.160*t').replace('(.027+.015*g','(.033+.014*g').replace('ys-.040*Math.pow','ys-.047*Math.pow').replace("seam,.0016,lipLine","seam,.0010,lipLine")
s=s.replace("color:'#be7b78'","color:'#bc7773'").replace("color:'#d58c85'","color:'#d68c85'")
s=s.replace("new THREE.Color('#efc2ad')","new THREE.Color('#eec0ac')").replace("g(y-2.25,.12)*.36","g(y-2.25,.14)*.51")
# Add asymmetric S-shaped front locks. These are real volumetric surfaces, visible in orbit.
needle=" mesh(makeGeometry(hp,hi,hu,hc),hairmat,hairGroup,'Layered volumetric hair clumps');"
extra='''
 const frontGuides=[];
 for(const side of [-1,1])for(let j=0;j<(side===1?38:30);j++){
  const t=j/(side===1?37:29),r=rnd(),z=.49+.13*t;
  const curve=new THREE.CatmullRomCurve3([
   V(.10+(t-.5)*.025,3.46-.07*t,.37+.02*t),
   V(side*(.38+.11*t),3.245+.07*t,.54-.06*t),
   V(side*(.57+.09*t),2.80,.47-.08*t),
   V(side*(.57+.10*t),2.12,.43-.03*t),
   V(side*(.58+.20*t),1.45,.48+.04*t),
   V(side*(.52+.32*t),.92,z+.055*Math.sin(t*5)),
   V(side*(.77+.25*t),.37,z-.05),
   V(side*(.69+.24*t),.05,.49-.02*t),
   V(side*(.39+.39*t),-.23+.22*t+.08*r,.46)
  ],false,'catmullrom',.35);
  const radial=V(side*.22,0,1).normalize();
  solidLock(curve,.030+.013*r,.021+.006*r,new THREE.Color().setHSL(.032,.18,.09+.037*r,THREE.SRGBColorSpace),radial,52);
  frontGuides.push({curve,radial});
 }
'''
s=s.replace(needle,extra+needle)
s=s.replace('const strandCount=mobile?1500:2800','const strandCount=mobile?1100:2000')
needle=' // Sparse fringes are individual tapered locks; the forehead remains visible between wisps.'
extra='''
 for(const {curve,radial} of frontGuides)for(let i=0;i<(mobile?12:24);i++)filament(curve,.00065+rnd()*.0005,new THREE.Color().setHSL(.032,.15,.11+rnd()*.07,THREE.SRGBColorSpace),radial,(rnd()-.5)*.050,rnd()*TAU,46);
'''
s=s.replace(needle,extra+needle)
s=s.replace('ty=2.52+.37*t+.06*Math.sin(t*7)','ty=2.47+.15*t+.04*Math.sin(t*6)')
s=s.replace('V(rx,3.47,.34),V(.06-.11*t,3.28,.541),V(mix(-.23,.10,t),3.025,.571),V(mix(-.38,.12,t),2.79+.17*t,.544),V(tx,ty,.47+.026*t)','V(rx,3.435-.055*t,.38+.06*t),V(.06-.11*t,3.23,.575),V(mix(-.23,.10,t),2.98,.56),V(mix(-.38,.12,t),2.72+.05*t,.54),V(tx,ty,faceZ(tx,ty)+.028)')
s=s.replace('k<32;k++','k<24;k++').replace('.00058+rnd()*.00065','.00045+rnd()*.00055')
s=s.replace('fineHairStrands:strandCount+468,solidHairLocks:122','fineHairStrands:strandCount+372+frontGuides.length*(mobile?12:24),solidHairLocks:122+frontGuides.length')
open(p,'w').write(s)
