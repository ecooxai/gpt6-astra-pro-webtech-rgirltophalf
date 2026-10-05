from pathlib import Path
p=Path('src/groom-flow.js');s=p.read_text()
changes=[
('RX=.695,RY=.973,RZ=.643','RX=.687,RY=.927,RZ=.636'),
('tip=.965+.030*hash(Math.floor(x*2.2),9),front=.9995+.0003*Math.sin(v*137),a=(1-smooth(v,tip-.009,tip))*(1-smooth(u,front-.001,front))','tip=.916+.079*hash(Math.floor(x*2.2),9),front=.984+.006*Math.sin(v*139)+.003*Math.sin(v*331),a=(1-smooth(v,tip-.018,tip))*(1-smooth(u,front-.024,front))'),
('const b=builder(),nu=100,nt=70;','const b=builder(),uv1=[],nu=100,nt=70;'),
('b.p.push(p.x,p.y,p.z);b.uv.push(u*9,t*.27);','b.p.push(p.x,p.y,p.z);b.uv.push(u*9,t*.27);uv1.push(u,t*.28);'),
('const scalpMat=coreMat.clone();scalpMat.side=THREE.DoubleSide;scalpMat.roughness=.72;applyHairShading(scalpMat,{strength:.28});\n  finish(b,scalpMat,parent,\'Continuous root-coordinate crown support \'+side,false);',"const scalpMat=baseMat.clone();scalpMat.side=THREE.DoubleSide;scalpMat.roughness=.76;applyHairShading(scalpMat,{strength:.23});\n  const crown=finish(b,scalpMat,parent,'Continuous root-coordinate crown support '+side,false);crown.geometry.setAttribute('uv1',new THREE.Float32BufferAttribute(uv1,2));"),
('roundLock(cores,curve,width,.010,field,color,mobile?94:116);','roundLock(cores,curve,width*(1-.82*smooth(u,.91,1)),.008,field,color,mobile?94:116);'),
('end=.89+.11*hash(id,617)','end=.84+.16*hash(id,617)'),
('for(let i=0;i<38;i++)','for(let i=0;i<132;i++)'),
('rootPoint(side,.991,t),inward=(.008+.024*r)*Math.sin(PI*t)','rootPoint(side,.971+.033*r,t),inward=(.010+.030*r)*Math.sin(PI*t)'),
('p.y-=.008+.018*r*Math.sin(PI*t);p.z+=.008;','p.y-=.012+.040*r*Math.sin(PI*t);p.z+=.008;'),
('mobile?30:48,width*.82,59001+i','mobile?24:42,width*.94,59001+i'),
("width=[.029,.020,.014,.012,.008,.007,.016,.006,.008][i]","width=[.025,.015,.012,.006,.011,.009,.007][i]")]
for a,b in changes:
 if a not in s:raise RuntimeError('Missing anchor: '+a[:100])
 s=s.replace(a,b)
a=s.index(' const bangPaths=[');b=s.index('\n for(let i=0;i<bangPaths.length;i++){',a)
s=s[:a]+''' const bangPaths=[
 [[.105,3.23],[-.023,3.04],[-.173,2.84],[-.342,2.57],[-.484,2.29]],
 [[.120,3.26],[.09,3.05],[.019,2.86],[-.058,2.67],[-.144,2.54]],
 [[.162,3.23],[.198,3.055],[.194,2.84],[.123,2.65],[.058,2.60]],
 [[.153,3.24],[.124,3.013],[.082,2.824],[.035,2.655],[-.005,2.608]],
 [[.119,3.28],[.076,3.01],[-.024,2.814],[-.18,2.609],[-.252,2.506]],
 [[.096,3.24],[-.055,3.039],[-.262,2.76],[-.409,2.475],[-.527,2.22]],
 [[.183,3.25],[.256,3.029],[.298,2.84],[.277,2.709],[.229,2.650]]];''' +s[b:]
p.write_text(s)
# Keep specular corneal highlights small enough to reveal iris fibers.
p=Path('src/eyes.js');s=p.read_text().replace('envMapIntensity:1.25','envMapIntensity:.82').replace('roughness:.105','roughness:.13');p.write_text(s)
print('Pass 30: lower crown, feathered scalp coverage, finer varied fringe and layered ends.')
