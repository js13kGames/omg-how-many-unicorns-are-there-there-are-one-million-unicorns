import {Battle, PADS} from "../src/battle.js";
import {MAP_WIDTH, MAP_HEIGHT, meadow_field, blocked} from "../src/navigation.js";
for (let map = 0; map < 5; map++) {
    const field = meadow_field(map);
    for (let y = 2; y < 34; y++)
        if (field[y * MAP_WIDTH + 2] < 0) throw new Error(`Unreachable spawn on map ${map}`);
    for (const [x, y] of PADS)
        if (blocked(x, y, map)) throw new Error(`Blocked build pad on map ${map}`);
    const b = new Battle();
    b.SetMap(map);
    b.Campaign = false;
    b.Rate = 0;
    for (let i = 0; i < 100; i++) b.Spawn();
    for (let i = 0; i < 900; i++) b.Tick();
    if (
        b.Enemies.some(
            (e) =>
                e.x < 0 ||
                e.x >= MAP_WIDTH ||
                e.y < 0 ||
                e.y >= MAP_HEIGHT ||
                b.Blocked(Math.floor(e.x), Math.floor(e.y)),
        )
    )
        throw new Error(`Movement escaped map ${map}`);
}
console.log("Five maps have reachable spawns, clear pads and valid movement.");
