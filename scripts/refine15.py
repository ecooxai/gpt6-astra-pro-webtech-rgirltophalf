from pathlib import Path
p=Path('src/model.js');s=p.read_text()
s=s.replace("import { buildGroom } from './groom.js';", "import { buildGroom } from './groom.js';\nimport { buildBlouse } from './garment.js';")
a=s.index(' // Tailored blouse');b=s.index(' root.userData=',a)
s=s[:a]+''' // Tailored blouse is a separately batched collection of original sewn panels.
 const blouse=buildBlouse(root,{mobile});
'''+s[b:]
s='\n'.join(line for line in s.split('\n') if "'Closed sleeve crop '" not in line)
s='\n'.join(line for line in s.split('\n') if not line.startswith((' const white=',' const stitch=',' const buttonMat=')))
s=s.replace("source:'All visual assets procedurally authored in src/model.js'", "source:'Original procedural geometry and maps in src/model.js, face-surface.js, groom.js, garment.js and surfaces.js'")
p.write_text(s)
# The headless renderer captures static frames, without multi-second damping trails.
p=Path('src/main.js');s=p.read_text().replace('controls.enableDamping=true','controls.enableDamping=!params.has("capture")');p.write_text(s)
