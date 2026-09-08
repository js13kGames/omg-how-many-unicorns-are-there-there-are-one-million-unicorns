import {Battle} from "../src/battle.js";
import {blocked} from "../src/navigation.js";

for (const count of [1000, 5000, 10000]) {
    const battle = new Battle();
    battle.Campaign = false;
    battle.Rate = 0;
    battle.TowerEnabled = false;
    battle.Limit = count;
    for (let i = 0; i < count; i++) {
        const enemy = battle.Spawn();
        enemy.x = 3 + battle.Random() * 25;
        enemy.y = 2 + battle.Random() * 32;
        enemy.hp = 30;
    }
    for (let i = 0; i < 30; i++) battle.Tick();
    const times: number[] = [];
    for (let i = 0; i < 120; i++) {
        const start = performance.now();
        battle.Tick();
        times.push(performance.now() - start);
    }
    battle.Explode(20, 18);
    for (let i = 0; i < 60; i++) battle.Tick();
    if (
        battle.Enemies.some(
            (e) => !Number.isFinite(e.x + e.y) || blocked(Math.floor(e.x), Math.floor(e.y)),
        )
    )
        throw new Error("Crowd escaped the map");
    times.sort((a, b) => a - b);
    console.log(
        JSON.stringify({
            count,
            medianMs: times[60],
            p95Ms: times[114],
            live: battle.Enemies.length,
        }),
    );
}
