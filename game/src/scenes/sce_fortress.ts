import {instantiate} from "../../lib/game.js";
import {Vec4} from "../../lib/math.js";
import {local_transform2d} from "../components/com_local_transform2d.js";
import {order, render2d} from "../components/com_render2d.js";
import {PADS} from "../battle.js";
import {Game} from "../game.js";
import {blueprint_camera} from "./blu_camera.js";

export function sprite(
    game: Game,
    name: string,
    x: number,
    y: number,
    w: number,
    h: number,
    color: Vec4 = [1, 1, 1, 1],
    z = -y / 100,
) {
    return instantiate(game, [
        local_transform2d([x, y], 0, [w, h]),
        render2d(name, color),
        order(z),
    ]);
}

export function scene_fortress(game: Game) {
    game.World.Width = 64;
    game.World.Height = 36;
    instantiate(game, blueprint_camera(game));
    sprite(game, "ground", 0, 0, 64, 36, [0.2, 0.26, 0.25, 1], -0.95);
    for (let y = -17; y < 18; y += 2) {
        for (let x = -31; x < 32; x += 2) {
            const shade = 0.24 + ((x * x + y * y) % 7) * 0.003;
            sprite(game, "ground", x, y, 1.96, 1.96, [shade, shade + 0.045, shade + 0.01, 1], -0.9);
        }
    }
    for (let y = -17; y <= 17; y += 2) {
        if (Math.abs(y) > 4) sprite(game, "stone", 0, y, 3.9, 1.95, undefined, 0.5);
        sprite(game, "stone", 29, y, 2, 2, undefined, 0.6);
    }
    sprite(game, "stone", 28, 0, 5, 7, undefined, 0.65);
    sprite(game, "ground", 25.7, 0, 0.4, 3, [0.64, 0.85, 0.83, 1], 0.7);
    for (const [x, y] of PADS)
        sprite(game, "ground", x - 32, y - 18, 2.5, 2.5, [0.4, 0.5, 0.42, 1], -0.7);
}
