from pathlib import Path
p=Path('src/groom.js');s=p.read_text()
s=s.replace('end:.70+random()*.30','end:.93+random()*.07')
s=s.replace("roughness:.42,anisotropy:.85,anisotropyRotation:PI/2,specularIntensity:.75,sheen:.25", "roughness:.57,anisotropy:.85,anisotropyRotation:PI/2,specularIntensity:.30,sheen:.08")
s=s.replace('2.19+1.06*Math.pow(front,1.2)','2.19+1.15*Math.pow(front,1.2)')
needle=' const cores=builder(),cards=builder(),wisps=builder();let lockCount=0,cardCount=0,filaments=0;'
insert='''
 function liftFront(curve){
  const points=curve.getPoints(180).map(p=>{
   if(p.y>2.83&&p.z>-.02){const sy=Math.max(1.80,Math.min(3.472,p.y-.065));
    if(Math.abs(p.x)<headWidth(sy)*1.13){const minZ=faceZ(p.x/1.115,sy)*1.085+.051,d=p.z-minZ;p.z=(p.z+minZ+Math.sqrt(d*d+.00012))*.5;}}
   return p;
  });return new THREE.CatmullRomCurve3(points,false,'centripetal');
 }
 function fineFibers(curve,radial,spread,count){
  const segments=mobile?52:76;
  for(let k=0;k<count;k++){
   const offset=(random()-.5)*spread*2,phase=random()*TAU,depth=.030+random()*.010,color=new THREE.Color('#59423c').multiplyScalar(.65+random()*.65),base=wisps.p.length/3,width=.00035+random()*.00025;
   for(let j=0;j<=segments;j++){
    const t=j/segments,p=curve.getPoint(t),tan=curve.getTangent(t).normalize(),out=radial.clone().add(V(0,.40*Math.pow(1-t,5),0)).normalize(),side=tan.clone().cross(out).normalize(),normal=side.clone().cross(tan).normalize();
    const taper=Math.pow(Math.max(.0001,1-t),.65);p.addScaledVector(side,offset*(.35+.65*taper)+.0013*Math.sin(t*13+phase));p.addScaledVector(normal,depth);
    for(let a=0;a<2;a++){const pp=p.clone().addScaledVector(side,(a?1:-1)*width*taper),n=normal.clone().multiplyScalar(.90).addScaledVector(side,(a?1:-1)*.44).normalize();wisps.p.push(pp.x,pp.y,pp.z);wisps.n.push(n.x,n.y,n.z);wisps.uv.push(a,t);wisps.color.push(color.r,color.g,color.b);}
    if(j<segments){const i=base+j*2;wisps.idx.push(i,i+1,i+2,i+1,i+3,i+2);}
   }filaments++;
  }
 }
'''
s=s.replace(needle,needle+insert)
a=s.index(' // Continuous rear locks');b=s.index(' // Front masses',a)
sec=s[a:b].replace('const curve=new THREE.CatmullRomCurve3','let curve=new THREE.CatmullRomCurve3').replace('V(.665*s,2.65,.625*c),V(.67*s,2.1,.61*c)','V(.665*s,2.65,s<0&&c>.15?-.11:.625*c),V(.67*s,2.1,s<0&&c>.15?-.13:.61*c)')
sec=sec.replace('  const radial=V(s,.03,c).normalize()', '  if(c>.1)curve=liftFront(curve);\n  const radial=V(s,.03,c).normalize()')
sec=sec.replace('lockCount++;','lockCount++;fineFibers(curve,radial,.042,mobile?12:24);')
s=s[:a]+sec+s[b:]
a=s.index(' // Front masses');b=s.index(' // Fine swept',a);sec=s[a:b]
sec=sec.replace('const curve=new THREE.CatmullRomCurve3','let curve=new THREE.CatmullRomCurve3')
sec=sec.replace('2.60,side<0?.12:', '2.60,side<0?-.10:').replace('2.18,side<0?-.005:', '2.18,side<0?-.14:')
sec=sec.replace('side*(.61+.11*layer),1.58','side*(.52+(side<0?.30:.39)*layer),1.58')
sec=sec.replace('side*(.53+.19*layer),1.00','side*(.42+(side<0?.43:.55)*layer),1.00')
sec=sec.replace('side*(.62+.22*layer),.52','side*(.53+(side<0?.43:.53)*layer),.52')
sec=sec.replace('side*(.73+.15*layer),.13','side*(.57+(side<0?.35:.43)*layer),.13')
sec=sec.replace('side*(.39+.25*layer),endY','side*((side<0?.29:.41)+.37*layer),endY')
sec=sec.replace('  const radial=V(side*.21,.0,1)', '  curve=liftFront(curve);\n  const radial=V(side*.21,.0,1)')
sec=sec.replace('lockCount++;','lockCount++;fineFibers(curve,radial,.038,mobile?38:62);')
s=s[:a]+sec+s[b:]
s=s.replace('const curve=new THREE.CatmullRomCurve3(pts,false,\'catmullrom\',.40),radial=V(0,.04,1);','const curve=liftFront(new THREE.CatmullRomCurve3(pts,false,\'catmullrom\',.40)),radial=V(0,.04,1);')
s=s.replace("curve=new THREE.CatmullRomCurve3(pts,false,'catmullrom',.35),radial=V(0,0,1)","curve=liftFront(new THREE.CatmullRomCurve3(pts,false,'catmullrom',.35)),radial=V(0,0,1)")
s=s.replace('mobile?15:25','mobile?42:65').replace("ribbon(wisps,cv,.00026+random()*.00021", "ribbon(wisps,liftFront(cv),.00038+random()*.00024")
p.write_text(s)
p=Path('src/main.js');s=p.read_text().replace('THREE.PCFSoftShadowMap','THREE.PCFShadowMap').replace('key.shadow.radius=3','key.shadow.radius=6').replace("params.has('capture')?1:Math.min(devicePixelRatio,mobile?1.5:1.75)","params.has('capture')?1.5:Math.min(Math.max(1.25,devicePixelRatio),mobile?1.5:1.75)");p.write_text(s)
