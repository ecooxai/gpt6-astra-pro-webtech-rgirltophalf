from pathlib import Path

def edit(name, pairs):
 p=Path(name);s=p.read_text()
 for old,new in pairs:
  if old not in s: raise RuntimeError(f'Missing edit anchor in {name}: {old[:70]}')
  s=s.replace(old,new)
 p.write_text(s)

edit('src/facial-definition.js',[
("z+=.060*g(x,.064)*g(ny-2.365,.224)*THREE.MathUtils.smoothstep(ny,2.100,2.163);","z+=.056*g(x,.079)*g(ny-2.345,.209);"),
("z+=.116*g(x,.094)*g(ny-2.174,.081)*THREE.MathUtils.smoothstep(ny,2.056,2.139);","z+=.102*g(x,.087)*g(ny-2.166,.084);"),
("z+=.023*g(x,.030)*g(ny-2.111,.027);","z+=.012*g(x,.031)*g(ny-2.108,.033);"),
("z+=.049*g(Math.abs(x)-.084,.041)*g(ny-2.142,.054)*THREE.MathUtils.smoothstep(ny,2.067,2.132);","z+=.028*g(Math.abs(x)-.081,.048)*g(ny-2.143,.051);"),
("z-=.006*g(Math.abs(x)-.126,.013)*g(ny-2.143,.038);","z-=.0035*g(Math.abs(x)-.119,.021)*g(ny-2.139,.036);"),
("z-=.037*g(Math.abs(x)-(eyeSpacing-.010),.155)*g(ey-2.419,.093);","z-=.022*g(Math.abs(x)-(eyeSpacing-.010),.174)*g(ey-2.419,.110);"),
("z+=.021*g(Math.abs(x)-.22,.17)*g(y-2.55,.065);","z+=.013*g(Math.abs(x)-.22,.18)*g(y-2.55,.083);"),
("z-=.018*g(Math.abs(x)-.12,.05)*g(ey-2.419,.10);","z-=.009*g(Math.abs(x)-.12,.070)*g(ey-2.419,.105);")])
edit('src/face-surface.js',[
("(Math.abs(x)-.080)/.020","(Math.abs(x)-.072)/.014"),
("center=2.117+fit.noseShift+.006*q","center=2.115+fit.noseShift+.002*q"),
("((y-center)/.009)**2","((y-center)/.006)**2"),
("x/.172","x/.159"),("x=t*.172","x=t*.159"),
("(.049+.013*G(Math.abs(t)-.29,.18)-.003*G(t,.10)):.075","(.038+.010*G(Math.abs(t)-.29,.18)-.004*G(t,.10)):.059"),
("(.049+.013*G(Math.abs(t)-.29,.18)-.003*G(t,.10))*Math.pow(f,.70),hl=.075","(.038+.010*G(Math.abs(t)-.29,.18)-.004*G(t,.10))*Math.pow(f,.70),hl=.059"),
("z-=.009*cavity","z-=.005*cavity"),
("(upper?.009:.017)","(upper?.006:.011)"),
(".0032*G(dist-.012,.012)",".0017*G(dist-.012,.016)"),
(".0044*G(dist-.030,.009)",".0025*G(dist-.030,.011)"),
(".0015*G(dist-.025,.018)",".0008*G(dist-.025,.024)"),
("new THREE.Color('#805046'),.56","new THREE.Color('#8d5d54'),.34"),
("lip.upper?'#c58280':'#db918f'","lip.upper?'#ba7474':'#d18383'"),
("f*.70","f*.78"),
(".44*(.45+.55*lip.t*lip.t)*G(y-lip.s,.0023)",".57*(.55+.45*lip.t*lip.t)*G(y-lip.s,.0017)")])
edit('src/skin-atlas.js',[("x/.172","x/.159"),("(.049+.013*G(Math.abs(r)-.29,.18)-.003*G(r,.10)):.075","(.038+.010*G(Math.abs(r)-.29,.18)-.004*G(r,.10)):.059"),(".49-.22*tzone",".46-.15*tzone"),("mouthAO=.085","mouthAO=.035"),("nostrilAO=.08","nostrilAO=.025")])
edit('src/eyes.js',[("envMapIntensity:2.6","envMapIntensity:1.25"),("roughness:.078","roughness:.105"),("color:'#e2d6ce'","color:'#eee1db'"),(".0036*Math.sin(PI*v)",".0018*Math.sin(PI*v)"),("v*.48","v*.30")])
edit('src/model.js',[("new THREE.Color('#efc6b6')","new THREE.Color('#f2ccbc')"),("g(y-2.25,.16)*.44","g(y-2.25,.18)*.30"),("skin.normalScale.set(.56,.56)","skin.normalScale.set(.41,.41)"),("skin.aoMapIntensity=.5","skin.aoMapIntensity=.25"),("skin.specularIntensity=.78","skin.specularIntensity=.50"),("skin.sheen=.045","skin.sheen=.14")])
# The collar rolls down from the neck instead of ending in a broad flat bib.
edit('src/garment.js',[
("const A=V(s*.233,1.465,.220),B=V(s*.455,1.215,.282),C=V(s*.425,1.010,.406),D=V(placketX(.890)+s*.045,.890,.415);","const A=V(s*.226,1.442,.222),B=V(s*.448,1.236,.290),C=V(s*.391,.977,.407),D=V(placketX(1.156)+s*.105,1.156,.363);"),
("p.z+=.047*Math.sin(PI*u)*Math.sin(PI*v)+.034*Math.sin(PI*v)*(1-u)+depth;","p.z+=.036*Math.sin(PI*u)*Math.sin(PI*v)+.060*Math.sin(PI*v)*(1-u)+depth;"),
("color:'#edf0f8',roughness:.72","color:'#f2f2fa',roughness:.80")])
print('Pass 29: nasal transitions, lip relief, orbital blend, skin materials and folded collar revised.')
