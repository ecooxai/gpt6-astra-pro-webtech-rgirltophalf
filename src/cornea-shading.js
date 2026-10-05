/** View-responsive studio reflections on the actual 3D corneal surface.
 * Analytic light lobes, not highlights painted into the iris texture.
 * The exported model uses a portable physical-transmission material.
 */
export function applyCorneaShading(material){
 material.userData.astraCornealReflection=1;
 material.onBeforeCompile=shader=>{
  shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
   vec3 eyeV=normalize(vViewPosition);
   vec3 eyeR=reflect(-eyeV,normal);
   vec3 eyeKey=normalize((viewMatrix*vec4(-3.5,4.6,4.0,1.0)).xyz+vViewPosition);
   vec3 eyeFill=normalize((viewMatrix*vec4(3.5,3.1,2.5,1.0)).xyz+vViewPosition);
   float eyePrimary=pow(max(0.0,dot(eyeR,eyeKey)),230.0);
   float eyeSecondary=pow(max(0.0,dot(eyeR,eyeFill)),310.0);
   float eyeFresnel=.020+0.980*pow(1.0-max(0.0,dot(normal,eyeV)),5.0);
   reflectedLight.directSpecular*=.045;
   reflectedLight.indirectSpecular*=.16;
   reflectedLight.directSpecular+=vec3(1.0,.98,.96)*(eyePrimary*.72+eyeSecondary*.19)*(1.0+eyeFresnel*2.0);
  `);
 };
 material.customProgramCacheKey=()=> 'astra-cornea-reflection-1';
 material.needsUpdate=true;return material;
}
