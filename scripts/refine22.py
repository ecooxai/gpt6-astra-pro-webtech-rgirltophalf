from pathlib import Path
p=Path('src/groom-flow.js');s=p.read_text()
s=s.replace("import * as THREE from 'three';", "import * as THREE from 'three';\nimport {applyHairShading} from './hair-shading.js';")
s=s.replace('RX=.654,RY=.939,RZ=.614','RX=.695,RY=.973,RZ=.643').replace('z=mix(-.49,.548,u)','z=mix(-.49,.587,u)').replace('side<0?1.22:.93','side<0?1.14:.87')
s=s.replace('t.channel=1;t.generateMipmaps=true;', 't.channel=1;t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=true;')
s=s.replace('d[k]=d[k+1]=d[k+2]=Math.round(a*255);d[k+3]=255;', 'd[k]=d[k+1]=d[k+2]=255;d[k+3]=Math.round(a*255);')
s=s.replace('alphaMap:cuticleMask()', 'map:cuticleMask()')
s=s.replace('coreMat.alphaMap=null;', 'coreMat.alphaMap=null;coreMat.map=null;')
anchor=' const guideCache=new Map()'
s=s.replace(anchor,''' applyHairShading(coreMat,{strength:.65});applyHairShading(cardMat,{strength:.55});applyHairShading(fineMat,{strength:.55});
 function clumpGuide(base,field,id){
  const points=[],phase=hash(id,713)*TAU,end=.958+.042*hash(id,617);
  for(let i=0;i<=150;i++){
   const t=i/150,q=t*end,p=base.getPoint(q),T=base.getTangent(q).normalize(),N=field(q,p),S=T.clone().cross(N).normalize(),rootFade=smooth(t,0,.055),lower=1-smooth(p.y,1.35,2.72);
   const lift=(.006+.015*hash(id,923)+.006*Math.sin(t*13+phase))*rootFade;
   const lateral=(.005*Math.sin(t*19+phase)+lower*.017*Math.sin(t*15+phase*2))*rootFade;
   p.addScaledVector(N,lift+lower*.008*Math.sin(t*21+phase)).addScaledVector(S,lateral);points.push(p);
  }
  const spline=new THREE.CatmullRomCurve3(points,false,'centripetal');spline.arcLengthDivisions=380;spline.updateArcLengths();const curve=new THREE.Curve();curve.getPoint=t=>spline.getPointAt(t);curve.getTangent=t=>spline.getTangentAt(t);return curve;
 }
'''+anchor)
s=s.replace('const count=mobile?66:78;', 'const count=mobile?52:68;')
s=s.replace('const u=(i+.48)/count,curve=guide(side,u),field=normalField(side,u),id=(side+1)*977+i,front=', 'const u=(i+.48)/count,field=normalField(side,u),id=(side+1)*977+i,curve=clumpGuide(guide(side,u),field,id),front=')
s=s.replace('width=mix(.023,.029,front),color=', 'width=mix(.020,.032,front)*(.67+.62*hash(id,227)),color=')
s=s.replace('addFine(curve,field,mobile?22:37,width*.92,id);','addFine(curve,field,mobile?30:40,width*.92,id);')
s=s.replace('offset*(.7+.3*Math.sin(PI*f.t))+curl','offset*(.7+.3*Math.sin(PI*f.t))*smooth(f.t,0,.042)+curl')
s=s.replace('addScaledVector(f.O,lift);', 'addScaledVector(f.O,mix(.002,lift,smooth(f.t,0,.045)));')
s=s.replace('100,.0022,5,false','100,.0029,5,false')
p.write_text(s)
p=Path('src/hair-primitives.js');s=p.read_text().replace('(.70+.30*Math.min(1,t*12))','(.05+.95*Math.min(1,t*16))').replace('(.6+.4*Math.min(1,t*14))','(.05+.95*Math.min(1,t*16))');p.write_text(s)
p=Path('scripts/capture.mjs');s=p.read_text().replace("page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});", "page.on('pageerror',e=>{errors.push(e.message);console.error(e.message);});\n page.on('console',m=>{if(m.type()==='error'&&!m.text().includes('favicon')){errors.push(m.text());console.error(m.text());}});")
p.write_text(s)
