import {Battle} from "../src/battle.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
const mortar = new Battle();
mortar.Campaign = false;
mortar.Rate = 0;
check(mortar.Build(0, 1), "Mortar purchase");
mortar.Enemies.push({x: 38, y: 23, vx: 0, vy: 0, hp: 10, id: 0});
mortar.Tick();
check(mortar.Mortars.length === 1 && mortar.Kills === 0, "Mortar has flight delay");
for (let i = 0; i < 40; i++) mortar.Tick();
check(mortar.Kills === 1, "Mortar area impact");
const coil = new Battle();
coil.Campaign = false;
coil.Rate = 0;
coil.Build(0, 2);
for (let i = 0; i < 4; i++)
    coil.Enemies.push({x: 38 + i * 0.5, y: 23, vx: 0, vy: 0, hp: 100, id: i});
coil.Tick();
check(coil.Shots.length === 4, "One chain visit per target");
check(
    coil.Enemies.every((e) => e.hp >= 97 && e.hp < 100),
    "Chain cannot hit the same target twice",
);
console.log("Mortar delay and chain uniqueness checks passed.");
