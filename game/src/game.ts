import {viewport_to_world} from "./components/com_camera2d.js";
import {Game3D} from "../lib/game.js";
import {create_spritesheet_from} from "../lib/texture.js";
import {GL_BLEND, GL_CULL_FACE, GL_DEPTH_TEST} from "../lib/webgl.js";
import {FLOATS_PER_INSTANCE, setup_render2d_buffers} from "../materials/layout2d.js";
import {mat_render2d} from "../materials/mat_render2d.js";
import {Battle, configure_test_level, PADS, TEST_UNICORNS, TOWER_COSTS} from "./battle.js";
import {sprite, scene_fortress} from "./scenes/sce_fortress.js";
import {destroy_entity} from "../lib/world.js";
import {atlas} from "./sprites/atlas.js";
import {fixed_steps, meadow_field, STEP} from "./navigation.js";
import {sys_camera2d} from "./systems/sys_camera2d.js";
import {sys_control_camera} from "./systems/sys_control_camera.js";
import {sys_render2d} from "./systems/sys_render2d.js";
import {sys_resize2d} from "./systems/sys_resize2d.js";
import {sys_transform2d} from "./systems/sys_transform2d.js";
import {Has, World} from "./world.js";

export const WORLD_CAPACITY = TEST_UNICORNS + 2_048;
export const REAL_UNIT_SIZE = Math.max(
    8,
    Math.min(window.innerWidth / 76, window.innerHeight / 48),
);

export class Game extends Game3D {
    World = new World(WORLD_CAPACITY);
    MaterialRender2D = mat_render2d(this.Gl, Has.Render2D, Has.SpatialNode2D);
    Spritesheet = create_spritesheet_from(this.Gl, document.querySelector("img")!);
    InstanceBuffer = this.Gl.createBuffer()!;
    UnitSize = REAL_UNIT_SIZE;
    Field = meadow_field();
    Speed = 1;
    Paused = false;
    Time = 0;
    Battle = new Battle();
    RenderCount = 0;
    Remainder = 0;
    Towers: number[] = [];
    Rewarded = false;
    FreezeStart: [number, number] | null = null;
    Debris: {entity: number; life: number; vx: number; vy: number}[] = [];
    Beams: number[] = [];

    constructor() {
        super();
        this.Gl.clearColor(0, 0, 0, 0);
        this.Gl.enable(GL_DEPTH_TEST);
        this.Gl.disable(GL_CULL_FACE);
        this.Gl.disable(GL_BLEND);
        setup_render2d_buffers(this.Gl, this.InstanceBuffer);
        configure_test_level(this.Battle);
        document.querySelector("#pause")!.addEventListener("click", () => {
            this.Paused = !this.Paused;
            document.querySelector("#pause")!.textContent = this.Paused ? "Resume" : "Pause";
        });
        document.querySelector("#retry")!.addEventListener("click", () => {
            this.World = new World(WORLD_CAPACITY);
            this.RenderCount = 0;
            this.Towers = [];
            this.Beams = [];
            this.Debris = [];
            this.Cameras = [];
            this.FreezeStart = null;
            this.Battle = new Battle();
            configure_test_level(this.Battle);
            scene_fortress(this);
            this.ViewportResized = true;
            this.Rewarded = false;
            this.Remainder = 0;
            this.Paused = false;
            document.querySelector("#pause")!.textContent = "Pause";
        });
        this.Ui.addEventListener("click", (event) => {
            if (event.target !== this.Ui || this.Paused || this.Cameras.length === 0) return;
            const point: [number, number] = [event.clientX, event.clientY];
            viewport_to_world(point, this.World.Camera2D[this.Cameras[0]], point);
            const ability = document.querySelector<HTMLSelectElement>("#ability")!.value;
            if (["freeze", "flyby", "divine"].includes(ability)) {
                if (!this.FreezeStart) this.FreezeStart = [point[0] + 32, point[1] + 18];
                else {
                    if (ability === "freeze")
                        this.Battle.Freeze(...this.FreezeStart, point[0] + 32, point[1] + 18);
                    else
                        this.Battle.Special(
                            ability,
                            ...this.FreezeStart,
                            point[0] + 32,
                            point[1] + 18,
                        );
                    this.FreezeStart = null;
                }
            } else if (ability === "apocalypse")
                this.Battle.Special(ability, point[0] + 32, point[1] + 18);
            else this.Battle.Explode(point[0] + 32, point[1] + 18);
        });
        const build = document.querySelector("#build")!;
        PADS.forEach((_, i) => {
            const button = document.createElement("button");
            button.textContent = `Pad ${i + 1} · 60 Stars`;
            button.addEventListener("click", () =>
                this.Battle.Build(
                    i,
                    Number(document.querySelector<HTMLSelectElement>("#tower-kind")!.value),
                ),
            );
            build.append(button);
        });
        document
            .querySelector("#start-wave")!
            .addEventListener("click", () => this.Battle.StartWave());
        document.querySelector("#speed")!.addEventListener("click", () => {
            this.Speed = this.Speed === 1 ? 2 : 1;
            document.querySelector("#speed")!.textContent = `${this.Speed}x speed`;
        });
    }

    override FrameUpdate(delta: number) {
        sys_control_camera(this, delta);
        const steps = fixed_steps(this.Remainder, delta, this.Paused ? 0 : this.Speed);
        this.Remainder = steps.remainder;
        for (let i = 0; i < steps.count; i++) {
            this.Time += STEP;
            this.Battle.Tick();
        }
        const ended = this.Battle.Won || this.Battle.Integrity <= 0;
        if (ended && !this.Rewarded) {
            this.Rewarded = true;
            document.querySelector("#summary")!.textContent = this.Battle.Won
                ? `${this.Battle.Kills.toLocaleString()} unicorns stopped. Test complete.`
                : `${this.Battle.Spawned.toLocaleString()} deployed before the fortress fell.`;
        }
        document.querySelector("#missile")!.textContent =
            this.Battle.MissileCooldown > 0
                ? `Magic Missile: ${Math.ceil(this.Battle.MissileCooldown)}s`
                : "Click battlefield: Magic Missile ready";
        if (document.querySelector<HTMLSelectElement>("#ability")!.value === "freeze")
            document.querySelector("#missile")!.textContent = this.FreezeStart
                ? "Click the end of the freeze line"
                : this.Battle.FreezeCooldown > 0
                  ? `Freeze: ${Math.ceil(this.Battle.FreezeCooldown)}s`
                  : "Click two points: Freeze ready";
        const ability = document.querySelector<HTMLSelectElement>("#ability")!.value;
        if (Object.hasOwn(this.Battle.SpecialCooldowns, ability))
            document.querySelector("#missile")!.textContent = this.FreezeStart
                ? "Click the line end"
                : this.Battle.SpecialCooldowns[ability] > 0
                  ? `${ability}: ${Math.ceil(this.Battle.SpecialCooldowns[ability])}s`
                  : ability === "apocalypse"
                    ? "Click target: Apocalypse ready"
                    : "Click two points: ability ready";
        const values = document.querySelectorAll("#status b");
        values[0].textContent = `${this.Battle.Integrity} / ${this.Battle.MaxIntegrity}`;
        values[1].textContent = `${this.Battle.Enemies.length.toLocaleString()} live · ${this.Battle.Spawned.toLocaleString()} / ${TEST_UNICORNS.toLocaleString()}`;
        while (this.Towers.length < this.Battle.Towers.length) {
            const t = this.Battle.Towers[this.Towers.length];
            this.Towers.push(
                sprite(
                    this,
                    "tower",
                    t.x - 32,
                    t.y - 18,
                    2.7,
                    2.7,
                    t.kind === 1
                        ? [0.65, 0.8, 1, 1]
                        : t.kind === 2
                          ? [0.85, 0.6, 1, 1]
                          : [1, 1, 1, 1],
                ),
            );
        }
        values[2].textContent = `${this.Battle.Stars} Stars`;
        document.querySelectorAll<HTMLButtonElement>("#build button").forEach((button, i) => {
            const [x, y] = PADS[i];
            const cost =
                TOWER_COSTS[
                    Number(document.querySelector<HTMLSelectElement>("#tower-kind")!.value)
                ];
            button.textContent = `Pad ${i + 1} · ${cost} Stars`;
            button.disabled =
                this.Battle.Stars < cost ||
                this.Battle.Integrity <= 0 ||
                this.Battle.Won ||
                this.Battle.Towers.some((t) => t.x === x && t.y === y);
        });
        while (this.Beams.length < this.Battle.Shots.length)
            this.Beams.push(sprite(this, "ground", 0, 0, 1, 0.08, [1, 0.94, 0.6, 1], 0.8));
        for (let i = 0; i < this.Beams.length; i++) {
            const ent = this.Beams[i],
                shot = this.Battle.Shots[i];
            if (!shot) {
                this.World.Signature[ent] &= ~Has.Render2D;
                continue;
            }
            this.World.Signature[ent] |= Has.Render2D | Has.Dirty;
            const local = this.World.LocalTransform2D[ent],
                dx = shot.x - shot.fromX,
                dy = shot.y - shot.fromY;
            local.Translation[0] = shot.fromX - 32 + dx / 2;
            local.Translation[1] = shot.fromY - 18 + dy / 2;
            local.Scale[0] = Math.hypot(dx, dy);
            local.Scale[1] = 0.05 + shot.life * 0.4;
            local.Rotation = (Math.atan2(dy, dx) * 180) / Math.PI;
        }
        for (const debris of this.Debris) {
            if (!this.Paused) {
                debris.life -= Math.min(delta, 0.1) * this.Speed;
                const local = this.World.LocalTransform2D[debris.entity];
                local.Translation[0] += debris.vx * delta;
                local.Translation[1] += debris.vy * delta;
                local.Scale[0] = local.Scale[1] = Math.max(0, debris.life) * 0.4;
                this.World.Signature[debris.entity] |= Has.Dirty;
            }
            if (debris.life <= 0) destroy_entity(this.World, debris.entity);
        }
        this.Debris = this.Debris.filter((d) => d.life > 0);
        const startButton = document.querySelector<HTMLButtonElement>("#start-wave")!;
        startButton.disabled =
            this.Battle.Preparing <= 0 || this.Battle.Won || this.Battle.Integrity <= 0;
        startButton.textContent =
            this.Battle.Wave === 0
                ? `Start ${TEST_UNICORNS.toLocaleString()} unicorn test`
                : `${this.Battle.Spawned.toLocaleString()} / ${TEST_UNICORNS.toLocaleString()} deployed`;
        document.querySelector(".report strong")!.textContent =
            this.Battle.Integrity <= 0
                ? "The fortress has been overloved."
                : this.Battle.Won
                  ? "Gate secured."
                  : this.Battle.Towers.length === 0
                    ? "Choose a tower, then a build pad."
                    : this.Battle.Wave === 0
                      ? "Start the million-unicorn test when ready."
                      : "One level · no persistent progression.";
        sys_transform2d(this, delta);
        const unicorn = atlas.unicorn;
        let offset = this.World.Signature.length * FLOATS_PER_INSTANCE;
        for (const e of this.Battle.Enemies) {
            const scale = [0.7, 0.55, 1.2, 0.9, 2.4][e.kind || 0];
            this.World.InstanceData[offset] = scale;
            this.World.InstanceData[offset + 1] = scale;
            this.World.InstanceData[offset + 4] = e.x - 32;
            this.World.InstanceData[offset + 5] = e.y - 18;
            this.World.InstanceData[offset + 6] = -(e.y - 18) / 100;
            this.World.InstanceData[offset + 7] = Has.Render2D;
            this.World.InstanceData[offset + 8] = (e.frozen || 0) > 0 ? 0.4 : 1;
            this.World.InstanceData[offset + 9] =
                (e.frozen || 0) > 0 ? 0.85 : 0.75 + (e.id % 4) * 0.06;
            this.World.InstanceData[offset + 10] = (e.frozen || 0) > 0 ? 1 : 0.92;
            this.World.InstanceData[offset + 11] = 1;
            this.World.InstanceData[offset + 12] = unicorn.x;
            this.World.InstanceData[offset + 13] = unicorn.y;
            this.World.InstanceData[offset + 14] = unicorn.w;
            this.World.InstanceData[offset + 15] = unicorn.h;
            offset += FLOATS_PER_INSTANCE;
        }
        this.RenderCount = this.World.Signature.length + this.Battle.Enemies.length;
        sys_resize2d(this, delta);
        sys_camera2d(this, delta);
        sys_render2d(this, delta);
    }
}

export const enum Layer {
    None = 0,
    Terrain = 1,
    Player = 2,
    Object = 4,
}
