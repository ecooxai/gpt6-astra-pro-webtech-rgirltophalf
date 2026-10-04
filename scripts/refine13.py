from pathlib import Path
p=Path('src/groom.js');s=p.read_text().replace('[[-INVALID]]','')
s=s.replace('[[-.50,2.42]];','[[-.50,2.42]]];') if '[[-.50,2.42]];' in s else s.replace('[-.50,2.42]];','[-.50,2.42]]];')
p.write_text(s)
p=Path('src/model.js');s=p.read_text()
s=s.replace("import * as THREE from 'three';", "import * as THREE from 'three';\nimport { buildGroom } from './groom.js';")
a=s.index(' const hairmat=');b=s.index(' const browMat=',a);s=s[:a]+s[b:]
a=s.index(' // Scalp undercoat');b=s.index(' // Tailored blouse',a)
s=s[:a]+''' const groomStats=buildGroom({parent:hairGroup,skinMaterial:skinPlain,mobile,headWidth,faceZ,backDepth});
'''+s[b:]
s=s.replace('stats:{fineHairStrands:strandCount+372+scalpFibers+frontGuides.length*(mobile?48:80),solidHairLocks:122+frontGuides.length+bangs.length,seed:220901}', 'stats:{...groomStats,seed:220901}')
s=s.replace('if(hair){x*=1.05;y+=.08*THREE.MathUtils.smoothstep(y,3.1,3.5);}', '')
s=s.replace('if(!o.name.includes("Individually swept"))o.geometry.computeVertexNormals();', 'if(!hair&&!o.name.includes("Continuous facial sculpt"))o.geometry.computeVertexNormals();')
s=s.replace("skinPlain.color.set('#efcbb9')", "skinPlain.color.set('#efc6b6')")
s=s.replace('],.00048,lashMat','],.00032,lashMat')
p.write_text(s)
p=Path('src/face-surface.js');s=p.read_text()
s=s.replace('export const seamY', '''function nearestEdge(side,x,y){
 const dx=x-side*eyeX,dy=y-eyeY-side*dx/eyeW*.009,upper=dy>=0,h=upper?.061:-.043;
 let t=clamp(Math.cos(Math.atan2(dy/Math.abs(h),dx/eyeW)),-.9998,.9998);
 for(let k=0;k<5;k++){
  const f=Math.max(.00004,1-t*t),ey=eyeY+side*.009*t+h*Math.pow(f,.72),ex=side*eyeX+eyeW*t;
  const d1=side*.009-1.44*h*t*Math.pow(f,-.28),d2=-1.44*h*(Math.pow(f,-.28)+.56*t*t*Math.pow(f,-1.28));
  const den=eyeW*eyeW+d1*d1+(ey-y)*d2;
  if(den<=.00001)break;
  t=clamp(t-clamp(((ex-x)*eyeW+(ey-y)*d1)/den,-.14,.14),-.99999,.99999);
 }
 return {edge:eyeEdge(side,t,upper),vertical:Math.pow(Math.max(0,1-t*t),.70),upper};
}
export const seamY''')
s=s.replace('const angle=Math.atan2(dy/(dy>=0?.061:.043),dx/eyeW),t=Math.cos(angle),edge=eyeEdge(s,t,dy>=0);','const {edge,vertical,upper}=nearestEdge(s,x,y);')
s=s.replace('    const upper=dy>0,vertical=Math.pow(Math.abs(Math.sin(angle)),1.4);','')
s=s.replace('const grain=.015*Math.sin(x*310+Math.sin(y*79))*f;', 'const grain=.002*Math.sin(x*310+Math.sin(y*79))*f;')
s=s.replace(' const tri=Delaunator.from(pts)', ''' for(let i=0;i<=180;i++){
  const t=-.999+1.998*i/180,x=t*.172,sy=seamY(t),f=1-t*t;
  const hu=(.033+.013*G(Math.abs(t)-.29,.18)-.003*G(t,.10))*Math.pow(f,.70),hl=.046*Math.pow(f,.70);
  for(let j=-18;j<=18;j++)add(x,sy+(j>=0?hu:hl)*j/18);
 }
 const tri=Delaunator.from(pts)''')
s=s.replace('p=[],uv=[],c=[],idx=[];', 'p=[],uv=[],c=[],idx=[],norm=[];')
s=s.replace('const col=colorAt(x,y);c.push(col.r,col.g,col.b);', '''const col=colorAt(x,y);c.push(col.r,col.g,col.b);
 const e=.0005,dx=(zAt(x+e,y)-zAt(x-e,y))/(2*e),dy=(zAt(x,y+e)-zAt(x,y-e))/(2*e),stretch=1+.07*6*clamp((y-2.13)/.30,0,1)*(1-clamp((y-2.13)/.30,0,1))/.30;
 const n=new THREE.Vector3(-dx,-dy/stretch,1).normalize();norm.push(n.x,n.y,n.z);''')
s=s.replace('geo.setIndex(idx);geo.computeVertexNormals();','geo.setIndex(idx);geo.setAttribute("normal",new THREE.Float32BufferAttribute(norm,3));')
p.write_text(s)
p=Path('src/main.js');s=p.read_text().replace("'#665a65',.50","'#b48e83',.60").replace("'#fff5ef',3.15","'#fff5ef',3.5").replace("'#e3e9ff',1.05","'#e3e9ff',1.55").replace("DirectionalLight('#fff4ed',1.10)","DirectionalLight('#fff4ed',.68)").replace('scene.environmentIntensity=.18','scene.environmentIntensity=.24');p.write_text(s)
