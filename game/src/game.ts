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
import {Battle, PADS} from "./battle.js";
import {Crowd, CROWD_LIMIT} from "./crowd.js";
import {meadow_field} from "./navigation.js";
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
    MissileCooldown = 0;

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
            if (
                event.target !== this.Ui ||
                this.Paused ||
                this.MissileCooldown > 0 ||
                this.Cameras.length === 0
            )
                return;
            const point: [number, number] = [event.clientX, event.clientY];
            viewport_to_world(point, this.World.Camera2D[this.Cameras[0]], point);
            const x = point[0] + 32,
                y = point[1] + 18;
            if (this.Crowd.Explode(x, y) > 0) {
                this.MissileCooldown = 2;
                this.Battle.Blast = {x, y, life: 0.5};
            }
        });
        const build = document.querySelector("#build")!;
        PADS.forEach(([x, y], i) => {
            const button = document.createElement("button");
            button.addEventListener("click", () => {
                if (this.Stars < TOWER_COST || !this.Crowd.Build(x, y)) return;
                this.Stars -= TOWER_COST;
                sprite(this, "tower", x - 32, y - 18, 2.7, 2.7);
                this.World.Signature[this.World.Signature.length - 1] |= Has.Dirty;
            });
            button.dataset.pad = String(i);
            build.append(button);
        });
    }

    Reset() {
        this.Crowd.Reset();
        this.World = new World(WORLD_CAPACITY);
        this.Cameras = [];
        this.EffectEntities = [];
        this.Stars = 360;
        this.MissileCooldown = this.Time = 0;
        this.Paused = false;
        this.Battle.Blast = null;
        scene_fortress(this);
        this.ViewportResized = true;
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
        const integrity = CROWD_LIMIT - this.Crowd.Arrived;
        const values = document.querySelectorAll("#status b");
        values[0].textContent = `${integrity.toLocaleString()} / ${CROWD_LIMIT.toLocaleString()}`;
        values[1].textContent = `${this.Crowd.Count.toLocaleString()} live · ${this.Crowd.Kills.toLocaleString()} destroyed`;
        values[2].textContent = `${this.Stars} Stars · ${this.Crowd.Arrived.toLocaleString()} breached`;
        const start = document.querySelector<HTMLButtonElement>("#start-wave")!;
        start.disabled = this.Crowd.Running;
        start.textContent = this.Crowd.Running
            ? `${this.Crowd.Spawned.toLocaleString()} / ${CROWD_LIMIT.toLocaleString()} deployed`
            : `Start ${CROWD_LIMIT.toLocaleString()} unicorn attack`;
        document.querySelector("#summary")!.textContent =
            this.MissileCooldown > 0
                ? `Magic Missile recharging: ${this.MissileCooldown.toFixed(1)}s`
                : "Click the battlefield to fire Magic Missile.";
        document.querySelectorAll<HTMLButtonElement>("#build button").forEach((button, i) => {
            button.textContent = `Build tower ${i + 1} · ${TOWER_COST} Stars`;
            button.disabled =
                this.Stars < TOWER_COST ||
                this.Crowd.Towers.some((tower) => {
                    const [x, y] = PADS[i];
                    return tower.x === x && tower.y === y;
                });
        });
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
