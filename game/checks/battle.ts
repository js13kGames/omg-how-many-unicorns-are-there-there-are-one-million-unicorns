import {Battle} from "../src/battle.js";
import {blocked} from "../src/navigation.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
const b = new Battle();
b.Rate = 0;
for (let i = 0; i < 200; i++) b.Spawn();
b.Grid();
for (const [x, y, r] of [
    [3, 10, 2],
    [8, 18, 12],
    [60, 30, 8],
]) {
    const actual = b.Query(x, y, r).sort((a, b) => a - b);
    const expected = b.Enemies.flatMap((e, i) =>
        (e.x - x) ** 2 + (e.y - y) ** 2 <= r * r ? [i] : [],
    );
    check(
        JSON.stringify(actual) === JSON.stringify(expected),
        "Grid query matches all-pairs reference",
    );
}
for (let i = 0; i < 300; i++) b.Tick();
check(
    b.Enemies.every(
        (e) => Number.isFinite(e.x + e.y) && !blocked(Math.floor(e.x), Math.floor(e.y)),
    ),
    "Movement remains within open map",
);
const arrival = new Battle();
arrival.Rate = 0;
arrival.TowerEnabled = false;
arrival.Enemies.push({x: 57, y: 18, vx: 0, vy: 0, hp: 3, id: 0});
arrival.Tick();
arrival.Tick();
check(arrival.Integrity === 99 && arrival.Enemies.length === 0, "Arrival damages fortress once");
const combat = new Battle();
combat.Rate = 0;
combat.Enemies.push({x: 38, y: 23, vx: 0, vy: 0, hp: 3, id: 0});
combat.Tick();
combat.Tick();
check(combat.Kills === 1 && combat.Enemies.length === 0, "Tower kills once and removes target");
console.log("Crowd, query, arrival, and combat checks passed.");
