# GPT-6 Astra Pro / Web portrait continuation

## Quality and provenance
Latest completed review: pass 26, 81/100. Check public/process/manifest.json for newer status. The requested 20,000 reviewed modeling iterations and >95/100 are NOT achieved. Scores are subjective; parameter candidates, compression jobs and test frames are not modeling reviews. No stock visual assets, generated images or reference pixels are used as textures. Passes 24-26 fixed crown/rear gaps and fringe roots. Skin, eyes, hair and tailoring remain stylized.

## Environment
Project: /home/dev/project/3d/gpt6_astra_pro_webtech_rgirltophalf
Runtime: mcp_colabdev highram, software ANGLE/SwiftShader.
Dedicated terminal: 1630. Quota: 32 terminals. Do not stop unrelated terminals or browsers. Short webterm read --filter shells have a five-second and 4096-byte limit; cd explicitly to this project.
Dev port: 48763
Tunnel: https://curves-latino-glossary-peers.trycloudflare.com
Pages: https://ecooxai.github.io/gpt6-astra-pro-webtech-rgirltophalf/
Repo: https://github.com/ecooxai/gpt6-astra-pro-webtech-rgirltophalf
Source branch: gpt6-astra-pro_chatgpt_webtech-portrait-polish
Pages branch: gpt6-astra-pro_webtech_pages
Verified deployed pass-26 commit: 542b951621f6011b47d66ca4666383764c67cca4

## Active work
Pass-26 acceptance tests are running in terminal 1630; dense wireframe is slow in software. Desktop layout, heading, six cameras, clay, wire, hair and turntable checks passed. Mobile/exports are NOT yet confirmed.
Queued: refine27.py and five-view capture; compression library installation; prepare-cache.py, bake-original.mjs, compress-original.mjs; load-portrait.js creation. Inspect logs/files before resubmitting. Do not edit imported source during captures.
Cache loader is NOT enabled. Remaining setup: export weave from garment.js; create runtime-version.json from compression report; update compress-original.mjs to write that version. Setup commands were blocked and did not execute.

## Architecture and tests
model.js batches original anatomy, eyes, hair and blouse. face-surface.js/facial-definition.js sculpt anatomy. eyes.js creates bounded eyes and lashes. groom-flow.js builds scalp-to-tip hair. garment.js builds sewn cloth/buttons. Maps are mathematical. main.js/index.html/style.css implement the responsive studio and latest-first journal.
export-portrait.js clones original materials and substitutes portable transmissive corneas. Custom live hair reflection uses standard PBR fallback in GLB. Cache geometry is authored here, never a stock asset.
Run scripts/capture.mjs NN portrait detail left right back with Node; geometry-test.mjs validates attributes/indices; test-studio.mjs checks UI and real exports. Python log_review.py records a reviewed pass. bake-original.mjs and compress-original.mjs build the own-model cache. deploy-pages.sh publishes Pages.
Reports: public/process/test-NN.json and acceptance-latest.json. Logs: .logs/. Reference: reference/rgirtophalf.png, git-ignored. View it with get_image, not pixel analysis. Old validate.mjs/review.mjs overwrite historical screenshots; replace npm test.

## Next delivery steps
Review pass 27 before scoring. Refine eye openings and face shading. Verify PNG/GLB download and reload. Visually compare cache before enabling; restore hair shader, corneas, normal scales, weave and shadow flags. Hide dense fibers in topology mode.
Publish current previews, verified model, source archive and reports with absolute paths. Use a dedicated /build subfolder; never clean shared /build. Exclude credentials, logs, dependencies, Git internals, reference and recursive archives. Update handoff, commit/push, deploy, verify public manifest/assets and back up Colab.
