from pathlib import Path
p=Path('src/export-portrait.js');s=p.read_text()
s=s.replace("copies[i].material=cornea;temporary.push(cornea);", "cornea.userData.exportTransmission=true;copies[i].material=cornea;temporary.push(cornea);")
s=s.replace("const source=portrait.originalMaterials.get(original[i])||original[i].material;", "const source=portrait.originalMaterials.get(original[i])||original[i].material;\n  copies[i].userData.astraRender={castShadow:original[i].castShadow,receiveShadow:original[i].receiveShadow,alphaToCoverage:source.alphaToCoverage,normalScale:source.normalScale?.toArray(),envMapIntensity:source.envMapIntensity,hairShader:source.userData.astraHairShading||null};")
s=s.replace("clone.userData={...clone.userData,exportedAt:", "clone.userData={...clone.userData,astraOriginalRoot:true,astraStats:portrait.stats,exportedAt:")
s=s.replace("const clone=portrait.root.clone(true),original", "portrait.hairGroup.userData.astraLayer='hair';\n const clone=portrait.root.clone(true),original")
p.write_text(s)
p=Path('src/main.js');s=p.read_text().replace('}}animate();','}}if(!params.has(\'bake\'))animate();');p.write_text(s)
print('Portable render metadata and non-rendering bake mode added')
