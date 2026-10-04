from pathlib import Path
p=Path('src/model.js');s=p.read_text()
s=s.replace("import { buildEar } from './ear.js';", "import { buildEar } from './ear.js';\nimport { buildIrisTexture } from './iris.js';\nimport { buildSkinAtlas } from './skin-atlas.js';")
s=s.replace('const headWidth=y=>interp(faceRows,y,1);','const headWidth=y=>interp(faceRows,y,1)*(1+.070*g(y-2.26,.36)+.015*g(y-2.69,.30));')
s=s.replace('z+=.030*g(Math.abs(x)-.34,.115)*g(y-2.25,.16);','z+=.036*g(Math.abs(x)-.37,.14)*g(y-2.25,.18);')
s=s.replace('z+=.037*g(Math.abs(x)-.078,.044)*g(y-2.139,.053);','z+=.047*g(Math.abs(x)-.079,.045)*g(y-2.139,.052);z-=.005*g(Math.abs(x)-.108,.010)*g(y-2.139,.033);')
s=s.replace("g(Math.abs(x)-.36,.13)*g(y-2.25,.14)*.51","g(Math.abs(x)-.39,.16)*g(y-2.25,.16)*.44")
s=s.replace('pivot.rotation.y=-.025','pivot.rotation.y=.035')
s=s.replace(' // Seamless face with precise curved eye boundaries and embedded nasal/lip relief.', ''' // Anatomically placed, original skin maps distinguish matte skin from hydrated lip relief.
 const atlas=buildSkinAtlas(headWidth);skin.map=atlas.color;skin.normalMap=atlas.normal;skin.normalScale.set(.30,.30);skin.roughnessMap=atlas.roughness;skin.roughness=1;skin.aoMap=atlas.occlusion;skin.aoMapIntensity=.5;skin.sheen=.045;skin.specularIntensity=.46;
 // Seamless face with precise curved eye boundaries and embedded nasal/lip relief.''')
s=s.replace('map:irisTexture(),roughness:.65,specularIntensity:.13','map:buildIrisTexture(),roughness:.42,specularIntensity:.18')
s=s.replace(" const pupilMat=new THREE.MeshPhysicalMaterial({color:'#130f10',roughness:.08,specularIntensity:.65});", " const cornealMaterial=new THREE.MeshPhysicalMaterial({color:'#ffffff',transmission:1,thickness:.008,ior:1.376,roughness:.042,specularIntensity:1,envMapIntensity:5,depthWrite:false});cornealMaterial.name='Optical cornea';")
a=s.index("  ball(head,'Pupil '");b=s.index('  for(const upper of[true,false])',a)
s=s[:a]+'''  // A clear curved optical layer supplies real environment reflections; the pupil is pigment, not a protruding ball.
  const cp=ip.slice(),radius=.088,edgeHeight=Math.sqrt(radius*radius-ir*ir);
  for(let k=0;k<cp.length;k+=3){
   const dx=cp[k]-ix,dy=cp[k+1]-iy,radial=Math.min(ir*ir,dx*dx+dy*dy),t=clamp((cp[k]-s*eyeX)/eyeW,-.999,.999),lo=eyeEdge(s,t,false).y,hi=eyeEdge(s,t,true).y,margin=Math.min(cp[k+1]-lo,hi-cp[k+1]);
   const bulge=Math.sqrt(Math.max(.0001,radius*radius-radial))-edgeHeight;
   cp[k+2]=eyeSurface(s,cp[k],cp[k+1])+.0035+bulge*THREE.MathUtils.smoothstep(margin,0,.012);
  }
  const corneal=mesh(makeGeometry(cp,ii,iu),cornealMaterial,head,'Refractive corneal dome '+s);corneal.castShadow=false;

'''+s[b:]
s=s.replace('upper?.0020:.0012','upper?.00135:.0010')
s=s.replace(" const groomStats=buildGroom", " for(const o of head.children)if(o.isMesh&&[lashMat,browMat,browBase,rimMat,irisMat,sclera,cornealMaterial].includes(o.material))o.castShadow=false;\n const groomStats=buildGroom")
# Batching must retain the shadow policy of very fine fibers and transparent optics.
s=s.replace('joined.userData.components=batch.map', 'joined.castShadow=batch.some(o=>o.castShadow);joined.userData.components=batch.map')
s=s.replace(" // Preserve originals for inspection tools.", " // Preserve originals for inspection tools.")
p.write_text(s)
p=Path('src/ear.js');s=p.read_text().replace('(.557+lx','(.591+lx');p.write_text(s)
p=Path('src/face-surface.js');s=p.read_text().replace('(.033+.013','(.040+.013').replace(':.046)*Math.pow(f,.70)',':.061)*Math.pow(f,.70)').replace('hl=.046*Math.pow(f,.70)','hl=.061*Math.pow(f,.70)').replace('(upper?.014:.020)','(upper?.017:.024)').replace('.72*G(y-lip.s,.0023)*Math.pow(lip.f,.5)', '.74*(.45+.55*lip.t*lip.t)*G(y-lip.s,.0023)*Math.pow(lip.f,.5)');p.write_text(s)
p=Path('src/main.js');s=p.read_text().replace('portrait:{pos:[0,1.68,7.6]','portrait:{pos:[0,2.42,7.6]').replace('left:{pos:[-4.9,1.85,5.8]','left:{pos:[-4.9,2.35,5.8]').replace('right:{pos:[4.9,1.85,5.8]','right:{pos:[4.9,2.35,5.8]');p.write_text(s)
