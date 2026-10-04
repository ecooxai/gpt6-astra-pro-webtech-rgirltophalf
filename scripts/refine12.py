from pathlib import Path
p=Path('src/model.js');s=p.read_text()
s=s.replace("import { buildOrbitalSkin, buildNoseSkin } from './anatomy.js';", "import { buildContinuousFace, eyeEdge, eyeSurface, eyeY, eyeX, eyeW } from './face-surface.js';")
a=s.index(' // One continuous closed head;');b=s.index(' // Neck and upper sternum',a)
s=s[:a]+''' // Seamless face with precise curved eye boundaries and embedded nasal/lip relief.
 buildContinuousFace({parent:head,material:skin,faceZ,skinColor,headWidth,backDepth,chinCenter,mobile});
'''+s[b:]
a=s.index(' const eyeY=2.419');b=s.index(' const sclera=',a);s=s[:a]+s[b:]
s=s.replace('  buildOrbitalSkin({parent:head,material:skin,side:s,eyeX,eyeY,eyeEdge,faceZ,skinColor,headWidth});','')
a=s.index(' // Nostrils are inset');b=s.index(' // Scalp undercoat',a);s=s[:a]+s[b:]
s=s.replace('pivot.rotation.z=-.095','pivot.rotation.z=-.135')
s=s.replace('z+=.065*g(x,.066)*g(y-2.38,.23);','z+=.054*g(x,.078)*g(y-2.38,.235);')
s=s.replace('z+=.141*g(x,.086)*g(y-2.170,.070)+.018*g(x,.025)*g(y-2.108,.030);','z+=.113*g(x,.090)*g(y-2.172,.078)+.017*g(x,.033)*g(y-2.111,.031);')
s=s.replace('z+=.052*g(Math.abs(x)-.075,.040)*g(y-2.130,.055);','z+=.037*g(Math.abs(x)-.078,.044)*g(y-2.139,.053);')
s=s.replace('z-=.009*g(x,.018)*g(y-2.035,.066);z+=.007*g(Math.abs(x)-.03,.013)*g(y-2.035,.06);','z-=.003*g(x,.023)*g(y-2.035,.054);z+=.003*g(Math.abs(x)-.028,.016)*g(y-2.035,.05);')
s=s.replace("const base=new THREE.Color('#f0caba')","const base=new THREE.Color('#efc6b6')")
s=s.replace("new THREE.Color('#d88d89'),blush","new THREE.Color('#d98684'),blush")
s=s.replace('skin.normalScale.set(.4,.4)','skin.normalScale.set(.18,.18)').replace('skin.specularIntensity=.74','skin.specularIntensity=.48')
s=s.replace('nr=14,na=96,ir=.064','nr=14,na=96,ir=.058').replace('(.064*.064)','(.058*.058)')
s=s.replace('[.026,.026,.004]','[.023,.023,.004]')
s=s.replace("const sclera=new THREE.MeshPhysicalMaterial({color:'#ffffff'","const sclera=new THREE.MeshPhysicalMaterial({color:'#e8e1dc'")
s=s.replace('haircapmat.alphaTest=.45','haircapmat.alphaTest=.15')
p.write_text(s)
