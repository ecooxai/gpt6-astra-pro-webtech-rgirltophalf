/** Portable original-geometry export; the live scene is never modified. */
import * as THREE from 'three';
import { GLTFExporter } from 'three/addons/exporters/GLTFExporter.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
export async function exportPortrait(portrait){
 portrait.hairGroup.userData.astraLayer='hair';
 const clone=portrait.root.clone(true),original=[],copies=[],temporary=[],convertedTextures=new Map();
 portrait.root.traverse(o=>{if(o.isMesh)original.push(o);});
 clone.traverse(o=>{o.visible=true;if(o.isMesh)copies.push(o);});
 for(let i=0;i<copies.length;i++){
  const source=portrait.originalMaterials.get(original[i])||original[i].material;
  copies[i].userData.astraRender={castShadow:original[i].castShadow,receiveShadow:original[i].receiveShadow,alphaToCoverage:source.alphaToCoverage,normalScale:source.normalScale?.toArray(),envMapIntensity:source.envMapIntensity,hairShader:source.userData.astraHairShading||null};
  if(source.userData.exportTransmission){
   const cornea=new THREE.MeshPhysicalMaterial({color:0xffffff,transmission:1,thickness:.002,ior:1.376,roughness:.078,specularIntensity:1});
   cornea.name='Portable physically transmissive cornea';cornea.userData.exportTransmission=true;copies[i].material=cornea;temporary.push(cornea);
  }else{const material=source.clone();temporary.push(material);copies[i].material=material;}
  for(const key of Object.keys(copies[i].material)){
   const texture=copies[i].material[key];
   if(texture?.isDataTexture)copies[i].material[key]=exportableTexture(texture,convertedTextures);
  }
 }
 clone.userData={...clone.userData,astraOriginalRoot:true,astraStats:portrait.stats,exportedAt:new Date().toISOString(),materialNote:'Original standard PBR fallback. Live custom dual-lobe hair reflection is not serialized; corneas use KHR_materials_transmission.'};
 try{return await new GLTFExporter().parseAsync(clone,{binary:true,onlyVisible:true,trs:false});}
 finally{temporary.forEach(m=>m.dispose());convertedTextures.forEach(t=>t.dispose());}
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

/** GLTFExporter combines roughness/metalness with Canvas2D, which requires drawable images.
 * Convert only our own mathematical texture buffers on export clones. Never touch the live maps.
 */
function exportableTexture(texture,cache){
 if(cache.has(texture))return cache.get(texture);
 const {data,width,height}=texture.image;
 if(!(data instanceof Uint8Array||data instanceof Uint8ClampedArray)||data.length!==width*height*4)throw Error('Unsupported original texture format: '+texture.name);
 const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
 const context=canvas.getContext('2d');if(!context)throw Error('Canvas2D unavailable for portable material export');
 context.putImageData(new ImageData(new Uint8ClampedArray(data.buffer,data.byteOffset,data.byteLength),width,height),0,0);
 const out=new THREE.CanvasTexture(canvas);
 for(const key of ['name','colorSpace','wrapS','wrapT','magFilter','minFilter','anisotropy','flipY','premultiplyAlpha','unpackAlignment','channel','rotation','matrixAutoUpdate'])out[key]=texture[key];
 out.offset.copy(texture.offset);out.repeat.copy(texture.repeat);out.center.copy(texture.center);out.matrix.copy(texture.matrix);out.userData={...texture.userData};out.needsUpdate=true;cache.set(texture,out);return out;
}
