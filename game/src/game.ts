import {Game3D} from "../lib/game.js";
import {create_spritesheet_from} from "../lib/texture.js";
import {GL_BLEND, GL_CULL_FACE, GL_DEPTH_TEST} from "../lib/webgl.js";
import {setup_render2d_buffers} from "../materials/layout2d.js";
import {mat_crowd} from "../materials/mat_crowd.js";
import {mat_render2d} from "../materials/mat_render2d.js";
import {Battle} from "./battle.js";
import {Crowd, CROWD_LIMIT} from "./crowd.js";
import {meadow_field} from "./navigation.js";
import {scene_fortress} from "./scenes/sce_fortress.js";
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
    MaterialCrowd = mat_crowd(this.Gl);
    CrowdVao = this.Gl.createVertexArray()!;
    Spritesheet = create_spritesheet_from(this.Gl, document.querySelector("img")!);
    InstanceBuffer = this.Gl.createBuffer()!;
    UnitSize = REAL_UNIT_SIZE;
    Field = meadow_field();
    Speed = 1;
    Paused = false;
    Time = 0;
    Battle = new Battle();
    Crowd = new Crowd();
    RenderCount = 0;

    constructor() {
        super();
        this.Gl.clearColor(0, 0, 0, 0);
        this.Gl.enable(GL_DEPTH_TEST);
        this.Gl.disable(GL_CULL_FACE);
        this.Gl.disable(GL_BLEND);
        setup_render2d_buffers(this.Gl, this.InstanceBuffer);
        this.Battle.Campaign = false;
        this.Battle.Rate = 0;
        this.Battle.TowerEnabled = false;
        this.Battle.Integrity = this.Battle.MaxIntegrity = CROWD_LIMIT;
        document.querySelector("#start-wave")!.addEventListener("click", () => this.Crowd.Start());
        document.querySelector("#retry")!.addEventListener("click", () => {
            this.Crowd.Reset();
            this.Time = 0;
            this.Paused = false;
            document.querySelector("#pause")!.textContent = "Pause";
        });
        document.querySelector("#pause")!.addEventListener("click", () => {
            this.Paused = !this.Paused;
            document.querySelector("#pause")!.textContent = this.Paused ? "Resume" : "Pause";
        });
        document.querySelector("#speed")!.addEventListener("click", () => {
            this.Speed = this.Speed === 1 ? 2 : 1;
            document.querySelector("#speed")!.textContent = `${this.Speed}x speed`;
        });
    }

    override FrameUpdate(delta: number) {
        sys_control_camera(this, delta);
        if (!this.Paused) {
            const elapsed = Math.min(delta, 0.1) * this.Speed;
            this.Time += elapsed;
            this.Crowd.Tick(elapsed);
        }
        const count = Math.floor(this.Crowd.Count);
        document.querySelectorAll("#status b")[1].textContent =
            `${count.toLocaleString()} visible · ${count.toLocaleString()} / ${CROWD_LIMIT.toLocaleString()}`;
        const start = document.querySelector<HTMLButtonElement>("#start-wave")!;
        start.disabled = this.Crowd.Running;
        start.textContent = this.Crowd.Running
            ? `${count.toLocaleString()} / ${CROWD_LIMIT.toLocaleString()} deployed`
            : `Start ${CROWD_LIMIT.toLocaleString()} unicorn test`;
        document.querySelector("#summary")!.textContent =
            count === CROWD_LIMIT
                ? "One million GPU-generated unicorns are visible."
                : "GPU visual crowd benchmark · aggregate gameplay simulation pending.";
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
