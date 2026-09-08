import {Game} from "./game.js";
import {scene_fortress} from "./scenes/sce_fortress.js";

async function start() {
    const image = document.querySelector("img")!;
    await image.decode();
    const canvas = document.querySelector("#scene") as HTMLCanvasElement;
    if (!canvas.getContext("webgl2"))
        throw new Error("This game needs WebGL2. Try a current desktop browser.");
    const game = new Game();
    scene_fortress(game);
    if (DEBUG) Object.assign(window, {game});
    game.Start();
}

start().catch((error: Error) => {
    document.querySelector("main")!.textContent = error.message;
});
