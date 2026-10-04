import assert from "node:assert/strict";
import * as THREE from "three";
import { buildPortrait } from "../src/model.js";
const model = buildPortrait({mobile:true});
let meshes=0,vertices=0,triangles=0;
model.root.traverse(object=>{
  if(!object.isMesh)return;
  meshes++;
  const geometry=object.geometry;
  const positions=geometry.getAttribute("position");
  assert.ok(positions && positions.count>0,object.name+": missing positions");
  vertices+=positions.count;
  for(const [name,attribute] of Object.entries(geometry.attributes)){
    assert.equal(attribute.count,positions.count,object.name+": attribute count "+name);
    for(const value of attribute.array)assert.ok(Number.isFinite(value),object.name+": non-finite "+name);
  }
  if(geometry.index){
    assert.equal(geometry.index.count%3,0,object.name+": incomplete triangle");
    for(const index of geometry.index.array)assert.ok(index>=0 && index<positions.count,object.name+": index out of range");
    triangles+=geometry.index.count/3;
  }else triangles+=positions.count/3;
});
model.root.updateMatrixWorld(true);
const bounds=new THREE.Box3().setFromObject(model.root);
const size=bounds.getSize(new THREE.Vector3());
assert.ok(size.x>1.5 && size.x<4,"Unexpected character width");
assert.ok(size.y>3 && size.y<5,"Unexpected character height");
assert.ok(meshes<45,"Draw-call batching regressed");
model.setClay(true);model.setWire(true);model.setWire(false);model.setClay(false);
console.log(JSON.stringify({passed:true,meshes,vertices,triangles,bounds:{min:bounds.min.toArray(),max:bounds.max.toArray()},checks:["finite attributes","matching attribute counts","valid triangle indices","plausible bounding volume","material controls"]},null,2));
