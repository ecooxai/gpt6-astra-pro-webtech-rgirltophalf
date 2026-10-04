/** Portable original-geometry export; the live scene is never modified. */
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export async function exportPortrait(portrait){
 const clone=portrait.root.clone(true),original=[],copies=[],temporary=[];
 portrait.root.traverse(o=>{if(o.isMesh)original.push(o);});
 clone.traverse(o=>{o.visible=true;if(o.isMesh)copies.push(o);});
 for(let i=0;i<copies.length;i++){
  const source=portrait.originalMaterials.get(original[i])||original[i].material;
  if(source.userData.exportTransmission){
   const cornea=new THREE.MeshPhysicalMaterial({color:0xffffff,transmission:1,thickness:.002,ior:1.376,roughness:.078,specularIntensity:1});
   cornea.name='Portable physically transmissive cornea';copies[i].material=cornea;temporary.push(cornea);
  }else copies[i].material=source;
 }
 clone.userData={...clone.userData,exportedAt:new Date().toISOString(),materialNote:'Original standard PBR fallback. Live custom dual-lobe hair reflection is not serialized; corneas use KHR_materials_transmission.'};
 try{return await new GLTFExporter().parseAsync(clone,{binary:true,onlyVisible:true,trs:false});}
 finally{temporary.forEach(m=>m.dispose());}
}
export async function validateExport(buffer){
 const gltf=await new GLTFLoader().parseAsync(buffer,''),scene=gltf.scene;
 let meshes=0,vertices=0,transmissiveCorneas=0;const textures=new Set(),materials=new Set();
 scene.traverse(o=>{if(!o.isMesh)return;meshes++;vertices+=o.geometry.attributes.position.count;if(o.material.transmission>.9)transmissiveCorneas++;materials.add(o.material);});
 scene.updateMatrixWorld(true);const box=new THREE.Box3().setFromObject(scene),size=box.getSize(new THREE.Vector3());
 const result={meshes,vertices,transmissiveCorneas,size:size.toArray(),validBounds:Number.isFinite(size.length())&&size.y>3&&size.y<5&&size.x>1.5&&size.x<4};
 scene.traverse(o=>{if(o.isMesh)o.geometry.dispose();});
 for(const m of materials){for(const value of Object.values(m))if(value?.isTexture)textures.add(value);m.dispose();}textures.forEach(t=>t.dispose());
 return result;
}
