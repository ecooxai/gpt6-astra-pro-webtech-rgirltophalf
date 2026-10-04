p='src/model.js'
s=open(p).read()
a=s.index('const faceRows=[')
b=s.index('export function faceZ',a)
s=s[:a]+'''const faceRows=[
[1.65,.001,.180,-.180,.180],[1.665,.068,.247,-.138,.150],[1.695,.138,.300,-.075,.110],[1.74,.211,.346,.035,.070],[1.80,.275,.383,.180,.030],[1.88,.336,.410,.300,.008],[1.98,.411,.419,.395,0],[2.10,.466,.422,.450,0],[2.22,.510,.421,.490,0],[2.38,.549,.430,.519,0],[2.56,.555,.433,.538,0],[2.76,.553,.451,.542,0],[2.96,.550,.468,.530,0],[3.13,.510,.449,.480,0],[3.26,.438,.389,.419,0],[3.35,.345,.308,.330,0],[3.41,.244,.219,.235,0],[3.455,.137,.124,.133,0],[3.474,.001,.001,.001,0]
];
const chinCenter=y=>interp(faceRows,y,4);
const headWidth=y=>interp(faceRows,y,1);
const frontDepth=y=>interp(faceRows,y,2)-chinCenter(y);
const backDepth=y=>interp(faceRows,y,3)+chinCenter(y);
function scalpFront(x,y){const sy=clamp(y-.066,1.8,3.473);return faceZ(x/1.12,sy)*1.075+.028;}
''' +s[b:]
s=s.replace('Math.max(0,1-u*u)),.63)','Math.max(0,1-u*u)),.85)')
s=s.replace('mix(1.66,3.47,j/ny)','mix(1.65,3.474,j/ny)')
s=s.replace('(.56+.44*Math.min(1,t*9))','Math.pow(Math.min(1,t*16),.45)')
s=s.replace('V(.10+(t-.5)*.025,3.46-.07*t,.37+.02*t)','V(.10+(t-.5)*.025,3.46-.10*t,scalpFront(.10+(t-.5)*.025,3.46-.10*t)+.020)')
s=s.replace('V(side*(.38+.11*t),3.245+.07*t,.54-.06*t)','V(side*(.35+.13*t),3.25-.12*t,scalpFront(side*(.35+.13*t),3.25-.12*t)+.035)')
open(p,'w').write(s)
