from pathlib import Path
p=Path('src/model.js');s=p.read_text().replace("import { buildBrows } from './brows.js';", "import { buildBrows } from './brows.js';\nimport { buildEyes } from './eyes.js';")
a=s.index(' const sclera=');b=s.index(' buildBrows(head,faceSculpt.zAt);',a)
s=s[:a]+''' const eyeMaterials=buildEyes(head,{skinMaterial:skinPlain,faceSculpt});
'''+s[b:]
s=s.replace('[lashMat,browMat,browBase,rimMat,irisMat,sclera,cornealMaterial].includes(o.material)','eyeMaterials.includes(o.material)')
s=s.replace("source:'Original procedural geometry and maps in src/model.js, face-surface.js, groom.js, garment.js and surfaces.js'", "source:'Original procedural geometry and maps authored in src/; no reference pixels or external visual assets'")
p.write_text(s)
