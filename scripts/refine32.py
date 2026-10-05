from pathlib import Path

def patch(file,pairs):
 p=Path(file);s=p.read_text()
 for a,b in pairs:
  if a not in s:raise ValueError('Missing anchor in '+file+': '+a[:75])
  s=s.replace(a,b)
 p.write_text(s)

patch('src/face-surface.js',[
 ('return .204+Math.sqrt','return .195+Math.sqrt'),
 ('(Math.abs(x)-.072)/.014','(Math.abs(x)-.075)/.019'),
 ('center=2.115+fit.noseShift+.002*q','center=2.112+fit.noseShift+.003*q'),
 ('((y-center)/.006)**2','((y-center)/.0075)**2'),
 ('z-=.005*cavity','z-=.008*cavity'),
 ("new THREE.Color('#8d5d54'),.34", "new THREE.Color('#794d45'),.49"),
 ("new THREE.Color('#bc8d80'),.12*f", "new THREE.Color('#b98177'),.20*f"),
 ("new THREE.Color('#ae7a71'),.11*G(y-e.y-.035,.008)", "new THREE.Color('#a67265'),.16*G(y-e.y-.026,.008)")
])
patch('src/facial-definition.js',[
 ('z+=.102*g(x,.087)*g(ny-2.166,.084);','z+=.111*g(x,.092)*g(ny-2.157,.083);'),
 ('z+=.012*g(x,.031)*g(ny-2.108,.033);','z+=.021*g(x,.032)*g(ny-2.107,.030);'),
 ('z+=.028*g(Math.abs(x)-.081,.048)*g(ny-2.143,.051);','z+=.037*g(Math.abs(x)-.082,.041)*g(ny-2.138,.048);')
])
patch('src/eyes.js',[
 ('(upper?-.0062:.0070)','(upper?-.0105:.0070)'),
 ('roughness:.37,specularIntensity:.34','roughness:.29,specularIntensity:.22'),
 ('contact=.29*Math.exp(-(hi-y)/.010)+.075*Math.exp(-(y-lo)/.009)','contact=.45*Math.exp(-(hi-y)/.014)+.11*Math.exp(-(y-lo)/.009)'),
 ("corner*.34", "corner*.55"),
 ('const shade=1-.25*Math.exp(-(hi-y)/.010)','const shade=1-.37*Math.exp(-(hi-y)/.014)'),
 ("color.lerp(new THREE.Color(upper?'#be8d80':'#d4a09a'),v*.30)","color.lerp(new THREE.Color(upper?'#b07b70':'#d3a096'),v*(upper?.46:.37))"),
 ('110,.00085,4,false','110,.0015,5,false')
])
print('Pass 32: upper lid coverage, contact shading, softened orbit depth, and sculpted alar/nostril anatomy.')
