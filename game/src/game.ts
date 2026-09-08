import {Game3D} from "../lib/game.js";
import {create_spritesheet_from} from "../lib/texture.js";
import {GL_BLEND, GL_CULL_FACE, GL_DEPTH_TEST} from "../lib/webgl.js";
import {setup_render2d_buffers} from "../materials/layout2d.js";
import {mat_render2d} from "../materials/mat_render2d.js";
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
    Remainder = 0;

    constructor() {
        super();
        this.Gl.clearColor(0, 0, 0, 0);
        this.Gl.enable(GL_DEPTH_TEST);
        this.Gl.disable(GL_CULL_FACE);
        this.Gl.disable(GL_BLEND);
        setup_render2d_buffers(this.Gl, this.InstanceBuffer);
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
        const steps = fixed_steps(this.Remainder, delta, this.Paused ? 0 : this.Speed);
        this.Remainder = steps.remainder;
        for (let i = 0; i < steps.count; i++) this.Time += STEP;
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
