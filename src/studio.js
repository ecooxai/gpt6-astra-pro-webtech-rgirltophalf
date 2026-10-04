/** A synthetic studio reflection field, authored mathematically without an HDR image. */
import * as THREE from "three";
export function createStudioEnvironment(renderer){
 const width=512,height=256,data=new Float32Array(width*height*4);
 const boxes=[
  {direction:new THREE.Vector3(-.72,.43,.96).normalize(),width:.39,height:.63,power:5.4,color:[1,.955,.925]},
  {direction:new THREE.Vector3(.83,.18,.91).normalize(),width:.27,height:.49,power:2.7,color:[.90,.94,1]},
  {direction:new THREE.Vector3(.23,.95,-.33).normalize(),width:.43,height:.34,power:3.1,color:[1,.98,.96]},
  {direction:new THREE.Vector3(-.26,.37,-.94).normalize(),width:.14,height:.48,power:2.2,color:[.97,.91,.86]}
 ].map(box=>{const right=new THREE.Vector3().crossVectors(new THREE.Vector3(0,1,0),box.direction).normalize();return {...box,right,up:new THREE.Vector3().crossVectors(box.direction,right).normalize()};});
 const d=new THREE.Vector3();
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const phi=Math.PI*y/(height-1),theta=2*Math.PI*(x/(width-1)-.5);d.set(Math.sin(phi)*Math.cos(theta),-Math.cos(phi),Math.sin(phi)*Math.sin(theta));
  const base=.065+.025*Math.max(0,d.y);let r=base,g=base*.96,b=base*.95;
  for(const box of boxes){const facing=d.dot(box.direction);if(facing<=0)continue;const u=Math.abs(d.dot(box.right)/facing),v=Math.abs(d.dot(box.up)/facing);const a=(1-THREE.MathUtils.smoothstep(u,box.width*.93,box.width))*(1-THREE.MathUtils.smoothstep(v,box.height*.93,box.height));r+=a*box.power*box.color[0];g+=a*box.power*box.color[1];b+=a*box.power*box.color[2];}
  const i=(y*width+x)*4;data[i]=r;data[i+1]=g;data[i+2]=b;data[i+3]=1;
 }
 const source=new THREE.DataTexture(data,width,height,THREE.RGBAFormat,THREE.FloatType);source.mapping=THREE.EquirectangularReflectionMapping;source.colorSpace=THREE.LinearSRGBColorSpace;source.needsUpdate=true;
 const generator=new THREE.PMREMGenerator(renderer);generator.compileEquirectangularShader();const environment=generator.fromEquirectangular(source);source.dispose();generator.dispose();return environment;
}
