import {Battle} from "../src/battle.js";
import {blocked} from "../src/navigation.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
const b = new Battle();
b.Campaign = false;
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
arrival.Campaign = false;
arrival.Rate = 0;
arrival.TowerEnabled = false;
arrival.Enemies.push({x: 57, y: 18, vx: 0, vy: 0, hp: 3, id: 0});
arrival.Tick();
arrival.Tick();
check(arrival.Integrity === 99 && arrival.Enemies.length === 0, "Arrival damages fortress once");
const combat = new Battle();
combat.Campaign = false;
combat.Rate = 0;
check(combat.Build(0), "Build on valid pad");
check(
    !combat.Build(0) && !combat.Build(-1) && !combat.Build(NaN),
    "Reject duplicate and invalid pads",
);
check(combat.Stars === 120, "Spend exactly once");
combat.Enemies.push({x: 38, y: 23, vx: 0, vy: 0, hp: 3, id: 0});
combat.Tick();
combat.Tick();
check(combat.Kills === 1 && combat.Enemies.length === 0, "Tower kills once and removes target");
check(combat.Stars === 121, "Kill reward once");
combat.Stars = 0;
check(!combat.Build(1), "Reject unaffordable purchase");
const blast = new Battle();
blast.Campaign = false;
blast.Rate = 0;
blast.Enemies.push({x: 10, y: 10, vx: 0, vy: 0, hp: 30, id: 0});
check(!blast.Explode(NaN, 10), "Reject invalid blast target");
check(blast.Explode(10, 10), "Blast at enemy centre");
check(!blast.Explode(10, 10), "Cooldown prevents duplicate blast");
check(blast.Enemies[0].hp === 18, "Blast centre damage");
blast.Tick();
check(Number.isFinite(blast.Enemies[0].x + blast.Enemies[0].y), "Centre knockback is finite");
for (let i = 0; i < 120; i++) blast.Tick();
check(
    blast.Enemies.every((e) => !blocked(Math.floor(e.x), Math.floor(e.y))),
    "Knockback respects walls",
);
console.log("Crowd, query, arrival, combat, and explosion checks passed.");
