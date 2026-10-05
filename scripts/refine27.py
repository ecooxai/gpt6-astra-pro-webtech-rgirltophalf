from pathlib import Path
p=Path('src/face-surface.js');s=p.read_text().replace('.225**2','.216**2').replace('const fade=1-THREE.MathUtils.smoothstep(dist,0,.14);','const fade=1-THREE.MathUtils.smoothstep(dist,0,upper?.14:.19);').replace('z+=.0047*G(dist-.025,.014)','z+=.0015*G(dist-.025,.018)').replace('z-=.016*cavity','z-=.009*cavity').replace('upper?.012:.023','upper?.009:.017').replace('z-=.0018*G(y-lip.s,.0018)','z-=.003*G(y-lip.s,.003)').replace(".32*Math.pow(cavity,.8)",".56*Math.pow(cavity,.8)").replace("new THREE.Color('#8b5050'),.61","new THREE.Color('#8b5050'),.44");p.write_text(s)
p=Path('src/brows.js');s=p.read_text().replace('i<250','i<350').replace('/250','/350').replace('const width=.009','const width=.0115').replace("'#66483c'","'#60483f'");p.write_text(s)
p=Path('src/garment.js');s=p.read_text()
s=s.replace(' return z;\n}', ''' // Gentle tension radiates from each sewn button, with broad relaxed cloth between them.
 for(const buttonY of [.695,.229,-.257]){
  const ax=Math.abs(dx),distance=y-buttonY+.105*ax+.095*ax*ax;
  const envelope=G(ax-.135,.20)*(1-G(ax,.035));
  z+=.0085*G(distance,.025)*envelope-.0045*G(distance+.030,.027)*envelope;
 }
 for(const side of[-1,1]){
  const anchor=side*.66,fold=y-.83+side*(x-anchor)*.47;
  z+=.013*G(fold,.028)*G(x-anchor,.23)*G(y-.66,.26);
  z-=.006*G(fold+.045,.032)*G(x-anchor,.25)*G(y-.66,.29);
 }
 return z;
}''')
s=s.replace('C=V(s*.445,1.004,.397),D=V(placketX(.875)+s*.045,.875,.419)', 'C=V(s*.406,.987,.410),D=V(placketX(1.035)+s*.038,1.035,.373)')
s=s.replace("color:'#eef0f6',roughness:.75,sheen:.55", "color:'#edf0f8',roughness:.72,sheen:.48")
p.write_text(s)
print('PASS27 eyelid, lip, eyebrow and tailored-cloth changes saved')
