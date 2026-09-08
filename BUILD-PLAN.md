# Unicorn Flood: build assessment and task list

## Status

The source review is complete. There is enough data to build Prototype Zero and the first playable version. There is not yet enough test data to promise the final crowd size, frame rate, or game balance.

B01–B03 are complete. B04–B05 now include density pressure, stable movement noise, visible instanced shots, hit lighting, and retry. The release page is 13,044 bytes. Type checks and crowd/combat checks passed. Browser checks confirmed a kill, visible beam slots, a non-zero light uniform, and no WebGL error. Flow quality and scale still need tests. The full game is not complete.

## Updated visual and scale target

Use `Sir, We Have an Orc Problem` as the user's visual and gameplay reference. Show a dense mass of unicorns with fluid-like motion. The player builds towers. Weapon fire must produce visible light effects on the battlefield. The spaced rows in the renderer test are temporary, not the target presentation.

The user wants hundreds of thousands of unicorns. Treat 100,000 and 200,000 visible units as performance targets, not verified capacity. The current buffer holds 16,384 total entity slots. Test crowd motion at smaller counts first, then compare CPU simulation, instance upload, and pixel costs as counts rise. Do not silently replace individually simulated enemies with visual-only units. Record any proposed aggregate simulation or detail-level tradeoff before using it. Bring tower placement and weapon-light tests forward once basic crowd motion and attacks work.

The inherited build tools report dependency advisories. Review and update the affected tools before deployment; do not expose the old development server to the public network.

The design source is `game-design-doc.md`, version 0.1. All 151 sections were read. Keep that source unchanged. This report records proposed build choices, not changes to the design.

## Source map

All paths below are relative to this repo.

| Source | What it provides |
| --- | --- |
| `AGENTS.md` | Small changes, code reuse, runnable checks, short commits, bundle size in each commit, and ASD-STE 100 docs. |
| `goodluck/goodluck/README.md` and `CONTEXT.md` | Goodluck is a source template, not an installed game library. Use TypeScript, ECS, direct WebGL2, and ordered systems. |
| `goodluck/goodluck/lib/game.ts` | Input state, browser frame loop, visibility handling, canvas, WebGL2, and audio setup. The current loop passes a variable delta to `FrameUpdate`. |
| `goodluck/goodluck/lib/world.ts` | Entity indices, component masks, and a free list for entity reuse. |
| `goodluck/goodluck/Platformer2D/game.ts` and `world.ts` | The best start point. Includes a 2D camera, sprite atlas, instance data, and ordered systems. Remove platform movement and physics from the game path. |
| `goodluck/goodluck/materials/layout2d.ts` | One quad, per-instance attributes, and `vertexAttribDivisor(..., 1)`. Each instance uses 16 floats, or 64 bytes. |
| `goodluck/goodluck/core/components/com_render2d.ts` | Atlas frame, tint, order, and typed-array views into instance data. |
| `goodluck/goodluck/materials/mat_render2d.ts` | The 2D sprite shader. Supports transforms without a parent and skips entities without the render bit. |
| `goodluck/goodluck/core/systems/sys_render2d.ts:59` | `drawArraysInstanced(..., 0, 4, World.Signature.length)`. Sprites use one draw for the selected camera and atlas. |
| `goodluck/duszki/src/systems/sys_render2d.ts:99` | Also uses instanced quads. Adds Y-based depth order and two camera passes. Thus it is not one draw for the whole frame. |
| `goodluck/duszki/src/game.ts:91` | Enables depth testing. Useful with the Y-based sprite order. |
| `goodluck/potato/src/game.ts` and `src/systems/sys_render2d.ts:53` | An older 2D instance renderer. Uses the same 16-float layout, but an older camera and base-game API. Do not mix its files into current Goodluck without changes. |
| `goodluck/backcountry/src/components/com_render_vox.ts` and `src/systems/sys_render.ts:118` | Instances cubes within a voxel model. It issues a draw for each matching model entity. This is not a single batch for all game actors. |
| `goodluck/goodluck/Instancing/systems/sys_render_instanced.ts` | A separate 3D instancing example. Not needed for the 2D start point. |
| `goodluck/goodluck/core/systems/sys_collide2d.ts` | All-pairs dynamic collision checks. Do not use this system for the horde. |
| `goodluck/goodluck/lib/pathfind.ts` | A* on a navigation mesh. It is not the shared grid flow field in the design. |
| `goodluck/goodluck/Platformer2D/systems/sys_control_camera.ts` | Pan, zoom, and pointer-to-world conversion. Change the pan button so that it does not conflict with building. |
| `goodluck/duszki/src/systems/sys_save.ts` | Periodic world saves through IndexedDB. The proposed small meta save does not need a whole-world save. |
| `goodluck/goodluck/bootstrap.sh` | Converts an example into `src`, resolves its core links, removes other examples and `core`, and makes a Git commit. |
| `goodluck/goodluck/package.json` and `play/Makefile` | Type checks, esbuild, Terser, Roadroller, and a single-file HTML release build. `npm run build` is a debug build, not the release size measure. |

Source revisions at review time:

- Goodluck: `d9864743b112be93c1dcb604589bc6ce6bb7d44b`.
- Duszki: `e97fefbfddb063d0fb89110b0b15d600ada77878`.
- Potato: `f053b8cc828fab452d4211962967bfda31a08de6`.
- Backcountry: `fbab40e342cea495300ab36794903d2b4e91c63a`.

## Build choice

Use the current `Platformer2D` template. Keep gameplay in the XY plane. The inherited class name `Game3D` does not require 3D gameplay. It supplies the WebGL2 context.

Reuse the 2D atlas, quad, shader, input, camera, and ECS flow. Do not build another renderer. Keep one main camera. Add separate effect passes only when a blend mode needs them.

Use ordinary ECS components first. Basic enemies need a local transform, render data, and small combat data. They do not need a transform hierarchy or a rigid body. The stock component arrays contain objects; they are not all packed numeric arrays. Use typed arrays for the navigation costs and spatial grid. Change enemy storage only if measured costs require it.

Add a game-specific fixed-step simulation at 60 steps per second. Keep camera and UI input active during pause. At 2x speed, run more simulation steps; do not double movement distances in a large variable step. Limit catch-up work after a stall. Do not create offline progress from time spent in a hidden tab.

Proposed system order:

1. Read UI and map input; apply valid build commands.
2. In each fixed step, advance waves and spawn enemies.
3. Build the local grid and cell density from live enemies.
4. Move enemies with flow, separation, pressure, obstacle checks, stable noise, and separate knockback velocity.
5. Resolve fortress arrivals and refresh the grid for combat queries.
6. Advance statuses, target towers, and resolve attacks and deaths.
7. Apply run results once, if the run has ended.
8. Update transforms, camera, effects, instance data, and UI for the frame.

Compute a shared distance field from the fortress. Use breadth-first search for the first map with equal-cost cells. Use Dijkstra when different terrain costs are added. Exclude blocked cells and invalid diagonal moves. Use the same spatial grid for neighbours, tower range, chain attacks, and explosions. Range queries must visit all intersecting cells, not only the eight cells next to the source.

## Limits to check early

- Instancing reduces draw calls. It does not remove CPU simulation costs or pixel overdraw.
- The stock renderer uploads the full capacity buffer each frame. The template reserves 65,536 slots: 4 MiB per upload, about 240 MiB per second at 60 frames per second. These are byte counts, not measured transfer times.
- A 10,000-slot buffer is 640,000 bytes. Upload the used range before adding more complex buffer management. The highest allocated index is not the live entity count.
- The free list reuses entity IDs. Delayed attacks must not hit a new enemy that takes a dead enemy's ID. Validate target lifetime or keep area attacks tied to a position.
- The stock capacity check is debug-only and uses `>` before allocation. Enforce the actual buffer limit in release code too. Test the last valid slot and the first invalid allocation.
- The stock shader leaves part of `gl_Position` unset for hidden instances. Assign a complete out-of-view position in the project copy and test dead/non-render slots.
- A spatial grid can still be expensive when thousands of enemies enter one cell. Measure dense chokes. If needed, cap sampled separation neighbours and use cell density for pressure. Record this limit in a `ponytail:` comment. Do not cap damage queries and silently omit valid targets.
- The template disables depth testing. Creation order is not suitable for top-down overlap after entity reuse. Use the Duszki depth pattern for opaque sprite cutouts. Draw translucent effects with an explicit order and suitable depth-write state.
- Keep the renderer's component-bit mask before conversion to floats. Do not upload an unrestricted 32-bit signature as a float.
- Do not use `sys_collide2d` or per-enemy A* for the crowd.
- Do not add lower-rate combat or simulation detail levels until tests show that they preserve the intended results.

## Proposed defaults and open items

None of these items prevents Prototype Zero. Final values need play tests.

| Item | Proposed first choice or remaining work |
| --- | --- |
| Platform | Desktop browser with WebGL2, mouse, and keyboard. Show a clear message if WebGL2 is absent. Mobile performance is not promised. |
| View | Top-down 2D. Pan and zoom. Use simple temporary sprite art with distinct enemy and tower shapes. |
| Scale | Test 1,000, 5,000, and 10,000 live enemies first. Then test 25,000, 100,000, and 200,000 visible units. None of these counts is a release promise yet. |
| Performance | Aim for 60 FPS at 1x with 5,000 enemies on a recorded desktop test device. Record browser, GPU, viewport, pixel ratio, frame-time percentiles, and simulation time. Confirm the release target after the first tests. |
| Prototype Zero | One map, one horde, Star Blaster, and fortress damage. No meta screen. Test an explosion and knockback before the content stage. |
| First playable version | One map, 8 waves, Star Blaster, Cloud Mortar, Friendship Coil, Basic and Sprinter enemies, Magic Missile and Freeze Rainbow, meta upgrades, save, and retry. This is within design sections 134–135. |
| Initial unlocks | Start with Star Blaster, Cloud Mortar, and Magic Missile. Unlock Coil and Freeze through progress. This resolves the two-starting-towers rule for the first playable version; the example timeline lists only one tower at time zero. |
| Map and values | Author one fixed map with build pads, open ground, a choke, and a fortress. Costs, ranges, fire rates, health, speeds, wave budgets, and cooldowns still need data tables and tuning. |
| Armor | Use flat reduction first, as in section 92 and the Crystal enemy role. Section 93 offers a different percentage model. Do not apply both. Revisit before adding Crystal enemies. |
| Continuous damage | Apply damage per second using elapsed simulation time. Do not apply a minimum of 1 damage on every frame; that would make damage depend on update rate. |
| Status rules | Strongest slow wins. Define duration refresh, vulnerability cap, freeze/knockback interaction, and damage-over-time rules before adding those effects. |
| Meta save | Use a versioned localStorage record for currency, unlocks, upgrades, and records. Validate loaded values and handle storage errors. Do not overwrite an unknown newer save. Save rewards once at run end and save each purchase. |
| Release content | Final sprites, animation frames, audio, music, asset rights, full map layouts, upgrade tree, and boss values remain to be made. No final unicorn asset set was supplied in the design. |
| Scope | No multiplayer, inventory, crafting, quests, procedural maps, or backend. No 13 KiB limit was requested. |

## Safe project setup

At review time, this directory had no Git repo. `goodluck` is a local link to `../garrulus/goodluck`. Do not commit that machine-specific link. Do not change the reference repos.

The assessment creates a root Git repo for the design and this plan. Place the future game in `game/` in that same repo.

For B01:

1. Copy the reviewed Goodluck source into a temporary directory. Preserve symlinks. Exclude its `.git` and generated files.
2. Initialize temporary Git state with the author required by `AGENTS.md`.
3. Run `bash ./bootstrap.sh Platformer2D` from that temporary copy. Do not run it from the reference directory.
4. Check that the selected example's links became regular files and that `src/` exists.
5. Move the generated project into `game/`, without the temporary `.git`. Keep the upstream license. Do not import the bootstrap auto-commit into the root history: its message has no bundle size.
6. Install the pinned tools with `npm ci` in `game/` and `game/play/`.
7. Check `play/game.html`: its default canvas and asset inputs must match the 2D page. Do not assume the default release HTML includes the sprite atlas.
8. Run type checks, the production build, and a browser smoke test. Then make the root commit with the measured bundle size.

## Resumable task list

Complete one row at a time. Split a row into smaller commits if it contains separate changes. After each logical change, run its check, record the result here, measure the bundle, and commit. Do not mark a task complete from a code review alone.

| ID | State | Task | Required check |
| --- | --- | --- | --- |
| A01 | Done | Read design, rules, engine, and named examples; save this assessment. | All design sections read; source paths and draw calls checked. |
| B01 | Done | Create `game/` with the bootstrap procedure above. | Type check; production build; browser shows 2D sprites; no broken core links; reference repos unchanged. |
| B02 | Done | Remove platform gameplay; add a top-down scene, temporary atlas, pan, zoom, correct depth, and safe instance capacity. | Browser shows overlapping sprites in correct order; test entity removal/reuse and capacity boundary; verify instanced calls and used-range uploads. |
| B03 | Done | Add fixed-step timing, pause, speed controls, fixed map, and shared flow field. | Small runnable checks for equal-cost routes, blocked and unreachable cells, corner handling, pause, and equivalent 1x/2x simulation time. |
| B04 | In progress | Add uniform grid, area spawning, crowd forces, and fortress arrivals. | Check local queries against a brute-force reference on a small sample; no non-finite positions; no wall escape; each arrival causes damage once. |
| B05 | In progress | Add health, Star Blaster, and death removal. Complete Prototype Zero. | Check range, FIRST targeting, damage, target reuse, and single kill rewards; play the one-tower scene. |
| B06 | Not started | Add a test explosion, knockback, density display, and repeatable crowd stress scenes. | Test 1k/5k/10k; record frame and simulation costs; inspect choke compression and recovery after blast. Stop content work if crowd motion fails. |
| B07 | Not started | Add wave segments, Stars, valid tower placement, win/loss, and retry. | Check budgets, purchases, forbidden pads, pause-build, last-wave completion, and one run end. Test first threat at 20–40 seconds. |
| B08 | Not started | Add Sparkles, upgrades, summary, and safe meta saves. | Check reward once, purchase rules, invalid/newer saves, storage failure, reload, and retry. Play three runs and compare progress. |
| B09 | Not started | Add Cloud Mortar, density targeting, and bounded death effects. | Check radius/falloff and mass-based knockback; record dense-wave costs with effects enabled. |
| B10 | Not started | Add Friendship Coil, Sprinter, Magic Missile, and Freeze Rainbow. | Check unique chain targets, chain decay, area input, cooldowns, freeze expiry, and UI/map input conflicts. |
| B11 | Not started | Complete the first playable version with 8 waves, tutorial, and full HUD. | Play win and loss routes; test pan/zoom, pause/2x, upgrade/retry, keyboard controls, and visible labels that do not rely only on color. |
| B12 | Not started | Add audio, adjust effects, and tune the first playable version. | Threat at 20–40 seconds; large effect by 60 seconds; useful upgrades after loss; repeat performance checks on a recorded device. |
| B13 | Not started | Add the remaining design content only after crowd and retry tests pass. | Separate tasks for each tower, ability, enemy, map, and upgrade group; regression and performance checks for each. |

### Resume procedure

1. Read `AGENTS.md`, this file, `git status`, and recent commits.
2. Find the first incomplete row. Check for partial work before starting it again.
3. Check the durable arbos plan for newer task results.
4. Run the current checks before making a new change.
5. Record the result and next task here at each commit boundary.

### Commit and size rule

Use the default author specified in `AGENTS.md`: `michal@virtualdesign.pl`. Do not add co-author trailers.

Measure the byte count of the generated `game/play/index.html` after the production build. Use a short one-line message, for example: `Add crowd grid; bundle 42180 B`. The number in this example is not a measured result.

For this documentation-only assessment, use `bundle N/A (docs only)`. There is no game bundle yet. Do not report zero bytes as a built game. If a later build fails, fix it before making a normal completed-feature commit.
