import {Battle} from "../src/battle.js";
function check(ok: boolean, message: string) {
    if (!ok) throw new Error(message);
}
const b = new Battle();
b.Campaign = false;
b.Rate = 0;
b.Wave = 4;
check(b.Spawn().kind === 2, "Chubby composition");
b.Wave = 6;
b.Spawned = 17;
const crystal = b.Spawn();
check(crystal.kind === 3, "Crystal composition");
b.DamageEnemy(crystal, 3);
check(crystal.hp === 17, "Flat armor reduces small hits");
b.Wave = 8;
b.Limit = 100;
b.Spawned = 99;
const royal = b.Spawn();
check(royal.kind === 4 && royal.mass === 15, "Final Royal enemy");
b.Enemies = [royal];
royal.x = 57;
royal.y = 18;
b.Tick();
check(b.Integrity === 80, "Royal fortress damage");
const mass = new Battle();
mass.Campaign = false;
mass.Rate = 0;
mass.Enemies = [
    {x: 10, y: 10, vx: 0, vy: 0, hp: 100, id: 0, mass: 1},
    {x: 10, y: 10, vx: 0, vy: 0, hp: 100, id: 1, mass: 4},
];
mass.Explode(9, 10);
check(Math.abs(mass.Enemies[0].kx! / mass.Enemies[1].kx! - 4) < 1e-9, "Mass scales knockback");
const rally = new Battle();
rally.Campaign = false;
rally.Rate = 0;
rally.Enemies = [
    {x: 10, y: 18, vx: 0, vy: 0, hp: 100, id: 0, kind: 4},
    {x: 12, y: 18, vx: 0, vy: 0, hp: 3, id: 1},
];
rally.Tick();
check(rally.Enemies[1].rally === true, "Royal rallies nearby allies");
rally.Enemies[0].hp = 0;
rally.Tick();
check(rally.Enemies[0].rally === false, "Rally ends when Royal dies");
console.log("Enemy archetype, armor, mass, and boss checks passed.");
