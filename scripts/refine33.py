from pathlib import Path
p=Path('src/groom-flow.js');s=p.read_text()
a=s.index(' // Separate tapered hairline wisps');b=s.index(' // A fine scalp-colored part',a)
s=s[:a]+''' // Short, locally rooted baby hairs soften the boundary without forming a second long hair band.
 for(const side of[-1,1])for(let i=0;i<196;i++){
  const r=hash(i,side+57),start=.045+.88*(i+.42*r)/196,span=.024+.069*hash(i,192),points=[];
  for(let j=0;j<=16;j++){
   const local=j/16,t=Math.min(.998,start+span*local),p=rootPoint(side,.993+.009*r,t);
   const feather=Math.sin(PI*local)*(.005+.019*r);
   p.x-=side*feather;p.y-=feather*.73;p.addScaledVector(scalpNormal(p),.003+.006*Math.sin(PI*local));points.push(p);
  }
  const curve=new THREE.CatmullRomCurve3(points,false,'centripetal'),field=(t,p)=>scalpNormal(p);
  ribbon(fine,curve,.00023+.00022*r,0,field,new THREE.Color('#3f2d29').multiplyScalar(.7+.3*r),{segments:24,across:1,offset:.002,tip:1.1,endStart:.25});strandCount++;
 }
''' +s[b:]
s=s.replace('tip=.916+.079*hash(Math.floor(x*2.2),9)', 'tip=.951+.015*Math.sin(u*TAU*7)+.017*Math.sin(u*TAU*19)+.006*Math.sin(u*TAU*61)')
s=s.replace('tip-.014,tip', 'tip-.026,tip')
s=s.replace('specularIntensity:.45,sheen:.09','specularIntensity:.27,sheen:.055')
s=s.replace('applyHairShading(baseMat,{strength:.28})','applyHairShading(baseMat,{strength:.16})')
s=s.replace('applyHairShading(coreMat,{strength:.37})','applyHairShading(coreMat,{strength:.22})')
s=s.replace('applyHairShading(fineMat,{strength:.40})','applyHairShading(fineMat,{strength:.48})')
s=s.replace("-(j===0?.060:0)","-(j===0?.045:j===1?.015:0)")
p.write_text(s)
p=Path('src/main.js');s=p.read_text();anchor="area('#f0d5c3',2.7,1.5,4.2,-2.2,2.2,3.5);"
assert anchor in s
s=s.replace(anchor,anchor+"\n  // A broad lower fill approximates reflected light from the white blouse.\n  area('#fff0e7',.46,-.35,1.15,2.3,2.0,.72,0,2.25,.20);")
p.write_text(s)
print('Pass 33: locally rooted short baby hairs, smooth layered hair ends, separated fiber highlights, and blouse bounce light.')
