/** Keep the structural view readable instead of drawing millions of strand edges. */
export function withStructureInspector(portrait){
 const setWire=portrait.setWire.bind(portrait),dense=[],visible=new Map();let active=false;
 portrait.hairGroup.traverse(o=>{if(o.isMesh&&/fiber|volumetric/i.test(o.name))dense.push(o);});
 portrait.setWire=on=>{setWire(on);if(on&&!active)dense.forEach(o=>visible.set(o,o.visible));dense.forEach(o=>{o.visible=on?false:(visible.has(o)?visible.get(o):o.visible);});active=on;if(!on)visible.clear();};
 portrait.stats.structureHiddenHairMeshes=dense.length;return portrait;
}
