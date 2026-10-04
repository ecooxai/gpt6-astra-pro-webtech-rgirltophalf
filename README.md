# Portrait 01 — GPT-6 Astra Pro / WebGL

An original, reference-led 3D upper-body character and responsive web studio, built with JavaScript, Three.js, and Vite. All geometry, hair strands, material maps, garment folds, and surface details are authored procedurally. No stock meshes, photo textures, pretrained character assets, or image-generation outputs are used.

## Status

This is a work in progress. The build journal records actual reviewed render passes and subjective visual assessments. The requested 95/100 likeness target and 20,000 iterations have not been achieved. The current result is stylized rather than photorealistic. See `public/process/manifest.json` for the latest review.

## Run

```sh
npm ci
npm run dev
```

Open the server on port 48763. Run `npm run build` for a portable static build in `build/`. No runtime asset CDN is required.

## Studio

Drag to orbit; scroll or pinch to zoom. Camera presets provide front, three-quarter, rear, and face-detail views. Controls include turntable, wireframe, hair visibility, light intensity, and clay materials. The studio offers PNG snapshots and GLB export. The review journal refreshes every eight seconds and shows the original Colab absolute paths below artifacts.

## Source and review

`src/model.js` constructs seeded geometry and procedural maps. `src/main.js` owns lighting, cameras, controls, exports, and journal updates. `src/style.css` and `index.html` implement the studio. `scripts/capture.mjs` renders numbered reviews in headless Chromium. `scripts/log_review.py` records a human visual assessment; it does not compute likeness automatically.

```sh
node scripts/capture.mjs 09 portrait left right back detail
python3 scripts/log_review.py 9 68 "Review title" "Specific visual observations."
```

The capture script uses `/home/dev/.local/bin/chromium` in Colab. Adjust the path for another machine. `?capture=1` hides studio chrome for clean review images.

See `Agents.md` for continuation context and outstanding work. Unseen side and rear anatomy are original interpretations of a single front-facing reference.
