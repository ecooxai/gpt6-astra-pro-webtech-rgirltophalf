/** Original compact dual-lobe fiber reflection approximation.
 * Uses the actual surface tangent, normal, view and world-space studio lights.
 * The underlying standard PBR material remains a portable glTF fallback.
 */
export function applyHairShading(material,{strength=1}={}){
 material.userData.astraHairShading={version:1,strength};
 material.onBeforeCompile=shader=>{
  shader.uniforms.astraHairStrength={value:strength};
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>',`#include <common>
   uniform float astraHairStrength;
   float astraStrandLobe(vec3 T,vec3 N,vec3 L,vec3 V,float shift,float exponent){
    vec3 H=normalize(L+V);vec3 tangent=normalize(T+shift*N);
    float d=clamp(dot(tangent,H),-1.0,1.0);
    return pow(sqrt(max(0.0,1.0-d*d)),exponent);
   }
   vec3 astraFiberReflection(vec3 T,vec3 N,vec3 V,vec3 L,vec3 tint,float strength){
    float facing=mix(0.08,1.0,smoothstep(-0.24,0.45,dot(N,L)));
    float primary=astraStrandLobe(T,N,L,V,0.038,92.0);
    float secondary=astraStrandLobe(T,N,L,V,-0.085,24.0);
    return tint*strength*facing*(0.110*primary+vec3(1.0,0.65,0.47)*0.037*secondary);
   }
  `);
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
   #ifdef USE_ANISOTROPY
    vec3 astraT=normalize(material.anisotropyT);
    vec3 astraN=normal;
    vec3 astraV=normalize(vViewPosition);
    vec3 astraKey=normalize((viewMatrix*vec4(-3.5,4.6,4.0,1.0)).xyz+vViewPosition);
    vec3 astraFill=normalize((viewMatrix*vec4(3.5,3.1,2.5,1.0)).xyz+vViewPosition);
    vec3 astraRim=normalize((viewMatrix*vec4(1.5,4.2,-2.2,1.0)).xyz+vViewPosition);
    vec3 astraReflection=astraFiberReflection(astraT,astraN,astraV,astraKey,vec3(1.0,0.96,0.91),1.0);
    astraReflection+=astraFiberReflection(astraT,astraN,astraV,astraFill,vec3(0.86,0.91,1.0),0.36);
    astraReflection+=astraFiberReflection(astraT,astraN,astraV,astraRim,vec3(1.0,0.88,0.80),0.32);
    reflectedLight.directDiffuse*=0.93;
    reflectedLight.directSpecular+=astraReflection*astraHairStrength;
   #endif
  `);
 };
 material.customProgramCacheKey=()=>`astra-dual-lobe-fiber-v1-${strength}`;
 material.needsUpdate=true;return material;
}
