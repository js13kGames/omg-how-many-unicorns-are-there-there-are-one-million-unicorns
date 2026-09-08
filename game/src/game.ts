import {new_progress, parse_progress, purchase, run_reward, upgrade_cost} from "./progress.js";
import {viewport_to_world} from "./components/com_camera2d.js";
import {Game3D} from "../lib/game.js";
import {create_spritesheet_from} from "../lib/texture.js";
import {GL_BLEND, GL_CULL_FACE, GL_DEPTH_TEST} from "../lib/webgl.js";
import {setup_render2d_buffers} from "../materials/layout2d.js";
import {mat_render2d} from "../materials/mat_render2d.js";
import {Battle, PADS} from "./battle.js";
import {sprite} from "./scenes/sce_fortress.js";
import {destroy_entity} from "../lib/world.js";
import {fixed_steps, meadow_field, STEP} from "./navigation.js";
import {sys_camera2d} from "./systems/sys_camera2d.js";
import {sys_control_camera} from "./systems/sys_control_camera.js";
import {sys_render2d} from "./systems/sys_render2d.js";
import {sys_resize2d} from "./systems/sys_resize2d.js";
import {sys_transform2d} from "./systems/sys_transform2d.js";
import {Has, World} from "./world.js";

export const WORLD_CAPACITY = 16_384;
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
    Actors = new Map<number, number>();
    Remainder = 0;
    Towers: number[] = [];
    Progress = new_progress();
    SaveBlocked = false;
    Rewarded = false;
    Save() {
        if (this.SaveBlocked) return;
        try {
            localStorage.setItem("unicorn-flood-v1", JSON.stringify(this.Progress));
        } catch {
            document.querySelector("#save-status")!.textContent =
                "Save failed. Keep this page open to retain progress.";
        }
    }
    ApplyProgress() {
        this.Battle.Damage = 3 * 1.2 ** this.Progress.damage;
        this.Battle.FireInterval = 0.06 / 1.15 ** this.Progress.rate;
    }
    Beams: number[] = [];

    constructor() {
        super();
        this.Gl.clearColor(0, 0, 0, 0);
        this.Gl.enable(GL_DEPTH_TEST);
        this.Gl.disable(GL_CULL_FACE);
        this.Gl.disable(GL_BLEND);
        setup_render2d_buffers(this.Gl, this.InstanceBuffer);
        try {
            this.Progress = parse_progress(localStorage.getItem("unicorn-flood-v1"));
        } catch (error) {
            this.SaveBlocked = true;
            document.querySelector("#save-status")!.textContent = String(error);
        }
        this.ApplyProgress();
        for (const kind of ["damage", "rate"] as const)
            document.querySelector(`#upgrade-${kind}`)!.addEventListener("click", () => {
                if (!this.Rewarded) return;
                if (purchase(this.Progress, kind)) this.Save();
            });
        document.querySelector("#pause")!.addEventListener("click", () => {
            this.Paused = !this.Paused;
            document.querySelector("#pause")!.textContent = this.Paused ? "Resume" : "Pause";
        });
        document.querySelector("#retry")!.addEventListener("click", () => {
            for (const ent of this.Actors.values()) destroy_entity(this.World, ent);
            this.Actors.clear();
            for (const ent of this.Towers) destroy_entity(this.World, ent);
            this.Towers = [];
            this.Battle = new Battle();
            this.ApplyProgress();
            this.Rewarded = false;
            this.Remainder = 0;
            this.Paused = false;
            document.querySelector("#pause")!.textContent = "Pause";
        });
        this.Ui.addEventListener("click", (event) => {
            if (event.target !== this.Ui || this.Paused || this.Cameras.length === 0) return;
            const point: [number, number] = [event.clientX, event.clientY];
            viewport_to_world(point, this.World.Camera2D[this.Cameras[0]], point);
            this.Battle.Explode(point[0] + 32, point[1] + 18);
        });
        const build = document.querySelector("#build")!;
        PADS.forEach((_, i) => {
            const button = document.createElement("button");
            button.textContent = `Pad ${i + 1} · 60 Stars`;
            button.addEventListener("click", () => this.Battle.Build(i));
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
            const reward = run_reward(this.Battle.Kills, this.Battle.Cleared, this.Battle.Won);
            this.Progress.sparkles += reward;
            this.Progress.runs++;
            this.Progress.best = Math.max(this.Progress.best, this.Battle.Cleared);
            document.querySelector("#summary")!.textContent =
                `${this.Battle.Kills} stopped · ${this.Battle.Cleared} waves cleared · ${reward} Sparkles earned`;
            this.Save();
        }
        document.querySelector<HTMLElement>("#upgrades")!.hidden = !ended;
        for (const kind of ["damage", "rate"] as const) {
            const button = document.querySelector<HTMLButtonElement>(`#upgrade-${kind}`)!;
            button.textContent = `${kind === "damage" ? "Damage +20%" : "Fire rate +15%"} · ${upgrade_cost(this.Progress[kind])} Sparkles`;
            button.disabled =
                this.Progress.sparkles < upgrade_cost(this.Progress[kind]) ||
                this.Progress[kind] >= 50;
        }
        document.querySelector("#sparkles")!.textContent =
            `${this.Progress.sparkles} Sparkles · upgrades apply on retry`;
        const live = new Set(this.Battle.Enemies.map((e) => e.id));
        for (const [id, ent] of this.Actors)
            if (!live.has(id)) {
                destroy_entity(this.World, ent);
                this.Actors.delete(id);
            }
        for (const e of this.Battle.Enemies) {
            let ent = this.Actors.get(e.id);
            if (ent === undefined) {
                ent = sprite(this, "unicorn", e.x - 32, e.y - 18, 0.7, 0.7, [
                    1,
                    0.75 + (e.id % 4) * 0.06,
                    0.92,
                    1,
                ]);
                this.Actors.set(e.id, ent);
            }
            const local = this.World.LocalTransform2D[ent];
            local.Translation[0] = e.x - 32;
            local.Translation[1] = e.y - 18;
            this.World.Render2D[ent].Detail[0] = -(e.y - 18) / 100;
            this.World.Signature[ent] |= Has.Dirty;
        }
        document.querySelector("#missile")!.textContent =
            this.Battle.MissileCooldown > 0
                ? `Magic Missile: ${Math.ceil(this.Battle.MissileCooldown)}s`
                : "Click battlefield: Magic Missile ready";
        const values = document.querySelectorAll("#status b");
        values[0].textContent = `${this.Battle.Integrity} / 100`;
        values[1].textContent = `${this.Battle.Enemies.length} / ${this.Battle.Kills} stopped`;
        while (this.Towers.length < this.Battle.Towers.length) {
            const t = this.Battle.Towers[this.Towers.length];
            this.Towers.push(sprite(this, "tower", t.x - 32, t.y - 18, 2.7, 2.7));
        }
        values[2].textContent = `${this.Battle.Stars} Stars`;
        document.querySelectorAll<HTMLButtonElement>("#build button").forEach((button, i) => {
            const [x, y] = PADS[i];
            button.disabled =
                this.Battle.Stars < 60 ||
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
        const startButton = document.querySelector<HTMLButtonElement>("#start-wave")!;
        startButton.disabled =
            this.Battle.Preparing <= 0 || this.Battle.Won || this.Battle.Integrity <= 0;
        startButton.textContent =
            this.Battle.Preparing > 0
                ? `Start wave ${this.Battle.Wave + 1} · ${Math.ceil(this.Battle.Preparing)}s`
                : `Wave ${this.Battle.Wave} / 8`;
        document.querySelector(".report strong")!.textContent =
            this.Battle.Integrity <= 0
                ? "The fortress has been overloved."
                : this.Battle.Won
                  ? "Gate secured."
                  : "Hold the gate.";
        sys_transform2d(this, delta);
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
