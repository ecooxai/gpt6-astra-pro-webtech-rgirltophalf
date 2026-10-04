# Continuation context

## Goal and honesty

Build a real 3D upper-body portrait matching the user reference, from scratch with web technology. The user requests 20,000 edit/test iterations and a visual score above 95/100. Those targets have NOT been reached. Count only actual reviewed iterations; never relabel frames, parameter samples, or repeated checks as visual modeling iterations. Scores are subjective self-assessments, not measured similarity.

Latest authoritative status: `public/process/manifest.json`. Eight visual passes have been rendered so far; the latest assessment is 68/100. The model remains stylized, not photorealistic. Front, side, rear, and detail PNGs are in `public/process/`.

## Environment and isolation

Project: `/home/dev/project/3d/gpt6_astra_pro_webtech_rgirltophalf`
Runtime: mcp_colabdev, user `/home/dev`; Node 22, headless Chromium, Cloudflared, GitHub CLI.
Branch: `gpt6-astra-pro_chatgpt_webgl-portrait`.
Dev port: 48763. Never reuse port 4317; it belongs to another project.
Temporary tunnel: https://courier-while-rapidly-chargers.trycloudflare.com

The runtime has a 32-terminal quota. Terminal 1579 was created for this project, but its live PTY later changed to another active project. DO NOT write to or stop that shared live PTY. Prefer a new dedicated terminal when available. A project-scoped `webterm read ... --filter` shell has worked for isolated commands; always explicitly change to the absolute project directory. Quote shell arguments correctly, including literal Markdown backticks. Long jobs can be launched with Python subprocess.Popen(start_new_session=True), with redirected logs, then actively monitored. Do not stop unrelated terminals or browser processes.

## Reference and provenance

Reference for visual inspection only: `reference/rgirtophalf.png` (git-ignored).
User URL: https://lesswebdisk.my-team-8435.chatgpt.site/raw/u-oKDfM5n2PVKJ/3d/rgirrltophalf/rgirtophalf.png
Use vision, not OCR or pixel analysis. Never use the reference as a render texture. No imported visual assets or image-generation tools have been used. All geometry and maps are procedural JavaScript.

## Architecture and tests

`src/model.js`: continuous sculpted head, eye openings, spherical eye surfaces, lips, ears, neck, layered volumetric and fine-strand hair, folded blouse and buttons. Seed 220901. Geometry is batched by material for about 27 draw calls. A viewport under 761 px selects reduced hair density.
`src/main.js`: studio lighting, orbit camera, render-on-demand loop, static shadow caching, controls, PNG/GLB export, auto-refresh journal.
`src/style.css` and `index.html`: responsive studio, model and tool names above the live character.
`node scripts/capture.mjs NN portrait left right back detail`: clean 720x1080 Chrome renders. This viewport selects the mobile model. Inspect images with get_image before recording a score.
`python3 scripts/log_review.py NN SCORE TITLE NOTE`: records the actual visual review.
`npm run build`: writes project-relative `build/`.

## Next priorities

Fix small upper-eyelid boundary gaps in close-up. Improve realistic skin response, scalp/root flow, fine fringe density, and cloth tension folds. Test desktop and phone layout, orbit presets, clay, wireframe, hair visibility, PNG and GLB export. Export and verify the GLB, preserve a source archive, update the journal artifact links and absolute paths, and refresh this file. Rebuild and redeploy after changes. Do not claim completion merely because the UI or browser tests pass.

GitHub CLI account was verified as `ecooxai`. Permanent deployment is being prepared; verify the actual remote and Pages status before claiming deployment. No credentials belong in source, logs committed to git, or archives.
