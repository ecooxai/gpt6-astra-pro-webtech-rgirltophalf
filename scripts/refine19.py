from pathlib import Path
p=Path('src/groom-flow.js');s=p.read_text()
s=s.replace("const x=.075+side*.0035,z=mix(-.49,.53,u)","const x=.075+.018*Math.sin(PI*u)+side*.0035,z=mix(-.49,.548,u)")
s=s.replace('side<0?1.22:1.075','side<0?1.22:.93')
s=s.replace('ripple=(.0027*Math.sin(u*49+t*5)+.0016*Math.cos(u*127-t*6))*Math.sin(PI*t)', 'ripple=(.008*Math.sin(u*41+t*7)+.0048*Math.cos(u*91-t*8)+.0024*Math.sin(u*177+t*12))*Math.sin(PI*t)')
s=s.replace('if(y>2.05)zFrontActual=side<0?-.135:.330;', 'if(y>2.05)zFrontActual=side<0?-.135:.355;')
s=s.replace('[2.38,.643,.590,.615,.090,.615,.095,.33]', '[2.38,.643,.590,.615,.090,.515,.165,.35]')
s=s.replace('[1.99,.653,.590,.637,.115,.618,.130,.35]', '[1.99,.653,.590,.585,.175,.500,.205,.40]')
s=s.replace('[1.52,.692,.596,.613,.276,.587,.354,.43]', '[1.52,.692,.596,.478,.376,.422,.485,.48]')
s=s.replace('[.98,.758,.594,.589,.328,.621,.384,.55]', '[.98,.758,.594,.448,.424,.452,.531,.57]')
s=s.replace('[.51,.811,.607,.803,.415,.704,.427,.60]', '[.51,.811,.607,.735,.390,.544,.532,.60]')
s=s.replace('[.09,.802,.574,.895,.364,.677,.443,.57]', '[.09,.802,.574,.794,.308,.569,.472,.58]')
s=s.replace('backTip=-.35+.17','backTip=-.275+.17').replace('frontTip=-.31-.10','frontTip=-.235-.10')
s=s.replace('[.70,.51,.694,.229,.614,.324,.51]', '[.70,.51,.571,.271,.491,.405,.51]')
s=s.replace('front=.982+.010*Math.sin(v*137)+.005*Math.sin(v*353)','front=.971+.014*Math.sin(v*137)+.008*Math.sin(v*353)')
s=s.replace('1-smooth(u,front-.006,front)','1-smooth(u,front-.011,front)')
s=s.replace("roughness:.45,anisotropy:.94,anisotropyRotation:PI/2,specularIntensity:.66", "roughness:.30,anisotropy:.97,anisotropyRotation:PI/2,specularIntensity:.85")
s=s.replace("width=flyaway?.00023+.00016*hash(id,k):.00031+.00022*hash(id,k)","width=flyaway?.00038+.00022*hash(id,k):.00065+.00043*hash(id,k)")
s=s.replace("flyaway?'#42343a':'#3b2c30'", "flyaway?'#75616b':'#5b454e'")
s=s.replace('.multiplyScalar(.69+.53*hash(k,id))','.multiplyScalar(.59+.73*hash(k,id))')
s=s.replace('curl=.0016*Math.sin(f.t*16+phase)*Math.sin(PI*f.t)', 'curl=(.0028*Math.sin(f.t*16+phase)+.0014*Math.sin(f.t*39+phase*3))*Math.sin(PI*f.t)')
s=s.replace('if(i%3===0)addFine(curve,field,2,width*1.3,id+7401,true);', 'if(i%2===0)addFine(curve,field,3,width*1.7,id+7401,true);')
s=s.replace("finish(cores,coreMat,parent,'Continuous-flow volumetric locks');", "finish(cores,coreMat,parent,'Continuous-flow volumetric locks',false);")
# Fine individual hairline growth prevents a hard, helmet-like boundary.
anchor=' // A fine scalp-colored part is visible below the growing roots, not a hard central seam.'
s=s.replace(anchor,''' // Separate tapered hairline wisps feather the front edge into visible skin.
 for(const side of[-1,1])for(let i=0;i<38;i++){
  const r=hash(i,side),points=[];
  for(let j=0;j<=32;j++){
   const t=j/32,p=rootPoint(side,.991,t),inward=(.008+.024*r)*Math.sin(PI*t);
   p.x-=side*inward;p.y-=.008+.018*r*Math.sin(PI*t);p.z+=.008;
   points.push(p);
  }
  const curve=new THREE.CatmullRomCurve3(points,false,'centripetal'),field=(t,p)=>scalpNormal(p);
  ribbon(fine,curve,.00030+.00038*r,0,field,new THREE.Color('#5f464e').multiplyScalar(.7+.3*r),{segments:66,across:1,offset:.009,tip:.9,endStart:.6});strandCount++;
 }
'''+anchor)
p.write_text(s)
p=Path('src/model.js');s=p.read_text().replace('else y-=.07*(1-THREE.MathUtils.smoothstep(y,2.13,2.43))','else if(!hair)y-=.07*(1-THREE.MathUtils.smoothstep(y,2.13,2.43))');p.write_text(s)
