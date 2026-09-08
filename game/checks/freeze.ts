import {Battle} from "../src/battle.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
const b = new Battle();
b.Campaign = false;
b.Rate = 0;
b.Enemies.push(
    {x: 10, y: 10, vx: 0, vy: 0, hp: 30, id: 0},
    {x: 10, y: 15, vx: 0, vy: 0, hp: 30, id: 1},
);
check(b.Freeze(5, 10, 15, 10), "Freeze line accepted");
check(!b.Freeze(5, 10, 15, 10), "Freeze cooldown");
for (let i = 0; i < 120; i++) b.Tick();
check(b.Enemies[0].x === 10 && b.Enemies[0].y === 10, "Frozen enemy stays still");
check(b.Enemies[1].x !== 10, "Enemy outside line moves");
for (let i = 0; i < 70; i++) b.Tick();
check(b.Enemies[0].x !== 10, "Freeze expires");
const wave = new Battle();
wave.Wave = 3;
check(
    wave.Spawn().speed === 4.8 && wave.Spawn().speed === 2.8,
    "Wave three mixes Sprinters and Basic enemies",
);
console.log("Freeze targeting, expiry and Sprinter checks passed.");
