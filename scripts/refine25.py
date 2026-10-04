from pathlib import Path
p=Path('src/groom-flow.js');s=p.read_text().replace('side*.0035,z=mix','side*-.0015,z=mix').replace('if(skinMaterial){','if(false&&skinMaterial){').replace('front=.971+.014*Math.sin(v*137)+.008*Math.sin(v*353)', 'front=.9995+.0003*Math.sin(v*137)').replace('front-.011,front','front-.001,front')
s=s.replace('end=.958+.042*hash(id,617)', 'end=.89+.11*hash(id,617)')
s=s.replace('lower*.017*Math.sin(t*15+phase*2)', 'lower*.031*Math.sin(t*15+phase*2)').replace('lower*.008*Math.sin(t*21+phase)', 'lower*.015*Math.sin(t*21+phase)')
s=s.replace('frontTip=-.235-.10*smooth(u,.73,1)+.022*Math.sin(u*31+side)', 'frontTip=-.165-.15*smooth(u,.73,1)+.062*Math.sin(u*31+side)')
marker=' // Close the narrow central rear seam;'
insert=''' // Original root-only scalp sheets fill the crown continuously before the long guide family.
 // This support uses scalp coordinates directly, avoiding normalized-length foldovers near the part.
 for(const side of[-1,1]){
  const b=builder(),nu=100,nt=70;
  for(let j=0;j<=nt;j++)for(let i=0;i<=nu;i++){
   const u=i/nu,t=j/nt,p=rootPoint(side,u,t);p.addScaledVector(scalpNormal(p),-.003);
   b.p.push(p.x,p.y,p.z);b.uv.push(u*9,t*.27);
   const c=new THREE.Color('#292022').multiplyScalar(.94+.035*Math.sin(u*117));b.color.push(c.r,c.g,c.b);
   if(j<nt&&i<nu){const k=j*(nu+1)+i;if(side>0)b.idx.push(k,k+1,k+nu+1,k+1,k+nu+2,k+nu+1);else b.idx.push(k,k+nu+1,k+1,k+1,k+nu+1,k+nu+2);}
  }
  const scalpMat=coreMat.clone();scalpMat.side=THREE.DoubleSide;scalpMat.roughness=.78;
  finish(b,scalpMat,parent,'Continuous root-coordinate crown support '+side,false);
 }
'''
s=s.replace(marker,insert+marker)
# Shorter root strands provide finer curvature sampling than a single full-length strip.
marker=' // Separate tapered hairline wisps'
insert=''' for(const side of[-1,1])for(let k=0;k<90;k++){
  const u=(k+.33)/90,points=[];for(let j=0;j<=48;j++)points.push(rootPoint(side,u,j/48));
  const curve=new THREE.CatmullRomCurve3(points,false,'centripetal');
  addFine(curve,(t,p)=>scalpNormal(p),mobile?5:8,.006,82000+(side+1)*500+k);
 }
'''
s=s.replace(marker,insert+marker);p.write_text(s)
p=Path('src/main.js');s=p.read_text().replace('THREE.PCFShadowMap','THREE.PCFSoftShadowMap').replace('key.shadow.normalBias=.007','key.shadow.normalBias=.015');p.write_text(s)
print('PASS25 continuous crown and layered tip geometry saved')
