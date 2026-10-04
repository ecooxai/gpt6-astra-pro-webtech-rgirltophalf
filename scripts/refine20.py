from pathlib import Path
p=Path('src/face-surface.js');s=p.read_text()
s=s.replace('(upper?.061:-.043)','(upper?.055:-.049)')
a=s.index('function nearestEdge(');b=s.index('export const seamY',a)
s=s[:a]+'''function nearestEdge(side,x,y){
 const dx=x-side*eyeX,dy=y-eyeY-side*dx/eyeW*.009,upper=dy>=0,h=upper?.055:-.049;
 const distance=theta=>{const t=Math.cos(theta),ex=side*eyeX+eyeW*t,ey=eyeY+side*.009*t+h*Math.pow(Math.sin(theta),1.44);return(ex-x)*(ex-x)+(ey-y)*(ey-y);};
 let best=0,min=Infinity;const steps=12;
 for(let i=0;i<=steps;i++){const d=distance(PI*i/steps);if(d<min){min=d;best=i;}}
 let lo=PI*Math.max(0,best-1)/steps,hi=PI*Math.min(steps,best+1)/steps;
 for(let i=0;i<12;i++){const a=(2*lo+hi)/3,b=(lo+2*hi)/3;if(distance(a)<distance(b))hi=b;else lo=a;}
 let angle=(lo+hi)*.5;if(distance(0)<distance(angle))angle=0;if(distance(PI)<distance(angle))angle=PI;
 const t=Math.cos(angle);return{edge:eyeEdge(side,t,upper),vertical:Math.pow(Math.max(0,1-t*t),.7),upper};
}
'''+s[b:]
s=s.replace('const {edge,vertical,upper}=nearestEdge(s,x,y);','if(Math.abs(dx)>.275||Math.abs(dy)>.225)continue;\n   const {edge,vertical,upper}=nearestEdge(s,x,y);')
s=s.replace('(.040+.013','(.049+.013').replace(':.061)*Math.pow(f,.70)',':.075)*Math.pow(f,.70)').replace('hl=.061*Math.pow(f,.70)','hl=.075*Math.pow(f,.70)').replace('(upper?.017:.024)','(upper?.020:.029)')
s=s.replace('z-=.0038*G(dist-.033,.0075)*vertical','z-=.0044*G(dist-.030,.009)*vertical').replace('z+=.004*G(dist-.030,.015)*vertical','z+=.0047*G(dist-.025,.014)*vertical')
s=s.replace("c.lerp(new THREE.Color('#7d4a41'),.73*Math.pow(cavity,.8))", "c.lerp(new THREE.Color('#805046'),.61*Math.pow(cavity,.8))")
s=s.replace("c.lerp(new THREE.Color(lip.upper?'#c47f7e':'#d9918b'),f*.85)", "c.lerp(new THREE.Color(lip.upper?'#c58280':'#db918f'),f*.82)")
s=s.replace('const c=skinColor(x,y,1);','''const c=skinColor(x,y,1);
  const browT=(Math.abs(x)-.10)/.303;
  if(browT>-.035&&browT<1.07){const t=clamp(browT,0,1),by=2.557+.025*Math.sin(PI*t*.94)-.022*t,shape=THREE.MathUtils.smoothstep(browT,-.035,.035)*(1-THREE.MathUtils.smoothstep(browT,.94,1.07));c.lerp(new THREE.Color('#866257'),.29*G(y-by,.0105*(1-.38*t))*shape);}
''')
s=s.replace('stretch=1+.07*6*','stretch=1+.02*6*')
p.write_text(s)
p=Path('src/model.js');s=p.read_text().replace("import { buildSkinAtlas } from './skin-atlas.js';", "import { buildSkinAtlas } from './skin-atlas.js';\nimport { buildBrows } from './brows.js';")
s=s.replace(' buildContinuousFace({parent:head',' const faceSculpt=buildContinuousFace({parent:head')
s=s.replace('else if(!hair)y-=.07*','else if(!hair)y-=.02*')
s=s.replace('iy=eyeY+.007','iy=eyeY+.004')
s=s.replace('roughness:.045,specularIntensity:1,envMapIntensity:5','roughness:.083,specularIntensity:1,envMapIntensity:2.9')
s=s.replace('z+=.113*g(x,.090)*g(y-2.172,.078)','z+=.128*g(x,.096)*g(y-2.174,.075)')
s=s.replace('z+=.047*g(Math.abs(x)-.079,.045)*g(y-2.139,.052)','z+=.057*g(Math.abs(x)-.085,.045)*g(y-2.142,.052)')
a=s.index('  // Eyebrow base is subdued;');b=s.index(' const groomStats=',a)
old=s[a:b];end=old.index('\n }')
s=s[:a]+' }\n buildBrows(head,faceSculpt.zAt);\n'+old[end+3:]+s[b:]
s=s.replace('atlas.normal;skin.normalScale.set(.30,.30)','atlas.normal;skin.normalScale.set(.45,.45)')
p.write_text(s)
p=Path('src/iris.js');s=p.read_text().replace('let red=77*tone,green=49*tone,blue=37*tone','let red=91*tone,green=61*tone,blue=45*tone').replace('tone*=1-.23*THREE.MathUtils.smoothstep(dy,-.10,.53)','tone*=1-.16*THREE.MathUtils.smoothstep(dy,-.10,.53)');p.write_text(s)
p=Path('src/ear.js');s=p.read_text().replace("material.roughness=.54;", "material.roughness=.57;material.normalMap=null;material.bumpMap=null;material.map=null;material.roughnessMap=null;material.aoMap=null;");p.write_text(s)
p=Path('src/skin-atlas.js');s=p.read_text().replace("(y>=seam?.045:.061)","(y>=seam?.059:.075)")
s=s.replace('color[k]=Math.round(251+grain*4-freckles*8);color[k+1]=Math.round(250+grain*4-freckles*11);color[k+2]=Math.round(250+grain*4-freckles*12);','''const vascular=front*(.50+.5*Math.sin(i*.067+Math.sin(j*.032)*2))*G(y-2.24,.42);
  color[k]=Math.round(250+grain*5-freckles*8);color[k+1]=Math.round(248+grain*5-freckles*11-vascular*2.5);color[k+2]=Math.round(248+grain*5-freckles*12-vascular*1.5);''')
p.write_text(s)
