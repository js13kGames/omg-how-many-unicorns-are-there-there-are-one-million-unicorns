import {viewport_to_world} from "./components/com_camera2d.js";
import {Game3D} from "../lib/game.js";
import {create_spritesheet_from} from "../lib/texture.js";
import {
    GL_BLEND,
    GL_CLAMP_TO_EDGE,
    GL_CULL_FACE,
    GL_DEPTH_TEST,
    GL_FLOAT,
    GL_NEAREST,
    GL_R32F,
    GL_RED,
    GL_TEXTURE_2D,
    GL_TEXTURE_MAG_FILTER,
    GL_TEXTURE_MIN_FILTER,
    GL_TEXTURE_WRAP_S,
    GL_TEXTURE_WRAP_T,
} from "../lib/webgl.js";
import {setup_render2d_buffers} from "../materials/layout2d.js";
import {mat_crowd} from "../materials/mat_crowd.js";
import {mat_render2d} from "../materials/mat_render2d.js";
import {Battle} from "./battle.js";
import {Crowd, CROWD_LIMIT, ESCAPE_LIMIT, KILL_TARGET} from "./crowd.js";
import {
    new_progress,
    parse_progress,
    Progress,
    purchase,
    run_reward,
    UPGRADE_KINDS,
    upgrade_cost,
} from "./progress.js";
import {blocked, meadow_field} from "./navigation.js";
import {sprite, scene_fortress} from "./scenes/sce_fortress.js";
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
const TOWER_COST = 60;

export class Game extends Game3D {
    World = new World(WORLD_CAPACITY);
    MaterialRender2D = mat_render2d(this.Gl, Has.Render2D, Has.SpatialNode2D);
    MaterialCrowd = mat_crowd(this.Gl);
    CrowdVao = this.Gl.createVertexArray()!;
    CrowdTexture = this.Gl.createTexture()!;
    Spritesheet = create_spritesheet_from(this.Gl, document.querySelector("img")!);
    InstanceBuffer = this.Gl.createBuffer()!;
    UnitSize = REAL_UNIT_SIZE;
    Field = meadow_field();
    Speed = 1;
    Paused = false;
    Time = 0;
    Battle = new Battle();
    Crowd = new Crowd();
    EffectEntities: number[] = [];
    RenderCount = 0;
    Stars = 360;
    Progress: Progress = new_progress();
    Rewarded = false;
    Reward = 0;
    MissileCooldown = 0;
    Building = false;
    Message = "Click the battlefield to fire Magic Missile.";

    constructor() {
        super();
        this.Gl.clearColor(0, 0, 0, 0);
        this.Gl.enable(GL_DEPTH_TEST);
        this.Gl.disable(GL_CULL_FACE);
        this.Gl.disable(GL_BLEND);
        setup_render2d_buffers(this.Gl, this.InstanceBuffer);
        this.Gl.bindTexture(GL_TEXTURE_2D, this.CrowdTexture);
        this.Gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_NEAREST);
        this.Gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_NEAREST);
        this.Gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
        this.Gl.texParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
        this.Gl.texImage2D(
            GL_TEXTURE_2D,
            0,
            GL_R32F,
            64,
            36,
            0,
            GL_RED,
            GL_FLOAT,
            this.Crowd.Prefix,
        );
        this.Battle.Campaign = false;
        this.Battle.Rate = 0;
        this.Battle.TowerEnabled = false;
        this.Battle.Integrity = this.Battle.MaxIntegrity = CROWD_LIMIT;
        try {
            this.Progress = parse_progress(
                localStorage.getItem("unicorn-flood-v2") ||
                    localStorage.getItem("unicorn-flood-v1"),
            );
        } catch (error) {
            this.Message = String(error);
        }
        this.ApplyProgress();
        document.querySelector("#start-wave")!.addEventListener("click", () => this.Crowd.Start());
        document.querySelector("#retry")!.addEventListener("click", () => this.Reset());
        document.querySelector("#pause")!.addEventListener("click", () => {
            this.Paused = !this.Paused;
            document.querySelector("#pause")!.textContent = this.Paused ? "Resume" : "Pause";
        });
        document.querySelector("#speed")!.addEventListener("click", () => {
            this.Speed = this.Speed === 1 ? 2 : 1;
            document.querySelector("#speed")!.textContent = `${this.Speed}x speed`;
        });
        this.Ui.addEventListener("click", (event) => {
            if (event.target !== this.Ui || this.Paused || this.Cameras.length === 0) return;
            const point: [number, number] = [event.clientX, event.clientY];
            viewport_to_world(point, this.World.Camera2D[this.Cameras[0]], point);
            const x = point[0] + 32,
                y = point[1] + 18;
            if (this.Building) {
                const cellX = Math.floor(x),
                    cellY = Math.floor(y);
                if (this.Stars < TOWER_COST) this.Message = "Not enough Stars for a tower.";
                else if (this.Crowd.Build(cellX, cellY)) {
                    this.Stars -= TOWER_COST;
                    sprite(this, "tower", cellX - 31.5, cellY - 17.5, 0.9, 0.9);
                    this.Building = false;
                    this.Message = "Tower built. Click the battlefield to fire Magic Missile.";
                } else this.Message = "Build on an empty maze wall cell, not on the path.";
                return;
            }
            if (this.MissileCooldown > 0) return;
            if (this.Crowd.Explode(x, y) > 0) {
                this.MissileCooldown = 2;
                this.Battle.Blast = {x, y, life: 0.5};
            }
        });
        document.querySelector("#build-tower")!.addEventListener("click", () => {
            if (this.Crowd.Result) return;
            if (this.Stars < TOWER_COST) {
                this.Message = "Not enough Stars for a tower.";
                return;
            }
            this.Building = !this.Building;
            this.Message = this.Building
                ? "Build mode: click an empty maze wall cell."
                : "Click the battlefield to fire Magic Missile.";
        });
        for (const kind of UPGRADE_KINDS)
            document.querySelector(`#upgrade-${kind}`)!.addEventListener("click", () => {
                if (this.Crowd.Result && purchase(this.Progress, kind)) {
                    this.Save();
                    this.UpdateUpgrades();
                }
            });
        document.querySelector("#result-retry")!.addEventListener("click", () => this.Reset());
    }

    Save() {
        try {
            localStorage.setItem("unicorn-flood-v2", JSON.stringify(this.Progress));
        } catch {
            this.Message = "Progress could not be saved.";
        }
    }

    ApplyProgress() {
        this.Crowd.TowerDamage = 250 * 1.5 ** this.Progress.damage;
        this.Crowd.TowerInterval = 0.12 / 1.2 ** this.Progress.rate;
        this.Crowd.TowerRange = 12 + this.Progress.range * 1.5;
        this.Crowd.MissileDamage = 20_000 * 1.5 ** this.Progress.missile;
        this.Stars = 360 + this.Progress.economy * 60;
    }

    UpdateUpgrades() {
        document.querySelector("#bank")!.textContent =
            `${this.Progress.stars.toLocaleString()} upgrade Stars`;
        for (const kind of UPGRADE_KINDS) {
            const button = document.querySelector<HTMLButtonElement>(`#upgrade-${kind}`)!;
            const cost = upgrade_cost(this.Progress[kind]);
            button.textContent = `${
                {
                    damage: "Tower damage +50%",
                    rate: "Tower fire rate +20%",
                    range: "Tower range +1.5",
                    missile: "Missile power +50%",
                    economy: "Starting Stars +60",
                }[kind]
            } · ${cost} Stars · level ${this.Progress[kind]}`;
            button.disabled = this.Progress.stars < cost || this.Progress[kind] >= 20;
        }
    }

    EndRun() {
        if (!this.Crowd.Result || this.Rewarded) return;
        this.Rewarded = true;
        this.Reward = run_reward(this.Crowd.Kills, this.Crowd.Result > 0);
        this.Progress.stars += this.Reward;
        this.Progress.runs++;
        this.Progress.wins += +(this.Crowd.Result > 0);
        this.Progress.bestKills = Math.max(this.Progress.bestKills, this.Crowd.Kills);
        this.Save();
        document.querySelector("#result-title")!.textContent =
            this.Crowd.Result > 0 ? "The gate holds!" : "The unicorns escaped!";
        const result = document.querySelector<HTMLElement>("#result")!;
        result.className = this.Crowd.Result > 0 ? "win" : "loss";
        document.querySelector("#result-copy")!.textContent =
            `${this.Crowd.Kills.toLocaleString()} destroyed · ${this.Crowd.Arrived.toLocaleString()} escaped · +${this.Reward} upgrade Stars`;
        document.querySelector<HTMLElement>("#result")!.hidden = false;
        this.UpdateUpgrades();
    }

    Reset() {
        this.Crowd.Reset();
        this.World = new World(WORLD_CAPACITY);
        this.Cameras = [];
        this.EffectEntities = [];
        this.Rewarded = false;
        this.Reward = 0;
        this.ApplyProgress();
        this.MissileCooldown = this.Time = 0;
        this.Building = false;
        this.Message = "Click the battlefield to fire Magic Missile.";
        this.Paused = false;
        this.Battle.Blast = null;
        scene_fortress(this);
        this.ViewportResized = true;
        document.querySelector<HTMLElement>("#result")!.hidden = true;
        document.body.classList.remove("building");
        document.querySelector("#pause")!.textContent = "Pause";
    }

    override FrameUpdate(delta: number) {
        sys_control_camera(this, delta);
        if (!this.Paused) {
            const elapsed = Math.min(delta, 0.1) * this.Speed;
            this.Time += elapsed;
            this.MissileCooldown = Math.max(0, this.MissileCooldown - elapsed);
            if (this.Battle.Blast && (this.Battle.Blast.life -= elapsed) <= 0)
                this.Battle.Blast = null;
            this.Crowd.Tick(elapsed);
            this.EndRun();
        }
        if (this.Crowd.UpdatePrefix()) {
            this.Gl.bindTexture(GL_TEXTURE_2D, this.CrowdTexture);
            this.Gl.texSubImage2D(
                GL_TEXTURE_2D,
                0,
                0,
                0,
                64,
                36,
                GL_RED,
                GL_FLOAT,
                this.Crowd.Prefix,
            );
        }
        const values = document.querySelectorAll("#status b");
        values[0].textContent = `${Math.max(0, ESCAPE_LIMIT - this.Crowd.Arrived).toLocaleString()} may still escape`;
        values[1].textContent = `${this.Crowd.Kills.toLocaleString()} / ${KILL_TARGET.toLocaleString()} destroyed`;
        values[2].textContent = `${this.Stars} build Stars · ${this.Progress.stars} upgrade Stars`;
        document.querySelector<HTMLElement>("#escape-fill")!.style.width =
            `${(this.Crowd.Arrived / ESCAPE_LIMIT) * 100}%`;
        document.querySelector<HTMLElement>("#kill-fill")!.style.width =
            `${(this.Crowd.Kills / KILL_TARGET) * 100}%`;
        document.body.classList.toggle("building", this.Building);
        const start = document.querySelector<HTMLButtonElement>("#start-wave")!;
        start.disabled = this.Crowd.Running || this.Crowd.Result !== 0;
        start.textContent = this.Crowd.Running
            ? `${this.Crowd.Spawned.toLocaleString()} / ${CROWD_LIMIT.toLocaleString()} deployed`
            : `Start ${CROWD_LIMIT.toLocaleString()} unicorn attack`;
        document.querySelector("#summary")!.textContent = this.Building
            ? this.Message
            : this.MissileCooldown > 0
              ? `Magic Missile recharging: ${this.MissileCooldown.toFixed(1)}s`
              : this.Message;
        const build = document.querySelector<HTMLButtonElement>("#build-tower")!;
        build.textContent = this.Building
            ? "Cancel tower placement"
            : `Build tower · ${TOWER_COST} Stars`;
        build.disabled = this.Stars < TOWER_COST || this.Crowd.Result !== 0;
        const preview = document.querySelector<HTMLElement>("#build-preview")!;
        preview.hidden = !this.Building || this.Cameras.length === 0;
        if (!preview.hidden) {
            const camera = this.World.Camera2D[this.Cameras[0]],
                point: [number, number] = [this.InputState.MouseX, this.InputState.MouseY];
            viewport_to_world(point, camera, point);
            const cellX = Math.floor(point[0] + 32),
                cellY = Math.floor(point[1] + 18),
                worldX = cellX - 31.5,
                worldY = cellY - 17.5,
                matrix = camera.Pv;
            preview.style.left = `${((matrix[0] * worldX + matrix[2] * worldY + matrix[4] + 1) * camera.ViewportWidth) / 2}px`;
            preview.style.top = `${((1 - (matrix[1] * worldX + matrix[3] * worldY + matrix[5])) * camera.ViewportHeight) / 2}px`;
            preview.style.width = preview.style.height = `${this.UnitSize}px`;
            preview.classList.toggle(
                "valid",
                cellX >= 0 &&
                    cellX < 56 &&
                    cellY >= 0 &&
                    cellY < 36 &&
                    blocked(cellX, cellY) &&
                    !this.Crowd.Towers.some(
                        (tower) => Math.floor(tower.x) === cellX && Math.floor(tower.y) === cellY,
                    ),
            );
        }
        while (this.EffectEntities.length < this.Crowd.Effects.length)
            this.EffectEntities.push(sprite(this, "ground", 0, 0, 1, 1, [1, 1, 1, 1], 0.9));
        for (let i = 0; i < this.EffectEntities.length; i++) {
            const entity = this.EffectEntities[i],
                effect = this.Crowd.Effects[i];
            if (!effect) {
                this.World.Signature[entity] &= ~Has.Render2D;
                continue;
            }
            this.World.Signature[entity] |= Has.Render2D | Has.Dirty;
            const local = this.World.LocalTransform2D[entity],
                progress = 1 - effect.life / effect.duration,
                start = effect.kind === "missile" ? Math.max(0, progress - 0.25) : 0,
                end = effect.kind === "missile" ? progress : 1,
                fromX = effect.fromX + (effect.x - effect.fromX) * start,
                fromY = effect.fromY + (effect.y - effect.fromY) * start,
                x = effect.fromX + (effect.x - effect.fromX) * end,
                y = effect.fromY + (effect.y - effect.fromY) * end,
                dx = x - fromX,
                dy = y - fromY;
            local.Translation[0] = (fromX + x) / 2 - 32;
            local.Translation[1] = (fromY + y) / 2 - 18;
            local.Scale[0] = Math.max(0.1, Math.hypot(dx, dy));
            local.Scale[1] = effect.width * (effect.kind === "blast" ? 1 + progress * 2 : 1);
            local.Rotation = (Math.atan2(dy, dx) * 180) / Math.PI;
            this.World.Render2D[entity].Color.set(
                effect.kind === "laser"
                    ? [0.25, 0.95, 1, 1]
                    : effect.kind === "missile"
                      ? [1, 0.45, 0.08, 1]
                      : [1, 0.9, 0.2, 1],
            );
        }
        this.RenderCount = this.World.Signature.length;
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
