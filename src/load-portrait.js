/** Load only this project's own baked original geometry. */
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {MeshoptDecoder} from 'three/addons/libs/meshopt_decoder.module.js';
import {applyHairShading} from './hair-shading.js';
import {applyCorneaShading} from './cornea-shading.js';
import {weave} from './garment.js';
import version from './runtime-version.json' with {type:'json'};
export async function loadPortrait({mobile=false,cached=false,onProgress=()=>{}}={}){
 const started=performance.now();
 if(cached){
  try{
   onProgress('Loading original optimized geometry');
   const loader=new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
   const file='./latest/gpt6-astra-pro_chatgpt_webtech_original-runtime.glb',query='?v='+version.sha256.slice(0,12);let gltf;
   if('DecompressionStream' in window){
    const response=await fetch(file+'.gz'+query);if(!response.ok)throw Error('Original geometry transfer unavailable');
    const buffer=await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer();gltf=await loader.parseAsync(buffer,'');
   }else gltf=await loader.loadAsync(file+query);
   const root=gltf.scene;let hairGroup,originalRoot;const originalMaterials=new Map(),configured=new Set();
   root.traverse(o=>{if(o.userData.astraOriginalRoot)originalRoot=o;if(o.userData.astraLayer==='hair')hairGroup=o;});
   if(!originalRoot||!hairGroup)throw Error('Original project metadata missing');
   root.traverse(o=>{
    if(!o.isMesh)return;const meta=o.userData.astraRender||{};o.castShadow=meta.castShadow??true;o.receiveShadow=meta.receiveShadow??true;
    const material=o.material;
    if(!configured.has(material)){
     configured.add(material);
     if(material.userData.exportTransmission){material.color.set(0);material.transmission=0;material.transparent=true;material.blending=THREE.AdditiveBlending;material.depthWrite=false;material.opacity=1;material.envMapIntensity=.82;material.roughness=.13;applyCorneaShading(material);}
     if(meta.normalScale&&material.normalScale)material.normalScale.fromArray(meta.normalScale);
     if(meta.envMapIntensity!==undefined&&!material.userData.exportTransmission)material.envMapIntensity=meta.envMapIntensity;
     material.alphaToCoverage=Boolean(meta.alphaToCoverage);
     const fiber=meta.hairShader||material.userData.astraHairShading;if(fiber)applyHairShading(material,{strength:fiber.strength});
     if(material.sheen>.4&&material.color.r>.5){material.bumpMap=weave();material.bumpScale=.0008;}
     material.needsUpdate=true;
    }
    originalMaterials.set(o,material);
   });
   root.userData={...originalRoot.userData,geometrySource:'Project-authored compressed geometry cache'};
   const clayMat=new THREE.MeshStandardMaterial({color:'#bda18d',roughness:.85,side:THREE.DoubleSide});
   return{root,hairGroup,originalMaterials,clayMat,stats:{...originalRoot.userData.astraStats,geometrySource:'original cached geometry',loadMs:Math.round(performance.now()-started)},setClay(on){root.traverse(o=>{if(o.isMesh)o.material=on?clayMat:originalMaterials.get(o);});},setWire(on){const materials=new Set();root.traverse(o=>{if(o.isMesh)materials.add(o.material);});materials.forEach(m=>m.wireframe=on);}};
  }catch(error){console.warn('Rebuilding the original project geometry.',error.message);}
 }
 onProgress('Shaping the original procedural portrait');
 const {buildPortrait}=await import('./model.js');const portrait=buildPortrait({mobile});portrait.stats.geometrySource='procedural source';portrait.stats.loadMs=Math.round(performance.now()-started);return portrait;
}
